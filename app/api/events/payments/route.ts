import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

type UserDoc = {
  _id?: ObjectId;
  fullName?: string;
  nom?: string;
  prenom?: string;
  email?: string;
};

function getUserName(user?: UserDoc | null) {
  const fullName = user?.fullName?.trim();
  if (fullName) return fullName;

  const composedName = [user?.prenom, user?.nom]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return composedName || user?.email || "Utilisateur";
}

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  return new ObjectId(payload.sub);
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Non authentifie" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const items = await db
      .collection("payments")
      .find({ userId, type: "event" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("GET /api/events/payments error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de charger les paiements" },
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

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { ok: false, message: "Event id invalide" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const eventObjectId = new ObjectId(eventId);
    const [event, cartItem, user] = await Promise.all([
      db.collection("events").findOne({ _id: eventObjectId }),
      db.collection("eventCart").findOne({ userId, eventId: eventObjectId }),
      db.collection<UserDoc>("users").findOne({ _id: userId }),
    ]);

    if (!event) {
      return NextResponse.json(
        { ok: false, message: "Evenement introuvable" },
        { status: 404 }
      );
    }

    if (!cartItem) {
      return NextResponse.json(
        { ok: false, message: "Evenement absent du panier" },
        { status: 400 }
      );
    }

    const amount = Number(event.prix) || 0;
    const now = new Date();
    const payment = {
      userId,
      eventId: eventObjectId,
      type: "event",
      provider: "manual",
      status: amount > 0 ? "paid" : "free",
      currency: "TND",
      amount,
      eventTitle: event.titre || "",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("payments").insertOne(payment);
    await db.collection("eventRegistrations").updateOne(
      { userId, eventId: eventObjectId },
      {
        $setOnInsert: {
          userId,
          eventId: eventObjectId,
          eventTitle: event.titre || "",
          eventPrice: amount,
          userName: getUserName(user),
          userEmail: user?.email || "",
          createdAt: now,
        },
        $set: {
          status: payment.status,
          paidAt: now,
          updatedAt: now,
        },
      },
      { upsert: true }
    );
    await db.collection("eventCart").deleteOne({ _id: cartItem._id });

    return NextResponse.json({
      ok: true,
      payment: { _id: result.insertedId, ...payment },
    });
  } catch (error) {
    console.error("POST /api/events/payments error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de valider le paiement" },
      { status: 500 }
    );
  }
}
