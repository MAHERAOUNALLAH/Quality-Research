import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

/**
 * Returns the user document if the request is from an admin/superadmin.
 * Returns null if not authenticated or not authorized.
 * API routes that need error-throwing behaviour should check the return value.
 */
export async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return null;
    return user;
  } catch {
    return null;
  }
}
