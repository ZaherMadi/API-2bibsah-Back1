import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing
 */

/**
 * @swagger
 * /api/payments/intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post('/intent', (req, res) => res.json({ message: 'Payment Intent' }));

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Payment provider webhook
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', (req, res) => res.json({ message: 'Webhook' }));

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Refund a payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
router.post('/:id/refund', (req, res) => res.json({ message: 'Refund' }));

export default router;
