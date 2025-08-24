import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth.router.js'
import userRouter from './routes/user.router.js'
import carRouter from './routes/car.router.js'

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(cookieParser())

// static files
app.use(express.static(path.join(__dirName, "../frontend")));

app.use(authRouter)
app.use(userRouter)
app.use(carRouter)

app.listen(PORT, () => {
	console.log(`Server is running on port: ${PORT}`)

});


