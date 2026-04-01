import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const items = await db
      .collection("calls")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/calls error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();

    const result = await db.collection("calls").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      insertedId: result.insertedId,
      message: "Call created",
    });
  } catch (error) {
    console.error("POST /api/calls error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create call" },
      { status: 500 }
    );
  }
}