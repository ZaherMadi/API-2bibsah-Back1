/**
 * Service d'authentification
 * 
 * Gère le hash des mots de passe et la vérification des credentials
 */

import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AuthService {
    private readonly saltRounds = 10;

    /**
     * Hash un mot de passe avec bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        try {
            const hash = await bcrypt.hash(password, this.saltRounds);
            return hash;
        } catch (error) {
            logger.error('Erreur lors du hash du mot de passe', error as Error);
            throw new Error('Erreur lors du hash du mot de passe');
        }
    }

    /**
     * Vérifie si un mot de passe correspond au hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            logger.error('Erreur lors de la vérification du mot de passe', error as Error);
            return false;
        }
    }

    /**
     * Vérifie les credentials d'un utilisateur
     * Retourne l'utilisateur si les credentials sont valides
     */
    async verifyCredentials(email: string, password: string) {
        // Trouver l'utilisateur par email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        // Vérifier le mot de passe
        const isPasswordValid = await this.verifyPassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Vérifie si un email existe déjà
     */
    async emailExists(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        return !!user;
    }

    /**
     * Crée un nouvel utilisateur
     */
    async createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role?: UserRole;
    }) {
        // Vérifier si l'email existe déjà
        if (await this.emailExists(data.email)) {
            throw new ConflictError('Cet email est déjà utilisé');
        }

        // Hash le mot de passe
        const hashedPassword = await this.hashPassword(data.password);

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: data.role || UserRole.PATIENT,
            },
        });

        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default new AuthService();
