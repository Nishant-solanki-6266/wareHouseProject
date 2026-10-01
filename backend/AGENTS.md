# Antigravity Operating Rules & Project Guardrails

> **Project:** VI Customs Brokers & Logistics (WereHousePRoject)  
> **Backend:** Fastify 5.x + TypeScript + PostgreSQL 18 via Drizzle ORM (`wereHouseDb`)  
> **Frontend:** React 18 + Vite (Production styling & modular layouts)  
> **Master Roadmap:** [`backend/PROJECT_STATE_AND_ROADMAP.md`](backend/PROJECT_STATE_AND_ROADMAP.md)  

---

## ⛔ Non-Negotiable Core Rules (Never Break These)

1. **NEVER MODIFY, REDESIGN, OR BREAK FRONTEND UI:**
   - Do NOT change existing layouts, navigation tabs, cards, tables, modals, buttons, or color palettes.
   - Do NOT replace or rewrite Vanilla CSS or CSS variables in `src/styles/`.
   - All connectivity changes must be internal to service functions (`src/services/*.js`) or context providers (`src/context/*.jsx`).

2. **CLEAN SLATE DATA INTEGRITY (NO DUMMY DATA):**
   - Do NOT introduce hardcoded dummy shipments, fake customers, or mock consignment numbers.
   - The database (`wereHouseDb`) and UI must remain a clean slate. Only real data submitted by user actions should exist.

3. **FOLLOW THE STEP-BY-STEP ROADMAP:**
   - Always refer to [`backend/PROJECT_STATE_AND_ROADMAP.md`](backend/PROJECT_STATE_AND_ROADMAP.md) before starting any work.
   - Work phase-by-phase (e.g., Auth ➔ Customers ➔ Warehouse Receipts ➔ House Bills ➔ Consolidations ➔ MBL ➔ Manifests ➔ Tracking).
   - Test and verify each phase with the user before moving to the next.

4. **MAINTAIN ALL 4 LOGIN PERSONAS:**
   - Always preserve the 4 functional workflow users:
     - **Marcus Vance:** `marcus.vance@vicustoms.com` (`super_admin` — HQ Console)
     - **Sarah Jenkins:** `sarah.j@vicustoms.com` (`documentation` — Maritime Docs & HBLs)
     - **Carlos Mendez:** `carlos.m@vicustoms.com` (`operations` — Miami CFS Intake & WRs)
     - **David Cartwright:** `operations@caribbeanexpressbahamas.com` (`agent` — Nassau Port Hub)
   - Default test password: `Password123!`

5. **CONSULT MASTER DOCUMENTATION BEFORE IMPLEMENTATION:**
   - Check [`backend/API_MAP.md`](backend/API_MAP.md) for exact route definitions, payloads, and JWT headers.
   - Check [`backend/DATABASE_SCHEMA.md`](backend/DATABASE_SCHEMA.md) for table column types and relationships.
   - Check [`backend/A_TO_Z_DATA_FLOW_MANUAL.md`](backend/A_TO_Z_DATA_FLOW_MANUAL.md) for business rules and calculations (e.g., CFT/CBM math, Hold/Release logic).
   - Check [`backend/FULL_SYSTEM_VALIDATION.md`](backend/FULL_SYSTEM_VALIDATION.md) for test protocols.

---

## 🛠️ Environment Reference
- **Frontend URL:** `http://localhost:5173`
- **Backend API URL:** `http://127.0.0.1:5000/api/v1`
- **Database Connection:** `postgresql://postgres:123456@localhost:5432/wereHouseDb`
- **Build Verification:** Run `npm run build` in `frontend (2)` to ensure zero compilation or bundling errors.
