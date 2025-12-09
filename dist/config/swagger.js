"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
const specs = (0, swagger_jsdoc_1.default)(options);
exports.default = specs;
