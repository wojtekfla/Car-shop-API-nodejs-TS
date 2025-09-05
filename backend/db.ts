import { Pool, QueryResultRow } from "pg"

export const pool = new Pool({
	host: 'localhost',
	port: 5400,
	user: 'postgres',
	password: 'Homer123',
	database: 'carshop',
})

export async function query<T extends QueryResultRow>(text: string, params?: any[]) {
	const result = await pool.query<T>(text, params)
	return result.rows
}



