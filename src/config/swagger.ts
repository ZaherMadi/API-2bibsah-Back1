import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// Determine if running from dist (production) or src (development)
const isProduction = __dirname.includes('dist');
const basePath = isProduction ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');

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
    },
    // Include both .ts and .js files to work in dev and production
    apis: [
        path.join(basePath, 'src', 'routes', '*.ts'),
        path.join(basePath, 'src', 'controllers', '*.ts'),
        path.join(basePath, 'dist', 'routes', '*.js'),
        path.join(basePath, 'dist', 'controllers', '*.js'),
    ],
};

const specs = swaggerJsdoc(options);

export default specs;
