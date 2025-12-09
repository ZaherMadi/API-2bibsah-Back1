"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
// Determine if running from dist (production) or src (development)
const isProduction = __dirname.includes('dist');
const basePath = isProduction ? path_1.default.join(__dirname, '..') : path_1.default.join(__dirname, '..', '..');
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
        path_1.default.join(basePath, 'src', 'routes', '*.ts'),
        path_1.default.join(basePath, 'src', 'controllers', '*.ts'),
        path_1.default.join(basePath, 'dist', 'routes', '*.js'),
        path_1.default.join(basePath, 'dist', 'controllers', '*.js'),
    ],
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
