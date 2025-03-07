import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, evaluatorAssignments } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const client = createClient({
  url: "libsql://rnd-system-vancenguyen.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDEzNTc2NDgsImlkIjoiZmNiNzI1ZDAtZGM1Yi00OTgyLTkxYTctODI5NjgxZTM1ZThjIn0.aKyporH7DsMpOVdbVYg_dNnSspxjM7cmtuCJ4N337YzzkBhDui_BIsnJ6PM1dBXEP-idMFgGOmpj9llIGj6nCg"
});

export const db = drizzle(client);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function initializeTestAccounts() {
  try {
    // Create users table
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee',
        full_name TEXT NOT NULL
      )
    `);

    // Create evaluator_assignments table
    await db.run(`
      CREATE TABLE IF NOT EXISTS evaluator_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        evaluator_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        FOREIGN KEY (evaluator_id) REFERENCES users(id),
        FOREIGN KEY (employee_id) REFERENCES users(id)
      )
    `);

    const testAccounts = [
      {
        username: "admin",
        password: await hashPassword("admin123"),
        email: "admin@example.com",
        role: "admin",
        fullName: "Admin User"
      },
      {
        username: "evaluator",
        password: await hashPassword("eval123"),
        email: "evaluator@example.com",
        role: "evaluator",
        fullName: "Evaluator User"
      },
      {
        username: "employee", 
        password: await hashPassword("emp123"),
        email: "employee@example.com",
        role: "employee",
        fullName: "Employee User"
      }
    ];

    for (const account of testAccounts) {
      const existing = await db.select().from(users).where(eq(users.username, account.username));
      if (existing.length === 0) {
        await db.insert(users).values(account);
        console.log(`Created test account: ${account.username}`);
      }
    }

    console.log("Test accounts created successfully");
  } catch (error) {
    console.error("Error creating test accounts:", error);
  }
}