"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/intent', (req, res) => res.json({ message: 'Payment Intent' }));
router.post('/webhook', (req, res) => res.json({ message: 'Webhook' }));
router.post('/:id/refund', (req, res) => res.json({ message: 'Refund' }));
exports.default = router;
