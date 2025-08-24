import { pool } from "../db.js";
import queries from "../queries.js";
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(queries.getAllUsers);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};
export const getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getUserById, [id], (error, result) => {
        if (error)
            throw error;
        res.status(200).json(result.rows);
    });
};
// PUT /users/:id
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role, balance } = req.body;
    try {
        const result = await pool.query(queries.updateUser, [id, username, role, balance]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};
// DELETE /users/:id
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(queries.deleteUser, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};
// export const loginUser = async (req: Request, res: Response) => {
// 	const { username, password } = req.body;
//   console.log('us name i pass', username, password)
// 	if (!username || !password) {
// 		return res.status(400).json({ message: "Missing username or password" });
// 	}
// 	try {
// 		const result = await pool.query(queries.findByUserName, [username]);
// 		const user: User = result.rows[0];
//     console.log('user', user)
// 		if (!user) return res.status(401).json({ error: "Invalid credentials" });
// 		const validPassword = await bcrypt.compare(password, user.password);
// 		if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });
// 		const token = generateToken(user);
//     setCookie(res, token)
//     res.json({message: `User: ${user.username} logged in`})
// 	} catch (error) {
// 		res.status(500).json({ error: "Login failed" });
// 	}
// };
