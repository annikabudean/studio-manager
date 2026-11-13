import { serve } from "@hono/node-server";
import { Hono } from "hono";
import auth from './routes/auth.js';

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route('/auth', auth);


serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`API running on http://localhost:${info.port}`);
});

export default app;