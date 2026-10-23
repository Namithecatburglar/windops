# WINDOPS — Offshore Wind Farm Operations Platform

> **Centralized SCADA telemetry, maintenance scheduling, marine weather modeling, and vessel fleet tracking for offshore wind assets.**

WINDOPS is a full-stack MERN application purpose-built for offshore wind operations and maintenance (O&M) teams. Designed with a **strict black-and-white industrial control-room aesthetic**, it delivers high-density technical readouts, live SCADA oscillations, and metocean suitability intelligence across a 48-turbine (360 MW) North Sea wind farm.

---

## 1. Demo Operator Credentials

Pre-configured role profiles with role-based access control (RBAC):

| Persona | Email | Passcode | Role Clearance & Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@windops.io` | `windops123` | Universal access to all telemetry, users, vessels, & config |
| **Operations Manager** | `ops@windops.io` | `windops123` | Fleet monitoring, marine vessel dispatch, work orders, reports |
| **Maintenance Engineer**| `tech@windops.io` | `windops123` | Turbine diagnostics, corrective work orders, sensor inspections |
| **QA / NDT Inspector** | `inspector@windops.io` | `windops123` | Blade UAV scans, borescope tests, subsea ROV reports |

> **Quick Switcher:** An active persona switcher is built directly into the top bar header for instant role toggling during evaluations.

---

## 2. Core Capabilities & 9 Operational Answers

When an operator enters the control room, WINDOPS answers the 9 core questions:

1. **How many turbines are operational?** — Real-time KPI indicates `42 / 48` (87.5% availability).
2. **Is the farm producing normally?** — Farm output delivers `318 MW` against a 360 MW rated capacity ($P \propto v^3$ power curve).
3. **Are there critical turbine problems?** — Direct alerts highlight `WT-024` intermediate shaft gearbox vibration (3.82 mm/s) and `WT-017` lubrication status.
4. **What maintenance is currently happening?** — Work orders board tracks `WO-1042` currently in progress on site with field technicians.
5. **What inspections are due?** — 12 inspections scheduled across drone blade imaging, ultrasonic scans, and subsea ROV surveys.
6. **Is marine weather safe for vessel operations?** — Dynamic Operational Weather Window calculates safe access for CTV (Hs < 1.8m) and Walk-to-Work SOV (Hs < 2.5m).
7. **Are any vessels delayed?** — AIS fleet tracker monitors 7 vessels; flags `VIKING ENDEAVOUR` as weather-delayed due to wave swell.
8. **What operational alerts require attention?** — Active triage stream with instant acknowledge and resolve actions.
9. **Which turbines are underperforming?** — Sortable comparison matrix filters turbines by capacity factor, health score, and run hours.

---

## 3. Technology Stack & Architecture

```text
windops/
├── client/                      # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/          # KpiCard, StatusBadge, DataTable, ChartCard, Modal, OffshoreMap
│   │   ├── context/             # AuthContext (JWT/RBAC), OperationsContext (SCADA Polling)
│   │   ├── layouts/             # Sidebar, Topbar, DashboardLayout
│   │   ├── pages/               # Overview, Turbines, TurbineDetail, Maintenance, Inspections, etc.
│   │   ├── services/            # api.js (REST client)
│   │   └── utils/               # formatters.js, constants.js
│
└── server/                      # Node.js + Express.js Backend
    ├── config/                  # db.js (MongoDB Connection)
    ├── controllers/             # auth, turbine, maintenance, inspection, weather, vessel, report
    ├── middleware/              # auth.js (JWT verify + RBAC), errorHandler.js
    ├── models/                  # Mongoose models: Turbine, Vessel, Maintenance, Alert, etc.
    ├── routes/                  # Modular express routers
    ├── services/                # simulationService.js (SCADA oscillations)
    ├── seed/                    # seed.js (Automated 48-turbine dataset generator)
    └── server.js                # Express app entry point
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
```bash
# In windops root:
npm run install:all
```

### Step 2: Seed the Database
```bash
npm run seed
```
*Populates 48 wind turbines, demo accounts, 48-hour weather timeline, marine fleet, work orders, and historical reports.*

### Step 3: Run the Application
In terminal 1 (Server):
```bash
npm run server:dev
```
*API runs on `http://localhost:5000` with background simulation ticker active every 12s.*

In terminal 2 (Client):
```bash
npm run client
```
*Vite frontend opens on `http://localhost:5173`.*

---

## 5. REST API Documentation

| Endpoint | Method | Role Clearance | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | Authenticates credentials, returns signed JWT |
| `/api/auth/demo-users` | GET | Public | Returns demo personas list |
| `/api/turbines` | GET | All | Searchable list of 48 turbines |
| `/api/turbines/:id` | GET | All | Single turbine 24h telemetry & sensors |
| `/api/turbines/summary/kpi`| GET | All | Aggregated fleet power, availability, health |
| `/api/maintenance` | GET/POST | All / Ops+Tech | Work order management |
| `/api/maintenance/:id/notes`| POST | Ops+Tech | Append field note to work order |
| `/api/inspections` | GET/POST | All / Inspector | Schedule and log QA inspections |
| `/api/weather/current` | GET | All | Metocean wave height, wind, and window |
| `/api/vessels` | GET/PUT | All / Ops | Marine fleet AIS tracking & dispatch |
| `/api/performance` | GET | All | Farm generation curves & downtime |
| `/api/alerts` | GET/PUT | All | Alarm triage, acknowledge, and resolve |
| `/api/reports/generate` | POST | Ops+Admin | Generate report from MongoDB |
| `/api/reports/:id/download`| GET | All | Direct CSV download |
| `/api/simulation/tick` | POST | All | Manual trigger for SCADA telemetry oscillation |
