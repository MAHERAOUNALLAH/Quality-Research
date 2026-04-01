import { NextResponse } from "next/server";
import { getEventsCollection } from "@/lib/models/Event";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const col = await getEventsCollection();
    const items = await col.find({}).sort({ date: -1 }).toArray();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.titre?.trim()) {
      return NextResponse.json({ ok: false, message: "titre is required" }, { status: 400 });
    }

    const col = await getEventsCollection();
    const result = await col.insertOne({
      titre: body.titre.trim(),
      description: body.description || "",
      date: body.date ? new Date(body.date) : new Date(),
      lieu: body.lieu || "",
      categoryId: body.categoryId || "",
      image: body.image || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create event" }, { status: 500 });
  }
}