import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes";
import { startPolling } from "./bubble-sync";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicDir = path.resolve(__dirname, "../public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Iniciar polling do Bubble automaticamente
  if (process.env.BUBBLE_SYNC_ENABLED === "true") {
    startPolling();
  }
});
