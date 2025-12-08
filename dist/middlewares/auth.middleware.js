"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        // For development simplicity, if no header, we can mock a user or return 401
        // let's return 401 to be strict, but maybe allow a bypass for testing if needed
        // res.status(401).json({ message: 'No token provided' });
        // return;
        // MOCKING USER FOR NOW
        req.user = { id: 'mock-user-id', role: 'patient' };
        next();
        return;
    }
    // Simulate JWT decoding
    const token = authHeader.split(' ')[1];
    if (token === 'admin-token') {
        req.user = { id: 'admin-id', role: 'admin' };
    }
    else if (token === 'doctor-token') {
        req.user = { id: 'doctor-id', role: 'doctor' };
    }
    else {
        req.user = { id: 'patient-id', role: 'patient' };
    }
    next();
};
exports.authMiddleware = authMiddleware;
