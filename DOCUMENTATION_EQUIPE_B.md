# DOCUMENTATION TECHNIQUE - ÉQUIPE B (BACK 2)
## Gestion des Rendez-vous, Paiements et Notifications

**Projet:** 2Bibsah - Plateforme de prise de rendez-vous médicaux  
**Équipe:** Back B - RDV, Paiements, Notifications  
**Date:** Novembre 2025  
**Version:** 1.0

---

# TABLE DES MATIÈRES

1. Introduction et périmètre
2. Ce que nous récupérons et pourquoi
3. Comment nous le récupérons et pourquoi
4. Dans quel format nous le récupérons et pourquoi
5. Architecture technique
6. Exemples d'implémentation
7. Gestion des erreurs
8. Annexes

---

# 1. INTRODUCTION ET PÉRIMÈTRE

## 1.1 Contexte du projet

Le projet 2Bibsah est une plateforme de prise de rendez-vous médicaux inspirée de Doctolib, destinée à un public multiculturel et multilingue (français, arabe, anglais). Le système est conçu pour fonctionner dans un contexte multi-villes avec des contraintes de connectivité.

## 1.2 Architecture générale

Le système est composé de deux backends principaux :

**BACK A (Équipe A)** - Identités & Référentiel
- Gestion des comptes utilisateurs (patients, médecins)
- Authentification et autorisation (JWT)
- Référentiel des médecins et spécialités
- Gestion des disponibilités (slots)
- Annuaire des pharmacies
- Prescriptions médicales

**BACK B (NOTRE ÉQUIPE)** - Transactions & Événements
- Gestion des rendez-vous (création, modification, annulation)
- Gestion des paiements
- Système de notifications (email/SMS)
- Jobs planifiés (rappels J-1, J-0)
- Sécurité et sauvegarde des données transactionnelles
- Audit logs

## 1.3 Notre périmètre de responsabilité

### Ce que nous gérons :

✓ Création, modification et annulation de rendez-vous
✓ Validation des créneaux disponibles
✓ Gestion des statuts RDV (booked, confirmed, canceled, done, no-show)
✓ Intégration des solutions de paiement (Stripe, Wave, Orange Money)
✓ Envoi de notifications multilingues (FR/AR/EN)
✓ Rappels automatiques (J-1 et J-0)
✓ Chiffrement des données sensibles
✓ Backups automatiques
✓ Rate limiting et protection API
✓ Logs d'audit pour conformité RGPD

### Ce que nous NE gérons PAS :

✗ Comptes utilisateurs (géré par équipe A)
✗ Profils médecins (géré par équipe A)
✗ Créneaux horaires / disponibilités (géré par équipe A)
✗ Authentification JWT (géré par équipe A)
✗ Prescriptions médicales (géré par équipe A)
✗ Pharmacies (géré par équipe A)

---

# 2. CE QUE NOUS RÉCUPÉRONS ET POURQUOI

## 2.1 Informations sur les médecins

### Données récupérées

Nous récupérons les informations suivantes depuis l'API de l'équipe A :

- Identifiant unique (UUID)
- Prénom et nom
- Spécialité médicale
- Email professionnel
- Numéro de téléphone
- Prix de consultation
- Ville d'exercice
- Statut de vérification
- Note/évaluation moyenne

### Justification métier

| Donnée | Raison métier | Utilisation concrète dans notre système |
|--------|---------------|----------------------------------------|
| Identifiant (id) | Identifiant unique du médecin | Créer la relation entre le RDV et le médecin dans notre base de données |
| Prénom + Nom | Personnalisation des communications | Utilisé dans les emails et SMS : "Votre rendez-vous avec Dr. Diallo est confirmé" |
| Spécialité | Information patient et contexte | Afficher "Consultation en cardiologie" dans les notifications et l'historique |
| Email | Communication professionnelle | Notifier le médecin lors d'une nouvelle réservation ou d'une annulation |
| Téléphone | Notifications urgentes | Envoyer des SMS d'alerte au médecin en cas d'annulation de dernière minute |
| Prix consultation | Calcul du montant à facturer | Déterminer le montant exact du paiement à créer (essentiel pour la transaction) |
| Ville | Contexte géographique | Afficher "Rendez-vous à Dakar" pour le patient, statistiques par ville |
| Statut vérifié | Sécurité et qualité | Bloquer la création de RDV avec des médecins non vérifiés |
| Note/Rating | Expérience utilisateur | Proposer une évaluation post-consultation, afficher dans l'historique |

### Fréquence de récupération

- À chaque création de rendez-vous (validation obligatoire)
- Lors de l'affichage des détails d'un rendez-vous existant
- Cache recommandé : 10 minutes (les infos médecins changent rarement)

## 2.2 Disponibilités (Slots)

### Données récupérées

Pour chaque médecin, nous récupérons la liste des créneaux horaires :

- Identifiant du créneau
- Date et heure de début (format ISO 8601)
- Date et heure de fin (format ISO 8601)
- Statut de disponibilité (disponible/occupé)
- Durée du créneau

### Justification métier

| Donnée | Raison métier | Utilisation concrète dans notre système |
|--------|---------------|----------------------------------------|
| Date/heure début et fin | Validation temporelle | Vérifier que le créneau demandé par le patient existe réellement dans le planning du médecin |
| Statut disponible | Prévention des conflits | Empêcher la double réservation d'un même créneau (race condition) |
| Identifiant slot | Traçabilité | (Optionnel) Permettre à l'équipe A de marquer le slot comme réservé côté leur système |
| Durée | Calcul automatique | Calculer l'heure de fin du RDV si seule l'heure de début est fournie |

### Cas d'usage critique

**Problème de concurrence :**
Un patient voit les créneaux disponibles à 14h00. Il réfléchit pendant 5 minutes, puis clique sur "Réserver à 14h30". Entre-temps, un autre patient a pu réserver ce même créneau.

**Solution :**
Nous DEVONS re-vérifier la disponibilité du créneau auprès de l'équipe A au moment exact de la confirmation du rendez-vous, pas uniquement à l'affichage initial.

### Fréquence de récupération

- Lors de l'affichage initial des disponibilités (frontend)
- OBLIGATOIRE : Re-vérification avant de créer le RDV (validation finale)
- Cache : 2 minutes maximum (les slots changent fréquemment)

## 2.3 Informations sur les patients

### Données récupérées

- Identifiant unique du patient (UUID)
- Prénom et nom
- Adresse email
- Numéro de téléphone mobile
- Langue préférée (fr/ar/en)
- Pays de résidence

### Justification métier

