import { Pool } from "pg";
export const pool = new Pool({
    host: 'localhost',
    port: 5400,
    user: 'postgres',
    password: 'Homer123',
    database: 'carshop',
});
export async function query(text, params) {
    const result = await pool.query(text, params);
    return result.rows;
}
