import fs from "node:fs/promises";
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
