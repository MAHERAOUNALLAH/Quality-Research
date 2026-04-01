import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Partner {
  _id?: ObjectId;
  name: string;
  type: string;
  country: string;
  logo: string;
  website: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPartnersCollection() {
  const db = await getDb();
  return db.collection<Partner>("partners");
}
