# VI Customs Brokers & Logistics — Project State, Handover & Roadmap

> **Authoritative Context & Session Handover Document**  
> **Target Audience:** Antigravity AI Assistant, Engineering Team, Product Owner  
> **Last Updated:** October 2026  
> **System State:** Backend Active • PostgreSQL Healthy • Database Clean Slate • Frontend UI Intact  

---

## 📌 Executive Summary & System Overview

This repository represents the enterprise logistics and customs brokerage management platform for **VI Customs Brokers & Logistics** (handling ocean freight, Miami CFS warehouse intake, container consolidations, and Caribbean port clearance).

### Core Business Lifecycle:
$$\text{Customer} \longrightarrow \text{Warehouse Receipt (WR)} \longrightarrow \text{Staged Cargo} \longrightarrow \text{House B/L (HBL)} \longrightarrow \text{Consolidation} \longrightarrow \text{Master Ocean B/L} \longrightarrow \text{Manifest} \longrightarrow \text{Tracking} \longrightarrow \text{Port Agent Delivery}$$

---

## 🟢 Exact Status as of Today (What Has Been Completed)

1. **Fastify 5.x + TypeScript Backend Built:**
   - Location: `e:\KiyaanProject\WereHousePRoject\backend`
   - Port: `5000` (`http://127.0.0.1:5000`)
   - Health Check: `/health` & `/health/db` verified returning `200 OK`.
   - Logging: Human-readable formatted logs via `pino-pretty`.

2. **PostgreSQL 18 Database Setup (`wereHouseDb`):**
   - Connected via `pg.Pool` & Drizzle ORM at `localhost:5432`.
   - All **20 tables migrated** with foreign keys, indexes, and cascades.
   - Migration file: `backend/drizzle/migrations/0000_lethal_mach_iv.sql`.

3. **Complete Dummy Data Removal (Database Clean Slate):**
   - **16 tables zeroed / clean:** `customers`, `warehouse_receipts`, `cargo`, `house_bills`, `consolidations`, `shipments`, `bills_of_lading`, `manifests`, `containers`, `vessels`, `voyages`, `agents`, `documents`, `tracking_events`, `audit_logs`, `permissions` = **0 rows**.
   - **4 core system tables preserved:**
     - `users` (4 workflow login personas)
     - `roles` (4 system roles)
     - `ports` (11 master Caribbean port terminals)
     - `settings` (numbering rules & company profile)

4. **Frontend Mock & Fallback Data Removed:**
   - Location: `e:\KiyaanProject\WereHousePRoject\frontend (2)`
   - All mock files in `src/data/mock/` zeroed (`initialCustomers = []`, etc.).
   - Hardcoded demo tracking in `ShipmentTrackingPortal.jsx` removed and made dynamic.
   - Static volume metrics in `AgentDashboard.jsx` made dynamic.
   - Storage service auto-purge (`kers_clean_slate_v4`) implemented to ensure browser refresh flushes client cache.
   - Frontend build tested: `npm run build` succeeds in `1.13s` with 0 errors.

5. **Central Frontend Data Hub Identified (`AppDataContext.jsx`):**
   - Location: `frontend (2)/src/context/AppDataContext.jsx` (587 lines, 21KB)
   - This is the **single source of truth** for ALL frontend state. It wraps 12 service files:
     - `customerService`, `warehouseService`, `cargoService`, `houseBillService`, `consolidationService`, `shipmentService`, `billOfLadingService`, `manifestService`, `portService`, `containerService`, `vesselService`, `agentService`
   - All 19 UI pages consume data via `useAppData()` hook from this context.
   - **Any backend connectivity MUST update this file** — replacing `localStorage` service calls with `apiClient` fetch calls.
   - Additionally, `AuthContext.jsx` handles login state (currently also uses mock users; must be connected to `POST /auth/login` first).

