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
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Management of doctor availability slots
 */
/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Calculate free slots
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slots = yield prisma_1.default.slot.findMany({
            where: { isBooked: false }
        });
        res.json({ success: true, data: slots });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /api/doctors/{id}/slots:
 *   post:
 *     summary: Define recurrence rules for slots
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Slots created
 */
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, start, end } = req.body;
        const slot = yield prisma_1.default.slot.create({
            data: {
                doctorId,
                start: new Date(start),
                end: new Date(end),
                isBooked: false
            }
        });
        res.status(201).json({ success: true, data: slot });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @swagger
 * /api/doctors/{id}/slots/{slotId}:
 *   delete:
 *     summary: Delete a specific slot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slot deleted
 */
router.delete('/:slotId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slotId } = req.params;
        yield prisma_1.default.slot.delete({ where: { id: slotId } });
        res.json({ success: true, message: 'Slot deleted' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
