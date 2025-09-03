import { Request, Response, NextFunction } from "express";
// import { IncomingMessage } from "node:http";
import path from "node:path";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "./types.js";
import dotenv from "dotenv";
import queries from "./queries.js";
import { pool } from "./db.js";

dotenv.config();

const SECRET = process.env.SECRET_TOKEN ?? "domyślny_klucz";
const EXPIRES_IN = process.env.TOKEN_EXPIRATION || "10m";

// const USERS_DB = path.join(process.cwd(), "db", "users.json");

interface TokenPayload {
	id: string;
	username: string;
	role: "admin" | "user";
}

export function generateToken(user: User): string {
	return jwt.sign(
		{
			id: user.id,
			username: user.username,
			role: user.role,
		},
		SECRET,
		{ expiresIn: "15m" }
	);
}

export function setCookie(res: Response, token: string) {
	res.cookie("token", token, {
		httpOnly: true,
		secure: false,
		sameSite: "strict",
		maxAge: 15 * 60 * 1000,
		path: "/",
	});
}

export async function getUserFromToken(token: string): Promise<User | null> {
	try {
		const decoded = jwt.verify(
			token,
			process.env.SECRET_TOKEN!
		) as TokenPayload;

		const result = await pool.query(queries.getUserById, [decoded.id])
		console.log('result rows', result.rows)
		if (result.rows.length === 0) {
			return null
		}
		return result.rows[0] as User
		
	} catch (error) {
		console.log('getUserFromToken error', error)
		return null;
	}
}
