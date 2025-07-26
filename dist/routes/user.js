import path from "node:path";
import fs from "fs/promises";
import url from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import { generateToken } from "../auth.js";
import { getBodyData } from "../db.js";
// get current path
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_DB = path.join(__dirname, "../../db", "users.json");
// const USERS_DB = path.join(process.cwd(), "db", "users.json");
// process.cwd() wskazuje na główny katalog projektu, niezależnie gdzie jestesmy w katalogach
export async function handleUserRoutes(req, res) {
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
            const payload = jwt.verify(token, secret);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, user: payload }));
        }
        catch (err) {
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
            const user = users.find((u) => u.username === username);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.statusCode = 401;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ success: false, message: "Invalid credentials" }));
                return;
            }
            const { id, role } = user;
            const payload = { id, username, role };
            const token = generateToken(payload, 300); // 5 min
            res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=300; SameSite=Strict`);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, userId: id, role }));
        }
        catch (error) {
            console.error("Login error:", error);
            res.statusCode = 400;
            res.end(JSON.stringify({
                success: false,
                message: "Bad request",
                error: String(error),
            }));
        }
        return;
    }
    if (method === "POST" && pathname === "/register") {
        try {
            const body = await getBodyData(req);
            const { username, password } = JSON.parse(body);
            const userRaw = await fs.readFile(USERS_DB, "utf-8");
            const users = JSON.parse(userRaw);
            if (users.find((u) => u.username === username)) {
                res.statusCode = 409;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ success: false, message: "this name is taken" }));
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = {
                id: crypto.randomUUID(),
                username,
                password: hashedPassword,
                role: "user",
                balance: 100000,
            };
            users.push(newUser);
            await fs.writeFile(USERS_DB, JSON.stringify(users, null, 2));
            res.statusCode = 201;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true, username: newUser.username }));
        }
        catch (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: false, message: "Bad request" }));
        }
        return;
    }
    if (method === "POST" && pathname === "/logout") {
        res.setHeader("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, message: "Logged out" }));
        return;
    }
    // GET users - tylko dla admina
    if (method === "GET" && pathname === "/users") {
        try {
            const cookies = parseCookies(req);
            const token = cookies.token;
            if (!token) {
                res.statusCode = 401;
                res.end(JSON.stringify({ success: false, message: "No token provided" }));
                return;
            }
            let payload;
            try {
                const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
                if (typeof decoded === "string")
                    throw new Error('Invalid token payload');
                payload = decoded;
            }
            catch (error) {
                res.statusCode = 403;
                res.end(JSON.stringify({ success: false, message: "Invalid token" }));
                return;
            }
            const usersRaw = await fs.readFile(USERS_DB, "utf-8");
            const users = JSON.parse(usersRaw);
            if (payload.role === "admin") {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(users));
            }
            else {
                const currentUser = users.find((u) => u.id === payload.id);
                if (!currentUser) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ success: false, message: "User not found" }));
                    return;
                }
                res.setHeader("Content-Type", "application/json");
                res.write(JSON.stringify(currentUser));
                res.end();
                return;
            }
        }
        catch (error) {
            console.log("Error in /users:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: "Server error" }));
            return;
        }
        return;
    }
    res.statusCode = 404;
    res.end("Not found");
}
function parseCookies(req) {
    const rawCookies = req.headers.cookie || "";
    const parsed = {};
    rawCookies.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        if (!name)
            return;
        const value = rest.join("=");
        parsed[name] = decodeURIComponent(value);
        console.log("parsed cookies", parsed);
    });
    return parsed;
}
