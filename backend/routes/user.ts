import { IncomingMessage, ServerResponse } from "http";
import path from "node:path";
import fs from "fs/promises";
import url from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import {
	generateToken,
	getCurrentUser,
	getUserFromToken,
	parseCookies,
} from "../auth.js";
import {
	getBodyData,
	getUserById,
	readDataFromJson,
	saveDataToJson,
} from "../db.js";
import { User, TokenPayload } from "../types.js";

// get current path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_DB = path.join(__dirname, "../../db", "users.json");
// const USERS_DB = path.join(process.cwd(), "db", "users.json");
// process.cwd() wskazuje na główny katalog projektu, niezależnie gdzie jestesmy w katalogach

export async function handleUserRoutes(
	req: IncomingMessage,
	res: ServerResponse
) {
	const method = req.method || "GET";
	const pathname = req.url?.split("?")[0];

	if (method === "GET" && pathname === "/auth") {
		const cookies = parseCookies(req);
		const token = cookies.token;

		if (!token) {
			res.statusCode = 401;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: false, message: "No token provided" }));
			return;
		}

		try {
			const secret = process.env.SECRET_TOKEN;
			const payload = jwt.verify(token, secret!);
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: true, user: payload }));
		} catch (err) {
			res.statusCode = 403;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: false, message: "Forbidden" }));
		}
		return;
	}

	if (method === "POST" && pathname === "/login") {
		try {
			const body = await getBodyData(req);
			const { username, password } = JSON.parse(body);

			const usersRaw = await fs.readFile(USERS_DB, "utf-8");
			const users = JSON.parse(usersRaw);

			const user: User = users.find((u: User) => u.username === username);

			if (!user || !(await bcrypt.compare(password, user.password))) {
				res.statusCode = 401;
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify({ success: false, message: "Invalid credentials" })
				);
				return;
			}

			const { id, role } = user;
			const payload = { id, username, role };
			// const token = generateToken(payload, 600); // 10 min
			const token = generateToken(user);

			res.setHeader(
				"Set-Cookie",
				`token=${token}; HttpOnly; Path=/; Max-Age=300; SameSite=Strict`
			);

			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: true, userId: id, role }));
		} catch (error) {
			console.error("Login error:", error);
			res.statusCode = 400;
			res.end(
				JSON.stringify({
					success: false,
					message: "Bad request",
					error: String(error),
				})
			);
		}
		return;
	}

	if (method === "POST" && pathname === "/register") {
		try {
			const body = await getBodyData(req);
			const { username, password } = JSON.parse(body);
			const userRaw = await fs.readFile(USERS_DB, "utf-8");
			const users = JSON.parse(userRaw);

			if (users.find((u: any) => u.username === username)) {
				res.statusCode = 403; // 403 Forbidden
				res.setHeader("Content-Type", "application/json");
				res.end(
					JSON.stringify({ success: false, message: "this name is taken" })
				);
				return;
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser: User = {
				id: Date.now().toString(),
				username,
				password: hashedPassword,
				role: "user",
				balance: 100000,
			};

			users.push(newUser);
			await fs.writeFile(USERS_DB, JSON.stringify(users, null, 2));
			res.statusCode = 201; // 201 Created
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: true, username: newUser.username }));
		} catch (error) {
			res.statusCode = 400; // 400 Bad request
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: false, message: "Bad request" }));
		}
		return;
	}

	if (method === "GET" && pathname === "/me") {
		const user = await getCurrentUser(req);
		if (!user) {
			res.statusCode = 401;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ error: "Not authenticated" }));
			return;
		}

		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		return res.end(JSON.stringify(user));
	}

	if (method === "POST" && pathname === "/logout") {
		res.setHeader(
			"Set-Cookie",
			`token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
		);
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ success: true, message: "Logged out" }));
		return;
	}

	if (method === "PUT" && req.url?.match(/^\/users\/\w+/)) {
		const userId = req.url.split("/")[2];

		const cookies = parseCookies(req);
		const token = cookies.token;

		if (!token) {
			res.statusCode = 401; // 401 Unauthorized
			return res.end(JSON.stringify({ error: "No token" }));
		}

		const currentUser = await getUserFromToken(token, USERS_DB);
		console.log('user id', userId)
		console.log('curr user', currentUser)
		if (!currentUser) {
			res.statusCode = 401; // 401 Unauthorized
			return res.end(JSON.stringify({ error: "Invalid token" }));
		}

		if (currentUser.role !== 'admin' && currentUser.id !== userId) {
			res.statusCode = 403; // 403 Forbidden
			return res.end(JSON.stringify({ error: "Forbidden action" }));
		}

		try {
			const body = await getBodyData(req);
			const { username, password, role, balance } = JSON.parse(body);

			const users = await readDataFromJson<User>(USERS_DB);

			const updatedUsers: User[] = [];

			for (const user of users) {
				if (user.id === userId) {
					const updatedUser: User = {
						...user,
						username: username ?? user.username,
						password: password
							? await bcrypt.hash(password, 10)
							: user.password,
						role: role ?? user.role,
						balance: balance ?? user.balance
					};
					updatedUsers.push(updatedUser);
				} else {
					updatedUsers.push(user);
				}
			}

			console.log("Upd users array", updatedUsers);
			await saveDataToJson(USERS_DB, updatedUsers);

			res.statusCode = 200; // 200 OK
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ success: true }));
		} catch (error) {
			res.statusCode = 400; // 400 Bad request
			res.end(JSON.stringify({ success: false, error: "Bad data" }));
		}
	}

	if (method === "DELETE" && req.url?.match(/^\/users\/\w+$/)) {
		const userId = req.url.split("/")[2];

		const cookies = parseCookies(req);
		const token = cookies.token;
		if (!token) {
			res.statusCode = 401;
			return res.end(JSON.stringify({ error: "No token" }));
		}

		const currentUser = await getUserFromToken(token, USERS_DB);
		if (!currentUser || currentUser.role !== "admin") {
			res.statusCode = 403;
			return res.end(JSON.stringify({ error: "Forbidden" }));
		}

		const users = await readDataFromJson<User>(USERS_DB);
		const filteredUsers = users.filter((u) => u.id !== userId);
		await saveDataToJson(USERS_DB, filteredUsers);

		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		return res.end(JSON.stringify({ success: true }));
	}

	if (method === "DELETE" && pathname === "/users/delete") {
		const cookies = parseCookies(req);
		const token = cookies.token;
		if (!token) {
			res.statusCode = 401;
			return res.end(JSON.stringify({ error: "No token" }));
		}

		const currentUser = await getUserFromToken(token, USERS_DB);
		if (!currentUser) {
			res.statusCode = 401;
			return res.end(
				JSON.stringify({ success: false, message: "Wrong token" })
			);
		}

		const users = await readDataFromJson<User>(USERS_DB);
		const filteredUsers = users.filter((u) => u.id !== currentUser.id);
		await saveDataToJson(USERS_DB, filteredUsers);

		res.setHeader("Set-Cookie", "token=; HttpOnly; Max-Age=0; Path=/");
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		return res.end(
			JSON.stringify({ success: true, message: "Profile has been deleted" })
		);
	}

	// if (method === "DELETE" && req.url?.match(/^\/users\/\w+$/)) {
	// 	const userId = req.url.split("/")[2];
	// 	const cookies = parseCookies(req);
	// 	const token = cookies.token;

	// 	if (!token) {
	// 		res.statusCode = 401; // 401 Unauthorized
	// 		return res.end(JSON.stringify({ error: "No token" }));
	// 	}

	// 	const currentUser = await getUserFromToken(token, USERS_DB);
	// 	if (!currentUser || currentUser.role !== 'admin') {
	// 		res.statusCode = 403; // 403
	// 		return res.end(
	// 			JSON.stringify({ error: "Forbidden" })
	// 		);
	// 	}

	// 	const users = await readDataFromJson<User>(USERS_DB);
	// 	const filteredUsers = users.filter((u) => u.id !== currentUser.id);
	// 	await saveDataToJson(USERS_DB, filteredUsers);

	// 	res.setHeader("Set-Cookie", "token=; HttpOnly; Max-Age=0; Path=/");

	// 	res.statusCode = 200; // 200 OK
	// 	res.setHeader("Content-Type", "application.json");
	// 	return res.end(
	// 		JSON.stringify({ success: true, message: "Profile has been deleted" })
	// 	);
	// }

	// GET users - tylko dla admina
	if (method === "GET" && pathname === "/users") {
		try {
			const cookies = parseCookies(req);
			const token = cookies.token;

			if (!token) {
				res.statusCode = 401;
				res.end(
					JSON.stringify({ success: false, message: "No token provided" })
				);
				return;
			}
			let payload: jwt.JwtPayload;
			try {
				const decoded = jwt.verify(token, process.env.SECRET_TOKEN!);
				if (typeof decoded === "string")
					throw new Error("Invalid token payload");
				payload = decoded as TokenPayload;
				console.log("Payload decoded in /users:", payload);
			} catch (error) {
				res.statusCode = 403;
				res.end(JSON.stringify({ success: false, message: "Invalid token" }));
				return;
			}

			const usersRaw = await fs.readFile(USERS_DB, "utf-8");
			const users = JSON.parse(usersRaw);

			if (payload.role === "admin") {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify(users));
			} else {
				const currentUser = users.find((u: User) => u.id === payload.id);

				if (!currentUser) {
					res.statusCode = 404;
					res.end(
						JSON.stringify({ success: false, message: "User not found" })
					);
					return;
				}
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				return res.end(JSON.stringify(currentUser));
			}
		} catch (error) {
			console.log("Error in /users:", error);
			res.statusCode = 500;
			res.end(JSON.stringify({ success: false, message: "Server error" }));
			return;
		}
		return;
	}

	if (method === "GET" && pathname?.startsWith("/fund/")) {
		const cookies = parseCookies(req);
		const token = cookies.token;

		if (!token) {
			res.statusCode = 401;
			return res.end(JSON.stringify({ succes: false, message: "No token" }));
		}
		const currentUser = await getUserFromToken(token, USERS_DB);
		if (!currentUser) {
			res.statusCode = 403;
			return res.end(
				JSON.stringify({ success: false, message: "Unauthorized" })
			);
		}
		const amountStr = pathname.split("/")[2];
		const amount = Number(amountStr);
		if (!amount || isNaN(amount) || amount > 100000) {
			res.statusCode = 400;
			return res.end(
				JSON.stringify({ success: false, message: "Invalid amount" })
			);
		}
		const users = await readDataFromJson<User>(USERS_DB);
		const target = users.find((u) => u.id === currentUser.id);
		if (!target) {
			res.statusCode = 404;
			return res.end(
				JSON.stringify({ success: false, message: "User not found" })
			);
		}
		target.balance += amount;
		await saveDataToJson(USERS_DB, users);

		res.statusCode = 302;
		res.setHeader("Location", "/#home");
		res.end()
		// return res.end(
		// 	JSON.stringify({ success: true, message: `+${amount} added` })
		// );
	}

	res.statusCode = 404;
	res.end("Not found");
}
