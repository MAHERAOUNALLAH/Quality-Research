import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const items = await db
      .collection("reports")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();

    const result = await db.collection("reports").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      insertedId: result.insertedId,
      message: "Report created",
    });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create report" },
      { status: 500 }
    );
  }
}