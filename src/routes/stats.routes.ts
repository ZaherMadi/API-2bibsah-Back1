import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: KPI and Statistics
 */

/**
 * @swagger
 * /api/stats/global:
 *   get:
 *     summary: Get global KPIs for admin dashboard
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Global statistics
 */
router.get('/global', (req, res) => res.json({ message: 'Global Stats' }));

export default router;
