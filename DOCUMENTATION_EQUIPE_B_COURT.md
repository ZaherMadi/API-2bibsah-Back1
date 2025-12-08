# DOCUMENTATION ÉQUIPE B - ÉCHANGES AVEC BFF ET ÉQUIPE A

**Projet :** 2Bibsah - Plateforme de prise de rendez-vous médicaux  
**Équipe :** Back B - Gestion RDV, Paiements et Notifications  
**Architecture :** Backend For Frontend (BFF)  
**Date :** Novembre 2025

---

## 1. CONTEXTE ET ARCHITECTURE

### 1.1 Architecture globale avec BFF

```
┌─────────────┐
│  Frontend   │
│ (React/Vue) │
└──────┬──────┘
       │ UN SEUL point d'entrée
       ▼
┌─────────────────────────────┐
│           BFF               │
│  (Backend For Frontend)     │
│                             │
│  - Agrège les données       │
│  - Transforme pour le UI    │
│  - Authentifie (JWT)        │
└──────┬──────────────────┬───┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   BACK A    │    │   BACK B    │
│  (Équipe A) │    │ (Notre équipe)│
│             │    │              │
│ - Users     │    │ - RDV        │
│ - Doctors   │    │ - Paiements  │
│ - Slots     │    │ - Notifs     │
│ - Pharmacy  │    │ - Jobs       │
└─────────────┘    └─────────────┘
```

### 1.2 Répartition des responsabilités

**Back A (Équipe A)** : Identités & Référentiel

- Comptes utilisateurs et authentification (JWT)
- Annuaire des médecins, spécialités, pharmacies
- Gestion des disponibilités (slots horaires)
- Prescriptions médicales

**BFF** : Agrégation & Transformation

- Point d'entrée unique pour le frontend
- Agrégation des données de Back A et Back B
- Authentification et autorisation (proxy JWT)
- Transformation des données pour l'UI

**Back B (Notre équipe)** : Transactions & Événements

- **Gestion des rendez-vous** (création, modification, annulation)
- **Paiements** (Stripe, Wave, Orange Money)
- **Notifications** (email/SMS multilingues FR/AR/EN)
- **Jobs planifiés** (rappels J-1 et J-0, détection no-show)
- **Sécurité** (backups, chiffrement, audit logs)

### 1.3 Flux avec BFF : Différence clé

**AVANT (sans BFF) :**

```
Frontend → Back A (médecin) + Back B (créer RDV) + Back A (patient)
= 3-5 appels HTTP depuis le frontend
```

**MAINTENANT (avec BFF) :**

```
Frontend → BFF (un seul appel)
BFF → Back A + Back B (agrégation côté serveur)
= 1 seul appel HTTP depuis le frontend
```

---

## 2. CE QUE NOUS RÉCUPÉRONS ET POURQUOI

### 2.1 Depuis le BFF (requêtes utilisateur)

Lors d'une création de RDV, **le BFF nous envoie des données enrichies** :

**Données reçues du BFF :**

```json
POST /api/v1/appointments (depuis le BFF)
{
  "doctor": {
    "id": "uuid",
    "first_name": "Amadou",
    "last_name": "Diallo",
    "specialty": "Cardiologue",
    "email": "dr.diallo@example.com",
    "phone_number": "+221771234567",
    "consultation_price": 25000,
    "city": "Dakar",
    "is_verified": true
  },
  "patient": {
    "id": "uuid",
    "first_name": "Fatou",
    "last_name": "Sow",
    "email": "fatou.sow@example.com",
    "phone_number": "+221776543210",
    "preferred_language": "fr"
  },
  "appointment": {
    "start_at": "2025-11-21T09:00:00Z",
    "end_at": "2025-11-21T09:30:00Z",
    "reason": "Consultation de routine"
  },
  "slot_verified": true
}
```

**Pourquoi le BFF nous envoie tout ça :**

