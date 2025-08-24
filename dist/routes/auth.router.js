import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware.js';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});
export default router;
