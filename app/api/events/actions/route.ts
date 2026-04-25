import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

type ActionType = "favorite" | "cart";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  return new ObjectId(payload.sub);
}

function getCollectionName(type: ActionType) {
  return type === "favorite" ? "eventFavorites" : "eventCart";
}

function isActionType(value: unknown): value is ActionType {
  return value === "favorite" || value === "cart";
}

async function getUserActionItems(userId: ObjectId, type: ActionType) {
  const db = await getDb();
  const collectionName = getCollectionName(type);

  return await db
    .collection(collectionName)
    .aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 1,
          eventId: 1,
          quantity: 1,
          createdAt: 1,
          event: {
            _id: "$event._id",
            titre: "$event.titre",
            description: "$event.description",
            date: "$event.date",
            lieu: "$event.lieu",
            image: "$event.image",
            prix: "$event.prix",
          },
        },
      },
    ])
    .toArray();
}

async function getStatus(userId: ObjectId, eventId: ObjectId) {
  const db = await getDb();
  const [favorite, cart] = await Promise.all([
    db.collection("eventFavorites").findOne({ userId, eventId }),
    db.collection("eventCart").findOne({ userId, eventId }),
  ]);

  return {
    favorite: Boolean(favorite),
    inCart: Boolean(cart),
  };
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Non authentifie" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const type = searchParams.get("type");

    if (!eventId && isActionType(type)) {
      const items = await getUserActionItems(userId, type);
      return NextResponse.json({ ok: true, items });
    }

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { ok: false, message: "Event id invalide" },
        { status: 400 }
      );
    }

    const status = await getStatus(userId, new ObjectId(eventId));
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    console.error("GET /api/events/actions error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de charger le statut" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Non authentifie" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const eventId = String(body.eventId || "");
    const type = body.type as ActionType;

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { ok: false, message: "Event id invalide" },
        { status: 400 }
      );
    }

    if (type !== "favorite" && type !== "cart") {
      return NextResponse.json(
        { ok: false, message: "Type invalide" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const eventObjectId = new ObjectId(eventId);
    const event = await db.collection("events").findOne({ _id: eventObjectId });

    if (!event) {
      return NextResponse.json(
        { ok: false, message: "Evenement introuvable" },
        { status: 404 }
      );
    }

    const collection = db.collection(getCollectionName(type));
    const existing = await collection.findOne({ userId, eventId: eventObjectId });

    if (existing) {
      await collection.deleteOne({ _id: existing._id });
    } else {
      const actionDocument: Record<string, unknown> = {
        userId,
        eventId: eventObjectId,
        eventTitle: event.titre || "",
        eventPrice: Number(event.prix) || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (type === "cart") {
        actionDocument.quantity = 1;
      }

      await collection.insertOne(actionDocument);
    }

    const status = await getStatus(userId, eventObjectId);
    return NextResponse.json({ ok: true, ...status });
  } catch (error) {
    console.error("POST /api/events/actions error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible d'enregistrer l'action" },
      { status: 500 }
    );
  }
}
