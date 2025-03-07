import { text, serial, integer, pgEnum, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["employee", "evaluator", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default("employee"),
  fullName: text("full_name").notNull(),
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => users.id),
  evaluatorId: integer("evaluator_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
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
