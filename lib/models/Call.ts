import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Call {
  _id?: ObjectId;
  title: string;
  description: string;
  type: "candidature" | "formation" | "projet" | "autre";
  deadline: Date;
  link?: string;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCallsCollection() {
  const db = await getDb();
  return db.collection<Call>("calls");
}