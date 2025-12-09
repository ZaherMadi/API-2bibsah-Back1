import { Router } from 'express';
import { prisma } from '../config/database';

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
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Non authentifié' });
            return;
        }

        const notifs = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: notifs });
    } catch (error) {
        next(error);
    }
});

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
router.patch('/:id/read', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        next(error);
    }
});

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
router.post('/test', async (req, res, next) => {
    // Mock logic or create actual DB notif
    res.json({ message: 'Test Notif' });
});

export default router;
