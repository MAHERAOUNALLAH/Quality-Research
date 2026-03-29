import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const payload = await verifyToken(token);
  const db = await getDb();

  const user = await db.collection("users").findOne({
    _id: new ObjectId(payload.sub),
  });

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    throw new Error("FORBIDDEN");
  }

  return user;
}