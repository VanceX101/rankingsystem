import { users, evaluations, evaluatorAssignments, type User, type Evaluation, type InsertUser, type InsertEvaluation, type InsertAssignment, type EvaluatorAssignment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./database";
import { eq, or, and } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getUserEvaluations(userId: number): Promise<Evaluation[]>;
  getAssignedEmployees(evaluatorId: number): Promise<User[]>;
  createAssignment(assignment: InsertAssignment): Promise<EvaluatorAssignment>;
  deleteAssignment(evaluatorId: number, employeeId: number): Promise<void>;
  getAssignments(evaluatorId?: number): Promise<EvaluatorAssignment[]>;
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
      const result = await db.select().from(users).where(eq(users.role, role));
      return result;
    } catch (error) {
      console.error("Error getting users by role:", error);
      throw new Error("Failed to get users by role");
    }
  }

  async getAssignedEmployees(evaluatorId: number): Promise<User[]> {
    try {
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
          fullName: users.fullName,
          password: users.password,
        })
        .from(users)
        .innerJoin(
          evaluatorAssignments,
          and(
            eq(evaluatorAssignments.employeeId, users.id),
            eq(evaluatorAssignments.evaluatorId, evaluatorId)
          )
        )
        .where(eq(users.role, "employee"));

      return result;
    } catch (error) {
      console.error("Error getting assigned employees:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async createAssignment(assignment: InsertAssignment): Promise<EvaluatorAssignment> {
    try {
      const result = await db.insert(evaluatorAssignments).values(assignment).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating assignment:", error);
      throw new Error("Failed to create assignment");
    }
  }

  async deleteAssignment(evaluatorId: number, employeeId: number): Promise<void> {
    try {
      await db
        .delete(evaluatorAssignments)
        .where(
          and(
            eq(evaluatorAssignments.evaluatorId, evaluatorId),
            eq(evaluatorAssignments.employeeId, employeeId)
          )
        );
    } catch (error) {
      console.error("Error deleting assignment:", error);
      throw new Error("Failed to delete assignment");
    }
  }

  async getAssignments(evaluatorId?: number): Promise<EvaluatorAssignment[]> {
    try {
      let query = db.select().from(evaluatorAssignments);
      if (evaluatorId) {
        query = query.where(eq(evaluatorAssignments.evaluatorId, evaluatorId));
      }
      const result = await query;
      return result;
    } catch (error) {
      console.error("Error getting assignments:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    try {
      // Verify evaluator is assigned to employee if it's an evaluator evaluation
      if (evaluation.type === "evaluator" && evaluation.evaluatorId && evaluation.employeeId) {
        const assignments = await this.getAssignments(evaluation.evaluatorId);
        const isAssigned = assignments.some(a => a.employeeId === evaluation.employeeId);
        if (!isAssigned) {
          throw new Error("Evaluator is not assigned to this employee");
        }
      }

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