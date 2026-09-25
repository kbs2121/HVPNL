# HSETCL Transmission Network Digital Twin

Enterprise-grade GIS platform for **Haryana State Electricity Transmission Corporation** — combining satellite mapping, animated power flow visualization, SCADA-ready architecture, and premium dark-glass UI.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Mapbox](https://img.shields.io/badge/Mapbox-GL-green) ![deck.gl](https://img.shields.io/badge/deck.gl-9-orange) ![PostGIS](https://img.shields.io/badge/PostGIS-3.4-blue)

## Features

- **Interactive GIS Map** — Satellite imagery with zones, circles, divisions, substations, towers, and transmission lines
- **Animated Power Flow** — Glowing particles traveling along transmission corridors at voltage-dependent speeds
- **Premium Dark UI** — Glassmorphism panels, glow effects, Framer Motion animations
- **Layer Control** — Toggle jurisdiction and electrical layers independently
- **Search** — Find substations, towers, zones, circles, divisions with auto fly-to
- **Hover Popups** — Rich asset detail cards for substations and towers
- **Live Dashboard** — Network KPIs, demand, generation, losses, utilization
- **Outage Simulation** — Trip a line and visualize rerouting
- **REST API + WebSocket** — Real-time telemetry feed (SCADA-ready)
- **PostGIS Schema** — Production database schema with spatial indexes

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Mapbox access token ([mapbox.com](https://account.mapbox.com/access-tokens/))

### 1. Clone & Install

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Export Network Data (for backend)

```bash
npx tsx scripts/export-network-data.ts
```

### 4. Run Development

**Terminal 1 — Frontend:**
```bash
npm run dev
```

**Terminal 2 — Backend API:**
```bash
cd backend && npm run dev
```

Open [http://localhost:3000/digital-twin](http://localhost:3000/digital-twin)

### Troubleshooting: Unstyled / Broken Layout

If the page shows plain HTML with no styling (blue links, bullet lists), the server is serving a **stale build** where CSS files are missing. Fix:

```bash
# Stop any running server, then rebuild and restart:
npm run build
npm start

# Or use the launch script (builds + starts in one step):
npm run launch
```

Always restart the server after running `npm run build`. Do not rebuild while `npm start` is already running.

## Docker

```bash
docker compose up --build
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000      |
| API        | http://localhost:4000      |
| PostgreSQL | localhost:5432             |

## Project Structure

```
├── src/
│   ├── app/digital-twin/          # Main digital twin page
│   ├── components/digital-twin/     # Map, UI panels, popups
│   ├── hooks/useDigitalTwinStore.ts # Zustand state
│   ├── lib/data/haryana/          # GIS data generator
│   ├── lib/digitalTwin/           # Map utilities, colors
│   └── lib/types/digitalTwin.ts   # TypeScript types
├── backend/
│   ├── src/server.ts              # Express + WebSocket
│   └── src/routes/                # REST API endpoints
├── database/
│   └── schema.sql                 # PostGIS schema
├── scripts/
│   └── export-network-data.ts     # Data export utility
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/api/zones`          | All zones with boundaries  |
| GET    | `/api/circles`        | Circle jurisdictions       |
| GET    | `/api/divisions`      | Division boundaries        |
| GET    | `/api/substations`    | 10 Haryana substations     |
| GET    | `/api/towers`         | ~112 transmission towers   |
| GET    | `/api/lines`          | 12 transmission corridors  |
| GET    | `/api/powerflow`      | Power flow animation data  |
| GET    | `/api/dashboard`      | Network KPI summary        |
| GET    | `/api/search?q=`      | Full-text asset search     |
| WS     | `/ws`                 | Live telemetry stream      |

## Sample Data

### Substations (10)
Panipat, Karnal, Yamunanagar, Ambala, Rohtak, Hisar, Bhiwani, Bahadurgarh, Gurugram, Faridabad

### Voltage Color Coding
| Voltage | Color  |
|---------|--------|
| 400kV   | Red    |
| 220kV   | Orange |
| 132kV   | Blue   |
| 66kV    | Green  |

## Future Integration Ready

Architecture supports: SCADA, IoT sensors, RTU, PMU, IEC 61850, IEC 60870-5-104, DNP3, Modbus, OMS, asset management, weather overlays, AI predictions, drone inspection.

## License

Proprietary — HSETCL Internal Use
