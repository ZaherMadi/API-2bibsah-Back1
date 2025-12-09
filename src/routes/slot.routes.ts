import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

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
router.get('/', async (req, res, next) => {
    try {
        const slots = await prisma.slot.findMany({
            where: { isBooked: false }
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
});

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
router.post('/', async (req, res, next) => {
    try {
        const { doctorId, start, end } = req.body;
        const slot = await prisma.slot.create({
            data: {
                doctorId,
                start: new Date(start),
                end: new Date(end),
                isBooked: false
            }
        });
        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
});

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
router.delete('/:slotId', async (req, res, next) => {
    try {
        const { slotId } = req.params;
        await prisma.slot.delete({ where: { id: slotId } });
        res.json({ success: true, message: 'Slot deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
