import { Hono } from "hono";
import { cors } from "hono/cors";
import { D1Database } from "@cloudflare/workers-types";

// Types
interface ShoppingNote {
  id: string;
  text: string;
  created_at: string;
}

interface MapNote {
  id: string;
  text: string;
  created_at: string;
}

interface CalendarNote {
  id: string;
  text: string;
  date: string;
  person: 1 | 2;
  created_at: string;
}

// D1データベースを使用するための型定義
interface Env {
  DB: D1Database;
}

// Initialize Hono app
const app = new Hono<{ Bindings: Env }>();

// CORSミドルウェア
app.use("*", cors({
  origin: (origin) => origin, // 全てのOriginを許可
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400, // 24時間
  credentials: true,
}));

// Routes
app.get("/", (c) => {
  return c.json({ message: "Our Notes API is running!" });
});

// Shopping Notes API
// Get all shopping notes
app.get("/api/shopping-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM shopping_notes ORDER BY created_at DESC").all<ShoppingNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching shopping notes:", error);
    return c.json({ error: "Failed to fetch shopping notes" }, 500);
  }
});

// Create a shopping note
app.post("/api/shopping-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO shopping_notes (id, text, created_at) VALUES (?, ?, ?)").bind(id, body.text, created_at).run();

    return c.json({ id, text: body.text, created_at }, 201);
  } catch (error) {
    console.error("Error creating shopping note:", error);
    return c.json({ error: "Failed to create shopping note" }, 500);
  }
});

// Delete a shopping note
app.delete("/api/shopping-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM shopping_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting shopping note:", error);
    return c.json({ error: "Failed to delete shopping note" }, 500);
  }
});

// Update a shopping note
app.put("/api/shopping-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE shopping_notes SET text = ? WHERE id = ?").bind(body.text, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, success: true });
  } catch (error) {
    console.error("Error updating shopping note:", error);
    return c.json({ error: "Failed to update shopping note" }, 500);
  }
});

// Map Notes API
// Get all map notes
app.get("/api/map-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM map_notes ORDER BY created_at DESC").all<MapNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching map notes:", error);
    return c.json({ error: "Failed to fetch map notes" }, 500);
  }
});

// Create a map note
app.post("/api/map-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO map_notes (id, text, created_at) VALUES (?, ?, ?)").bind(id, body.text, created_at).run();

    return c.json({ id, text: body.text, created_at }, 201);
  } catch (error) {
    console.error("Error creating map note:", error);
    return c.json({ error: "Failed to create map note" }, 500);
  }
});

// Delete a map note
app.delete("/api/map-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM map_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting map note:", error);
    return c.json({ error: "Failed to delete map note" }, 500);
  }
});

// Update a map note
app.put("/api/map-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text) {
      return c.json({ error: "Text is required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE map_notes SET text = ? WHERE id = ?").bind(body.text, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, success: true });
  } catch (error) {
    console.error("Error updating map note:", error);
    return c.json({ error: "Failed to update map note" }, 500);
  }
});

// Calendar Notes API
// Get all calendar notes
app.get("/api/calendar-notes", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM calendar_notes ORDER BY date DESC").all<CalendarNote>();
    return c.json(results);
  } catch (error) {
    console.error("Error fetching calendar notes:", error);
    return c.json({ error: "Failed to fetch calendar notes" }, 500);
  }
});

// Create a calendar note
app.post("/api/calendar-notes", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.text || !body.date || !body.person) {
      return c.json({ error: "Text, date, and person are required" }, 400);
    }

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    await c.env.DB.prepare("INSERT INTO calendar_notes (id, text, date, person, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, body.text, body.date, body.person, created_at).run();

    return c.json({ id, text: body.text, date: body.date, person: body.person, created_at }, 201);
  } catch (error) {
    console.error("Error creating calendar note:", error);
    return c.json({ error: "Failed to create calendar note" }, 500);
  }
});

// Delete a calendar note
app.delete("/api/calendar-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const { meta } = await c.env.DB.prepare("DELETE FROM calendar_notes WHERE id = ?").bind(id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar note:", error);
    return c.json({ error: "Failed to delete calendar note" }, 500);
  }
});

// Update a calendar note
app.put("/api/calendar-notes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    if (!body.text || !body.date || !body.person) {
      return c.json({ error: "Text, date, and person are required" }, 400);
    }

    const { meta } = await c.env.DB.prepare("UPDATE calendar_notes SET text = ?, date = ?, person = ? WHERE id = ?").bind(body.text, body.date, body.person, id).run();

    if (meta.changes === 0) {
      return c.json({ error: "Note not found" }, 404);
    }

    return c.json({ id, text: body.text, date: body.date, person: body.person, success: true });
  } catch (error) {
    console.error("Error updating calendar note:", error);
    return c.json({ error: "Failed to update calendar note" }, 500);
  }
});

export default app;
