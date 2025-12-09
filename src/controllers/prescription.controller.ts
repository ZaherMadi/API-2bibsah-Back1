import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class PrescriptionController {

    /**
     * GET /api/prescriptions/:id
     * Retrieve a prescription by ID with its details
     */
    public getPrescriptionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;

            const prescription = await prisma.prescription.findUnique({
                where: { id },
                include: {
                    appointment: {
                        include: {
                            doctor: true,
                            patient: true
                        }
                    },
                    medications: true
                }
            });

            if (!prescription) {
                res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
                return;
            }

            res.json({
                success: true,
                data: prescription
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/prescriptions
     * Create a new prescription for an appointment
     */
    public createPrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { appointmentId, medications, notes } = req.body;

            // Validate input
            if (!appointmentId || !medications || !Array.isArray(medications) || medications.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid input: appointmentId and medications array are required'
                });
                return;
            }

            // Check if appointment exists
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId }
            });

            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
                return;
            }

            // Create prescription with medications
            const prescription = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const newPrescription = await tx.prescription.create({
                    data: {
                        appointmentId,
                        notes,
                        status: 'pending'
                    }
                });

                // Add medications to the prescription
                for (const medication of medications) {
                    await tx.prescriptionMedication.create({
                        data: {
                            prescriptionId: newPrescription.id,
                            name: medication.name,
                            dosage: medication.dosage,
                            frequency: medication.frequency,
                            duration: medication.duration,
                            instructions: medication.instructions || null
                        }
                    });
                }

                return newPrescription;
            });

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                data: prescription
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /api/prescriptions/:id/dispense
     * Mark a prescription as dispensed (Pharmacist action)
     */
    public dispensePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id; // Should be a pharmacist user

            // Check if prescription exists
            const prescription = await prisma.prescription.findUnique({
                where: { id }
            });

            if (!prescription) {
                res.status(404).json({
                    success: false,
                    message: 'Prescription not found'
                });
                return;
            }

            if (prescription.status === 'dispensed') {
                res.status(400).json({
                    success: false,
                    message: 'Prescription already dispensed'
                });
                return;
            }

            // Update prescription status and record dispense information
            const updatedPrescription = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const updated = await tx.prescription.update({
                    where: { id },
                    data: {
                        status: 'dispensed',
                        dispensedAt: new Date(),
                        dispensedBy: userId
                    }
                });

                // Create an audit log entry
                await tx.auditLog.create({
                    data: {
                        userId: userId || 'system',
                        action: 'PRESCRIPTION_DISPENSED',
                        targetId: id,
                        targetType: 'PRESCRIPTION',
                        details: JSON.stringify({
                            prescriptionId: id,
                            status: 'dispensed'
                        })
                    }
                });

                return updated;
            });

            res.json({
                success: true,
                message: 'Prescription dispensed successfully',
                data: updatedPrescription
            });
        } catch (error) {
            next(error);
        }
    };
}
