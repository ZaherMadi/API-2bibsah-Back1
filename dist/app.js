"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
// import routes
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const slot_routes_1 = __importDefault(require("./routes/slot.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const path_1 = __importDefault(require("path"));
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const publicPath = path_1.default.join(process.cwd(), 'public');
console.log('Serving static files from:', publicPath);
app.use(express_1.default.static(publicPath));
// Swagger Documentation - Vercel-compatible setup using CDN assets
const swaggerOptions = {
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"
    ]
};
// For Vercel: serve swagger spec as JSON endpoint
app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.default);
});
// Serve Swagger UI with CDN assets
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, swaggerOptions));
console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
// Routes
// Note: Auth middleware is applied globally or per route. 
// For this example, let's assume some routes might be public, but most are private.
// Applying authMiddleware to /api would protect all routes.
// app.use('/api', authMiddleware) // Uncomment to protect all routes
// For now we will apply it conceptually or inside specific routers if needed.
// Using authMiddleware for all API routes as per requirements (User injection)
app.use('/api', auth_middleware_1.authMiddleware);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/doctors/:id/slots', slot_routes_1.default); // Specific slot routes
app.use('/api/slots', slot_routes_1.default); // General slot routes
app.use('/api/prescriptions', prescription_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/auditlog', audit_routes_1.default);
app.use('/api/stats', stats_routes_1.default);
// Root Endpoint
app.get('/', (req, res) => {
    const indexPath = path_1.default.join(process.cwd(), 'public', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});
// Error Handling Middleware (Must be last)
app.use(error_middleware_1.errorMiddleware);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