5. **Complete Documentation Created in `backend/`:**
   - [API_MAP.md](file:///e:/KiyaanProject/WereHousePRoject/backend/API_MAP.md) — 19 module endpoints catalog with payloads.
   - [DATABASE_SCHEMA.md](file:///e:/KiyaanProject/WereHousePRoject/backend/DATABASE_SCHEMA.md) — 20 PostgreSQL tables schema specification.
   - [A_TO_Z_DATA_FLOW_MANUAL.md](file:///e:/KiyaanProject/WereHousePRoject/backend/A_TO_Z_DATA_FLOW_MANUAL.md) — End-to-end multi-persona operational manual.
   - [IMPLEMENTATION_MAP.md](file:///e:/KiyaanProject/WereHousePRoject/backend/IMPLEMENTATION_MAP.md) — Server architecture and plugin structure.
   - [FULL_SYSTEM_VALIDATION.md](file:///e:/KiyaanProject/WereHousePRoject/backend/FULL_SYSTEM_VALIDATION.md) — Persona QA matrix and test cases.

---

## 🔑 Active User Personas & Credentials

| Persona Name | System Role | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- | :--- |
| **Carlos Mendez** | `operations` | `carlos.m@vicustoms.com` | `Password123!` | Miami CFS Intake, WRs, Cargo, 4x6 Labels |
| **Sarah Jenkins** | `documentation` | `sarah.j@vicustoms.com` | `Password123!` | Maritime Docs, HBL Issuance, Manifests |
| **Marcus Vance** | `super_admin` | `marcus.vance@vicustoms.com` | `Password123!` | Full HQ Console, Consolidations, MBL Hold/Release |
| **David Cartwright** | `agent` | `operations@caribbeanexpressbahamas.com` | `Password123!` | Secure Nassau Port Agent Hub, Cargo Release |

---

## 🔌 Current Integration State (Important for Tomorrow)

> [!IMPORTANT]
> - **The Frontend is currently reading/writing to browser `localStorage` (`storageService.js`).**
> - **The Backend API (`http://127.0.0.1:5000`) and PostgreSQL database are running and ready to receive requests.**
> - The next phase of development will connect frontend API service calls to the Fastify backend endpoints step-by-step.

---

## 🗺️ Tomorrow's Step-by-Step Roadmap (Frontend ➔ Backend Connectivity)

When resuming the project, execute the connectivity in this exact order so dependent entities link cleanly:

### Phase 1: Base API Client Setup
- [ ] Create/configure an `apiClient.js` (using `fetch` or `axios`) pointing to `http://127.0.0.1:5000/api/v1`.
- [ ] Implement JWT token injection into `Authorization: Bearer <token>` header.
- [ ] Handle standardized Fastify error responses gracefully.

> [!IMPORTANT]
> **Central Entry Point:** All connectivity changes go through **`AppDataContext.jsx`** (`frontend (2)/src/context/AppDataContext.jsx`). This context wraps all 12 service files and feeds every UI page. Replace `localStorage` service calls with `apiClient` calls inside each service, then `AppDataContext` will automatically propagate real data across the full UI.

### Phase 2: Auth & User Session Connectivity
- [ ] Connect `frontend (2)/src/context/AuthContext.jsx` to `POST /api/v1/auth/login`.
- [ ] Store received JWT in `localStorage`.
- [ ] Verify `GET /api/v1/auth/me` validates session on page reload.

### Phase 3: Customer Profiles Connectivity
- [ ] Connect `customerService.js` to `GET /api/v1/customers` and `POST /api/v1/customers`.
- [ ] Verify creating a customer saves to PostgreSQL `customers` table.

### Phase 4: Warehouse Receipts & Cargo Intake Connectivity
- [ ] Connect `warehouseService.js` to `GET /api/v1/warehouse-receipts` and `POST /api/v1/warehouse-receipts`.
- [ ] Verify package dimensions, weight, CFT, and CBM persist in `warehouse_receipts` and `cargo` tables.
- [ ] Verify 4x6 label print reads accurate intaked data.

### Phase 5: House Bills of Lading (HBL) Connectivity
- [ ] Connect `houseBillService.js` to `GET /api/v1/house-bills` and `POST /api/v1/house-bills`.
- [ ] Verify multi-select WR combination creates HBL record without data re-entry.

### Phase 6: Consolidations & Master Ocean Shipments
- [ ] Connect `consolidationService.js` to `GET /api/v1/consolidations` and `POST /api/v1/consolidations`.
- [ ] Verify finalization creates Master B/L (`bills_of_lading`) and Manifest (`manifests`).

### Phase 7: Master B/L Hold / Release Governance
- [ ] Connect `billOfLadingService.js` to `POST /api/v1/bills-of-lading/:id/hold` and `release`.
- [ ] Verify Agent Portal dynamically locks/unlocks document download and delivery.

### Phase 8: Cargo Tracking & Timeline
- [ ] Connect `trackingService.js` to `GET /api/v1/tracking/:query`.
- [ ] Verify milestone checkpoints display live database events.

---

## ⚠️ Non-Negotiable Engineering Rules for Antigravity

1. **NEVER break or redesign frontend UI:** All pages, cards, tables, CSS variables, colors, buttons, and navigation must remain visually and functionally identical.
2. **NEVER introduce hardcoded dummy data:** Maintain clean slate integrity; only real user submissions should appear in tables.
3. **NEVER modify database schema without migration:** Always create Drizzle migrations if adding columns or tables.
4. **ALWAYS keep all 4 login personas functional:** Do not remove Marcus Vance, Sarah Jenkins, Carlos Mendez, or David Cartwright.
5. **PRESERVE error handling:** Ensure API failures show user-friendly toasts without crashing React state.
