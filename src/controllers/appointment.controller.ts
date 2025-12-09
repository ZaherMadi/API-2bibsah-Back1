import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { Prisma, AppointmentStatus, PaymentStatus } from '@prisma/client';

export class AppointmentController {

    // CRITICAL: Real Transactional Logic with Prisma
    public createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { doctorId, slotId, reason } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Non authentifié' });
            return;
        }

        console.log(`[Transaction Start] Creating appointment for User ${userId} with Doctor ${doctorId}`);

        try {
            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Step 1: Check and lock the slot
                const slot = await tx.slot.findUnique({
                    where: { id: slotId }
                });

                if (!slot || !slot.isAvailable || slot.isLocked) {
                    throw new Error('Créneau non disponible');
                }

                // Lock the slot
                await tx.slot.update({
                    where: { id: slotId },
                    data: { isLocked: true, isAvailable: false }
                });
                console.log('[Step 1] Slot locked.');

                // Step 2: Create Appointment Record
                const newAppointment = await tx.appointment.create({
                    data: {
                        userId,
                        doctorId,
                        slotId,
                        startAt: slot.startAt,
                        status: AppointmentStatus.PENDING,
                        reason
                    }
                });
                console.log(`[Step 2] Appointment ${newAppointment.id} created.`);

                // Step 3: Create Payment Log (Pending)
                await tx.payment.create({
                    data: {
                        appointmentId: newAppointment.id,
                        amount: 50.00,
                        status: PaymentStatus.PENDING
                    }
                });
                console.log('[Step 3] Payment record initialized.');

                // Step 4: Create Notification
                await tx.notification.create({
                    data: {
                        userId: userId,
                        type: 'system',
                        title: 'Rendez-vous créé',
                        message: `Votre RDV avec le médecin est en attente de paiement pour le ${slot.startAt.toLocaleString()}`
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
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Non authentifié' });
                return;
            }

            const appointments = await prisma.appointment.findMany({
                where: { userId },
                orderBy: { startAt: 'desc' },
                include: { doctor: true, slot: true }
            });
            res.json({ success: true, data: appointments });
        } catch (error) {
            next(error);
        }
    };

    public getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await prisma.appointment.findUnique({
                where: { id },
                include: { doctor: true, slot: true, payment: true }
            });
            if (!appointment) {
                res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
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
            const userId = req.user?.id;

            // Verify ownership
            const appointment = await prisma.appointment.findUnique({ where: { id } });
            if (!appointment) {
                res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
                return;
            }
            if (appointment.userId !== userId) {
                res.status(403).json({ success: false, message: 'Non autorisé' });
                return;
            }

            // Cancel appointment and release slot
            await prisma.$transaction([
                prisma.appointment.update({
                    where: { id },
                    data: { status: AppointmentStatus.CANCELLED }
                }),
                prisma.slot.update({
                    where: { id: appointment.slotId },
                    data: { isAvailable: true, isLocked: false }
                })
            ]);

            res.json({ success: true, message: 'Rendez-vous annulé' });
        } catch (error) {
            next(error);
        }
    };

    public updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { reason } = req.body; // Only allow updating reason for now

            const updated = await prisma.appointment.update({
                where: { id },
                data: { reason }
            });
            res.json({ success: true, message: 'Mis à jour', data: updated });
        } catch (error) {
            next(error);
        }
    };
}
