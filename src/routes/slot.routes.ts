import { Router } from 'express';

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
router.get('/', (req, res) => res.json({ message: 'Slots endpoint' }));

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
router.post('/', (req, res) => res.json({ message: 'Create Slot' }));

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
router.delete('/:slotId', (req, res) => res.json({ message: 'Delete Slot' }));

export default router;