| Donnée | Raison métier | Utilisation concrète dans notre système |
|--------|---------------|----------------------------------------|
| Identifiant patient | Lien avec le compte | Associer le rendez-vous au patient dans notre base de données |
| Prénom + Nom | Personnalisation | "Bonjour Fatou" dans les emails, "Mme Sow" dans les SMS professionnels |
| Email | Canal de notification principal | Envoyer la confirmation de RDV, la facture, les rappels |
| Téléphone mobile | Canal de notification urgente | Envoyer les rappels SMS J-1 et J-0, notifications critiques |
| Langue préférée | Internationalisation (i18n) | Envoyer les notifications dans la langue choisie par le patient (FR/AR/EN) |
| Pays | Contexte réglementaire | Adapter le format de la facture selon les normes du pays |

### Fréquence de récupération

- À chaque création de rendez-vous (pour les notifications)
- Cache : 5 minutes (les infos patient changent rarement pendant une session)

## 2.4 Validation des tokens JWT

### Données récupérées

Pour chaque requête authentifiée, nous validons le token auprès de l'équipe A :

- Validité du token (vrai/faux)
- Identifiant utilisateur
- Rôle de l'utilisateur (PATIENT, DOCTOR, ADMIN)
- Email de l'utilisateur
- Date d'expiration du token

### Justification métier

| Donnée | Raison métier | Utilisation concrète dans notre système |
|--------|---------------|----------------------------------------|
| Validité token | Sécurité fondamentale | Rejeter immédiatement toute requête avec un token invalide ou expiré |
| Identifiant utilisateur | Identification | Savoir quel utilisateur fait la demande pour associer le RDV au bon compte |
| Rôle utilisateur | Autorisation (RBAC) | Un PATIENT ne peut voir que ses RDV, un DOCTOR peut voir son agenda, un ADMIN peut tout voir |
| Email | Audit et logs | Tracer qui a effectué quelle action pour la conformité RGPD |
| Expiration | Gestion de session | Forcer l'utilisateur à se reconnecter si le token est expiré |

### Fréquence de récupération

