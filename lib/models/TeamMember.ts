import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface TeamMember {
  _id?: ObjectId;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  photo: string;
  email: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getTeamMembersCollection() {
  const db = await getDb();
  return db.collection<TeamMember>("teamMembers");
}
