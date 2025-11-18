# Guide de démarrage rapide - API 2Bibsah

## Installation

```bash
npm install
```

## Démarrage du serveur

```bash
npm start
```

Le serveur démarrera sur `http://localhost:3000`

## Utilisation de l'API

### 1. Obtenir toutes les spécialités médicales

**Endpoint:** `GET /api/v1/docteur`

**Exemple avec curl:**
```bash
curl http://localhost:3000/api/v1/docteur
```

**Réponse:**
```json
{
  "success": true,
  "message": "Retrouvez vos chirurgiens dentistes, pédiatres...",
  "specialites": {
    "dentiste": { ... },
    "pediatre": { ... },
    ...
  }
}
```

### 2. Filtrer par spécialité

**Endpoint:** `GET /api/v1/docteur?specialite={nom_specialite}`

**Spécialités disponibles:**
- dentiste
- pediatre
- generaliste
- cardiologue
- dermatologue
- ophtalmologue

**Exemple avec curl:**
```bash
curl "http://localhost:3000/api/v1/docteur?specialite=dentiste"
```

**Réponse:**
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

## Interface Web

Accédez à l'interface web en visitant: `http://localhost:3000`

L'interface affiche toutes les spécialités médicales avec un design africain multiculturel coloré.

## Structure du projet

```
API-2bibsah-Back1/
├── index.js           # Serveur Express principal
├── public/
│   └── index.html    # Interface web avec style africain
├── package.json      # Dépendances et scripts
├── README.md         # Documentation
└── .gitignore       # Fichiers à ignorer
```

## Notes importantes

- Aucune base de données n'est requise pour cette version
- Les données sont stockées en mémoire dans le fichier `index.js`
- Pour un usage en production, il est recommandé d'ajouter:
  - Une base de données (MongoDB, PostgreSQL, etc.)
  - Rate limiting pour protéger l'API
  - Variables d'environnement pour la configuration
  - Logging et monitoring
