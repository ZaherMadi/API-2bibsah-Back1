# API-2bibsah-Back1

Ce repository à pour objectif de monter une API reposant sur des similitudes de Doctolib, en destinant ces outils à un public non occidentale. Ce projet sera en relation avec plusieurs élèves de M2 Développement

## 🚀 Installation

```bash
npm install
```

## 📦 Démarrage

```bash
npm start
```

Le serveur démarrera sur le port 3000. Accédez à l'application via: `http://localhost:3000`

## 🌍 API Endpoints

### Obtenir toutes les spécialités
```
GET /api/v1/docteur
```

Retourne la liste de toutes les spécialités médicales disponibles avec leur description.

**Exemple de réponse:**
```json
{
  "success": true,
  "message": "Retrouvez vos chirurgiens dentistes, pédiatres, médecins généralistes...",
  "specialites": {
    "dentiste": {
      "nom": "Chirurgien Dentiste",
      "description": "Retrouvez vos chirurgiens dentistes qualifiés...",
      "icon": "🦷"
    }
  }
}
```

### Filtrer par spécialité
```
GET /api/v1/docteur?specialite={specialite}
```

Retourne les informations d'une spécialité spécifique.

**Spécialités disponibles:** dentiste, pediatre, generaliste, cardiologue, dermatologue, ophtalmologue

**Exemple:**
```
GET /api/v1/docteur?specialite=dentiste
```

**Exemple de réponse:**
```json
{
  "success": true,
  "specialite": "dentiste",
  "data": {
    "nom": "Chirurgien Dentiste",
    "description": "Retrouvez vos chirurgiens dentistes qualifiés...",
    "icon": "🦷"
  }
}
```

## 🎨 Interface Web

L'application comprend une interface web avec un style africain multiculturel accessible à la racine (`/`). Elle affiche toutes les spécialités médicales disponibles avec des couleurs vibrantes inspirées des cultures africaines.
