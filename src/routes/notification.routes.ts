import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notification history
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', (req, res) => res.json({ message: 'Get Notifications' }));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch('/:id/read', (req, res) => res.json({ message: 'Mark as read' }));

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Test notification sending (Admin)
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Test notification sent
 */
router.post('/test', (req, res) => res.json({ message: 'Test Notification' }));

export default router;
