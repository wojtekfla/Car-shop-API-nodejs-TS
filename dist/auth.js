import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import queries from "./queries.js";
import { pool } from "./db.js";
dotenv.config();
const SECRET = process.env.SECRET_TOKEN ?? "domyślny_klucz";
const EXPIRES_IN = process.env.TOKEN_EXPIRATION || "10m";
export function generateToken(user) {
    return jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role,
    }, SECRET, { expiresIn: "15m" });
}
export function setCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });
}
export async function getUserFromToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
        const result = await pool.query(queries.getUserById, [decoded.id]);
        console.log('result rows', result.rows);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    catch (error) {
        console.log('getUserFromToken error', error);
        return null;
    }
}
// export async function getCurrentUser(
// 	req: IncomingMessage
// ): Promise<User | null> {
// 	const cookies = parseCookies(req);
// 	const token = cookies.token;
// 	if (!token) return null;
// 	return getUserFromToken(token, USERS_DB);
// }
// export function parseCookies(req: IncomingMessage): Record<string, string> {
// 	const rawCookies = req.headers.cookie || "";
// 	const parsed: Record<string, string> = {};
// 	rawCookies.split(";").forEach((cookie) => {
// 		const [name, ...rest] = cookie.trim().split("=");
// 		if (!name) return;
// 		const value = rest.join("=");
// 		parsed[name] = decodeURIComponent(value);
// 	});
// 	return parsed;
// }
/*

// export function setAuthCookie(res: ServerResponse, token: string) {
// }

// export function parseCookies(req: IncomingMessage): Record<string, string> {
// }

*/
