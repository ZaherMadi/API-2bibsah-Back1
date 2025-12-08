"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Placeholders
router.get('/', (req, res) => res.json({ message: 'Slots endpoint' }));
router.post('/', (req, res) => res.json({ message: 'Create Slot' }));
router.delete('/:slotId', (req, res) => res.json({ message: 'Delete Slot' }));
exports.default = router;
