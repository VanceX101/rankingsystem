import { users, evaluations, type User, type Evaluation, type InsertUser, type InsertEvaluation } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./database";
import { eq, or } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getUserEvaluations(userId: number): Promise<Evaluation[]>;
  sessionStore: session.Store;
}

export class TursoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      throw new Error("Failed to get user");
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw new Error("Failed to get user by username");
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw new Error("Failed to get all users");
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await db.select().from(users).where(eq(users.role, role));
    } catch (error) {
      console.error("Error getting users by role:", error);
      throw new Error("Failed to get users by role");
    }
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    try {
      const result = await db.insert(evaluations).values(evaluation).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating evaluation:", error);
      throw new Error("Failed to create evaluation");
    }
  }

  async getUserEvaluations(userId: number): Promise<Evaluation[]> {
    try {
      return await db.select()
        .from(evaluations)
        .where(
          or(
            eq(evaluations.employeeId, userId),
            eq(evaluations.evaluatorId, userId)
          )
        );
    } catch (error) {
      console.error("Error getting user evaluations:", error);
      throw new Error("Failed to get user evaluations");
    }
  }
}

export const storage = new TursoStorage();