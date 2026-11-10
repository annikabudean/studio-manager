import { serve } from "@hono/node-server";
import { Hono } from "hono";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});