import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "Accès refusé" },
        { status: 403 }
      );
    }

    const db = await getDb();

    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            passwordHash: 0,
            password: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error("ADMIN_USERS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}
