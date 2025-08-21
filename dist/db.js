import pg from "pg";
export const pool = new pg.Pool({
    host: 'localhost',
    port: 5400,
    user: 'postgres',
    password: 'Homer123',
    database: 'carshop',
});
// export const pool = new pg.Pool({
// 	host: process.env.DB_HOST || 'localhost',
// 	port: Number(process.env.DB_PORT) || 5400,
// 	user: process.env.DB_USER || 'postgres',
// 	password: process.env.DB_PASSWORD || 'Homer123',
// 	database: process.env.DB_NAME || 'carshop',
// })
export async function query(text, params) {
    const result = await pool.query(text, params);
    return result.rows;
}
/*
import { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { Car, User } from "./types.js";
import { getCurrentUser } from "./auth.js";
import { sendSSE } from "./sse.js";

const USERS_DB = path.join(process.cwd(), "db", "users.json");
const CARS_DB = path.join(process.cwd(), "db", "cars.json");

// odczyt body
export function getBodyData(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let body: string = "";

            req.on("data", (chunk: any) => {
                body += chunk.toString();
            });

            req.on("end", () => {
                resolve(body);
            });
        } catch (error) {
            reject(error);
        }
    });
}

// read data from JSON
export async function readDataFromJson<T>(filePath: string): Promise<T[]> {
    try {
        await fs.access(filePath); // spr. czy plik instnieje
    } catch (error) {
        await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
        return [];
    }
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]") as T[];
}

// save data in JSON
export async function saveDataToJson<T>(filePath: string, data: T[]) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
        console.log("error", error);
    }
}

// CRUD for Users
// create User

// load Users

// get User by Id
export async function getUserById(
    id: string,
    filePath: string
): Promise<User | null> {
    const usersRaw = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(usersRaw) as User[];
    const user = users.find((u) => u.id === id);
    return user || null;
}

// update User

// delete User

// CRUD for Cars
// load cars
export async function loadCars(filePath: string): Promise<Car[]> {
    const cars = await readDataFromJson<Car>(filePath);
    return cars;
}
// get car by Id
export async function getCarById(id: string, filePath: string): Promise<Car> {
    const cars = await readDataFromJson<Car>(filePath);
    const car = cars.find((car) => car.id === id);
    if (!car) {
        throw new Error(`Car with id: ${id} not found`);
    }
    return car;
}
// update car

// delete car

// buy car
export async function buyCar(
    req: IncomingMessage,
    res: ServerResponse,
    pathname: string
) {
    const pathnameParts = pathname.split("/");
    const carId = pathnameParts[2];

    const buyer = await getCurrentUser(req);
    if (!buyer) {
        res.statusCode = 401; // 401 Unauthorized
        res.setHeader ("Content-Type", "application/json")
        return res.end(JSON.stringify({ error: "Unauthorized" }));
    }

    const users = await readDataFromJson<User>(USERS_DB)
    const cars = await readDataFromJson<Car>(CARS_DB);

    const boughtCar = cars.find((c) => c.id === carId);
    if (!boughtCar) {
        res.statusCode = 404;
        res.setHeader ("Content-Type", "application/json")
        return res.end(JSON.stringify({ error: "Car not found" }));
    }

    if (boughtCar.ownerId !== null) {
        res.statusCode = 400;
        res.setHeader ("Content-Type", "application/json")
        return res.end(JSON.stringify({ error: "Car already sold" }));
    }

    if (buyer.balance < boughtCar.price) {
        res.statusCode = 400;
        res.setHeader ("Content-Type", "application/json")
        return res.end(JSON.stringify({ error: "Insufficiend funds" }));
    }

    // Transaction
    const buyerIndex = users.findIndex((u: User) => u.id === buyer.id);
    if (buyerIndex !== -1) {
        users[buyerIndex].balance -= boughtCar.price
    }

    boughtCar.ownerId = buyer.id; // boughtCar jest referencja do cars - modyfikacja zostanie uwzgledniona

    await saveDataToJson<Car>(CARS_DB, cars)
    await saveDataToJson<User>(USERS_DB, users)

    sendSSE({
  event: "carPurchased",
  carId: boughtCar.id,
  buyerId: buyer.id,
  model: boughtCar.model,
  price: boughtCar.price,
  buyerUsername: buyer.username,
    });

    res.statusCode = 200;
    res.setHeader ("Content-Type", "application/json")
    return res.end(JSON.stringify({ success: "Car purchased successfully" }));
}

*/
