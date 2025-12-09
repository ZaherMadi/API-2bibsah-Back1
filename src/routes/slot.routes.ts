import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// mergeParams: true allows access to params from parent routes
const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Management of doctor availability slots
 */

// ==================== GET ALL AVAILABLE SLOTS ====================
/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: Get all available slots from all doctors
 *     tags: [Slots]
 *     responses:
 *       200:
 *         description: List of all available slots
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slots = await prisma.slot.findMany({
            where: { isAvailable: true }
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
});

// ==================== GET SLOTS FOR A SPECIFIC DOCTOR ====================
/**
 * @swagger
 * /api/slots/by-doctor/{doctorId}:
 *   get:
 *     summary: Get available slots for a specific doctor
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of available slots for the doctor
 */
router.get('/by-doctor/:doctorId', async (req: Request<{ doctorId: string }>, res: Response, next: NextFunction) => {
    try {
        const { doctorId } = req.params;
        const slots = await prisma.slot.findMany({
            where: {
                doctorId: doctorId,
                isAvailable: true
            }
        });
        res.json({ success: true, data: slots });
    } catch (error) {
        next(error);
    }
});

// ==================== CREATE A NEW SLOT ====================
/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a new slot
 *     tags: [Slots]
 *     responses:
 *       201:
 *         description: Slot created
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { doctorId, start, end } = req.body;
        const slot = await prisma.slot.create({
            data: {
                doctorId,
                startAt: new Date(start),
                endAt: new Date(end),
                isAvailable: true
            }
        });
        res.status(201).json({ success: true, data: slot });
    } catch (error) {
        next(error);
    }
});

// ==================== DELETE A SLOT ====================
/**
 * @swagger
 * /api/slots/{slotId}:
 *   delete:
 *     summary: Delete a specific slot
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slot deleted
 */
router.delete('/:slotId', async (req: Request<{ slotId: string }>, res: Response, next: NextFunction) => {
    try {
        const { slotId } = req.params;
        await prisma.slot.delete({ where: { id: slotId } });
        res.json({ success: true, message: 'Slot deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
