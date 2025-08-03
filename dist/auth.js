import path from "node:path";
import jwt from "jsonwebtoken";
import { readDataFromJson } from "./db.js";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.SECRET_TOKEN ?? "domyślny_klucz";
const EXPIRES_IN = process.env.TOKEN_EXPIRATION || "10m";
const USERS_DB = path.join(process.cwd(), "db", "users.json");
// export function generateToken(userId: string): string {
// } 
export function generateToken(userId) {
    return jwt.sign({
        id: userId
    }, SECRET, { expiresIn: "15m" });
}
export function generateToken2(payload, expiresIn) {
    const options = { expiresIn };
    return jwt.sign(payload, SECRET, options);
}
export function generateToken3(user) {
    return jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role
    }, SECRET, { expiresIn: "1h" });
}
export async function getUserFromToken(token, filePath) {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        console.log('decoded payload', decoded);
        const users = await readDataFromJson(filePath);
        return users.find((u) => u.id === decoded.id) || null;
    }
    catch (error) {
        return null;
    }
}
export async function getCurrentUser(req) {
    const cookies = parseCookies(req);
    const token = cookies.token;
    if (!token)
        return null;
    return getUserFromToken(token, USERS_DB);
}
export function parseCookies(req) {
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
// export function setAuthCookie(res: ServerResponse, token: string) {
// }
// export function parseCookies(req: IncomingMessage): Record<string, string> {
// }
