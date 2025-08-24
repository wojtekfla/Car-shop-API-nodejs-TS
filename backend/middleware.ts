import { Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'
import queries from './queries.js'

export interface TokenPayload {
  id: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export interface UserRow {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  balance: number;
}

export interface AuthRequest extends Request {
  user?: UserRow
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {

  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({message: 'No token'})

    const decodedUser = jwt.verify(token, process.env.SECRET_TOKEN!) as TokenPayload
    const result = await pool.query(queries.getUserById, [decodedUser.id])
    if (result.rows.length === 0) {
      return res.status(401).json({message: 'User not found'})
    }

    req.user = result.rows[0] as UserRow
    next()
  } catch (error) {
    return res.status(401).json({message: 'Unauthorized'})
  }
}

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({message: 'Admin only'})
  }
  next()
}

export const requireMyselfOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const targetId = req.params.id
  const reqUserId = req.user?.id

  if (!reqUserId) {
    return res.status(401).json({message: 'Unauthorized'})
  }

  if (req.user?.role === 'admin' || (reqUserId === targetId)) {
    return next()
  }
  
  return res.status(403).json({message: 'Forbidden'})
}

