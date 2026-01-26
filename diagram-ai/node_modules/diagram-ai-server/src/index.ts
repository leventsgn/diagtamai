import express from "express";
import cors from "cors";
import diagramRoutes from "./routes/diagram.js";

console.log("Loading server...");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

console.log("Loading diagram routes...");
app.use("/api/diagram", diagramRoutes);
console.log("Diagram routes loaded successfully");

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
  console.error("❌ Server error:", err);
});

server.on('listening', () => {
  console.log(`✅ Port ${PORT} is LISTENING`);
});
