"use strict";
// Swagger configuration with inline OpenAPI spec for Vercel compatibility
// On Vercel serverless, file-based swagger-jsdoc scanning doesn't work reliably
Object.defineProperty(exports, "__esModule", { value: true });
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
        {
            url: 'https://api-2bibsah-back1.vercel.app',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    tags: [
        { name: 'Appointments', description: 'Appointment management' },
        { name: 'Slots', description: 'Management of doctor availability slots' },
        { name: 'Prescriptions', description: 'Prescription management' },
        { name: 'Payments', description: 'Payment processing' },
        { name: 'Notifications', description: 'User notifications' },
        { name: 'Audit', description: 'Audit logs' },
        { name: 'Stats', description: 'KPI and Statistics' },
    ],
    paths: {
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
                responses: {
                    '200': { description: 'List of appointments' },
                },
            },
        },
        '/api/appointments/{id}': {
            get: {
                summary: 'Get appointment by ID',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Appointment details' },
                    '404': { description: 'Appointment not found' },
                },
            },
            delete: {
                summary: 'Cancel an appointment',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Appointment cancelled' },
                },
            },
            patch: {
                summary: 'Update an appointment',
                tags: ['Appointments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Appointment updated' },
                },
            },
        },
        // ==================== SLOTS ====================
        '/api/slots': {
            get: {
                summary: 'Calculate free slots',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of available slots' },
                },
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
                                properties: {
                                    doctorId: { type: 'string' },
                                    start: { type: 'string', format: 'date-time' },
                                    end: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '201': { description: 'Slot created' },
                },
            },
        },
        '/api/doctors/{id}/slots': {
            post: {
                summary: 'Define recurrence rules for slots',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '201': { description: 'Slots created' },
                },
            },
        },
        '/api/doctors/{id}/slots/{slotId}': {
            delete: {
                summary: 'Delete a specific slot',
                tags: ['Slots'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                    { in: 'path', name: 'slotId', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Slot deleted' },
                },
            },
        },
        // ==================== PRESCRIPTIONS ====================
        '/api/prescriptions': {
            post: {
                summary: 'Create a prescription',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '201': { description: 'Prescription created' },
                },
            },
        },
        '/api/prescriptions/{id}': {
            get: {
                summary: 'Get prescription details',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Prescription details' },
                },
            },
        },
        '/api/prescriptions/{id}/dispense': {
            post: {
                summary: 'Mark prescription as dispensed (Pharmacist)',
                tags: ['Prescriptions'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Prescription dispensed' },
                },
            },
        },
        // ==================== PAYMENTS ====================
        '/api/payments/intent': {
            post: {
                summary: 'Create payment intent',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Payment intent created' },
                },
            },
        },
        '/api/payments/webhook': {
            post: {
                summary: 'Payment provider webhook',
                tags: ['Payments'],
                responses: {
                    '200': { description: 'Webhook processed' },
                },
            },
        },
        '/api/payments/{id}/refund': {
            post: {
                summary: 'Refund a payment',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Refund processed' },
                },
            },
        },
        // ==================== NOTIFICATIONS ====================
        '/api/notifications': {
            get: {
                summary: 'Get user notification history',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of notifications' },
                },
            },
        },
        '/api/notifications/{id}/read': {
            patch: {
                summary: 'Mark notification as read',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    '200': { description: 'Notification marked as read' },
                },
            },
        },
        '/api/notifications/test': {
            post: {
                summary: 'Test notification sending (Admin)',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Test notification sent' },
                },
            },
        },
        // ==================== AUDIT ====================
        '/api/auditlog': {
            get: {
                summary: 'Consult audit logs',
                tags: ['Audit'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of audit logs' },
                },
            },
        },
        // ==================== STATS ====================
        '/api/stats/global': {
            get: {
                summary: 'Get global KPIs for admin dashboard',
                tags: ['Stats'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Global statistics' },
                },
            },
        },
    },
};
exports.default = swaggerSpec;
