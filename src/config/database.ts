/**
 * Configuration de la base de données avec Prisma
 * 
 * Ce fichier initialise le client Prisma qui sera utilisé
 * dans toute l'application pour interagir avec la base de données.
 */

import { PrismaClient } from '@prisma/client';

// Déclaration globale pour éviter les multiples instances en développement
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Client Prisma singleton
 * 
 * En développement, on réutilise la même instance pour éviter
 * les problèmes de connexions multiples avec nodemon/ts-node.
 * En production, on crée une nouvelle instance.
 */
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Fonction pour déconnecter proprement Prisma
 * Utile pour les tests ou l'arrêt du serveur
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export default prisma;
