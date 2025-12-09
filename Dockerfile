# Image de base Node.js
FROM node:20-alpine

# Installer les outils nécessaires pour Prisma et les builds natifs
RUN apk add --no-cache openssl libc6-compat

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer les dépendances
# npm ci est plus rapide et plus fiable que npm install pour les builds Docker
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port sur lequel l'API écoute
EXPOSE 3000

# Commande par défaut pour démarrer l'application
# En développement, on utilise ts-node directement avec nodemon pour le hot-reload
# En production, on pourrait build puis lancer le JS compilé
CMD ["npm", "run", "dev"]
