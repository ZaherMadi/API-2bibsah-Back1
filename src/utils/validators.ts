/**
 * Validateurs de données
 * 
 * Pour l'instant, fonctions de validation basiques
 * Plus tard, vous pouvez intégrer Zod ou Joi pour une validation plus robuste
 */

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valide un mot de passe
 * Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre
 */
export function isValidPassword(password: string): boolean {
    if (password.length < 8) {
        return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * Valide un numéro de téléphone (format international simplifié)
 */
export function isValidPhone(phone: string): boolean {
    // Supprime les espaces et caractères spéciaux
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Vérifie que c'est composé uniquement de chiffres et commence par +
    return /^\+?[1-9]\d{1,14}$/.test(cleaned);
}

/**
 * Valide un UUID
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Valide une date ISO
 */
export function isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}
