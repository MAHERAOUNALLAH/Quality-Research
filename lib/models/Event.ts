import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Event {
  _id?: ObjectId;
  titre: string;
  description: string;
  date: Date;
  lieu: string;
  categoryId?: ObjectId | string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getEventsCollection() {
  const db = await getDb();
  return db.collection<Event>("events");
}