// Swagger configuration with inline OpenAPI spec for Vercel compatibility
// On Vercel serverless, file-based swagger-jsdoc scanning doesn't work reliably

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: '2bibsah Back 2',
        version: '1.0.0',
        description: 'API for managing medical appointments, slots, prescriptions, and payments.',
        contact: {
            name: 'API Support',
            email: 'support@example.com'
        },
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Entrez votre token JWT obtenu via /api/auth/login ou /api/auth/register',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
                    phone: { type: 'string', nullable: true },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                        type: 'object',
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: { type: 'string', description: 'Token JWT à utiliser dans le header Authorization' },
                        },
                    },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string' },
                    code: { type: 'string', nullable: true },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
    tags: [
        { name: 'Authentication', description: 'Authentification et gestion des utilisateurs' },
        { name: 'Appointments', description: 'Appointment management' },
        { name: 'Slots', description: 'Management of doctor availability slots' },
        { name: 'Prescriptions', description: 'Prescription management' },
        { name: 'Payments', description: 'Payment processing' },
        { name: 'Notifications', description: 'User notifications' },
        { name: 'Audit', description: 'Audit logs' },
        { name: 'Stats', description: 'KPI and Statistics' },
    ],
    paths: {
        // ==================== AUTHENTICATION ====================
        '/api/auth/register': {
            post: {
                summary: "Inscription d'un nouvel utilisateur",
                tags: ['Authentication'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password', 'firstName', 'lastName'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                                    password: { type: 'string', minLength: 8, example: 'SecurePass123' },
                                    firstName: { type: 'string', example: 'John' },
                                    lastName: { type: 'string', example: 'Doe' },
                                    phone: { type: 'string', example: '+221771234567' },
                                    role: { type: 'string', enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Inscription réussie', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    '400': { description: 'Données invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                    '409': { description: 'Email déjà utilisé', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/auth/login': {
            post: {
                summary: "Connexion d'un utilisateur",
                tags: ['Authentication'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                                    password: { type: 'string', example: 'SecurePass123' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': { description: 'Connexion réussie', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    '401': { description: 'Email ou mot de passe incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
                },
            },
        },
        '/api/auth/me': {
            get: {
                summary: "Récupérer le profil de l'utilisateur actuel",
                tags: ['Authentication'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Profil utilisateur' },
                    '401': { description: 'Non authentifié' },
                },
            },
        },

        // ==================== APPOINTMENTS ====================
        '/api/appointments': {
            post: {
                summary: 'Create a new appointment (Transactional)',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Appointment created successfully' },
                    '401': { description: 'Unauthorized' },
                },
            },
        },
        '/api/appointments/my': {
            get: {
                summary: 'Get my appointments',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of appointments' } },
            },
        },
        '/api/appointments/{id}': {
            get: {
                summary: 'Get appointment by ID',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    '200': { description: 'Appointment details' },
                    '404': { description: 'Appointment not found' },
                },
            },
            delete: {
                summary: 'Cancel an appointment',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Appointment cancelled' } },
            },
            patch: {
                summary: 'Update an appointment',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Appointment updated' } },
            },
        },

        // ==================== SLOTS ====================
        '/api/slots': {
            get: {
                summary: 'Get all available slots from all doctors',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of all available slots' } },
            },
            post: {
                summary: 'Create a new slot',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['doctorId', 'startAt', 'endAt'],
                                properties: {
                                    doctorId: { type: 'string' },
                                    startAt: { type: 'string', format: 'date-time' },
                                    endAt: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                    },
                },
                responses: { '201': { description: 'Slot created' } },
            },
        },
        '/api/slots/by-doctor/{doctorId}': {
            get: {
                summary: 'Get available slots for a specific doctor',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'doctorId', required: true, schema: { type: 'string' }, description: 'Doctor ID' }],
                responses: { '200': { description: 'List of available slots for the doctor' } },
            },
        },
        '/api/slots/{slotId}': {
            delete: {
                summary: 'Delete a specific slot',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'slotId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Slot deleted' } },
            },
        },

        // ==================== PRESCRIPTIONS ====================
        '/api/prescriptions': {
            post: {
                summary: 'Create a prescription',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                responses: { '201': { description: 'Prescription created' } },
            },
        },
        '/api/prescriptions/{id}': {
            get: {
                summary: 'Get prescription details',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Prescription details' } },
            },
        },
        '/api/prescriptions/{id}/dispense': {
            post: {
                summary: 'Mark prescription as dispensed (Pharmacist)',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Prescription dispensed' } },
            },
        },

        // ==================== PAYMENTS ====================
        '/api/payments/intent': {
            post: {
                summary: 'Create payment intent',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Payment intent created' } },
            },
        },
        '/api/payments/webhook': {
            post: {
                summary: 'Payment provider webhook',
                tags: ['Payments'],
                security: [],
                responses: { '200': { description: 'Webhook processed' } },
            },
        },
        '/api/payments/{id}/refund': {
            post: {
                summary: 'Refund a payment',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Refund processed' } },
            },
        },

        // ==================== NOTIFICATIONS ====================
        '/api/notifications': {
            get: {
                summary: 'Get user notification history',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of notifications' } },
            },
        },
        '/api/notifications/{id}/read': {
            patch: {
                summary: 'Mark notification as read',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Notification marked as read' } },
            },
        },
        '/api/notifications/test': {
            post: {
                summary: 'Test notification sending (Admin)',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Test notification sent' } },
            },
        },

        // ==================== AUDIT ====================
        '/api/auditlog': {
            get: {
                summary: 'Consult audit logs',
                tags: ['Audit'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of audit logs' } },
            },
        },

        // ==================== STATS ====================
        '/api/stats/global': {
            get: {
                summary: 'Get global KPIs for admin dashboard',
                tags: ['Stats'],
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'Global statistics' } },
            },
        },
    },
};

export default swaggerSpec;
