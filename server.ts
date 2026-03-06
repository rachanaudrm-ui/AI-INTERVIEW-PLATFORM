import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    role TEXT,
    language TEXT,
    difficulty TEXT,
    score INTEGER,
    feedback TEXT,
    results_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_score INTEGER DEFAULT 0,
    interviews_count INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (user && user.password === password) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    try {
      const info = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
      // Initialize leaderboard entry
      db.prepare("INSERT INTO leaderboard (user_id) VALUES (?)").run(info.lastInsertRowid);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ success: false, message: "Username already exists" });
    }
  });

  // Interviews API
  app.post("/api/interviews", (req, res) => {
    const { user_id, type, role, language, difficulty, score, feedback, results_json } = req.body;
    const info = db.prepare(`
      INSERT INTO interviews (user_id, type, role, language, difficulty, score, feedback, results_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user_id, type, role, language, difficulty, score, feedback, results_json);

    // Update leaderboard
    const stats = db.prepare("SELECT COUNT(*) as count, AVG(score) as avg FROM interviews WHERE user_id = ?").get(user_id) as any;
    db.prepare(`
      UPDATE leaderboard 
      SET interviews_count = ?, average_score = ?, last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(stats.count, stats.avg, user_id);

    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.get("/api/interviews/user/:userId", (req, res) => {
    const results = db.prepare("SELECT * FROM interviews WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(results);
  });

  // Leaderboard API
  app.get("/api/leaderboard", (req, res) => {
    const results = db.prepare(`
      SELECT l.*, u.username 
      FROM leaderboard l 
      JOIN users u ON l.user_id = u.id 
      ORDER BY l.average_score DESC 
      LIMIT 10
    `).all();
    res.json(results);
  });

  // Admin API
  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role, created_at FROM users").all();
    res.json(users);
  });

  app.get("/api/admin/results", (req, res) => {
    const results = db.prepare(`
      SELECT i.*, u.username 
      FROM interviews i 
      JOIN users u ON i.user_id = u.id 
      ORDER BY i.created_at DESC
    `).all();
    res.json(results);
  });

  app.delete("/api/admin/results/:id", (req, res) => {
    db.prepare("DELETE FROM interviews WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
