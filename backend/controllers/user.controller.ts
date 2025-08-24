import { Request, Response } from "express";
import { pool } from "../db.js";
import { User } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import queries from "../queries.js";
import { generateToken, setCookie } from "../auth.js";

export const getUserById = async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	pool.query(queries.getUserById, [id], (error, result) => {
		if (error) throw error;
		res.status(200).json(result.rows);
	});
};

export const loginUser = async (req: Request, res: Response) => {
	const { username, password } = req.body;
  console.log('us name i pass', username, password)
	if (!username || !password) {
		return res.status(400).json({ message: "Missing username or password" });
	}

	try {
		const result = await pool.query(queries.findByUserName, [username]);
		const user: User = result.rows[0];
    console.log('user', user)
		if (!user) return res.status(401).json({ error: "Invalid credentials" });

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

		const token = generateToken(user);
    setCookie(res, token)
    res.json({message: `User: ${user.username} logged in`})

	} catch (error) {
		res.status(500).json({ error: "Login failed" });
	}
};