| Donnée                          | Pourquoi nous en avons besoin                  | Source originale   |
| ------------------------------- | ---------------------------------------------- | ------------------ |
| **doctor.id**                   | Lier le RDV au médecin dans notre DB           | Équipe A           |
| **doctor.first_name/last_name** | Notifications : "Votre RDV avec Dr. Diallo..." | Équipe A           |
| **doctor.email/phone**          | Notifier le médecin (nouveau RDV, annulation)  | Équipe A           |
| **doctor.consultation_price**   | Créer le paiement avec le montant exact        | Équipe A           |
| **doctor.is_verified**          | Double vérification sécurité                   | Équipe A           |
| **patient.id**                  | Lier le RDV au patient dans notre DB           | Équipe A           |
| **patient.email/phone**         | Envoyer confirmation email + SMS rappels       | Équipe A           |
| **patient.preferred_language**  | i18n : email en français/arabe/anglais         | Équipe A           |
| **appointment.start_at/end_at** | Créer le RDV avec l'horaire exact              | Frontend           |
| **slot_verified**               | Confirmation que le BFF a vérifié la dispo     | BFF (via Équipe A) |

**Avantage :** Nous recevons **tout en une fois**, pas besoin d'appeler l'équipe A nous-mêmes pour chaque requête utilisateur.

### 2.2 Depuis l'Équipe A (jobs asynchrones)

Pour les **jobs planifiés** (rappels J-1, J-0), nous devons quand même récupérer des données de l'équipe A :

**Cas d'usage : Job de rappel J-1**

```javascript
// 1. On récupère les RDV de demain depuis notre DB
const rdvDemain = await RDV.findAll({
  where: { start_at: tomorrow },
});

// 2. Pour chaque RDV, on doit envoyer une notification
// → Besoin des infos patient (email, téléphone, langue)
for (const rdv of rdvDemain) {
  const patient = await teamAClient.getUserDetails(rdv.patient_id);
  const doctor = await teamAClient.getDoctorDetails(rdv.doctor_id);

  await sendReminderNotification(patient, doctor, rdv);
}
```

**Données récupérées depuis l'Équipe A (pour jobs) :**

```json
GET /api/users/{id} (Équipe A)
{
  "id": "uuid",
  "first_name": "Fatou",
  "email": "fatou.sow@example.com",
  "phone_number": "+221776543210",
  "preferred_language": "fr"
}

GET /api/doctors/{id} (Équipe A)
{
  "id": "uuid",
  "first_name": "Amadou",
  "last_name": "Diallo",
  "specialty": { "name": "Cardiologue" }
}
```

**Pourquoi nous en avons besoin :**

| Donnée                         | Utilisation                           | Fréquence                    |
| ------------------------------ | ------------------------------------- | ---------------------------- |
| **patient.email**              | Envoyer rappel par email              | Chaque job (18h J-1, 9h J-0) |
| **patient.phone_number**       | Envoyer rappel SMS                    | Chaque job                   |
| **patient.preferred_language** | Email/SMS dans la bonne langue        | Chaque job                   |
| **doctor.name**                | "Rappel : RDV avec Dr. Diallo demain" | Chaque job                   |

### 2.3 Validation JWT (via BFF)

Le BFF gère l'authentification, mais nous validons quand même le token en cas d'appel direct (API-to-API) :

```json
POST /api/auth/verify-token (Équipe A)
{
  "valid": true,
  "user": {
    "id": "uuid",
    "role": "PATIENT"
  }
}
```

**Utilisation :** Sécurité pour nos endpoints (rejeter token invalide).

---

## 3. COMMENT NOUS RÉCUPÉRONS CES DONNÉES

### 3.1 Depuis le BFF : API REST via HTTPS

**Méthode :** Le BFF nous appelle avec des requêtes HTTP standard.

**Protocole :** REST/HTTPS

**Justification du choix REST :**

- ✅ Standard connu de toutes les équipes (A, B, BFF, Frontend)
- ✅ Simple à débugger (Postman, curl, logs clairs)
- ✅ Documentation standard (Swagger/OpenAPI)
- ✅ Compatible tous environnements (cloud, on-premise)
- ✅ Outils matures (monitoring, cache, rate limiting)

**Alternatives écartées :**

- ❌ **GraphQL** : Overkill pour un BFF qui agrège déjà (double agrégation)
- ❌ **gRPC** : Format binaire difficile à debugger, moins mature sur web
- ❌ **WebSockets** : Pas besoin de real-time pour créer un RDV

### 3.2 Depuis l'Équipe A : Client HTTP encapsulé

Pour les **jobs asynchrones**, nous créons un service `teamAClient.js` qui centralise les appels vers l'équipe A.

**Architecture :**

```javascript
// src/services/teamAClient.js
class TeamAClient {
  async getUserDetails(userId) {
    // Appel HTTP vers équipe A
  }

  async getDoctorDetails(doctorId) {
    // Appel HTTP vers équipe A
  }
}
```

