"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class AppointmentController {
    constructor() {
        // CRITICAL: Real Transactional Logic with Prisma
        this.createAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId, start_at, reason } = req.body;
            const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'mock-patient-id'; // Fallback for testing without full auth
            const startDateTime = new Date(start_at);
            console.log(`[Transaction Start] Creating appointment for User ${userId} with Doctor ${doctorId}`);
            try {
                const result = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // Step 1: Check Availability & Lock Slot (if slot exists)
                    // For simplicity, we assume slots are created beforehand. 
                    // If no slot exists, we might implicitly creating one or failing.
                    // Let's check for overlapping appointments for this doctor.
                    const existingAppt = yield tx.appointment.findFirst({
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
                    const newAppointment = yield tx.appointment.create({
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
                    yield tx.payment.create({
                        data: {
                            appointmentId: newAppointment.id,
                            amount: 50.00, // Standard fee
                            status: 'pending'
                        }
                    });
                    console.log('[Step 3] Payment record initialized.');
                    // Step 4: Create Notification
                    yield tx.notification.create({
                        data: {
                            userId: userId,
                            type: 'system',
                            content: `Votre RDV avec ${doctorId} est confirmé pour le ${startDateTime.toLocaleString()}`,
                            status: 'unread'
                        }
                    });
                    console.log('[Step 4] Notification logged.');
                    return newAppointment;
                }));
                console.log('[Transaction Commit] All steps successful.');
                res.status(201).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                console.error(`[Transaction Rollback] Error: ${error.message}`);
                next(error);
            }
        });
        this.getMyAppointments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'mock-patient-id';
                const appointments = yield prisma_1.default.appointment.findMany({
                    where: { patientId: userId },
                    orderBy: { start_at: 'desc' },
                    include: { doctor: true } // Include doctor details if possible
                });
                res.json({ success: true, data: appointments });
            }
            catch (error) {
                next(error);
            }
        });
        this.getAppointmentById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const appointment = yield prisma_1.default.appointment.findUnique({ where: { id } });
                if (!appointment) {
                    res.status(404).json({ success: false, message: 'Not found' });
                    return;
                }
                res.json({ success: true, data: appointment });
            }
            catch (error) {
                next(error);
            }
        });
        this.cancelAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield prisma_1.default.appointment.update({
                    where: { id },
                    data: { status: 'cancelled' }
                });
                res.json({ success: true, message: 'Appointment cancelled' });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updated = yield prisma_1.default.appointment.update({
                    where: { id },
                    data: req.body
                });
                res.json({ success: true, message: 'Updated', data: updated });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AppointmentController = AppointmentController;
