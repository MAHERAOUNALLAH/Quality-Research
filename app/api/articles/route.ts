import { NextResponse } from "next/server";
import { getArticlesCollection } from "@/lib/models/Article";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  try {
    const col = await getArticlesCollection();
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch articles" }, { status: 500 });
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

    const col = await getArticlesCollection();
    const result = await col.insertOne({
      titre: body.titre.trim(),
      contenu: body.contenu || "",
      categoryId: body.categoryId || "",
      authorId: body.authorId || "",
      image: body.image || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, insertedId: result.insertedId });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to create article" }, { status: 500 });
  }
}