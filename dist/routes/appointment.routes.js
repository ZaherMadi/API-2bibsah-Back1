"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
const controller = new appointment_controller_1.AppointmentController();
/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */
/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment (Transactional)
 *     tags: [Appointments]
 *     responses:
 *       201:
 *         description: Appointment created successfully
 */
router.post('/', controller.createAppointment);
/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get my appointments
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/my', controller.getMyAppointments);
router.get('/:id', controller.getAppointmentById);
router.delete('/:id', controller.cancelAppointment);
router.patch('/:id', controller.updateAppointment);
exports.default = router;
