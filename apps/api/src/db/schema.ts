import { pgTable, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["teacher", "student", "parent"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  role: roleEnum("role").notNull(),
  timezone: text("timezone").notNull().default("UTC"), // change to your IANA zone later
  createdAt: timestamp("created_at").notNull().defaultNow(),
});