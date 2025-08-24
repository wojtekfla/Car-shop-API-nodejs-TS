import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import queries from './queries.js';
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token)
            return res.status(401).json({ message: 'No token' });
        const decodedUser = jwt.verify(token, process.env.SECRET_TOKEN);
        const r = await pool.query(queries.getUserById, [decodedUser.id]);
        if (r.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = r.rows[0];
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
export const requireAdmin = async (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin only' });
    }
    next();
};
export const requireMyselfOrAdmin = async (req, res, next) => {
    const targetId = req.params.id;
    const reqUserId = req.user?.id;
    if (!reqUserId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user?.role === 'admin' || (reqUserId === targetId)) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden' });
};
