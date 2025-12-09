import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
// import routes
import appointmentRoutes from './routes/appointment.routes';
import slotRoutes from './routes/slot.routes';
import prescriptionRoutes from './routes/prescription.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import auditRoutes from './routes/audit.routes';
import statsRoutes from './routes/stats.routes';

import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

import path from 'path';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const publicPath = path.join(process.cwd(), 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Swagger Documentation - Vercel-compatible setup using CDN assets
const swaggerOptions = {
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"
    ]
};

// For Vercel: serve swagger spec as JSON endpoint
app.get('/api-docs/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});

// Serve Swagger UI with CDN assets
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));
console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);

// Routes
// Note: Auth middleware is applied globally or per route. 
// For this example, let's assume some routes might be public, but most are private.
// Applying authMiddleware to /api would protect all routes.
// app.use('/api', authMiddleware) // Uncomment to protect all routes
// For now we will apply it conceptually or inside specific routers if needed.

// Using authMiddleware for all API routes as per requirements (User injection)
app.use('/api', authMiddleware);

app.use('/api/appointments', appointmentRoutes);
app.use('/api/slots', slotRoutes); // All slot routes (including /by-doctor/:doctorId)
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auditlog', auditRoutes);
app.use('/api/stats', statsRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
    const indexPath = path.join(process.cwd(), 'public', 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

// Error Handling Middleware (Must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
