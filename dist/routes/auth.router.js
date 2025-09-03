import { Router } from 'express';
import { register, login, logout, hackFund } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware.js';
const router = Router();
// router.use()
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});
router.get('/hack/fund', authMiddleware, hackFund);
export default router;
