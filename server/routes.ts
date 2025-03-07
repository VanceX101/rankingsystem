import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { sendDailyEvaluationEmail } from "./mailer";
import { insertEvaluationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Get evaluations for a user
  app.get("/api/evaluations/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const evaluations = await storage.getUserEvaluations(parseInt(req.params.userId));
    res.json(evaluations);
  });

  // Submit evaluation
  app.post("/api/evaluations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const evaluation = insertEvaluationSchema.parse(req.body);
      const saved = await storage.createEvaluation(evaluation);
      res.status(201).json(saved);
    } catch (error) {
      res.status(400).json({ error: "Invalid evaluation data" });
    }
  });

  // Get all users (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Get users by role
  app.get("/api/users/:role", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const users = await storage.getUsersByRole(req.params.role);
    res.json(users);
  });

  // Send evaluation reminders (admin only)
  app.post("/api/send-reminders", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const users = await storage.getUsersByRole("employee");

      for (const user of users) {
        await sendDailyEvaluationEmail(user.email);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({ error: "Failed to send reminders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}