- À CHAQUE requête authentifiée (middleware d'authentification)
- Pas de cache (sécurité critique)

## 2.5 Récapitulatif des données échangées

### Flux entrants (ce que nous recevons de l'équipe A)

| Type de données | Endpoint source | Fréquence | Cache | Criticité |
|-----------------|-----------------|-----------|-------|-----------|
| Détails médecin | GET /api/doctors/{id} | Par RDV | 10 min | Haute |
| Disponibilités | GET /api/doctors/{id}/slots | Par recherche + validation | 2 min | Critique |
| Infos patient | GET /api/users/{id} | Par RDV | 5 min | Haute |
| Validation JWT | POST /api/auth/verify-token | Chaque requête | Aucun | Critique |

### Flux sortants (ce que nous exposons)

| Type de données | Endpoint | Consommateur | Criticité |
|-----------------|----------|--------------|-----------|
| Liste RDV | GET /api/v1/appointments/my | Frontend, Équipe A | Haute |
| Détails RDV | GET /api/v1/appointments/{id} | Frontend | Haute |
| Créer RDV | POST /api/v1/appointments | Frontend | Critique |
| Annuler RDV | DELETE /api/v1/appointments/{id} | Frontend | Haute |
| Stats médecin | GET /api/v1/stats/doctor/{id} | Équipe A | Moyenne |

---

# 3. COMMENT NOUS LE RÉCUPÉRONS ET POURQUOI

## 3.1 Protocole de communication

### Choix technologique : API REST via HTTPS

Nous utilisons le protocole REST (Representational State Transfer) sur HTTPS pour communiquer avec l'API de l'équipe A.

### Justification du choix REST

| Critère | Justification |
|---------|--------------|
| **Standard éprouvé** | REST est le standard de facto pour les APIs web. Les deux équipes maîtrisent cette technologie. |
| **Simplicité** | Pas besoin d'apprendre de nouvelles technologies (GraphQL, gRPC). Courbe d'apprentissage nulle. |
| **Debugging facile** | Testable avec des outils simples (Postman, curl, navigateur). Logs clairs et lisibles. |
| **Documentation** | Swagger/OpenAPI sont des standards pour documenter les APIs REST. |
| **Compatibilité** | Fonctionne sur tous les environnements (cloud, on-premise, mobile, web). |
| **Outils matures** | Énorme écosystème de libraries (Axios, Fetch) et d'outils de monitoring. |
| **Cache HTTP** | Support natif du cache via les headers HTTP (Cache-Control, ETag). |

### Alternatives envisagées et raisons du rejet

**GraphQL :**
- ❌ Courbe d'apprentissage plus élevée
- ❌ Surcharge pour un MVP
- ✓ Pourrait être envisagé en phase 2 si besoins complexes d'agrégation

**gRPC :**
- ❌ Format binaire difficile à debugger
- ❌ Nécessite des outils spécialisés
- ❌ Less mature sur le web (problèmes de compatibilité navigateur)
- ✓ Pourrait être envisagé pour communication interne en production (performances)

**WebSockets :**
- ❌ Overkill pour notre use case (pas de real-time critique)
- ❌ Plus complexe à maintenir
- ✓ Pourrait être utile pour notifications en temps réel (phase future)

## 3.2 Architecture : Client HTTP encapsulé

### Principe du pattern "Service Client"

Nous créons une classe `TeamAClient` qui encapsule toute la logique de communication avec l'API de l'équipe A. C'est le même pattern que celui utilisé par AWS SDK, Stripe SDK, etc.

### Avantages de cette approche

| Avantage | Explication | Bénéfice concret |
|----------|-------------|------------------|
| **Centralisation** | Un seul endroit où se trouvent tous les appels vers l'équipe A | Si l'URL de base change, on modifie un seul fichier |
| **Réutilisabilité** | Les méthodes sont réutilisables dans tous nos controllers | Pas de duplication de code |
| **Gestion d'erreurs centralisée** | Les erreurs sont traitées au même endroit | Messages d'erreur cohérents, logs uniformes |
| **Testabilité** | Facile à mocker dans les tests unitaires | Tests rapides sans vraie connexion réseau |
| **Monitoring** | Tous les appels passent par le même point | Facile de mesurer latence, taux d'erreur, etc. |
| **Retry logic** | Logique de retry centralisée | Si l'équipe A est temporairement down, on réessaye automatiquement |
| **Cache** | Cache centralisé | Optimisation des performances transparente |
| **Traçabilité** | Request ID automatique sur tous les appels | Débugger plus facilement en suivant une requête de bout en bout |

### Composants techniques utilisés

**Axios** - Client HTTP
- Mature et stable (millions de téléchargements)
- Gestion native des timeouts
- Interceptors (middleware pour les requêtes)
- Support des promesses
- Transformation automatique JSON

**axios-retry** - Retry automatique
- Réessaye automatiquement en cas d'échec réseau
- Stratégie exponential backoff (attente progressive)
- Configurable (nombre de tentatives, délai)

**winston** - Logging
- Logs structurés (JSON)
- Multiples transports (fichier, console, cloud)
- Niveaux de log (debug, info, warn, error)

## 3.3 Configuration du client HTTP

### Paramètres clés

**Base URL**
- Valeur : `https://api-team-a.2bibsah.com` (exemple)
- Stockage : Variable d'environnement `TEAM_A_API_URL`
- Raison : Ne jamais hard-coder les URLs (différence dev/staging/prod)

**Timeout**
- Valeur : 5000 ms (5 secondes)
- Raison : Si l'équipe A ne répond pas en 5s, on considère que le service est down. Évite de bloquer notre API indéfiniment.

**Retry**
- Tentatives : 3 fois
- Stratégie : Exponential backoff (1s, 2s, 4s)
- Raison : Résistance aux erreurs temporaires (pic de charge, redémarrage serveur)

**Headers personnalisés**
- `Content-Type: application/json` - Format des données
- `X-Service: team-b-rdv` - Identification de notre service
- `X-Request-ID: {uuid}` - Traçabilité des requêtes
- `Authorization: Bearer {token}` - Authentification inter-services

### Stratégie de retry

Nous réessayons automatiquement dans ces cas :

✓ Erreur réseau (ECONNREFUSED, ETIMEDOUT)
✓ Erreur 503 (Service Unavailable)
✓ Erreur 504 (Gateway Timeout)

Nous NE réessayons PAS dans ces cas :

✗ Erreur 400 (Bad Request) - Nos données sont invalides
✗ Erreur 401 (Unauthorized) - Token invalide
✗ Erreur 404 (Not Found) - Ressource inexistante
✗ Erreur 409 (Conflict) - Slot déjà réservé

Raison : Réessayer ces erreurs ne changera rien au résultat et ralentit inutilement le système.

## 3.4 Authentification inter-services

### Méthode choisie : Service Token (JWT)

Nous utilisons un token JWT spécifique pour l'authentification service-à-service.

**Caractéristiques du token :**
- Émetteur : Équipe A
- Audience : Équipe B
- Durée de vie : 1 heure
- Renouvellement : Automatique avant expiration
- Stockage : Variable d'environnement (sécurisée)

### Pourquoi ne pas utiliser le token du user ?

❌ **Problèmes si on utilisait le token du user :**
- Le token user peut expirer pendant le traitement
- Si on fait un appel asynchrone (notification J-1), pas de token user disponible
- Dépendance au cycle de vie de la session user

✓ **Avantages du service token :**
- Indépendant du user
- L'équipe A peut identifier et autoriser notre service
- Durée de vie gérée entre les services
- Logs et audit simplifiés

### Alternative : API Key

Dans un contexte plus simple, une API Key statique peut suffire :
- Plus simple (juste un string)
- Pas d'expiration
- Moins sécurisé (si volée, valide indéfiniment)

Nous avons choisi JWT pour la rotation automatique des tokens (meilleure sécurité).

## 3.5 Gestion des erreurs et résilience

### Stratégie par type d'erreur

| Erreur | Code HTTP | Action système | Réponse au client | Raison |
|--------|-----------|----------------|-------------------|--------|
| Médecin introuvable | 404 | Log warning + Rejeter RDV | "Ce médecin n'existe pas" | Empêcher RDV invalide |
| Service indisponible | 503 | Log error + Retry (3×) | "Service temporairement indisponible" | L'équipe A peut être en maintenance |
| Timeout réseau | ETIMEDOUT | Log error + Retry (3×) | "Délai de connexion dépassé" | Problème réseau temporaire |
| Slot déjà pris | 409 | Log info + Rejeter RDV | "Ce créneau n'est plus disponible" | Concurrence normale |
| Token invalide | 401 | Log critical + Bloquer service | Erreur interne (pas exposée) | Problème de configuration critique |

### Circuit Breaker (protection avancée)

En production, nous implémentons un circuit breaker (library : Opossum) :

**États du circuit :**

1. **CLOSED (fermé - normal)**
   - Les requêtes passent normalement
   - Si taux d'erreur > 50% pendant 10s → passe en OPEN

2. **OPEN (ouvert - protection)**
   - Les requêtes sont bloquées immédiatement (fail fast)
   - Évite de surcharger l'équipe A si elle est en difficulté
   - Après 30s → passe en HALF_OPEN

3. **HALF_OPEN (semi-ouvert - test)**
   - Laisse passer 1 requête test
   - Si succès → retour en CLOSED
   - Si échec → retour en OPEN

**Bénéfice :** Si l'équipe A est down, on le détecte rapidement et on évite de la bombarder de requêtes inutiles.

## 3.6 Traçabilité et monitoring

### Request ID

Chaque requête vers l'équipe A reçoit un ID unique :
- Format : `{timestamp}-{random}` ex: `1732183200-a3f9k2`
- Propagé dans le header `X-Request-ID`
- Logé côté équipe B ET équipe A

**Bénéfice :** En cas de bug, on peut retrouver la requête exacte dans les logs des deux services.

### Logs structurés

Chaque appel génère des logs standardisés :

```
[2025-11-21T10:30:45Z] [INFO] [TeamA] → GET /api/doctors/123 | RequestID: 1732183200-a3f9k2
[2025-11-21T10:30:46Z] [INFO] [TeamA] ← 200 OK (245ms) | RequestID: 1732183200-a3f9k2
```

En cas d'erreur :

```
[2025-11-21T10:30:45Z] [ERROR] [TeamA] → GET /api/doctors/999 | RequestID: 1732183200-x7k3m1
[2025-11-21T10:30:46Z] [ERROR] [TeamA] ✖ 404 Not Found (120ms) | RequestID: 1732183200-x7k3m1
```

### Métriques

Nous collectons ces métriques pour chaque appel :
- Latence (temps de réponse en ms)
- Taux de succès / échec
- Nombre d'appels par endpoint
- Taux de retry

Ces métriques sont envoyées à un système de monitoring (Grafana, DataDog, etc.).

---

# 4. DANS QUEL FORMAT NOUS LE RÉCUPÉRONS ET POURQUOI

## 4.1 Format de sérialisation : JSON

### Caractéristiques

JSON (JavaScript Object Notation) est le format standard pour l'échange de données.

### Justification du choix

| Critère | Justification |
|---------|--------------|
| **Standard universel** | Tous les langages et frameworks supportent JSON nativement |
| **Lisibilité humaine** | Facile à lire et débugger (contrairement aux formats binaires) |
| **Compatible JavaScript** | Parse natif avec `JSON.parse()`, pas de bibliothèque externe |
| **Validation facile** | JSON Schema permet de valider la structure des données |
| **Outils matures** | Éditeurs, validators, formatters disponibles partout |
| **Léger** | Plus compact que XML, moins de surcharge réseau |

### Alternatives et raisons du rejet

**XML**
- ❌ Plus verbeux (balises ouvrantes/fermantes)
- ❌ Plus lent à parser
- ❌ Moins naturel en JavaScript
- ✓ Meilleur support des namespaces (pas nécessaire ici)

**Protocol Buffers (Protobuf)**
- ❌ Format binaire (pas lisible par humain)
- ❌ Nécessite des fichiers de schéma (.proto)
- ✓ Plus performant et compact (utile en micro-services haute performance)
- ✓ Pourrait être envisagé en phase optimisation

**MessagePack**
- ❌ Format binaire
- ❌ Moins d'outils disponibles
- ✓ Plus compact que JSON (utile si bande passante critique)

## 4.2 Structure des réponses : Enveloppe standardisée

### Format adopté

Toutes les réponses de l'API suivent cette structure :

**En cas de succès :**
```
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-21T10:30:00Z",
    "version": "v1",
    "request_id": "1732183200-a3f9k2"
  }
}
```

**En cas d'erreur :**
```
{
  "success": false,
  "error": {
    "code": "DOCTOR_NOT_FOUND",
    "message": "Le médecin demandé n'existe pas",
    "details": { "doctor_id": "abc-123" }
  },
  "meta": {
    "timestamp": "2025-11-21T10:30:00Z",
    "version": "v1",
    "request_id": "1732183200-a3f9k2"
  }
}
```

### Justification de la structure

| Champ | Raison | Bénéfice |
|-------|--------|----------|
| **success** | Indicateur booléen simple | Savoir immédiatement si la requête a réussi sans parser le code HTTP |
| **data** | Isolation des données métier | Les données utiles sont toujours au même endroit, parsing simplifié |
| **error.code** | Code machine | Permet des `switch/case` dans le code (ex: `SLOT_UNAVAILABLE` → afficher message spécifique) |
| **error.message** | Message humain | Peut être affiché tel quel au user ou logué |
| **error.details** | Contexte additionnel | Debugging : savoir exactement quel paramètre a posé problème |
| **meta.timestamp** | Horodatage serveur | Debugging : savoir quand la donnée a été générée (timezone UTC) |
| **meta.version** | Version API | Gérer plusieurs versions d'API en parallèle (v1, v2) |
| **meta.request_id** | Traçabilité | Retrouver la requête dans les logs |

### Avantages par rapport à d'autres structures

**Structure "flat" (sans enveloppe) :**
```
{
  "id": "123",
  "name": "Dr. Diallo"
}
```
❌ Impossible de différencier métadonnées et données métier  
❌ Pas de champ standard pour les erreurs

**Structure Google API style :**
```
{
  "kind": "doctor",
  "items": [...],
  "etag": "..."
}
```
✓ Bien pour APIs publiques avec versioning complexe  
❌ Overkill pour notre contexte inter-services

## 4.3 Format des types de données

### Dates et timestamps : ISO 8601

**Format adopté :**
```
"2025-11-21T09:00:00Z"
```

**Composants :**
- `2025-11-21` - Date (YYYY-MM-DD)
- `T` - Séparateur date/heure (standard ISO)
- `09:00:00` - Heure (HH:MM:SS)
- `Z` - Timezone UTC (Zulu time)

**Variante avec timezone explicite :**
```
"2025-11-21T09:00:00+00:00"
```

### Justification

| Avantage | Explication | Exemple de problème évité |
|----------|-------------|---------------------------|
| **Standard international** | ISO 8601 est reconnu mondialement | Pas d'ambiguïté 01/02/2025 (1er fév ou 2 jan ?) |
| **Timezone explicite** | Le Z indique UTC, pas d'ambiguïté | "9h" c'est 9h où ? Paris ? Dakar ? UTC ? |
| **Parse automatique** | `new Date(isoString)` fonctionne directement en JavaScript | Pas besoin de bibliothèque externe |
| **Tri lexicographique** | Trier alphabétiquement = trier chronologiquement | Requêtes SQL avec ORDER BY fonctionnent naturellement |
| **Lisible par humain** | Un développeur peut lire et comprendre | Contrairement aux timestamps Unix (1732183200) |

### Formats à ÉVITER

❌ `"21/11/2025 09:00"` - Ambigu (format français/américain ?)  
❌ `1732183200` - Timestamp Unix (pas lisible)  
❌ `"2025-11-21"` - Pas d'heure (incomplet)  
❌ `"09:00:00"` - Pas de date (incomplet)  
❌ `"21 Nov 2025"` - Format textuel (difficile à parser)

### Identifiants : UUID v4

**Format adopté :**
```
"550e8400-e29b-41d4-a716-446655440000"
```

**Caractéristiques :**
- 128 bits
- Représentation hexadécimale avec tirets
- Génération aléatoire (v4)

### Justification

| Avantage | Explication | Bénéfice |
|----------|-------------|----------|
| **Unicité globale** | Probabilité de collision quasi nulle | Équipe A et B peuvent générer des IDs sans coordination |
| **Sécurité** | Impossible de deviner les IDs adjacents | Pas de "fishing" : tester /api/users/1, /api/users/2... |
| **Distribution** | Pas besoin de serveur central | Chaque service génère ses IDs indépendamment |
| **Standard** | Supporté nativement par PostgreSQL (type UUID) | Performance optimale en base de données |
| **Lisibilité** | Format reconnaissable instantanément | Distinct d'autres types de données |

### Formats à ÉVITER

❌ IDs incrémentaux (1, 2, 3...) - Prévisibles, problèmes de sécurité  
❌ IDs aléatoires courts (a3f9k) - Risque de collision  
❌ Timestamps comme ID - Pas uniques si créations simultanées

### Montants financiers : Entiers en centimes

**Format adopté :**
```
{
  "consultation_price": 2500,
  "currency": "XOF"
}
```

Représente : 2500 centimes = 25.00 XOF

### Justification

| Problème | Solution avec centimes | Exemple concret |
|----------|----------------------|-----------------|
| **Précision floating point** | `0.1 + 0.2 = 0.30000000000000004` en JavaScript | Avec centimes : `10 + 20 = 30` (exact) |
| **Arrondis** | Les floats arrondissent mal | 25.005 → 25.00 ou 25.01 ? Avec centimes : 2501 (pas d'ambiguïté) |
| **Comparaisons** | `0.1 + 0.2 === 0.3` retourne `false` | `10 + 20 === 30` retourne `true` |
| **Standard industrie** | Stripe, PayPal, banques utilisent les centimes | Compatibilité avec les systèmes de paiement |

### Conversion

**Réception depuis l'API :**
```
const priceInCents = 2500; // Reçu de l'API
const priceInXOF = priceInCents / 100; // 25.00 XOF
```

**Affichage utilisateur :**
```
const formatted = `${priceInXOF.toFixed(2)} XOF`; // "25.00 XOF"
```

**Envoi vers l'API de paiement :**
```
stripe.charges.create({
  amount: 2500, // Stripe attend des centimes
  currency: "xof"
});
```

### Formats à ÉVITER

❌ `25.00` (float) - Problèmes d'arrondi  
❌ `"25.00"` (string) - Nécessite parsing  
❌ `2500.0` (decimal avec .0) - Confusion centimes/euros

### Devises : Code ISO 4217

**Format adopté :**
```
"XOF" (Franc CFA)
"EUR" (Euro)
"MAD" (Dirham marocain)
```

**Standard :** ISO 4217 (3 lettres)

### Justification

✓ Standard international  
✓ Pas d'ambiguïté ($ = USD ? CAD ? AUD ?)  
✓ Supporté par tous les systèmes de paiement

## 4.4 Pagination : Format Offset-based

### Format adopté

**Requête :**
```
GET /api/doctors?page=2&per_page=20
```

**Réponse :**
```
{
  "success": true,
  "data": [
    { "id": "uuid1", "name": "Dr. A" },
    { "id": "uuid2", "name": "Dr. B" }
  ],
  "pagination": {
    "total": 156,
    "page": 2,
    "per_page": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true
  }
}
```

### Justification

| Champ | Utilisation | Exemple UI |
|-------|-------------|------------|
| **total** | Afficher le nombre total | "156 médecins trouvés" |
| **page** | Savoir où on est | "Page 2 sur 8" |
| **per_page** | Configuration | "Afficher 20 / 50 / 100 résultats" |
| **total_pages** | Navigation | Afficher les numéros de pages cliquables |
| **has_next** | Bouton suivant | Désactiver si dernière page |
| **has_prev** | Bouton précédent | Désactiver si première page |

### Alternative : Cursor-based pagination

**Avantage :** Meilleur pour flux infini (social media)  
**Inconvénient :** Pas de numéros de page  
**Notre choix :** Offset-based car adapté à nos besoins (listes finies)

## 4.5 Codes d'erreur : HTTP + Codes métier

### Codes HTTP standard

| Code | Nom | Quand l'utiliser | Exemple |
|------|-----|------------------|---------|
| **200** | OK | Succès d'une opération GET ou PATCH | Récupération détails médecin |
| **201** | Created | Ressource créée avec succès | Création d'un RDV |
| **204** | No Content | Suppression réussie | Annulation d'un RDV |
| **400** | Bad Request | Données invalides (validation) | Email mal formaté |
| **401** | Unauthorized | Token manquant ou invalide | Pas de header Authorization |
| **403** | Forbidden | Token valide mais pas les droits | Patient essaye de modifier le RDV d'un autre |
| **404** | Not Found | Ressource introuvable | Médecin ID inexistant |
| **409** | Conflict | Conflit métier | Slot déjà réservé |
| **422** | Unprocessable Entity | Données valides mais logique KO | Date de RDV dans le passé |
| **429** | Too Many Requests | Rate limit dépassé | Plus de 100 requêtes / minute |
| **500** | Internal Server Error | Erreur serveur non gérée | Bug dans le code |
| **503** | Service Unavailable | Service temporairement indisponible | Maintenance ou surcharge |

### Codes métier personnalisés

En plus du code HTTP, nous ajoutons un code métier :

```
{
  "success": false,
  "error": {
    "code": "SLOT_ALREADY_BOOKED",
    "message": "Ce créneau a déjà été réservé par un autre patient",
    "http_status": 409
  }
}
```

### Liste des codes métier

| Code métier | HTTP | Signification | Action frontend |
|-------------|------|---------------|-----------------|
| DOCTOR_NOT_FOUND | 404 | Médecin inexistant | Afficher "Ce médecin n'existe plus" |
| DOCTOR_NOT_VERIFIED | 403 | Médecin non vérifié | Bloquer la réservation |
| SLOT_UNAVAILABLE | 409 | Créneau plus disponible | Proposer autres créneaux |
| SLOT_IN_PAST | 422 | Date dans le passé | "Impossible de réserver dans le passé" |
| PAYMENT_FAILED | 402 | Paiement échoué | Proposer autre moyen de paiement |
| INVALID_TOKEN | 401 | Token invalide | Rediriger vers login |
| RATE_LIMIT_EXCEEDED | 429 | Trop de requêtes | "Veuillez patienter" |
| SERVICE_UNAVAILABLE | 503 | Service indisponible | "Service temporairement indisponible" |

### Avantage des codes métier

✓ Le frontend peut avoir une logique spécifique par erreur  
✓ Les messages sont dans la langue du user (i18n côté frontend)  
✓ Les logs sont plus clairs

---

# 5. ARCHITECTURE TECHNIQUE

## 5.1 Structure du projet

```
API-2bibsah-Back-B/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuration PostgreSQL/MongoDB
│   │   ├── redis.js             # Configuration cache Redis
│   │   ├── teamA.js             # Configuration API équipe A
│   │   ├── env.js               # Chargement variables d'environnement
│   │   └── i18n/
│   │       ├── fr.json          # Traductions français
│   │       ├── ar.json          # Traductions arabe
│   │       └── en.json          # Traductions anglais
│   ├── models/
│   │   ├── RDV.js               # Modèle Rendez-vous
│   │   ├── Paiement.js          # Modèle Paiement
│   │   └── Notification.js      # Modèle Notification
│   ├── routes/
│   │   ├── appointments.routes.js    # Routes RDV
│   │   ├── notifications.routes.js   # Routes notifications
│   │   └── payments.routes.js        # Routes paiements
│   ├── controllers/
│   │   ├── appointments.controller.js
│   │   ├── notifications.controller.js
│   │   └── payments.controller.js
│   ├── services/
│   │   ├── teamAClient.js            # ⭐ Client HTTP vers équipe A
│   │   ├── appointmentService.js     # Logique métier RDV
│   │   ├── slotValidator.js          # Validation disponibilités
│   │   ├── notificationService.js    # Orchestration notifications
│   │   │   ├── emailService.js       # Envoi emails (Nodemailer)
│   │   │   └── smsService.js         # Envoi SMS (Twilio)
│   │   └── paymentService.js         # Intégration paiements
│   ├── middlewares/
│   │   ├── auth.js                   # Validation JWT
│   │   ├── rateLimit.js              # Rate limiting
│   │   ├── errorHandler.js           # Gestion erreurs globale
│   │   └── validator.js              # Validation des données
│   ├── utils/
│   │   ├── encryption.js             # Chiffrement données sensibles
│   │   ├── dateHelper.js             # Manipulation dates
│   │   └── logger.js                 # Logging (Winston)
│   ├── jobs/
│   │   ├── reminderJob.js            # Jobs rappels J-1 et J-0
│   │   └── noShowDetector.js         # Détection no-show
│   └── app.js                        # Point d'entrée Express
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   └── swagger.yaml                  # Documentation OpenAPI
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 5.2 Stack technologique

### Backend

| Composant | Technologie | Version | Raison du choix |
|-----------|------------|---------|-----------------|
| **Runtime** | Node.js | 18 LTS | Écosystème mature, performances, async natif |
| **Framework** | Express.js | 5.x | Simple, flexible, large communauté |
| **Base de données** | PostgreSQL | 15 | Relations complexes, ACID, transactions |
| **ORM** | Sequelize | 6.x | Mature, migrations, support TypeScript |
| **Cache** | Redis | 7.x | Performances, pub/sub pour jobs |
| **Queue** | Bull / BullMQ | 4.x | Jobs asynchrones (notifications, rappels) |

### Services externes

| Service | Provider | Usage |
|---------|----------|-------|
| **Email** | SendGrid / AWS SES | Envoi emails transactionnels |
| **SMS** | Twilio / Africa's Talking | SMS rappels (adapté marché africain) |
| **Paiement** | Stripe + Wave + Orange Money | Paiements internationaux + locaux |
| **Monitoring** | Grafana / DataDog | Métriques et alertes |
| **Logs** | CloudWatch / ELK | Centralisation logs |

### Sécurité

| Aspect | Solution | Raison |
|--------|----------|--------|
| **HTTPS** | Obligatoire | Chiffrement en transit |
| **Helmet.js** | Middleware Express | Headers sécurité HTTP |
| **CORS** | cors package | Contrôle des origines |
| **Rate limiting** | express-rate-limit | Protection DDoS |
| **Validation** | Joi / Zod | Validation des inputs |
| **Encryption** | crypto (Node) | Chiffrement données sensibles |
| **RGPD** | Audit logs | Traçabilité et conformité |

## 5.3 Variables d'environnement

```
# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/rdv_db

# Redis
REDIS_URL=redis://localhost:6379

# API Équipe A
TEAM_A_API_URL=https://api-team-a.2bibsah.com
TEAM_A_SERVICE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Notifications
SENDGRID_API_KEY=SG.xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+221771234567

# Paiements
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Application
PORT=3001
NODE_ENV=production
APP_VERSION=1.0.0

# Sécurité
JWT_SECRET=xxx (si on génère nos propres tokens)
ENCRYPTION_KEY=xxx
```

## 5.4 Flux de données complet

### Scénario : Créer un rendez-vous

```
1. Frontend
   ↓ POST /api/v1/appointments
   ↓ Body: { doctor_id, start_at, reason }
   
2. Notre API (Back B)
   ↓ Middleware auth : Valider JWT
   ↓
   
3. TeamAClient.verifyToken()
   ↓ → Équipe A : POST /api/auth/verify-token
   ↓ ← Équipe A : { valid: true, user: {...} }
   
4. Controller appointments.create()
   ↓
   
5. TeamAClient.getDoctorDetails(doctor_id)
   ↓ → Équipe A : GET /api/doctors/{id}
   ↓ ← Équipe A : { id, name, price, ... }
   
6. TeamAClient.checkSlotAvailability()
   ↓ → Équipe A : GET /api/doctors/{id}/slots?from=...
   ↓ ← Équipe A : { slots: [...] }
   
7. Validation disponibilité
   ↓ Si indisponible → Erreur 409
   ↓ Si disponible → Suite
   
8. Créer RDV en DB
   ↓ INSERT INTO rdv
   
9. Créer Paiement en DB
   ↓ INSERT INTO paiement
   
10. TeamAClient.getUserDetails(patient_id)
    ↓ → Équipe A : GET /api/users/{id}
    ↓ ← Équipe A : { email, phone, lang, ... }
    
11. NotificationService.sendBookingConfirmation()
    ↓ Email + SMS au patient
    ↓ Email au médecin
    
12. Réponse au Frontend
    ← 201 Created
    ← Body: { appointment, payment }
```

---

# 6. EXEMPLES D'IMPLÉMENTATION

## 6.1 Service TeamAClient (extrait)

```javascript
// src/services/teamAClient.js

const axios = require('axios');
const axiosRetry = require('axios-retry');
const logger = require('../utils/logger');

class TeamAClient {
  constructor() {
    this.baseURL = process.env.TEAM_A_API_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': 'team-b-rdv'
      }
    });

    // Configuration retry
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error)
          || error.response?.status === 503;
      }
    });

    // Intercepteur : ajout du token service
    this.client.interceptors.request.use(async (config) => {
      config.headers.Authorization = `Bearer ${process.env.TEAM_A_SERVICE_TOKEN}`;
      config.headers['X-Request-ID'] = this.generateRequestId();
      
      logger.info(`[TeamA] → ${config.method.toUpperCase()} ${config.url}`);
      return config;
    });

    // Intercepteur : logs des réponses
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`[TeamA] ← ${response.status} (${response.config.url})`);
        return response;
      },
      (error) => {
        logger.error(`[TeamA] ✖ ${error.message}`);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  handleError(error) {
    if (error.response?.status === 404) {
      throw new NotFoundError(error.response.data.error?.message);
    }
    if (error.response?.status === 503) {
      throw new ServiceUnavailableError('Team A API is unavailable');
    }
    throw new ExternalAPIError('Failed to call Team A API', error);
  }

  // Récupérer détails d'un médecin
  async getDoctorDetails(doctorId) {
    const response = await this.client.get(`/api/doctors/${doctorId}`);
    return response.data.data;
  }

  // Vérifier disponibilité d'un slot
  async checkSlotAvailability(doctorId, startAt, endAt) {
    const response = await this.client.get(`/api/doctors/${doctorId}/slots`, {
      params: {
        from: startAt,
        to: endAt
      }
    });

    const slots = response.data.data.slots;
    return slots.some(slot => 
      slot.start === startAt && slot.available === true
    );
  }

  // Récupérer infos utilisateur
  async getUserDetails(userId) {
    const response = await this.client.get(`/api/users/${userId}`);
    return response.data.data;
  }

  // Vérifier validité d'un token
  async verifyToken(token) {
    const response = await this.client.post('/api/auth/verify-token', {
      token: token
    });
    return response.data.data;
  }
}

