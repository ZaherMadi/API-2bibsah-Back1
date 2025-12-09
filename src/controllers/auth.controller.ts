/**
 * Contrôleur d'authentification
 * 
 * Gère l'inscription, la connexion et la récupération du profil utilisateur
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { jwtService } from '../services';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';
import { isValidEmail, isValidPassword } from '../utils/validators';
import { ApiResponse } from '../types';

export class AuthController {
    /**
     * Inscription d'un nouvel utilisateur
     * POST /api/auth/register
     * 
     * Body: {
     *   email: string,
     *   password: string,
     *   firstName: string,
     *   lastName: string,
     *   phone?: string,
     *   role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'
     * }
     */
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password, firstName, lastName, phone, role } = req.body;

            // Validation des données
            if (!email || !password || !firstName || !lastName) {
                throw new BadRequestError('Email, mot de passe, prénom et nom sont requis');
            }

            // Valider le format de l'email
            if (!isValidEmail(email)) {
                throw new BadRequestError('Format d\'email invalide');
            }

            // Valider le mot de passe
            if (!isValidPassword(password)) {
                throw new BadRequestError(
                    'Le mot de passe doit contenir au moins 8 caractères, ' +
                    'une majuscule, une minuscule et un chiffre'
                );
            }

            // Créer l'utilisateur
            const user = await authService.createUser({
                email,
                password,
                firstName,
                lastName,
                phone,
                role,
            });

            // Générer un token JWT
            const token = jwtService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            logger.info('Nouvel utilisateur inscrit', { userId: user.id, email: user.email });

            const response: ApiResponse = {
                success: true,
                message: 'Inscription réussie',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                    },
                    token,
                },
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Connexion d'un utilisateur
     * POST /api/auth/login
     * 
     * Body: {
     *   email: string,
     *   password: string
     * }
     */
    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Validation des données
            if (!email || !password) {
                throw new BadRequestError('Email et mot de passe sont requis');
            }

            // Valider le format de l'email
            if (!isValidEmail(email)) {
                throw new BadRequestError('Format d\'email invalide');
            }

            // Vérifier les credentials
            const user = await authService.verifyCredentials(email, password);

            // Générer un token JWT
            const token = jwtService.generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            logger.info('Utilisateur connecté', { userId: user.id, email: user.email });

            const response: ApiResponse = {
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                    },
                    token,
                },
            };

            res.status(200).json(response);
        } catch (error) {
            // Si c'est une UnauthorizedError, c'est normal (mauvais credentials)
            if (error instanceof UnauthorizedError) {
                logger.warn('Tentative de connexion échouée', { email: req.body.email });
            }
            next(error);
        }
    };

    /**
     * Récupérer le profil de l'utilisateur actuel
     * GET /api/auth/me
     * 
     * Nécessite un token JWT valide (req.user injecté par authMiddleware)
     */
    public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // req.user est injecté par authMiddleware
            if (!req.user) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }

            const response: ApiResponse = {
                success: true,
                data: {
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        firstName: req.user.firstName,
                        lastName: req.user.lastName,
                        role: req.user.role,
                    },
                },
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}

export default new AuthController();
