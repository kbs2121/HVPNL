import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { apiRouter } from "./routes/index.js";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "hsetcl-digital-twin-api", timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "connected", message: "HSETCL Digital Twin live feed" }));

  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: "telemetry",
          payload: {
            livePowerMW: 3370 + Math.round(Math.random() * 80 - 40),
            timestamp: new Date().toISOString(),
            alerts: Math.floor(Math.random() * 3),
          },
        })
      );
    }
  }, 3000);

  ws.on("close", () => clearInterval(interval));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HSETCL Digital Twin API listening on port ${PORT} (0.0.0.0)`);
});
