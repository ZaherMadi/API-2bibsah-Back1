/**
 * Middleware d'authentification JWT
 * 
 * Vérifie le token JWT dans le header Authorization
 * et injecte l'utilisateur dans req.user
 */

import { Request, Response, NextFunction } from 'express';
import jwtService from '../services/jwt.service';
import { prisma } from '../config/database';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extraire le token depuis le header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            throw new UnauthorizedError('Token d\'authentification manquant');
        }

        // Extraire et vérifier le token
        const token = jwtService.extractTokenFromHeader(authHeader);
        const decoded = jwtService.verifyToken(token);

        // Récupérer l'utilisateur depuis la base de données
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('Utilisateur non trouvé');
        }

        // Injecter l'utilisateur dans la requête
        req.user = user;
        next();
    } catch (error) {
        // Si c'est déjà une AppError, la passer au middleware d'erreur
        if (error instanceof UnauthorizedError) {
            return next(error);
        }

        // Sinon, logger l'erreur et retourner une erreur générique
        logger.error('Erreur dans authMiddleware', error as Error);
        next(new UnauthorizedError('Erreur d\'authentification'));
    }
};
