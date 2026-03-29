import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  try {
    const payload = await verifyToken(token);
    const db = await getDb();

    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.sub),
    });

    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      redirect("/");
    }

    return <>{children}</>;
  } catch {
    redirect("/login");
  }
}