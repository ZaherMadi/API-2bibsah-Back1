"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
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
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'mock-patient-id'; // Fallback
        const notifs = yield prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: notifs });
    }
    catch (error) {
        next(error);
    }
}));
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
router.patch('/:id/read', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.default.notification.update({
            where: { id },
            data: { status: 'read' }
        });
        res.json({ success: true, message: 'Marked as read' });
    }
    catch (error) {
        next(error);
    }
}));
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
router.post('/test', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Mock logic or create actual DB notif
    res.json({ message: 'Test Notif' });
}));
exports.default = router;
