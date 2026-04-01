import { NextResponse } from "next/server";
import { getCategoriesCollection } from "@/lib/models/Category";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const col = await getCategoriesCollection();
    const items = await col.find({}).sort({ nom: 1 }).toArray();
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    if (!body.nom?.trim()) {
      return NextResponse.json({ ok: false, message: "nom is required" }, { status: 400 });
    }

    const col = await getCategoriesCollection();
    const result = await col.insertOne({
      nom: body.nom.trim(),
      description: body.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ ok: false, message: "Failed to create category" }, { status: 500 });
  }
}