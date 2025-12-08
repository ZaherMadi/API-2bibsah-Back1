import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management
 */

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get prescription details
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription details
 */
router.get('/:id', (req, res) => res.json({ message: 'Get Prescription' }));

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create a prescription
 *     tags: [Prescriptions]
 *     responses:
 *       201:
 *         description: Prescription created
 */
router.post('/', (req, res) => res.json({ message: 'Create Prescription' }));

/**
 * @swagger
 * /api/prescriptions/{id}/dispense:
 *   post:
 *     summary: Mark prescription as dispensed (Pharmacist)
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription dispensed
 */
router.post('/:id/dispense', (req, res) => res.json({ message: 'Dispense Prescription' }));

export default router;
