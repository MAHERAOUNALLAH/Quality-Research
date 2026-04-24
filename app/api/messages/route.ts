import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
