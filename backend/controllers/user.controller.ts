import { Request, Response } from "express";
import { pool } from "../db.js";
import { User } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import queries from "../queries.js";
import { generateToken, setCookie } from "../auth.js";

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const result = await pool.query(queries.getAllUsers);
		res.json(result.rows);
	} catch (error) {
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
export const updateUser = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { username, role, balance } = req.body;

	try {
		const result = await pool.query(queries.updateUser, [
			id,
			username,
			role,
			balance,
		]);
		if (result.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(result.rows[0]);
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
