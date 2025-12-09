/**
 * Middleware de gestion des erreurs global
 * 
 * Capture toutes les erreurs et les formate de manière cohérente
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorMiddleware = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Si c'est une AppError, utiliser ses propriétés
    if (err instanceof AppError) {
        logger.error(`[${err.statusCode}] ${err.message}`, {
            code: err.code,
            path: req.path,
            method: req.method,
        });

        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
            }),
        });
        return;
    }

    // Erreur inattendue (non opérationnelle)
    logger.error('Erreur serveur inattendue', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // En production, ne pas exposer les détails de l'erreur
    const message = process.env.NODE_ENV === 'production'
        ? 'Erreur serveur interne'
        : err.message;

    res.status(500).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
        }),
    });
};
