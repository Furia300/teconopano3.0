import type { Express } from "express";

export function registerRoutes(app: Express) {
  // Auth routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // TODO: Implement real auth with Passport.js + DB
    if (email && password) {
      res.json({
        user: {
          id: "1",
          username: email,
          nome: "Admin",
          perfil: "administrador",
        },
      });
    } else {
      res.status(401).json({ message: "Credenciais inválidas" });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.json({ ok: true });
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // TODO: Add CRUD routes for all entities
}
