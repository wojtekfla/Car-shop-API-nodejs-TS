import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import queries from "../queries.js";
function generateToken(payload) {
    return jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: "15m" });
}
// POST /register
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password required" });
        }
        // unikalność loginu
        const existing = await pool.query(queries.findByUserName, [username]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Username already taken" });
        }
        // hash hasła
        const hashed = await bcrypt.hash(password, 10);
        const newUserId = Date.now().toString();
        // dodanie usera do bazy
        const result = await pool.query(queries.createUser, [
            newUserId,
            username,
            hashed,
            "user",
            100000,
        ]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("registration error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
//POST /login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Username and password required" });
        }
        const result = await pool.query(queries.findByUserName, [username]);
        const user = result.rows[0];
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = generateToken({ id: user.id, role: user.role });
        setCookie(res, token);
        res.json({ message: `User: ${user.username} logged in` });
    }
    catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//POST /logout
export const logout = (req, res) => {
    clearCookie(res);
    res.json({ message: "Logged out" });
};
export function setCookie(res, token) {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
        path: "/",
    });
}
export function clearCookie(res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        path: "/",
    });
}
//GET /hack/fund
export async function hackFund(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unathorized" });
        const result = await pool.query(queries.fundUser, [50000, userId]);
        if (result.rowCount === 0)
            return res.status(404).json({ message: 'User not found' });
        return res.redirect('/');
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
    ;
}
