import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const secret = process.env.JWT_SECRET!

export function signToken(payload: any) {
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret)
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
