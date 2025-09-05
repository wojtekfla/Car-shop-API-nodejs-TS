import { Request, Response } from "express";
import { pool } from "../db.js";
import { authMiddleware } from "../middleware.js";
import queries, { carQueries } from "../queries.js";
import { AuthRequest } from "../middleware.js";
import { Car, User } from "../types.js";
import { sendSSE } from "../sse.js";

// GET /cars
export const getAllCars = async (req: Request, res: Response) => {
	try {
		const result = await pool.query(carQueries.getAllCars);
		const cars: Car[] = result.rows.map(mapCar);
		res.status(200).json(cars);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching cars" });
	}
};

// GET /cars/:id
export const getCarById = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const result = await pool.query(carQueries.getCarById, [id]);
		if (result.rows.length === 0) {
			return res.status(404).json({ message: "Car not found" });
		}
		res.status(200).json(result.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error or car not found" });
	}
};

// POST /cars
export const addNewCar = async (req: AuthRequest, res: Response) => {
	const { model, price } = req.body;
	const id = Date.now().toString();
	const owner_id = null;

	try {
		const result = await pool.query(carQueries.addNewCar, [
			id,
			model,
			price,
			owner_id,
		]);
		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error adding car" });
	}
};

// PUT /cars
export const updateCar = async (req: AuthRequest, res: Response) => {
	const { id } = req.params;
	const { model, price } = req.body;

	try {
		const existingCar = await pool.query(carQueries.getCarById, [id]);
		if (existingCar.rows.length === 0) {
			return res.status(404).json({ message: "Car not found" });
		}
		const updatedModel = model ? model : existingCar.rows[0].model;
		const updatedPrice = price ? price : existingCar.rows[0].price;

		const result = await pool.query(carQueries.updateCar, [
			updatedModel,
			updatedPrice,
			id,
		]);
		res.json(result.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error updating car" });
	}
};

// DELETE /cars/:id
export const deleteCar = async (req: AuthRequest, res: Response) => {
	const { id } = req.params;

	try {
		const result = await pool.query(carQueries.deleteCar, [id]);
		if (result.rowCount === 0) {
			return res.status(404).json({ message: "Car not found" });
		}
		res.json({ message: "Car deleted" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting car" });
	}
};

// POST /cars/:is/buy
export const buyCar = async (req: AuthRequest, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.id;

	try {
		const carData = await pool.query(carQueries.getCarById, [id]);
		if (carData.rowCount === 0) {
			return res.status(404).json({ message: "Car not found" });
		}
		const car: Car = mapCar(carData.rows[0]);

		if (car.ownerId) {
			return res.status(400).json({ message: "Car already purchased" });
		}

		const userData = await pool.query(queries.getUserById, [userId]);
		if (userData.rowCount === 0) {
			return res.status(404).json({ message: "User not found" });
		}
		const user: User = userData.rows[0];

		if (user.balance < car.price) {
			return res.status(400).json({ message: "Insufficient money" });
		}

		await pool.query("BEGIN");

		await pool.query(
			"UPDATE cars SET owner_id = $1 WHERE id = $2 AND owner_id IS NULL",
			[userId, id]
		);

		await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [
			car.price,
			userId,
		]);

		await pool.query("COMMIT");

		sendSSE({
			event: "car_purchased",
			username: user.username,
			model: car.model,
			message: `Car ${car.model} has just been purchased by user ${user.username}`,
		});

		res.json({ message: "Car purchased successfuly", car });

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error buing car" });
	}
};

function mapCar(row: any) {
	return {
		id: row.id,
		model: row.model,
		price: row.price,
		ownerId: row.owner_id,
	};
}
