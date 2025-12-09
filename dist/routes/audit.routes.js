"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
exports.default = router;
