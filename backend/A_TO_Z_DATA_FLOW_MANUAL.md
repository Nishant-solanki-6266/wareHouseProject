# VI Customs Brokers & Logistics — A to Z End-to-End Data Flow Manual

> **Purpose:** Authoritative operational lifecycle and data flow manual for the freight forwarding and cargo consolidation platform.  
> **Personas:** Warehouse Staff (`operations`), Documentation Staff (`documentation`), Operations Manager / Super Admin (`super_admin`), Destination Port Agent (`agent`).

---

## 🔄 End-to-End Business Flow Diagram

```text
[Carlos Mendez - Warehouse Staff]
   │
   ├─► 1. Customer Check / Intake Form
   ├─► 2. Generate Warehouse Receipt (WR-2026-XXXX)
   │        └─ Package Rows: Live L×W×H ➔ CFT / CBM Math
   └─► 3. Print 4" x 6" Thermal Cargo Labels (Barcode + QR)
            │
            ▼
[Sarah Jenkins - Documentation Staff]
   │
   ├─► 4. Select Un-consolidated Warehouse Receipts (Multi-select)
   ├─► 5. Issue House Bill of Lading (HBL-2026-XXXX) [Zero Data Re-entry]
   └─► 6. Verify Customs Line Items & Ocean Manifest
            │
            ▼
[Marcus Vance - Super Admin / Operations HQ]
   │
   ├─► 7. Build Container Consolidation (CNS-2026-XXXX)
   │        ├─ Filter HBLs by Destination Port (e.g., NAS - Nassau)
   │        ├─ Visual Fill Gauge (% of Container CBM Capacity)
   │        └─ Assign Vessel, Voyage, Container #, and Bolt Seal #
   ├─► 8. Finalize Consolidation
   │        ├─ Auto-Generates Master Ocean Shipment (SHP-2026-XXXX)
   │        ├─ Auto-Generates Master Ocean B/L (BL-VI-2026-XXXX)
   │        └─ Auto-Generates Shipping Manifest (MNF-2026-XXXX)
   └─► 9. Manage B/L Hold / Release Governance
            │
            ▼
[David Cartwright - Destination Port Agent (Nassau)]
   │
   ├─► 10. Access Nassau Agent Portal
   ├─► 11. View Inbound Container Schedules & ETAs
   └─► 12. Enforce Delivery Handover Security:
            ├─ If B/L "On Hold" ➔ Download & Cargo Release Locked (Red Alert)
            └─ If B/L "Released" ➔ Download Delivery Order & Release Cargo
```

---

## 📍 Phase 1: CFS Warehouse Intake (Carlos Mendez — `operations`)

### 1.1 Customer Selection / Verification
- Warehouse staff searches or creates the commercial/personal importer (e.g., *Atlantic Trading Co.*).
- Selecting the customer automatically populates:
  - Default Destination Port: `NAS - Nassau, Bahamas`
  - Consignee Name & Delivery Address
  - Tax TIN / ID (`TIN-BS-994821`)

### 1.2 Package-Level Measurement & Live Mathematics
- Staff adds package line items with dimensions and piece counts:
  $$\text{Volume per Item (CFT)} = \frac{\text{Length (in)} \times \text{Width (in)} \times \text{Height (in)}}{1728} \times \text{Pieces}$$
  $$\text{Volume (CBM)} = \text{CFT} \times 0.0283168$$
- Dark blue summary bar computes live real-time totals:
  - `Total Pieces`
  - `Total Weight (LBS)`
  - `Total CFT`
  - `Total CBM`
- **Output:** Warehouse Receipt (`WR-2026-XXXX`) generated with status `Ready for Consolidation`.

### 1.3 Cargo Inventory Staging
- When a WR is saved, the system **automatically creates a linked Cargo record** in the `Cargo Inventory` module.
- Carlos can view the `Cargo Inventory` menu to see all physically staged items in the Miami CFS warehouse bays.
- Each cargo item shows:
  - Linked WR Number, Customer Name, Package Description
  - Warehouse Bay Location (e.g., `Bay A-01`)
  - Dimensions: CFT / CBM
  - Status: `Ready for Consolidation` → transitions to `Consolidated` when packed
- Carlos can **update warehouse bay location** (`PATCH /cargo/:id/location`) if cargo is moved between staging areas.

### 1.4 4" $\times$ 6" Thermal Cargo Label Printing
- For each physical box/pallet received, a standardized label is printed:
  - Destination Code: **`NAS`** (Prominent bold font)
  - Receipt Number: `WR-2026-1041`
  - Package Sequence: **Piece 1 of 8**, **Piece 2 of 8**...
  - Symbology: Code 128 Barcode + 2D QR Code for handheld terminal scanners
  - Staging Location: `Bay A-04`
  - Print media: `@media print` CSS optimized for 4"×6" thermal roll format

---

## 📍 Phase 2: Maritime Documentation & House B/L (Sarah Jenkins — `documentation`)

