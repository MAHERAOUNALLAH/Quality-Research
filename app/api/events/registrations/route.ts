import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRole, verifyToken } from "@/lib/auth";

type UserDoc = {
  _id: ObjectId;
  fullName?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: string;
};

type EventDoc = {
  _id: ObjectId;
  titre?: string;
  prix?: number;
};

type AggregatedRegistration = {
  _id: ObjectId;
  userId?: ObjectId;
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: Date | string;
};

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!ObjectId.isValid(payload.sub)) return null;

  const db = await getDb();
  return await db
    .collection<UserDoc>("users")
    .findOne({ _id: new ObjectId(payload.sub) });
}

function getUserName(user: UserDoc) {
  const fullName = user.fullName?.trim();
  if (fullName) return fullName;

  const composedName = [user.prenom, user.nom]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return composedName || user.email || "Utilisateur";
}

function toIsoString(value?: Date | string) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function getEventId(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") || "";

  if (!eventId || !ObjectId.isValid(eventId)) {
    return null;
  }

  return new ObjectId(eventId);
}

export async function GET(req: Request) {
  try {
    const eventId = getEventId(req);

    if (!eventId) {
      return NextResponse.json(
        { ok: false, message: "Event id invalide" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const adminView = searchParams.get("admin") === "1";
    const user = await getCurrentUser();

    if (adminView) {
      if (!user || !isAdminRole(user.role)) {
        return NextResponse.json(
          { ok: false, message: "Acces refuse" },
          { status: 403 }
        );
      }

      const db = await getDb();
      const items = await db
        .collection("eventRegistrations")
        .aggregate<AggregatedRegistration>([
          { $match: { eventId } },
          { $sort: { createdAt: -1 } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              userId: 1,
              status: 1,
              createdAt: 1,
              fullName: { $ifNull: ["$user.fullName", "$userName"] },
              email: { $ifNull: ["$user.email", "$userEmail"] },
              role: "$user.role",
            },
          },
        ])
        .toArray();

      return NextResponse.json({
        ok: true,
        count: items.length,
        items: items.map((item) => ({
          _id: String(item._id),
          userId: item.userId ? String(item.userId) : "",
          fullName: item.fullName || "Utilisateur",
          email: item.email || "",
          role: item.role || "",
          status: item.status || "registered",
          createdAt: toIsoString(item.createdAt),
        })),
      });
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Non authentifie" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const registration = await db.collection("eventRegistrations").findOne({
      userId: user._id,
      eventId,
    });

    return NextResponse.json({
      ok: true,
      registered: Boolean(registration),
    });
  } catch (error) {
    console.error("GET /api/events/registrations error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible de charger les inscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
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
    const event = await db
      .collection<EventDoc>("events")
      .findOne({ _id: eventObjectId });

    if (!event) {
      return NextResponse.json(
        { ok: false, message: "Evenement introuvable" },
        { status: 404 }
      );
    }

    const now = new Date();
    const registrations = db.collection("eventRegistrations");

    await registrations.updateOne(
      { userId: user._id, eventId: eventObjectId },
      {
        $setOnInsert: {
          userId: user._id,
          eventId: eventObjectId,
          eventTitle: event.titre || "",
          eventPrice: Number(event.prix) || 0,
          userName: getUserName(user),
          userEmail: user.email || "",
          status: "registered",
          createdAt: now,
        },
        $set: {
          updatedAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, registered: true });
  } catch (error) {
    console.error("POST /api/events/registrations error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible d'enregistrer la participation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Non authentifie" },
        { status: 401 }
      );
    }

    const eventId = getEventId(req);

    if (!eventId) {
      return NextResponse.json(
        { ok: false, message: "Event id invalide" },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection("eventRegistrations").deleteOne({
      userId: user._id,
      eventId,
    });

    return NextResponse.json({ ok: true, registered: false });
  } catch (error) {
    console.error("DELETE /api/events/registrations error:", error);
    return NextResponse.json(
      { ok: false, message: "Impossible d'annuler la participation" },
      { status: 500 }
    );
  }
}
