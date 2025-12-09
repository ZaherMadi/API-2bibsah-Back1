import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class AppointmentController {

    // CRITICAL: Real Transactional Logic with Prisma
    public createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { doctorId, start_at, reason } = req.body;
        const userId = req.user?.id || 'mock-patient-id'; // Fallback for testing without full auth
        const startDateTime = new Date(start_at);

        console.log(`[Transaction Start] Creating appointment for User ${userId} with Doctor ${doctorId}`);

        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Step 1: Check Availability & Lock Slot (if slot exists)
                // For simplicity, we assume slots are created beforehand. 
                // If no slot exists, we might implicitly creating one or failing.
                // Let's check for overlapping appointments for this doctor.

                const existingAppt = await tx.appointment.findFirst({
                    where: {
                        doctorId: doctorId,
                        start_at: startDateTime,
                        status: { not: 'cancelled' }
                    }
                });

                if (existingAppt) {
                    throw new Error('Slot not available (Already booked)');
                }
                console.log('[Step 1] Slot availability checked.');

                // Step 2: Create Appointment Record
                const newAppointment = await tx.appointment.create({
                    data: {
                        doctorId,
                        patientId: userId,
                        start_at: startDateTime,
                        status: 'confirmed', // Confirmed immediately for this demo
                        reason,
                        paymentStatus: 'pending'
                    }
                });
                console.log(`[Step 2] Appointment ${newAppointment.id} created.`);

                // Step 3: Create Payment Log (Pending)
                await tx.payment.create({
                    data: {
                        appointmentId: newAppointment.id,
                        amount: 50.00, // Standard fee
                        status: 'pending'
                    }
                });
                console.log('[Step 3] Payment record initialized.');

                // Step 4: Create Notification
                await tx.notification.create({
                    data: {
                        userId: userId,
                        type: 'system',
                        content: `Votre RDV avec ${doctorId} est confirmé pour le ${startDateTime.toLocaleString()}`,
                        status: 'unread'
                    }
                });
                console.log('[Step 4] Notification logged.');

                return newAppointment;
            });

            console.log('[Transaction Commit] All steps successful.');

            res.status(201).json({
                success: true,
                data: result
            });

        } catch (error: any) {
            console.error(`[Transaction Rollback] Error: ${error.message}`);
            next(error);
        }
    };

    public getMyAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id || 'mock-patient-id';
            const appointments = await prisma.appointment.findMany({
                where: { patientId: userId },
                orderBy: { start_at: 'desc' },
                include: { doctor: true } // Include doctor details if possible
            });
            res.json({ success: true, data: appointments });
        } catch (error) {
            next(error);
        }
    };

    public getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await prisma.appointment.findUnique({ where: { id } });
            if (!appointment) {
                res.status(404).json({ success: false, message: 'Not found' });
                return;
            }
            res.json({ success: true, data: appointment });
        } catch (error) {
            next(error);
        }
    };

    public cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await prisma.appointment.update({
                where: { id },
                data: { status: 'cancelled' }
            });
            res.json({ success: true, message: 'Appointment cancelled' });
        } catch (error) {
            next(error);
        }
    };

    public updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updated = await prisma.appointment.update({
                where: { id },
                data: req.body
            });
            res.json({ success: true, message: 'Updated', data: updated });
        } catch (error) {
            next(error);
        }
    };
}