### 2.1 Combining Warehouse Receipts (Zero Data Re-entry)
- Documentation staff opens `House Bills of Lading (HBL)`.
- Selects customer (*Atlantic Trading Co.*) and checks one or more un-consolidated WRs.
- System automatically sums pieces, weights, descriptions, and volumes.
- **Output:** Multimodal House Bill of Lading (`HBL-2026-XXXX`) issued:
  - Shipped on board terms
  - Freight charges (Prepaid / Collect)
  - Shipper, Consignee, and Notify Party certification

### 2.2 House B/L Hold (HBL-Level Security)
- Sarah can place an individual **House B/L On Hold** before consolidation if required:
  - Reason types: *Payment Pending*, *Document Discrepancy*, *Customs Pre-clearance*.
  - When HBL Hold is placed:
    - HBL displays amber `ON HOLD` banner.
    - HBL cannot be selected into a Consolidation batch until hold is cleared.
  - Sarah can **Clear HBL Hold** once resolved.

### 2.3 Customs Ocean Manifest Verification
- Staff opens `Ocean Manifests (CSV/XML)` from the Maritime Documentation sidebar.
- Each manifest line item displays:
  - Parent HBL identifier (`HBL-2026-XXXX`)
  - Package description, weight in KG/LBS, volume in CBM
  - Shipper & Consignee
- **Orientation:** Toggle between **Portrait Manifest** and **Landscape Manifest** view.
- **Export Actions:**
  - **`Export CSV`** — Customs-compliant comma-separated format for port authority filing.
  - **`Export XML`** — Structured XML for EDI/ASYCUDA customs systems.
  - Endpoint: `GET /api/v1/manifests/:id/export?format=csv` or `?format=xml`

---

## 📍 Phase 3: Container Packing & Master B/L (Marcus Vance — `super_admin`)

### 3.1 Consolidation Wizard & Capacity Utilization
- Operations HQ initiates `Build New Consolidation`:
  1. **Select Destination Port:** e.g., `NAS - Nassau Container Port`.
  2. **Select Eligible HBLs:** System displays available HBLs matching destination port.
  3. **Visual Container Fill Bar:** Calculates total CBM of selected cargo against container capacity:
     - 20' Standard GP: `33.2 CBM`
     - 40' Standard GP: `67.5 CBM`
     - 40' High Cube (HC): `76.2 CBM`
  4. **Vessel & Equipment Linkage:**
     - Ocean Carrier: *Tropical Shipping Line*
     - Vessel: *MV Island Voyager*
     - Voyage: *V.2026-19E*
     - Container Number: *CMAU-109482-7*
     - High-Security Bolt Seal Number: *SEAL-VI-99482*

### 3.2 Automated Cascade on Consolidation Finalization
Clicking **`Finalize Consolidation`** triggers a transaction that:
1. Updates all packed HBLs and WRs status to `Consolidated`.
2. Creates Master Ocean Shipment (`SHP-2026-XXXX`) with tracking number `TRK-VI-XXXXXX`.
3. Creates Master Ocean Bill of Lading (`BL-VI-2026-XXXX`).
4. Generates Shipping Manifest (`MNF-2026-XXXX`).
5. Generates 6 tracking milestones in `tracking_events`.

### 3.3 Hold / Release Governance
- **Placing On Hold:**
  - Reason types: *Payment Pending (Freight/Doc Charges)*, *Customs Audit*, *Damaged Goods*.
  - When Hold is placed:
    - Master B/L displays red `ON HOLD` banner and watermark.
    - Destination Agent Portal locks document download and prevents cargo handover.
- **Releasing Hold:**
  - Upon accounts payment clearance, Super Admin clicks `Clear Hold & Release B/L`.
  - Status becomes `Released`. Destination Agent Portal immediately unlocks document download.

---

## 📍 Phase 4: Destination Port Reception & Release (David Cartwright — `agent`)

### 4.1 Inbound Vessel & Container Tracking
- Port Agent logs into dedicated **Secure Agent Portal** (Nassau Hub).
- Displays inbound vessel arrival schedule (Vessel name, voyage, ETA at Nassau).

### 4.2 Cargo Release Handover Protocol
- Agent opens `Documents & B/Ls`:
  - **Case A: Document is ON HOLD:**
    - UI shows red lock icon and blocking banner: *"Access Blocked: Document is currently ON HOLD by HQ."*
    - Agent cannot release cargo to consignee.
  - **Case B: Document is RELEASED:**
    - Green release badge displayed.
    - Agent downloads certified Master B/L and Manifest.
    - Issues delivery order and records final handover to *Atlantic Trading Co.*

---

## 📍 Phase 5: Real-Time Cargo Tracking Timeline

Customers and logistics staff can query the unified tracking portal with:
- **Tracking Number:** `TRK-VI-994821`
- **Master B/L Number:** `BL-VI-2026-0092`
- **Warehouse Receipt:** `WR-2026-1041`

### Standard Milestones Progression:
1. `Cargo Received at CFS Terminal (Miami)` — Completed
2. `Cargo Inspected & Staged in Warehouse Bay` — Completed
3. `Container Stuffed & High-Security Seal Applied` — Completed
4. `Loaded Aboard Vessel & Departed Origin Port` — Active / In Transit
5. `Vessel Arrival & Discharged at Destination Port` — Pending
6. `Customs Cleared & Released to Consignee` — Pending
