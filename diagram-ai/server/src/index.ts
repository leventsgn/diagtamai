import express from "express";
import cors from "cors";
import diagramRoutes from "./routes/diagram.ts";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/diagram", diagramRoutes);

app.listen(3001, () => console.log("Server: http://localhost:3001"));
