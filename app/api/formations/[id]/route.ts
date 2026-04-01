import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const item = await db.collection("formations").findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch formation" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.collection("formations").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: body.title,
          description: body.description || "",
          duration: body.duration || "",
          level: body.level || "",
          format: body.format || "",
          image: body.image || "",
          published: body.published !== false,
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
    const db = await getDb();
    await db.collection("formations").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