module.exports = new TeamAClient();
```

## 6.2 Controller Appointments (extrait)

```javascript
// src/controllers/appointments.controller.js

const teamAClient = require('../services/teamAClient');
const RDV = require('../models/RDV');
const Paiement = require('../models/Paiement');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class AppointmentsController {
  
  async create(req, res) {
    const { doctor_id, start_at, reason } = req.body;
    const patient_id = req.user.id; // Extrait du JWT par middleware

    try {
      logger.info(`Creating appointment for patient ${patient_id} with doctor ${doctor_id}`);

      // 1. Récupérer détails médecin
      const doctor = await teamAClient.getDoctorDetails(doctor_id);
      
      if (!doctor.is_verified) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DOCTOR_NOT_VERIFIED',
            message: 'Ce médecin n\'est pas encore vérifié'
          }
        });
      }

      // 2. Calculer heure de fin (30 min par défaut)
      const end_at = new Date(new Date(start_at).getTime() + 30 * 60000);

      // 3. Vérifier disponibilité du slot
      const isAvailable = await teamAClient.checkSlotAvailability(
        doctor_id,
        start_at,
        end_at
      );

      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SLOT_UNAVAILABLE',
            message: 'Ce créneau n\'est plus disponible'
          }
        });
      }

      // 4. Récupérer infos patient (pour notifications)
      const patient = await teamAClient.getUserDetails(patient_id);

      // 5. Créer le RDV dans notre DB
      const rdv = await RDV.create({
        doctor_id,
        patient_id,
        start_at,
        end_at,
        status: 'booked',
        reason: reason || ''
      });

      // 6. Créer le paiement
      const paiement = await Paiement.create({
        rdv_id: rdv.id,
        montant: doctor.consultation_price, // En centimes
        monnaie: 'XOF',
        status: 'pending',
        provider: 'stripe'
      });

      // 7. Envoyer notifications
      await notificationService.sendBookingConfirmation({
        patient: {
          email: patient.email,
          phone: patient.phone_number,
          name: `${patient.first_name} ${patient.last_name}`,
          lang: patient.preferred_language || 'fr'
        },
        doctor: {
          email: doctor.email,
          name: `Dr. ${doctor.last_name}`,
          specialty: doctor.specialty.name
        },
        appointment: {
          date: start_at,
          price: doctor.consultation_price / 100
        }
      });

      logger.info(`Appointment ${rdv.id} created successfully`);

      // 8. Réponse
      return res.status(201).json({
        success: true,
        data: {
          appointment: rdv,
          payment: paiement
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      });

    } catch (error) {
      logger.error(`Error creating appointment: ${error.message}`, {
        patient_id,
        doctor_id,
        error: error.stack
      });

      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la création du rendez-vous'
        }
      });
    }
  }

  async getMyAppointments(req, res) {
    const user_id = req.user.id;
    const { status, from, to } = req.query;

    try {
      const where = {};
      
      if (req.user.role === 'PATIENT') {
        where.patient_id = user_id;
      } else if (req.user.role === 'DOCTOR') {
        where.doctor_id = user_id;
      }

      if (status) {
        where.status = status;
      }

      if (from) {
        where.start_at = { ...where.start_at, $gte: new Date(from) };
      }

      if (to) {
        where.start_at = { ...where.start_at, $lte: new Date(to) };
      }

      const appointments = await RDV.findAll({
        where,
        order: [['start_at', 'ASC']]
      });

      return res.json({
        success: true,
        data: appointments,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      });

    } catch (error) {
      logger.error(`Error fetching appointments: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des rendez-vous'
        }
      });
    }
  }

  async cancel(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
      const rdv = await RDV.findByPk(id);

      if (!rdv) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'APPOINTMENT_NOT_FOUND',
            message: 'Rendez-vous introuvable'
          }
        });
      }

      // Vérifier autorisation
      if (rdv.patient_id !== user_id && rdv.doctor_id !== user_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vous n\'êtes pas autorisé à annuler ce rendez-vous'
          }
        });
      }

      // Mise à jour statut
      rdv.status = 'canceled';
      rdv.canceled_at = new Date();
      await rdv.save();

      // TODO: Gérer remboursement si paiement effectué

      // TODO: Envoyer notifications d'annulation

      logger.info(`Appointment ${id} canceled by user ${user_id}`);

      return res.json({
        success: true,
        data: rdv,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      });

    } catch (error) {
      logger.error(`Error canceling appointment: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de l\'annulation'
        }
      });
    }
  }
}

