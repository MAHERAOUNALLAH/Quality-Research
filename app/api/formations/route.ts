import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("formations")
      .find({ published: true })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch formations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ ok: false, message: "title is required" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("formations").insertOne({
      title: body.title.trim(),
      description: body.description || "",
      duration: body.duration || "",
      level: body.level || "",
      format: body.format || "",
      image: body.image || "",
      published: body.published !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create formation" }, { status: 500 });
  }
}
