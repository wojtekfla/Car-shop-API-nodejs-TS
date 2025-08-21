import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
// import { handleRequest } from "./router.js";
import carsRouter from './routes/cars.router.js';
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// routs
app.use(express.static(path.join(__dirName, "../frontend")));
app.use('/api/cars', carsRouter);
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    // handleRequest();
});