module.exports = new AppointmentsController();
```

---

# 7. GESTION DES ERREURS

## 7.1 Stratégie globale

Notre stratégie de gestion des erreurs repose sur trois principes :

1. **Fail fast** : Détecter et rejeter les erreurs le plus tôt possible
2. **Contexte riche** : Fournir suffisamment d'informations pour debugger
3. **Messages clairs** : Différencier messages techniques (logs) et messages utilisateur

## 7.2 Types d'erreurs

### Erreurs de validation (400)

**Cause :** Données envoyées invalides  
**Exemples :**
- Email mal formaté
- Date dans un format incorrect
- Champ requis manquant

**Gestion :**
- Validation avec Joi avant le traitement
- Retour détaillé des champs en erreur
- Pas de retry côté client

### Erreurs d'authentification (401)

**Cause :** Token manquant, invalide ou expiré  
**Exemples :**
- Header Authorization absent
- Token JWT expiré
- Signature JWT invalide

**Gestion :**
- Vérification en middleware
- Redirection vers login côté frontend
- Log de sécurité

### Erreurs d'autorisation (403)

**Cause :** Token valide mais pas les droits  
**Exemples :**
- Patient essaye de voir les RDV d'un autre
- Médecin non vérifié
- Accès à une ressource admin

**Gestion :**
- Vérification des rôles en middleware
- Message clair "Accès refusé"
- Log de sécurité

### Erreurs métier (409, 422)

**Cause :** Logique métier violée  
**Exemples :**
- Slot déjà réservé (409 Conflict)
- Date dans le passé (422 Unprocessable)
- Médecin non disponible

**Gestion :**
- Message spécifique au cas métier
- Code métier custom
- Proposer alternatives si possible

### Erreurs externes (503)

**Cause :** Service équipe A indisponible  
**Exemples :**
- Timeout réseau
- Équipe A en maintenance
- Surcharge serveur

**Gestion :**
- Retry automatique (3×)
- Circuit breaker pour protection
- Message "Service temporairement indisponible"
- Alertes monitoring

### Erreurs internes (500)

**Cause :** Bug dans notre code  
**Exemples :**
- Exception non catchée
- Erreur de connexion DB
- Bug logique

**Gestion :**
- Log complet avec stack trace
- Message générique au user (pas de détails techniques)
- Alerte équipe (Slack, email)

## 7.3 Tableau récapitulatif

| Erreur | HTTP | Code métier | Message user | Action système | Retry ? |
|--------|------|-------------|--------------|----------------|---------|
| Email invalide | 400 | INVALID_EMAIL | "Email invalide" | Log debug | Non |
| Token manquant | 401 | MISSING_TOKEN | "Authentification requise" | Rejeter | Non |
| Accès refusé | 403 | FORBIDDEN | "Accès refusé" | Log sécurité | Non |
| Médecin inexistant | 404 | DOCTOR_NOT_FOUND | "Médecin introuvable" | Log warning | Non |
| Slot déjà pris | 409 | SLOT_TAKEN | "Créneau indisponible" | Log info | Non |
| Date passée | 422 | PAST_DATE | "Date invalide" | Log debug | Non |
| Rate limit | 429 | RATE_LIMIT | "Trop de requêtes" | Log warning | Oui (après délai) |
| Bug interne | 500 | INTERNAL_ERROR | "Erreur serveur" | Log error + alerte | Non |
| Service down | 503 | SERVICE_DOWN | "Service indisponible" | Log error + retry | Oui (3×) |

---

# 8. ANNEXES

## 8.1 Glossaire

| Terme | Définition |
|-------|------------|
| **API** | Application Programming Interface - Interface permettant à deux systèmes de communiquer |
| **REST** | Representational State Transfer - Style d'architecture pour APIs web |
| **JWT** | JSON Web Token - Standard de token d'authentification |
| **UUID** | Universally Unique Identifier - Identifiant unique universel |
| **ISO 8601** | Standard international pour la représentation des dates et heures |
| **RGPD** | Règlement Général sur la Protection des Données |
| **Circuit Breaker** | Pattern de résilience qui "coupe" temporairement les appels vers un service défaillant |
| **Retry** | Tentative automatique de refaire une requête échouée |
| **Timeout** | Durée maximale d'attente d'une réponse avant abandon |
| **Rate Limiting** | Limitation du nombre de requêtes par unité de temps |
| **i18n** | Internationalisation - Support de plusieurs langues |
| **Cache** | Stockage temporaire de données pour accélérer l'accès |
| **Webhook** | Callback HTTP permettant à un service de notifier un événement |

## 8.2 Endpoints API Équipe A (consommés par nous)

### Authentification

```
POST /api/auth/verify-token
Body: { "token": "eyJhbGc..." }
Response: { "valid": true, "user": {...} }
```

### Utilisateurs

```
GET /api/users/{id}
Response: { "id", "first_name", "last_name", "email", "phone_number", "preferred_language" }
```

### Médecins

```
GET /api/doctors/{id}
Response: { "id", "first_name", "last_name", "specialty", "consultation_price", "is_verified", "rating" }

