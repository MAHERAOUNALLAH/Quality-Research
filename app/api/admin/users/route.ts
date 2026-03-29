import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await requireAdmin();

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
    const message = error instanceof Error ? error.message : "ERROR";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, message: "Accès refusé" },
        { status: 403 }
      );
    }

    console.error("ADMIN_USERS_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}