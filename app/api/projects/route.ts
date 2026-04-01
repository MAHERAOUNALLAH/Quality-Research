import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const items = await db
      .collection("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();

    const result = await db.collection("projects").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      insertedId: result.insertedId,
      message: "Project created",
    });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create project" },
      { status: 500 }
    );
  }
}