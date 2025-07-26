// export function generateToken(userId: string): string {
// }

import jwt, {SignOptions} from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()

const SECRET = process.env.SECRET_TOKEN ?? "domyślny_klucz"
const EXPIRES_IN = process.env.TOKEN_EXPIRATION || "10m"

export function generateToken(payload: object, expiresIn: number): string {
  const options: SignOptions = { expiresIn }
  return jwt.sign(payload, SECRET, options)
  // return jwt.sign(payload, token, { expiresIn })
}

// export function getUserFromToken(token: string): User | null {
// }

// export function setAuthCookie(res: ServerResponse, token: string) {
// }

// export function parseCookies(req: IncomingMessage): Record<string, string> {
// }
