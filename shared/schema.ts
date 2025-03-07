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

export const evaluations = sqliteTable("evaluations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").references(() => users.id),
  evaluatorId: integer("evaluator_id").references(() => users.id),
  date: integer("date", { mode: "timestamp_ms" }).notNull(),
  productivity: integer("productivity").notNull(),
  quality: integer("quality").notNull(),
  teamwork: integer("teamwork").notNull(),
  communication: integer("communication").notNull(),
  comments: text("comments"),
  type: text("type").notNull(), // 'self' or 'evaluator'
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type User = typeof users.$inferSelect;
export type Evaluation = typeof evaluations.$inferSelect;