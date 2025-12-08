import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit logs
 */

/**
 * @swagger
 * /api/auditlog:
 *   get:
 *     summary: Consult audit logs
 *     tags: [Audit]
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', (req, res) => res.json({ message: 'Audit Log' }));

export default router;
