/**
 * Configuration des variables d'environnement
 * 
 * Ce fichier charge et valide les variables d'environnement
 * nécessaires au fonctionnement de l'application.
 */

import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

/**
 * Interface pour typer les variables d'environnement
 */
interface EnvConfig {
  // Base de données
  DATABASE_URL: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Serveur
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // CORS
  CORS_ORIGIN?: string;
}

/**
 * Fonction pour valider et charger les variables d'environnement
 */
function loadEnvConfig(): EnvConfig {
  // Vérifier les variables obligatoires
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(
        `❌ Variable d'environnement manquante: ${varName}\n` +
        `   Créez un fichier .env à la racine du projet.\n` +
        `   Copiez .env.example en .env et remplissez les valeurs.`
      );
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'],
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  };
}

// Charger et exporter la configuration
export const env = loadEnvConfig();

// Export par défaut pour faciliter l'import
export default env;
