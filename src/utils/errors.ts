/**
 * Classes d'erreurs personnalisées pour l'application
 * 
 * Ces classes permettent de gérer les erreurs de manière cohérente
 * et de fournir des codes d'erreur métier spécifiques.
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        statusCode: number,
        message: string,
        isOperational = true,
        code?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.name = this.constructor.name;

        // Maintient la stack trace pour le débogage
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erreur 400 - Bad Request
 * Utilisée pour les données invalides ou les requêtes mal formées
 */
export class BadRequestError extends AppError {
    constructor(message: string, code?: string) {
        super(400, message, true, code);
    }
}

/**
 * Erreur 401 - Unauthorized
 * Utilisée quand l'utilisateur n'est pas authentifié
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Non autorisé', code?: string) {
        super(401, message, true, code);
    }
}

/**
 * Erreur 403 - Forbidden
 * Utilisée quand l'utilisateur n'a pas les permissions nécessaires
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Accès interdit', code?: string) {
        super(403, message, true, code);
    }
}

/**
 * Erreur 404 - Not Found
 * Utilisée quand une ressource n'est pas trouvée
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Ressource non trouvée', code?: string) {
        super(404, message, true, code);
    }
}

/**
 * Erreur 409 - Conflict
 * Utilisée pour les conflits (ex: email déjà utilisé)
 */
export class ConflictError extends AppError {
    constructor(message: string, code?: string) {
        super(409, message, true, code);
    }
}

/**
 * Erreur 422 - Unprocessable Entity
 * Utilisée pour les erreurs de validation
 */
export class ValidationError extends AppError {
    public readonly errors?: Record<string, string[]>;

    constructor(message: string, errors?: Record<string, string[]>, code?: string) {
        super(422, message, true, code);
        this.errors = errors;
    }
}

/**
 * Erreur 500 - Internal Server Error
 * Utilisée pour les erreurs serveur inattendues
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Erreur serveur interne', code?: string) {
        super(500, message, false, code);
    }
}
