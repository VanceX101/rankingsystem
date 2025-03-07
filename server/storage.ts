import { users, evaluations, type User, type Evaluation, type InsertUser, type InsertEvaluation } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private evaluations: Map<number, Evaluation>;
  private currentUserId: number;
  private currentEvalId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.evaluations = new Map();
    this.currentUserId = 1;
    this.currentEvalId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id, role: insertUser.role || "employee" };
    this.users.set(id, user);
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentEvalId++;
    const newEvaluation = {
      ...evaluation,
      id,
      date: evaluation.date || new Date(),
      comments: evaluation.comments || null,
      employeeId: evaluation.employeeId || null,
      evaluatorId: evaluation.evaluatorId || null
    };
    this.evaluations.set(id, newEvaluation);
    return newEvaluation;
  }

  async getUserEvaluations(userId: number): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values()).filter(
      evaluation => evaluation.employeeId === userId || evaluation.evaluatorId === userId
    );
  }
}

export const storage = new MemStorage();