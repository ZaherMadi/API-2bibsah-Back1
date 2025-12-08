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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
class AppointmentController {
    constructor() {
        // CRITICAL: Simulated Transactional Logic
        this.createAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { doctorId, start_at, reason } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Injected by Auth Middleware
            console.log(`[Transaction Start] Creating appointment for User ${userId} with Doctor ${doctorId}`);
            try {
                // Step 1: Check Availability (Lock Slot)
                // SELECT * FROM slots WHERE doctor_id = $1 AND start_at = $2 FOR UPDATE;
                const isAvailable = true; // Mock check
                if (!isAvailable) {
                    throw new Error('Slot not available');
                }
                console.log('[Step 1] Slot locked and verified.');
                // Step 2: Create Appointment Record
                // INSERT INTO appointments ... RETURNING id;
                const appointmentId = 'appt-12345';
                console.log(`[Step 2] Appointment ${appointmentId} created (PENDING).`);
                // Step 3: Process Payment / Create Intent
                // Call Payment Service
                const paymentSuccess = true;
                if (!paymentSuccess) {
                    throw new Error('Payment initialization failed');
                }
                console.log('[Step 3] Payment intent created.');
                // Step 4: Send Notification
                // Call Notification Service
                console.log('[Step 4] Notification sent to patient and doctor.');
                // COMMIT TRANSACTION
                console.log('[Transaction Commit] All steps successful.');
                res.status(201).json({
                    success: true,
                    data: {
                        id: appointmentId,
                        status: 'confirmed',
                        start_at,
                        doctorId
                    }
                });
            }
            catch (error) {
                // ROLLBACK TRANSACTION
                console.error(`[Transaction Rollback] Error: ${error.message}`);
                // Cleanup logic (e.g., set status to FAILED, release slot)
                console.log('[Rollback] Releasing slot...');
                console.log('[Rollback] Marking appointment as FAILED...');
                next(error);
            }
        });
        this.getMyAppointments = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Mock response
            res.json({
                success: true,
                data: [
                    { id: '1', doctorId: 'doc-1', start_at: '2023-10-10T10:00:00Z', status: 'confirmed' }
                ]
            });
        });
        this.getAppointmentById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            res.json({ success: true, data: { id, status: 'confirmed' } });
        });
        this.cancelAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            console.log(`Cancelling appointment ${id}`);
            res.json({ success: true, message: 'Appointment cancelled' });
        });
        this.updateAppointment = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            res.json({ success: true, message: `Appointment ${id} updated` });
        });
    }
}
exports.AppointmentController = AppointmentController;
