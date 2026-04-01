import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Message {
  _id?: ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export async function getMessagesCollection() {
  const db = await getDb();
  return db.collection<Message>("messages");
}