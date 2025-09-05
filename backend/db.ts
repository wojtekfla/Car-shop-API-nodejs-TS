import { Pool, QueryResultRow } from "pg"

export const pool = new Pool({
	host: process.env.PGHOST || "localhost",
	port: Number((process.env.PGPORT || "5432").trim()),
	user: process.env.PGUSER || "postgres",
	password: process.env.PGPASSWORD || "Homer123",
	database: process.env.PGDATABASE || "carshop",
})

export async function query<T extends QueryResultRow>(text: string, params?: any[]) {
	const result = await pool.query<T>(text, params)
	return result.rows
}