**Avantages :**

- **Centralisation** : Un seul endroit pour gérer les appels vers équipe A
- **Réutilisabilité** : Utilisé dans les jobs, les webhooks, etc.
- **Gestion d'erreurs** : Traitement uniforme (retry, logs)
- **Testabilité** : Facile à mocker dans les tests
- **Monitoring** : Métriques centralisées (latence, taux d'erreur)

**Configuration :**

- **Base URL** : `https://api-team-a.2bibsah.com` (variable d'environnement)
- **Timeout** : 5 secondes (évite de bloquer les jobs)
- **Retry** : 3 tentatives avec délai exponentiel (1s, 2s, 4s)
- **Headers** : `Authorization: Bearer {service_token}`, `X-Request-ID` pour traçabilité

### 3.3 Authentification inter-services

**Méthode :** Service Token (JWT)

- Token spécifique pour l'authentification service-à-service
- Durée de vie : 1 heure avec renouvellement automatique
- Indépendant du token utilisateur (fonctionne pour les jobs asynchrones)

**Raison :** Les jobs s'exécutent sans contexte utilisateur (pas de token user disponible).

### 3.4 Gestion des erreurs et résilience

| Type d'erreur           | Code HTTP | Action                      | Retry ? | Raison                             |
| ----------------------- | --------- | --------------------------- | ------- | ---------------------------------- |
| Utilisateur introuvable | 404       | Log warning + Notif échouée | Non     | Utilisateur supprimé entre-temps   |
| Service indisponible    | 503       | Retry 3 fois                | Oui     | Équipe A en maintenance temporaire |
| Timeout réseau          | ETIMEDOUT | Retry 3 fois                | Oui     | Problème réseau temporaire         |
| Token invalide          | 401       | Alerte critique             | Non     | Problème de configuration          |

**Circuit Breaker :** Si taux d'erreur > 50% pendant 10s, on coupe temporairement pour protéger l'équipe A.

---

## 4. FORMAT DES DONNÉES ET MÉTHODES HTTP

### 4.1 Format de sérialisation : JSON

**Pourquoi JSON ?**

- Standard universel pour les APIs REST
- Lisible par les humains (facile à débugger)
- Parse natif en JavaScript (`JSON.parse()`)
- Outils matures (validators, formatters, viewers)

### 4.2 Structure des réponses

**Succès :**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-21T10:30:00Z",
    "version": "v1"
  }
}
```

**Erreur :**

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "Ce créneau n'est plus disponible"
  }
}
```

### 4.3 Méthodes HTTP et justifications

