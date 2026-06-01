import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getEventsCollection } from "@/lib/models/Event";
import { requireAdmin } from "@/lib/requireAdmin";
import { getDb } from "@/lib/mongodb";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await getEventsCollection();
    const event = await col.findOne({ _id: new ObjectId(id) });
    if (!event) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    let categoryName: string | null = null;
    if (event.categoryId) {
      try {
        const db = await getDb();
        const cat = await db.collection("categories").findOne({ _id: new ObjectId(String(event.categoryId)) });
        if (cat) categoryName = cat.nom;
      } catch {}
    }

    return NextResponse.json({ ok: true, item: { ...event, categoryName } });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const col = await getEventsCollection();

    await col.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          titre: body.titre,
          description: body.description,
          date: body.date ? new Date(body.date) : new Date(),
          lieu: body.lieu,
          prix: Number(body.prix) || 0,
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
    const col = await getEventsCollection();
    const eventId = new ObjectId(id);
    await col.deleteOne({ _id: eventId });

    const db = await getDb();
    await Promise.all([
      db.collection("eventRegistrations").deleteMany({ eventId }),
      db.collection("eventFavorites").deleteMany({ eventId }),
      db.collection("eventCart").deleteMany({ eventId }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Failed to delete" }, { status: 500 });
  }
}
