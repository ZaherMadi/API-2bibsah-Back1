"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/:id/dispense', (req, res) => res.json({ message: 'Dispense Prescription' }));
router.get('/:id', (req, res) => res.json({ message: 'Get Prescription' }));
router.post('/', (req, res) => res.json({ message: 'Create Prescription' })); // If needed directly? Usually via appointment.
exports.default = router;