| Méthode    | Usage                  | Exemple                            | Pourquoi cette méthode ?                                                          | Idempotent ? |
| ---------- | ---------------------- | ---------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| **GET**    | Lire des données       | `GET /api/v1/appointments/my`      | Sémantique REST : récupération sans effet de bord. Cacheable par les proxies.     | ✅ Oui       |
| **POST**   | Créer une ressource    | `POST /api/v1/appointments`        | Créer un nouveau RDV (nouvel ID généré). Non idempotent : 2 appels = 2 RDV.       | ❌ Non       |
| **PATCH**  | Modifier partiellement | `PATCH /api/v1/appointments/{id}`  | Modifier uniquement certains champs (ex: changer l'heure). Plus flexible que PUT. | ❌ Non       |
| **DELETE** | Supprimer              | `DELETE /api/v1/appointments/{id}` | Annuler un RDV. Idempotent : annuler 2× = même résultat.                          | ✅ Oui       |
| **PUT**    | Remplacer complètement | (Pas utilisé)                      | Remplacerait toute la ressource. PATCH plus adapté pour nos besoins.              | ✅ Oui       |

**Justification détaillée :**

**GET - Lecture**

- **Sémantique claire** : Universel pour "récupérer"
- **Cache HTTP natif** : Navigateurs et proxies peuvent cacher
- **Safe** : Pas d'effet de bord (peut être appelé plusieurs fois sans risque)
- **Bookmarkable** : URLs GET peuvent être sauvegardées/partagées

**POST - Création**

- **Standard REST** : POST = créer une nouvelle ressource
- **Non idempotent** : Chaque appel crée un nouveau RDV (comportement attendu)
- **Code retour 201** : Indique clairement la création
- **Location header** : Peut retourner l'URL de la nouvelle ressource

**PATCH - Modification partielle**

- **Économie de bande passante** : Envoyer uniquement les champs modifiés
- **Flexibilité** : Modifier juste l'heure sans renvoyer toutes les données
- **Atomic** : Une seule opération en base de données
- **Meilleur que PUT** : PUT remplacerait toute la ressource (risque d'écraser des données)

**DELETE - Suppression**

- **Sémantique explicite** : DELETE = supprimer/annuler
- **Idempotent** : Annuler un RDV déjà annulé ne change rien
- **Code retour 204** : Pas de contenu après suppression
- **Safe à retry** : Si le réseau coupe, on peut retry sans risque

**Pourquoi pas PUT ?**

- PUT impose de renvoyer **toute** la ressource
- Exemple : Pour changer juste l'heure, il faudrait renvoyer doctor_id, patient_id, reason, etc.
- Risque d'écraser des données par erreur
- PATCH est plus adapté pour des modifications partielles

### 4.4 Format des types de données

**Dates : ISO 8601 UTC**

```json
"start_at": "2025-11-21T09:00:00Z"
```

**Raison :** Standard international, timezone explicite (UTC), parse automatique JavaScript.

**Identifiants : UUID v4**

```json
"id": "550e8400-e29b-41d4-a716-446655440000"
```

**Raison :** Unicité globale, sécurité (IDs non prévisibles), génération distribuée.

**Montants : Centimes (integer)**

```json
"consultation_price": 2500  // = 25.00 XOF
```

**Raison :** Précision financière (pas d'arrondi float), standard Stripe/PayPal/banques.

**Devises : ISO 4217**

```json
"currency": "XOF"  // Franc CFA
```

**Raison :** Standard international (3 lettres), pas d'ambiguïté ($, €, etc.).

### 4.5 Codes HTTP et erreurs métier

| Code HTTP | Nom                 | Usage             | Code métier    | Quand l'utiliser                      |
| --------- | ------------------- | ----------------- | -------------- | ------------------------------------- |
| **200**   | OK                  | Succès GET/PATCH  | -              | Lecture ou modification réussie       |
| **201**   | Created             | Ressource créée   | -              | POST réussi (RDV créé)                |
| **204**   | No Content          | Suppression OK    | -              | DELETE réussi (pas de body)           |
| **400**   | Bad Request         | Données invalides | INVALID_DATA   | Email mal formaté, date invalide      |
| **401**   | Unauthorized        | Token invalide    | INVALID_TOKEN  | Token expiré ou absent                |
| **403**   | Forbidden           | Accès refusé      | FORBIDDEN      | Patient essaye de voir RDV d'un autre |
| **404**   | Not Found           | Ressource absente | NOT_FOUND      | RDV inexistant                        |
| **409**   | Conflict            | Conflit métier    | SLOT_TAKEN     | Créneau déjà réservé                  |
| **422**   | Unprocessable       | Logique KO        | PAST_DATE      | Date dans le passé                    |
| **429**   | Too Many Requests   | Rate limit        | RATE_LIMIT     | Plus de 100 req/15min                 |
| **500**   | Internal Error      | Bug serveur       | INTERNAL_ERROR | Exception non gérée                   |
| **503**   | Service Unavailable | Service down      | SERVICE_DOWN   | DB inaccessible                       |

**Raison :** Code HTTP pour le protocole, code métier pour la logique (actions spécifiques dans le code).

---

## 5. FLUX COMPLET : CRÉATION D'UN RENDEZ-VOUS AVEC BFF

```
1. Frontend → BFF
   POST /bff/appointments/create
   Body: { doctor_id, start_at, reason }

2. BFF : Authentifier user (JWT)
   Extraire patient_id du token

3. BFF → Équipe A : Récupérer détails médecin
   GET /api/doctors/{doctor_id}
   ← { id, name, price, is_verified, email, phone, ... }

4. BFF → Équipe A : Vérifier disponibilité slot
   GET /api/doctors/{doctor_id}/slots?from=...
   ← { slots: [{ start, end, available }] }
   ✓ Validation : slot disponible ?

5. BFF → Équipe A : Récupérer infos patient
   GET /api/users/{patient_id}
   ← { id, name, email, phone, lang, ... }

6. BFF → BACK B (NOUS) : Créer le RDV
   POST /api/v1/appointments
   Body: {
     doctor: { id, name, email, phone, price, ... },
     patient: { id, name, email, phone, lang, ... },
     appointment: { start_at, end_at, reason },
     slot_verified: true
   }

7. BACK B : Traitement
   - INSERT INTO rdv (doctor_id, patient_id, start_at, ...)
   - INSERT INTO paiement (montant, status: 'pending', ...)
   - Envoyer notifications (email + SMS)

8. BACK B → BFF
   ← 201 Created { appointment: {...}, payment: {...} }

9. BFF → Frontend
   ← 201 Created { appointment, payment, doctor, nextAvailableSlots }
```

**Différence clé :** Le BFF agrège les données de l'équipe A AVANT de nous appeler. Nous recevons tout enrichi.

---

## 6. ENDPOINTS API

### 6.1 APIs que nous exposons (appelées par le BFF)

| Endpoint                    | Méthode | Description           | Corps de la requête                                     | Réponse        |
| --------------------------- | ------- | --------------------- | ------------------------------------------------------- | -------------- |
| `/api/v1/appointments`      | POST    | Créer un RDV          | `{ doctor: {...}, patient: {...}, appointment: {...} }` | 201 Created    |
| `/api/v1/appointments/my`   | GET     | Liste RDV d'un user   | Query: `?user_id=&status=&from=&to=`                    | 200 OK         |
| `/api/v1/appointments/{id}` | GET     | Détails d'un RDV      | -                                                       | 200 OK         |
| `/api/v1/appointments/{id}` | PATCH   | Modifier un RDV       | `{ start_at?, reason? }`                                | 200 OK         |
| `/api/v1/appointments/{id}` | DELETE  | Annuler un RDV        | -                                                       | 204 No Content |
| `/api/v1/payments/intent`   | POST    | Créer intent paiement | `{ appointment_id, amount }`                            | 201 Created    |
| `/api/v1/payments/webhook`  | POST    | Webhook Stripe/Wave   | (Payload provider)                                      | 200 OK         |

**Justification des méthodes :**

- **POST /appointments** : Créer = POST (non idempotent)
- **GET /appointments** : Lire = GET (safe, cacheable)
- **PATCH /appointments/{id}** : Modifier partiel = PATCH (flexible)
- **DELETE /appointments/{id}** : Annuler = DELETE (idempotent)

### 6.2 APIs que nous consommons (Équipe A - pour jobs)

| Endpoint                 | Méthode | Usage                     | Fréquence          |
| ------------------------ | ------- | ------------------------- | ------------------ |
| `/api/users/{id}`        | GET     | Infos patient (jobs)      | Jobs J-1, J-0      |
| `/api/doctors/{id}`      | GET     | Infos médecin (jobs)      | Jobs J-1, J-0      |
| `/api/auth/verify-token` | POST    | Validation JWT (sécurité) | Appels API directs |

### 6.3 Différence avec/sans BFF

**Sans BFF :**

```
Nous exposons : POST /api/v1/appointments { doctor_id, start_at, reason }
Nous appelons : GET /api/doctors/{id}, GET /api/users/{id}, GET /api/slots
```

**Avec BFF :**

```
Nous exposons : POST /api/v1/appointments { doctor: {...}, patient: {...}, appointment: {...} }
Nous appelons : (seulement pour jobs asynchrones)
```

---

## 7. SÉCURITÉ ET BONNES PRATIQUES

### Sécurité

- **HTTPS obligatoire** : Chiffrement en transit (certificat TLS)
- **Helmet.js** : Headers HTTP sécurisés (XSS, clickjacking, etc.)
- **CORS** : Origines autorisées uniquement (BFF + équipe A)
- **Rate limiting** : 100 requêtes / 15 min par IP (protection DDoS)
- **Validation inputs** : Joi/Zod pour valider toutes les entrées
- **Chiffrement** : Données sensibles chiffrées au repos (crypto Node.js)
- **Audit logs** : Traçabilité de toutes les actions (RGPD)

### Performance

- **Cache Redis** :
  - Données patient (5 min) pour jobs
  - Données médecin (10 min) pour jobs
  - Pas de cache sur les RDV (données critiques en temps réel)
- **Pagination** : Toutes les listes paginées (20 items par défaut)
- **Index DB** : Sur doctor_id, patient_id, start_at, status

### Monitoring

- **Logs structurés** : Winston (JSON format)
- **Métriques** : Latence, taux d'erreur, taux de création RDV
- **Alertes** :
  - Si taux d'échec notifications > 10%
  - Si service équipe A down > 5 min
  - Si taux d'erreur > 5%
- **Traçabilité** : Request ID sur chaque appel

---

## 8. RÉSUMÉ DES CHOIX TECHNIQUES

| Aspect              | Choix                 | Justification                                       |
| ------------------- | --------------------- | --------------------------------------------------- |
| **Architecture**    | BFF + microservices   | Frontend simplifié, agrégation côté serveur         |
| **Protocole**       | REST/HTTPS            | Standard, simple, mature, outils matures            |
| **Client HTTP**     | Axios                 | Retry, interceptors, timeout natifs                 |
| **Format données**  | JSON                  | Universel, lisible, natif JS                        |
| **Méthodes HTTP**   | GET/POST/PATCH/DELETE | Sémantique REST standard (voir tableau section 4.3) |
| **Format dates**    | ISO 8601 UTC          | Standard international, timezone explicite          |
| **Format IDs**      | UUID v4               | Unique, sécurisé, distribué                         |
| **Format montants** | Centimes (integer)    | Précision financière, pas d'arrondi                 |
| **Auth**            | Service Token JWT     | Indépendant du user, pour jobs asynchrones          |
| **Retry**           | 3× exponentiel        | Résilience aux erreurs temporaires                  |
| **Timeout**         | 5 secondes            | Évite de bloquer les jobs                           |
| **Cache**           | Redis                 | Performances pour les jobs                          |
| **Logs**            | Winston (JSON)        | Structuré, centralisé, facilite analyse             |

### Justification GET vs POST vs PATCH vs DELETE

**Pourquoi ces méthodes spécifiquement ?**

1. **GET** :

   - Standard pour "lire"
   - Cacheable par nature (headers HTTP Cache-Control)
   - Safe (pas d'effet de bord)
   - Idempotent (appeler 10× = même résultat)

2. **POST** :

   - Standard pour "créer"
   - Non idempotent (créer 2× = 2 ressources)
   - Code 201 Created indique succès
   - Corps de requête pour données complexes

3. **PATCH** :

   - Modification **partielle** (vs PUT = remplacement total)
   - Envoi uniquement des champs modifiés
   - Économie de bande passante
   - Moins de risque d'erreur (pas besoin de tout renvoyer)

4. **DELETE** :
   - Standard pour "supprimer"
   - Idempotent (supprimer 2× = même résultat)
   - Code 204 No Content (pas de body dans réponse)
   - Clair et sans ambiguïté

**Alternatives rejetées :**

- ❌ **PUT** : Trop strict (remplace toute la ressource), risque d'écraser des données
- ❌ **POST pour tout** : Perte de sémantique REST, cache impossible, pas de standards

---

## CONCLUSION

Avec l'architecture **BFF**, notre équipe (Back B) a un rôle simplifié pour les requêtes utilisateur :

### Avantages du BFF pour nous

✅ **Moins d'appels vers équipe A** : Le BFF agrège avant de nous appeler  
✅ **Données enrichies** : Nous recevons tout (médecin + patient + RDV) en un seul appel  
✅ **Moins de logique** : Pas besoin de valider le JWT, le BFF s'en charge  
✅ **Focus métier** : Nous nous concentrons sur RDV, paiements, notifications

### Notre responsabilité reste complète pour

✅ **Jobs asynchrones** : Rappels J-1/J-0 (nous appelons équipe A directement)  
✅ **Notifications** : Email/SMS multilingues  
✅ **Paiements** : Intégration Stripe/Wave/Orange Money  
✅ **Sécurité** : Audit logs, chiffrement, backups  
✅ **Performance** : Cache, monitoring, alertes

### Choix techniques justifiés

Les choix de **REST/HTTPS**, **méthodes HTTP standard** (GET/POST/PATCH/DELETE), **JSON**, **ISO 8601**, et **UUID** suivent les standards de l'industrie et garantissent :

- **Interopérabilité** : Fonctionne avec tous les systèmes
- **Maintenabilité** : Standards connus de tous les développeurs
- **Performance** : Cache HTTP natif, optimisations standards
- **Sécurité** : HTTPS, validation, logs structurés

---

**Contacts**

- **Équipe B (nous)** : team-b@2bibsah.com
- **Équipe A** : team-a@2bibsah.com
- **Équipe BFF** : team-bff@2bibsah.com
- **Documentation BFF** : https://bff.2bibsah.com/docs
