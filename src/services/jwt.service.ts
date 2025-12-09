/**
 * Service JWT
 * 
 * Gère la génération et la vérification des tokens JWT
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload, UserRole } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export class JwtService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = env.JWT_SECRET;
        this.expiresIn = env.JWT_EXPIRES_IN;
    }

    /**
     * Génère un token JWT pour un utilisateur
     */
    generateToken(payload: {
        userId: string;
        email: string;
        role: UserRole;
    }): string {
        try {
            const tokenPayload: JwtPayload = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            };

            return jwt.sign(
                tokenPayload,
                this.secret,
                {
                    expiresIn: this.expiresIn,
                } as SignOptions
            );
        } catch (error) {
            logger.error('Erreur lors de la génération du token JWT', error as Error);
            throw new Error('Erreur lors de la génération du token');
        }
    }

    /**
     * Vérifie et décode un token JWT
     * Lance une erreur si le token est invalide ou expiré
     */
    verifyToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, this.secret) as JwtPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token expiré');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Token invalide');
            }
            logger.error('Erreur lors de la vérification du token JWT', error as Error);
            throw new UnauthorizedError('Erreur lors de la vérification du token');
        }
    }

    /**
     * Décode un token sans vérifier la signature (pour le débogage uniquement)
     * ⚠️ Ne pas utiliser en production !
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return jwt.decode(token) as JwtPayload;
        } catch (error) {
            logger.error('Erreur lors du décodage du token', error as Error);
            return null;
        }
    }

    /**
     * Extrait le token depuis le header Authorization
     * Format attendu: "Bearer <token>"
     */
    extractTokenFromHeader(authHeader: string | undefined): string {
        if (!authHeader) {
            throw new UnauthorizedError('Token manquant');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new UnauthorizedError('Format de token invalide. Utilisez: Bearer <token>');
        }

        return parts[1];
    }
}

export default new JwtService();
