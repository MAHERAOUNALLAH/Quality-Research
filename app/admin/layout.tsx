import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { isAdminRole, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminLayoutClient from "./_components/AdminLayoutClient";

async function getCurrentUser(token: string) {
  try {
    const payload = await verifyToken(token);
    const db = await getDb();
    return await db.collection("users").findOne({
      _id: new ObjectId(payload.sub),
    });
  } catch {
    return null;
  }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const user = await getCurrentUser(token);
  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/");

  return (
    <AdminLayoutClient email={user.email} role={user.role}>
      {children}
    </AdminLayoutClient>
  );
}
