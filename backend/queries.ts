const queries = {
  getAllUsers: "SELECT * FROM users",
  getUserById: "SELECT id, username, role, balance FROM users WHERE id = $1",
  findByUserName: "SELECT * FROM users WHERE username = $1",
  createUser: "INSERT INTO users (id, username, password, role, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, balance",
  updateUser: "UPDATE users SET username = $1, role = $2, balance = $3 WHERE id = $4 RETURNING id, username, role, balance",
  deleteUser: "DELETE FROM users WHERE id = $1"
}
export default queries

export const carQueries = {
  getAllCars: "SELECT * FROM cars",
  getCarById: "SELECT * FROM cars WHERE id = $1",
  addNewCar: "INSERT INTO cars (id, model, price, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
  updateCar: "UPDATE cars SET model = $1, price = $2, WHERE id = $3 RETURNING *",
  deleteCar: "DELETE FROM cars WHERE id = $1",
  buyCar: "UPDATE cars SET owner_id = $1 WHERE id = $2 AND owner_id IS NULL RETURNING *"
}
