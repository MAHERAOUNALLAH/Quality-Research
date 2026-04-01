import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();
    const item = await db.collection("calls").findOne({ _id: new ObjectId(id) });
    if (!item) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch call" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.collection("calls").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: body.title,
          excerpt: body.excerpt || "",
          content: body.content || "",
          type: body.type || "",
          deadline: body.deadline ? new Date(body.deadline) : null,
          link: body.link || "",
          isOpen: body.isOpen !== false,
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
    await db.collection("calls").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
