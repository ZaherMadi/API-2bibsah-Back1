// Swagger configuration with inline OpenAPI spec for Vercel compatibility
// On Vercel serverless, file-based swagger-jsdoc scanning doesn't work reliably

const options = {
    definition: {
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
                url: 'https://api-2bibsah-back1.vercel.app', // Update this with your actual Vercel URL if known, or use relative
                description: 'Production server',
            },
            // Alternatively, use a relative path if supported by the client, 
            // but Swagger UI often prefers absolute. 
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
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        firstName: {
                            type: 'string',
                        },
                        lastName: {
                            type: 'string',
                        },
                        role: {
                            type: 'string',
                            enum: ['PATIENT', 'DOCTOR', 'ADMIN'],
                        },
                        phone: {
                            type: 'string',
                            nullable: true,
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                user: {
                                    $ref: '#/components/schemas/User',
                                },
                                token: {
                                    type: 'string',
                                    description: 'Token JWT à utiliser dans le header Authorization',
                                },
                            },
                        },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                        },
                        code: {
                            type: 'string',
                            nullable: true,
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default swaggerSpec;
