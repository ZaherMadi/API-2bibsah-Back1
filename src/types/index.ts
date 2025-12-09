/**
 * Types TypeScript partagés dans toute l'application
 */

import { UserRole, AppointmentStatus, PaymentStatus, PrescriptionStatus } from '@prisma/client';

// Ré-exporter les types Prisma pour faciliter les imports
export type { UserRole, AppointmentStatus, PaymentStatus, PrescriptionStatus };

/**
 * Interface pour les réponses API standardisées
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Interface pour les erreurs API
 */
export interface ApiError {
    statusCode: number;
    message: string;
    code?: string;
    details?: any;
}

/**
 * Interface pour les tokens JWT
 */
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

/**
 * Interface pour les données de login
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Interface pour les données d'inscription
 */
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
}