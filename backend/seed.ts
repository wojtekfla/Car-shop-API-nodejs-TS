import { pool } from "./db.js";
import bcrypt from "bcrypt";

async function seed() {
	try {
		console.log("Seeding database ...");

		const adminCheck = await pool.query(
			"SELECT * FROM users WHERE role = 'admin' LIMIT 1"
		);
		if (adminCheck.rows.length === 0) {
			const hashed = await bcrypt.hash("admin123", 10);
			const newId = Date.now().toString();
			await pool.query(
				"INSERT INTO users (id, username, password, role, balance) VALUES ($1, $2, $3, $4, $5)",
				[newId, "admin", hashed, "admin", 100000]
			);
			console.log("admin created: login=admin password=admin123");
		} else {
			console.log("Admin already exists, skipping");
		}

		const carCheck = await pool.query("SELECT * FROM cars LIMIT 1");
		if (carCheck.rows.length === 0) {
			const cars = [
				{
					id: "1721708487939",
					model: "Toyota Corrola",
					price: 65000,
					ownerId: null,
				},
				{
					id: "1721857889365",
					model: "Honda Civic",
					price: 61000,
					ownerId: null,
				},
				{
					id: "1721917542677",
					model: "Mazda 6",
					price: 58000,
					ownerId: null,
				},
				{
					id: "1721979674821",
					model: "Volkswagen Passat",
					price: 72000,
					ownerId: null,
				},
				{
					id: "1722076537523",
					model: "Kia Sportage",
					price: 85000,
					ownerId: null,
				},
				{
					id: "1754238269951",
					model: "Ford Focus",
					price: 37500,
					ownerId: null,
				},
			];

      for (const car of cars) {
        await pool.query(
          "INSERT INTO cars (id, model, price, owner_id) VALUES ($1, $2, $3, NULL)", [car.id, car.model, car.price]
        )
      }
      console.log('Car added to database')
		} else {
      console.log('Cars already exist, skipping')
    }
	} catch (error) {
    console.error('Seed error', error)
  } finally {
    await pool.end()
  }
}

seed()
