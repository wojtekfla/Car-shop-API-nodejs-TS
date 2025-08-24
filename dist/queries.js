const queries = {
    getAllUsers: "SELECT * FROM users",
    getUserById: "SELECT id, username, role, balance FROM users WHERE id = $1",
    findByUserName: "SELECT * FROM users WHERE username = $1",
    createUser: "INSERT INTO users (id, username, password, role, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, balance",
    updateUser: "UPDATE users SET username = $1, role = $2, balance = $3 WHERE id = $4 RETURNING id, username, role, balance",
    deleteUser: "DELETE FROM users WHERE id = $1"
};
export default queries;
