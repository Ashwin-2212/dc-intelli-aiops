# DC-Intelli — AI-Powered Data Center Intelligence & Monitoring Platform

An enterprise-grade Observability, Capacity Planning, and Predictive AIOps platform built with React 19, TypeScript, Express, and MongoDB.

---

## 🏛️ Architecture Overview

```text
React 19 Frontend (SPA + Recharts + Lucide + Tailwind)
                  ↓  (Bearer JWT + RBAC)
       Express 4.21 REST API Gateway
                  ↓  (Validation & Normalization)
            Service Layer
                  ↓  (Mongoose 9 ODM)
       MongoDB Database (Local or MongoDB Atlas)
```

### Key Technical Capabilities:
- **Centralized MongoDB Persistence**: Stores users, facilities, 42U racks, hardware devices, time-series telemetry, alerts, correlated incidents, predictive models, work orders, graph topology, what-if simulations, and compliance audit logs.
- **Universal Telemetry Ingestion Pipeline**: Ingests, validates, and normalizes live and simulated telemetry from Redfish BMCs, SNMP UPS/PDU agents, Modbus/BACnet cooling plants, and IoT sensors into MongoDB.
- **Role-Based Access Control (RBAC)**: Secure JWT-based authentication enforcing strict role authorizations (`ADMIN`, `DATA_CENTER_MANAGER`, `ENGINEER`, `OPERATOR`, `VIEWER`). Passwords hashed with `bcryptjs`.
- **AI Copilot & Neural RCA**: Integrated Google Gemini 3.7 Flash reasoning grounded in live persisted infrastructure metrics.
- **Graceful Degradation**: Auto-reconnection and non-blocking failure tolerance ensures platform remains responsive even during database network disruptions.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ or v22+
- **MongoDB**: Local MongoDB instance running on `127.0.0.1:27017` OR a MongoDB Atlas cluster URI.

### 2. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/data_center_aiops
JWT_SECRET=replace_with_a_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=24h
GEMINI_API_KEY=MY_GEMINI_API_KEY
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

> **Security Note:** `.env` is excluded from git tracking in `.gitignore`. Never commit database credentials or API secrets.

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Initial Infrastructure Data (Idempotent)
Populate default facilities, racks, demo accounts, sample telemetry, and alerts:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

| Script | Purpose | Command |
| :--- | :--- | :--- |
| **Lint & Type Check** | Validates TypeScript with zero compiler errors | `npm run lint` |
| **Database Tests** | Verifies Mongoose connection, ping, schemas, and queries | `npm run test:db` |
| **API Integration** | Verifies all 10 REST endpoints, auth, and persistence | `npm run test:api` |
| **Database Seeding** | Safely provisions demo data with duplicate prevention | `npm run seed` |

---

## 🔑 Default Demo Accounts

All demo accounts are provisioned with secure `bcryptjs` password hashing:

| Email | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin@dcintelli.local` | `Admin@123` | `ADMIN` | Global administrator with full cluster access |
| `manager@dcintelli.local` | `Manager@123` | `DATA_CENTER_MANAGER` | Facilities, SLA, and capacity management |
| `engineer@dcintelli.local` | `Engineer@123` | `ENGINEER` | Site reliability, hardware diagnostics, and work orders |
| `operator@dcintelli.local` | `Operator@123` | `OPERATOR` | 24/7 NOC monitoring and alert triage |
| `analyst@dcintelli.local` | `Analyst@123` | `VIEWER` | Predictive analytics and thermal modeling |

---

## 📡 REST API Reference

### Health & Diagnostics
- `GET /api/health` — MongoDB connection health, readyState, and AI service diagnostics.

### Authentication & Users
- `POST /api/auth/login` — Authenticate and receive signed Bearer JWT token.
- `POST /api/auth/logout` — Invalidate session and record audit log.
- `GET /api/auth/me` — Return authenticated user profile.
- `GET /api/auth/users` — Paginated user directory (Admin/Manager only).

### Devices & Racks
- `GET /api/devices` — Paginated device inventory with filtering by `deviceType`, `status`, `rackId`.
- `GET /api/devices/:id` — Query specific server or equipment specs and latest telemetry.
- `POST /api/devices` — Register new server chassis or infrastructure component.
- `PATCH /api/devices/:id` — Update device specs or maintenance state.
- `DELETE /api/devices/:id` — Remove device (Admin only).
- `GET /api/devices/racks/all` — Retrieve 42U rack units with thermal and power load.

### Telemetry & Time-Series
- `POST /api/telemetry` — Ingest, normalize, and store time-series metric packet.
- `POST /api/telemetry/batch` — High-throughput bulk write ingestion endpoint.
- `GET /api/telemetry/history/:deviceId` — Bounded historical time-series query for charts.
- `GET /api/telemetry/live/:assetId` — Real-time sensor metrics for specific equipment.
- `GET /api/telemetry/anomalies` — Active multi-tier anomaly detection records.
- `GET /api/telemetry/platform-health` — Self-observability metrics and event counters.

### Alerts & Incidents
- `GET /api/alerts` — Query system alerts with severity and status filters.
- `PATCH /api/alerts/:id/acknowledge` — Acknowledge an active alert.
- `GET /api/incidents` — Correlated incidents with root cause analysis and evidence matrices.
- `PATCH /api/incidents/:id/status` — Transition incident state (`OPEN` → `INVESTIGATING` → `RESOLVED` → `CLOSED`).

### Predictions & Work Orders
- `GET /api/predictions` — Equipment failure probability forecasts and degradation factors.
- `GET /api/work-orders` — Maintenance work orders and technician assignments.
- `POST /api/work-orders` — Dispatch and persist automated maintenance work order.

### Topology & Simulations
- `GET /api/sites` — Data center facilities and PUE benchmarks.
- `GET /api/dependencies` — Full dependency graph (Grid → UPS → PDU → Rack → Server).
- `POST /api/simulations` — Persist What-If capacity and cooling scenarios to MongoDB.
- `GET /api/audit-logs` — Security and administrative compliance activity logs.

---

## 🛠️ Troubleshooting

### 1. MongoDB Connection Warning on Startup
If MongoDB is not running locally, the server logs:
```text
[Database Warning] Could not connect to MongoDB (mongodb://127.0.0.1:27017/data_center_aiops): connect ECONNREFUSED
```
- **Resolution**: Ensure the MongoDB service is started (`net start MongoDB` on Windows or `sudo systemctl start mongod` on Linux) or provide a cloud-hosted MongoDB Atlas URI in `.env`.
- **Note**: The application features graceful degradation and will continue serving frontend requests even if the database is offline.

### 2. MongoDB Atlas Connection
For cloud-hosted MongoDB Atlas, use the SRV connection string:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/data_center_aiops?retryWrites=true&w=majority"
```
Credentials in the URI are automatically masked in server logs by `sanitizeMongoUri()`.
