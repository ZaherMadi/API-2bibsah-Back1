"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
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
exports.default = router;
