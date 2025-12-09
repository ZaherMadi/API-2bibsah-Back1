/**
 * Extensions des types Express
 * 
 * Ce fichier étend les types Express pour ajouter des propriétés personnalisées
 * comme req.user qui sera injecté par le middleware d'authentification.
 */

declare global {
    namespace Express {
        interface Request {
            /**
             * Utilisateur authentifié injecté par authMiddleware
             * undefined si l'utilisateur n'est pas authentifié
             */
            user?: {
                id: string;
                email: string;
                role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
                firstName?: string | null;
                lastName?: string | null;
            };
        }
    }
}

// Cette ligne est nécessaire pour que le fichier soit traité comme un module
export {};
