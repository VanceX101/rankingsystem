import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function initializeTestAccounts() {
  try {
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