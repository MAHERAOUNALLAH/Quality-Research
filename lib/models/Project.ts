import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  startDate: Date;
  endDate?: Date;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getProjectsCollection() {
  const db = await getDb();
  return db.collection<Project>("projects");
}