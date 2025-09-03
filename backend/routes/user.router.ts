import express from 'express';
// import { pool } from '../db';
import { getUserById, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller.js';
import { authMiddleware, requireAdmin, requireMyselfOrAdmin, } from "../middleware.js"

// import { User } from '../types';

const router = express.Router()

// admin
router.get("/users", authMiddleware, requireAdmin, getAllUsers);
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUser);

// admin or user
router.put("/users/:id", authMiddleware, requireMyselfOrAdmin, updateUser);

export default router

