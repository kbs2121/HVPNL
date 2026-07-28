import { Router } from "express";
import { network } from "../data/networkData.js";
import { getDashboardStats, searchNetwork } from "../data/utils.js";

export const apiRouter = Router();

apiRouter.get("/zones", (_req, res) => res.json(network.zones));
apiRouter.get("/circles", (_req, res) => res.json(network.circles));
apiRouter.get("/divisions", (_req, res) => res.json(network.divisions));
apiRouter.get("/substations", (_req, res) => res.json(network.substations));
apiRouter.get("/towers", (_req, res) => res.json(network.towers));
apiRouter.get("/lines", (_req, res) => res.json(network.lines));

apiRouter.get("/powerflow", (_req, res) => {
  const flows = network.lines.map((line) => ({
    lineId: line.id,
    name: line.name,
    voltage: line.voltage_level,
    path: line.path,
    flowMW: line.flow_MW,
    direction: line.flow_direction,
    loadPct: line.load_pct,
  }));
  res.json(flows);
});

apiRouter.get("/dashboard", (_req, res) => res.json(getDashboardStats()));

apiRouter.get("/search", (req, res) => {
  const q = String(req.query.q ?? "");
  res.json(searchNetwork(q));
});

apiRouter.get("/substations/:id", (req, res) => {
  const sub = network.substations.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: "Substation not found" });
  res.json(sub);
});

apiRouter.get("/towers/:id", (req, res) => {
  const tower = network.towers.find((t) => t.id === req.params.id);
  if (!tower) return res.status(404).json({ error: "Tower not found" });
  res.json(tower);
});
