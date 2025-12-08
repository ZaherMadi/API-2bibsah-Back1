import swaggerJsdoc from 'swagger-jsdoc';

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
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default specs;
