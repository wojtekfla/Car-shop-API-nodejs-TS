import fs from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "./auth.js";
const USERS_DB = path.join(process.cwd(), "db", "users.json");
const CARS_DB = path.join(process.cwd(), "db", "cars.json");
// odczyt body
export function getBodyData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                resolve(body);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
// read data from JSON
export async function readDataFromJson(filePath) {
    try {
        await fs.access(filePath); // spr. czy plik instnieje
    }
    catch (error) {
        await fs.writeFile(filePath, JSON.stringify([], null, 2), "utf-8");
        return [];
    }
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data || "[]");
}
// save data in JSON
export async function saveDataToJson(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (error) {
        console.log("error", error);
    }
}
// CRUD for Users
// create User
// load Users
// get User by Id
export async function getUserById(id, filePath) {
    const usersRaw = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(usersRaw);
    const user = users.find((u) => u.id === id);
    return user || null;
}
// update User
// delete User
// CRUD for Cars
// load cars
export async function loadCars(filePath) {
    const cars = await readDataFromJson(filePath);
    return cars;
}
// get car by Id
export async function getCarById(id, filePath) {
    const cars = await readDataFromJson(filePath);
    const car = cars.find((car) => car.id === id);
    if (!car) {
        throw new Error(`Car with id: ${id} not found`);
    }
    return car;
}
// update car
// delete car
// buy car
export async function buyCar(req, res, pathname) {
    const pathnameParts = pathname.split("/");
    const carId = pathnameParts[2];
    const buyer = await getCurrentUser(req);
    if (!buyer) {
        res.statusCode = 401; // 401 Unauthorized
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Unauthorized" }));
    }
    const users = await readDataFromJson(USERS_DB);
    const cars = await readDataFromJson(CARS_DB);
    const boughtCar = cars.find((c) => c.id === carId);
    if (!boughtCar) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Car not found" }));
    }
    if (boughtCar.ownerId !== null) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Car already sold" }));
    }
    if (buyer.balance < boughtCar.price) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Insufficiend funds" }));
    }
    // Transaction
    const buyerIndex = users.findIndex((u) => u.id === buyer.id);
    if (buyerIndex !== -1) {
        users[buyerIndex].balance -= boughtCar.price;
    }
    boughtCar.ownerId = buyer.id; // boughtCar jest referencja do cars - modyfikacja zostanie uwzgledniona 
    await saveDataToJson(CARS_DB, cars);
    await saveDataToJson(USERS_DB, users);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ success: "Car purchased successfully" }));
}
