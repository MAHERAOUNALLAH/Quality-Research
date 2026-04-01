import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getArticlesCollection } from "@/lib/models/Article";
import { requireAdmin } from "@/lib/requireAdmin";
import { getDb } from "@/lib/mongodb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await getArticlesCollection();
    const article = await col.findOne({ _id: new ObjectId(id) });
    if (!article) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    // Populate category name
    let categoryName: string | null = null;
    if (article.categoryId) {
      try {
        const db = await getDb();
        const cat = await db.collection("categories").findOne({ _id: new ObjectId(String(article.categoryId)) });
        if (cat) categoryName = cat.nom;
      } catch {}
    }

    return NextResponse.json({ ok: true, item: { ...article, categoryName } });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const col = await getArticlesCollection();

    await col.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          titre: body.titre,
          contenu: body.contenu,
          categoryId: body.categoryId || "",
          image: body.image || "",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const col = await getArticlesCollection();
    await col.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
