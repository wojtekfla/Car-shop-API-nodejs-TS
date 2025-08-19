import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const router = express.Router();
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const app = express();
const USERS_DB = path.join(process.cwd(), "db", "users.json"); // przyklad do cars
const carsData = JSON.parse(fs.readFileSync(path.join(__dirName, "../../db", "cars.json"), "utf-8"));
router.get("/api/cars", (req, res) => {
    res.status(200).json(carsData);
});
router.get("/api/cars/:id/", (req, res) => {
    const id = req.params.id;
    console.log('id', id);
    console.log(typeof (id));
    const foundCar = carsData.find((c) => c.id === id);
    console.log('found car', foundCar);
    if (!foundCar) {
        return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(foundCar);
});
export default router;
// import { IncomingMessage, ServerResponse } from "node:http";
// import path from "node:path";
// import fs from "node:fs/promises";
// import url from "node:url";
// import {
// 	buyCar,
// 	getBodyData,
// 	getCarById,
// 	loadCars,
// 	readDataFromJson,
// 	saveDataToJson,
// } from "../db.js";
// import { getCurrentUser } from "../auth.js";
// get current path
// const __filename = url.fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const CARS_DB = path.join(__dirname, "../../db", "cars.json");
// export async function handleCarsRoutes(
// 	req: IncomingMessage,
// 	res: ServerResponse
// ) {
// 	const method = req.method;
// 	const pathname = req.url?.split("?")[0];
// 	if (method === "GET" && pathname === "/cars") {
// 		const cars = await loadCars(CARS_DB);
// 		if (cars) {
// 			res.statusCode = 200;
// 			res.setHeader("Content-Type", "application/json");
// 			res.end(JSON.stringify(cars));
// 		} else {
// 			res.statusCode = 400;
// 			res.end(JSON.stringify({ success: false, message: "Cars not found" }));
// 		}
// 	}
// 	if (method === "POST" && pathname === "/cars") {
// 		const currentUser = await getCurrentUser(req);
// 		if (!currentUser) {
// 			res.statusCode = 401; // 401 Unauthorized
// 			return res.end(JSON.stringify({ error: "Have to be logged" }));
// 		}
// 		if (currentUser.role !== "admin") {
// 			res.statusCode = 403; // 403 Forbidden
// 			return res.end(JSON.stringify({ error: "Forbidden action" }));
// 		}
// 		const body = JSON.parse(await getBodyData(req));
// 		const { model, price } = body;
// 		if (!model || typeof model !== "string" || isNaN(price)) {
// 			res.statusCode = 400; // 400 Bad request
// 			return res.end(JSON.stringify({ error: "Incorrect car details" }));
// 		}
// 		const cars = await readDataFromJson<Car>(CARS_DB);
// 		const newCar: Car = {
// 			id: Date.now().toString(),
// 			model,
// 			price: Number(price),
// 			ownerId: null,
// 		};
// 		cars.push(newCar);
// 		await saveDataToJson(CARS_DB, cars);
// 		res.statusCode = 201;
// 		return res.end(JSON.stringify(newCar));
// 	}
// 	if (method === "PUT" && pathname?.match(/^\/cars\/[^\/]+$/)) {
// 		const pathnameParts = pathname.split("/");
// 		const carId = pathnameParts[2];
// 		const currentUser = await getCurrentUser(req);
// 		if (!currentUser || currentUser.role !== "admin") {
// 			res.statusCode = 403; // 403 Forbidden
// 			return res.end(JSON.stringify({ error: "Unauthorized" }));
// 		}
// 		const body = JSON.parse(await getBodyData(req));
// 		const { model, price, ownerId } = body;
// 		if (!model || typeof model !== "string" || isNaN(price)) {
// 			res.statusCode = 400; // 400 Bad request
// 			return res.end(JSON.stringify({ error: "Invalid data" }));
// 		}
// 		const cars = await readDataFromJson<Car>(CARS_DB);
// 		// inna metoda, z wyszukaniem indexu
// 		const index = cars.findIndex((car) => car.id === carId);
// 		if (index === -1) {
// 			res.statusCode = 404; // Not found
// 			return res.end(JSON.stringify({ error: "Car not found" }));
// 		}
// 		cars[index].model = model;
// 		cars[index].price = price;
// 		await saveDataToJson(CARS_DB, cars);
// 		res.statusCode = 200; // OK
// 		return res.end(JSON.stringify(cars[index]));
// 	}
// 	if (method === "DELETE" && pathname?.match(/^\/cars\/[^\/]+\/delete$/)) {
// 		const pathnameParts = pathname.split("/");
// 		const carId = pathnameParts[2];
// 		const currentUser = await getCurrentUser(req);
// 		if (!currentUser || currentUser.role !== "admin") {
// 			res.statusCode = 403; // 403 Forbidden
// 			return res.end(JSON.stringify({ error: "Unauthorized" }));
// 		}
// 		const cars = await readDataFromJson<Car>(CARS_DB);
// 		const deletedCar = cars.find((c) => c.id === carId);
// 		const filteredCars = cars.filter((c) => c.id !== carId);
// 		await saveDataToJson(CARS_DB, filteredCars);
// 		res.statusCode = 200; // OK
// 		return res.end(JSON.stringify({ success: true, deleted: deletedCar }));
// 	}
// 	if (method === "POST" && pathname?.match(/^\/cars\/[\w-]+\/buy$/)) {
// 		await buyCar(req, res, pathname);
// 	}
// }
