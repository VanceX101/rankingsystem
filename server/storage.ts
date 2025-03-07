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
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const result = await db.insert(evaluations).values(evaluation).returning();
    return result[0];
  }

  async getUserEvaluations(userId: number): Promise<Evaluation[]> {
    return await db.select()
      .from(evaluations)
      .where(
        or(
          eq(evaluations.employeeId, userId),
          eq(evaluations.evaluatorId, userId)
        )
      );
  }
}

export const storage = new TursoStorage();