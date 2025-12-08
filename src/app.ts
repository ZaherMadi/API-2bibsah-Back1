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
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
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
app.use('/api/doctors/:id/slots', slotRoutes); // Specific slot routes
app.use('/api/slots', slotRoutes); // General slot routes
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auditlog', auditRoutes);
app.use('/api/stats', statsRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error Handling Middleware (Must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
