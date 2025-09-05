import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { AuthRequest } from "../middleware.js";
import queries from "../queries.js";
import { User } from "../types";


export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const result = await pool.query(queries.getAllUsers);
		res.json(result.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching users" });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	pool.query(queries.getUserById, [id], (error, result) => {
		if (error) throw error;
		res.status(200).json(result.rows);
	});
};

// PUT /users/:id
export const updateUser = async (req: AuthRequest, res: Response) => {
	const { id } = req.params;
	const { username, role, balance, password } = req.body;

	try {
		const existingUser = await pool.query(queries.getUserById, [id]);
		if (existingUser.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		if (req.user?.role === "admin") {
			const result = await pool.query(queries.updateUserByAdmin, [
				username ?? existingUser.rows[0].username,
				role ?? existingUser.rows[0].role,
				balance ?? existingUser.rows[0],
				id,
			]);
			return res.json(result.rows[0]);
		}

		if (req.user?.id === id) {
			let hashedPassword = existingUser.rows[0].password;

			if (password) {
				hashedPassword = await bcrypt.hash(password, 10);
			}

			const result = await pool.query(queries.updateUser, [
				id,
				username ?? existingUser.rows[0].username,
				hashedPassword,
			]);

			return res.json(result.rows[0]);
		}

		return res.status(403).json({ message: "Forbidden" });
	} catch (error) {
		res.status(500).json({ message: "Error updating user" });
	}
};

// DELETE /users/:id
export const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const result = await pool.query(queries.deleteUser, [id]);

		if (result.rowCount === 0) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json({ message: "User deleted" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting user" });
	}
};
