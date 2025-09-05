import express from 'express';
const router = express.Router();
import { getAllCars, getCarById, addNewCar, updateCar, deleteCar, buyCar } from '../controllers/car.controller.js';
import { authMiddleware, requireAdmin } from '../middleware.js';
// all users
router.get('/cars', getAllCars);
router.get('/cars/:id/buy', getCarById);
// admin only
router.post('/cars', authMiddleware, requireAdmin, addNewCar);
router.put('/cars/:id', authMiddleware, requireAdmin, updateCar);
router.delete('/cars/:id/delete', authMiddleware, requireAdmin, deleteCar);
// buing car
router.post('/cars/:id/buy', authMiddleware, buyCar);
export default router;
