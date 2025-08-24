import { Request, Response } from 'express'
import { pool } from "../db.js"
import { authMiddleware } from '../middleware.js'
import { carQueries } from '../queries'

// GET /cars
export const getAllCars = async (req: Request, res: Response) => {
  const result = await pool.query(carQueries.getAllCars)
  res.json(result.rows)
}

// GET /cars/:id
export const getCarById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(carQueries.getCarById, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({message: 'Car not found'})
  }
  res.json(result.rows[0])
}

// POST /cars







