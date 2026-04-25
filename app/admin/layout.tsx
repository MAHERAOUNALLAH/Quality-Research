import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { isAdminRole, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import AdminSidebar from "./_components/AdminSidebar";

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
    <div className="flex min-h-screen bg-[#f6fbf8]">
      <AdminSidebar email={user.email} role={user.role} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
