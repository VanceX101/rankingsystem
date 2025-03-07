import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["employee", "evaluator", "admin"] }).notNull().default("employee"),
  fullName: text("full_name").notNull(),
});

export const evaluatorAssignments = sqliteTable("evaluator_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  evaluatorId: integer("evaluator_id").references(() => users.id).notNull(),
  employeeId: integer("employee_id").references(() => users.id).notNull(),
});

export const evaluations = sqliteTable("evaluations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").references(() => users.id).notNull(),
  evaluatorId: integer("evaluator_id").references(() => users.id),
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  type: text("type", { enum: ["self", "evaluator"] }).notNull(),
  productivity: integer("productivity").notNull(),
  quality: integer("quality").notNull(),
  teamwork: integer("teamwork").notNull(),
  communication: integer("communication").notNull(),
  comments: text("comments"),
  status: text("status", { enum: ["draft", "submitted", "reviewed"] }).notNull().default("submitted"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true });
export const insertAssignmentSchema = createInsertSchema(evaluatorAssignments).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type User = typeof users.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;
export type EvaluatorAssignment = typeof evaluatorAssignments.$inferSelect;