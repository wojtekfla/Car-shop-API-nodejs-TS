// DB INTERACTION
import { IncomingMessage } from "node:http";
import fs from "node:fs/promises";
import { Car, User } from "./types.js";

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
export async function getUserById(id: string, filePath: string): Promise<User | null> {
  const usersRaw = await fs.readFile(filePath, "utf-8");
	const users = JSON.parse(usersRaw) as User[]
	const user = users.find((u) => u.id === id)
	return user || null
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

