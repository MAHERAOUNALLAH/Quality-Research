import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Acces refuse" },
        { status: 403 }
      );
    }

    const db = await getDb();
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0, passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de recuperer les utilisateurs" },
      { status: 500 }
    );
  }
}