GET /api/doctors?city={city}&specialty={specialty}&lang={lang}&page={page}
Response: { "data": [...], "pagination": {...} }
```

### Slots

```
GET /api/doctors/{id}/slots?from={iso_date}&to={iso_date}
Response: { "slots": [{ "id", "start", "end", "available" }] }
```

## 8.3 Endpoints API que nous exposons

### Rendez-vous

```
POST /api/v1/appointments
Body: { "doctor_id", "start_at", "reason" }
Response: 201 { "appointment": {...}, "payment": {...} }

GET /api/v1/appointments/my?status={status}&from={date}&to={date}
Response: 200 { "data": [...] }

GET /api/v1/appointments/{id}
Response: 200 { "data": {...} }

DELETE /api/v1/appointments/{id}
Response: 200 { "data": {...} }
```

### Paiements

```
POST /api/v1/payments/intent
Body: { "appointment_id", "amount", "currency" }
Response: 201 { "client_secret", "payment_id" }

POST /api/v1/payments/webhook
Body: (Stripe webhook payload)
Response: 200 OK
```

### Notifications

```
POST /api/v1/notifications/test
Body: { "type", "recipient", "lang" }
Response: 200 { "message": "Notification sent" }
```

## 8.4 Variables d'environnement complètes

```bash
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/rdv_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL_DEFAULT=300

