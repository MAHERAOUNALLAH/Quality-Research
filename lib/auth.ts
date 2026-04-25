import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export type TokenPayload = {
  sub: string; // userId
  email: string;
  role: string;
};

export function normalizeRole(role: unknown) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export function isAdminRole(role: unknown) {
  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "superadmin";
}

export function isSuperAdminRole(role: unknown) {
  return normalizeRole(role) === "superadmin";
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return await bcrypt.compare(password, passwordHash);
}

export async function signToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}