# API Équipe A
TEAM_A_API_URL=https://api-team-a.2bibsah.com
TEAM_A_SERVICE_TOKEN=service_token_here
TEAM_A_TIMEOUT=5000
TEAM_A_RETRY_COUNT=3

# Notifications Email
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@2bibsah.com
EMAIL_FROM_NAME=2Bibsah

# Notifications SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+221771234567

# Paiements
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
WAVE_API_KEY=xxx
ORANGE_MONEY_API_KEY=xxx

# Application
PORT=3001
NODE_ENV=production
APP_VERSION=1.0.0
LOG_LEVEL=info

# Sécurité
ENCRYPTION_KEY=32_char_secret_key_here_xxxx
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Jobs
REMINDER_J1_HOUR=18
REMINDER_J0_HOUR=9
```

## 8.5 Checklist de mise en production

### Sécurité

- [ ] HTTPS activé (certificat SSL valide)
- [ ] Helmet.js configuré
- [ ] CORS configuré avec origines spécifiques
- [ ] Rate limiting activé
- [ ] Variables d'environnement sécurisées (pas en clair)
- [ ] Validation de toutes les entrées utilisateur
- [ ] Chiffrement des données sensibles
- [ ] Logs d'audit activés

### Performance

- [ ] Redis configuré pour le cache
- [ ] Index DB sur les colonnes fréquemment requêtées
- [ ] Pagination sur toutes les listes
- [ ] Compression gzip activée
- [ ] CDN pour les assets statiques (si applicable)

### Monitoring

- [ ] Logs centralisés (CloudWatch, ELK)
- [ ] Métriques collectées (latence, erreurs, uptime)
- [ ] Alertes configurées (downtime, taux d'erreur élevé)
- [ ] Healthcheck endpoint (/health)
- [ ] Dashboard de monitoring (Grafana, DataDog)

### Résilience

- [ ] Circuit breaker configuré
- [ ] Retry logic testée
- [ ] Timeouts appropriés
- [ ] Backups automatiques configurés
- [ ] Plan de disaster recovery documenté

### Documentation

- [ ] Documentation API (Swagger)
- [ ] README à jour
- [ ] Variables d'environnement documentées
- [ ] Runbook pour les incidents
- [ ] Architecture diagramée

### Tests

- [ ] Tests unitaires (couverture > 80%)
- [ ] Tests d'intégration
- [ ] Tests de charge (load testing)
- [ ] Tests de sécurité (OWASP)

## 8.6 Contacts et ressources

### Équipe B (notre équipe)

- **Responsable technique :** [Nom]
- **Email :** team-b@2bibsah.com
- **Slack :** #team-b-rdv
- **Repository :** github.com/2bibsah/back-b

### Équipe A (dépendances)

- **Responsable technique :** [Nom]
- **Email :** team-a@2bibsah.com
- **Slack :** #team-a-identites
- **Documentation API :** https://api-team-a.2bibsah.com/docs

### Ressources externes

- **Stripe Documentation :** https://stripe.com/docs
- **Twilio API :** https://www.twilio.com/docs
- **SendGrid Guide :** https://docs.sendgrid.com

---

**FIN DU DOCUMENT**

*Document généré le : 21 novembre 2025*  
*Version : 1.0*  
*Auteur : Équipe Back B*


