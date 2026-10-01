Aapke charon (4) logins ke exact menu aur screenshots ke hisab se **sabse perfect step-by-step testing workflow** yeh hai:

---

# 🏆 MASTER SHIPPING WORKFLOW (Login by Login)

```text
STEP 1: CARLOS MENDEZ (Warehouse Staff) 
   👉 Customer check/create karega 
   👉 Warehouse Receipt (WR) banayega (Packages + Live CFT/CBM Math)
   👉 4x6 Thermal Label print karega
          ↓
STEP 2: SARAH JENKINS (Documentation Staff)
   👉 Carlos ke banaye WRs ko select karke House B/L (HBL) issue karegi
   👉 Ocean Manifest check karegi
          ↓
STEP 3: MARCUS VANCE (Super Admin / Operations HQ)
   👉 House B/Ls ko select karke Consolidation (Container Packing) karega
   👉 Master B/L (MBL) aur Master Shipment generate karega
   👉 Master B/L par Hold / Release govern karega
          ↓
STEP 4: CARIBBEAN EXPRESS (Destination Port Agent)
   👉 Nassau Port par container receive karega
   👉 Released Master B/L aur cargo documents check/download karega
```

---

## 🟢 PHASE 1: Carlos Mendez se Login karein (Role: Warehouse Staff)

> **Carlos ka Kaam:** Cargo receive karna, destination set karna, har package ka size/weight daalna, aur 4x6 label print karna.

### 📍 Step 1.1: Login Page par click karein:
- **`Carlos Mendez`** (Warehouse icon / 1-Tap button) par click karke login karein.
- Sidebar par dekhein: `ROLE: WAREHOUSE STAFF` likha aayega.

### 📍 Step 1.2: Menu: `Customer Profiles`
1. Left sidebar se **`Customer Profiles`** par click karein.
2. Yahan master customer profiles dikhenge (jaise `Atlantic Trading Co.`, `Nassau Wholesale Goods Ltd.`, etc.).
3. Chahein toh **`+ New Customer Profile`** par click karke apna naya test customer bana sakte hain:
   - **Company Name:** *Atlantic Trading Co.*
   - **Destination Port:** *NAS - Nassau, Bahamas*
   - Save karein.

### 📍 Step 1.3: Menu: `Warehouse Receipts (WR)`
1. Left sidebar se **`Warehouse Receipts (WR)`** par click karein.
2. Top right par **`+ Create Warehouse Receipt`** ya **`+ Intake WR`** click karein:
   - **Customer Dropdown:** Customer select karein (e.g. *Atlantic Trading Co.*).
     *(Notice karein: Customer choose karte hi Shipper, Consignee aur Destination Port `NAS` apne aap fill ho jayega — dobara type nahi karna padega).*
   - **Package-Level Entry Table:**
     - **`+ Add Package Row`** click karein multiple items daalne ke liye (`PKG-001`, `PKG-002`...).
     - Har row mein Length, Width, Height, Pieces aur Weight dalein.
     - Notice karein: Har package ka **CFT** aur **CBM** live calculate hoga.
     - Niche dark blue bar mein Total Pieces, Total Weight, Total CFT aur Total CBM apne aap sum ho jayenge.
3. **`Save & Generate Warehouse Receipt`** par click karein.

### 📍 Step 1.4: Cargo Label Print (4" $\times$ 6" Thermal)
1. Created Warehouse Receipt ke page par **`Preview 4x6 Label`** button click karein.
2. Dekhein: Isme Customer, WR #, Destination (`NAS`), Barcode, QR Code aur **Piece 1 of N, Piece 2 of N** ka live label print layout aa jayega.

👉 **Ab Bottom Left se `Logout` par click karein.**

---

## 🔵 PHASE 2: Sarah Jenkins se Login karein (Role: Documentation Staff)

> **Sarah ka Kaam:** Carlos ke intaked Warehouse Receipts ko select karke customer ke liye **House Bill of Lading (HBL)** issue karna aur **Customs Ocean Manifest** check karna.

### 📍 Step 2.1: Login Page par click karein:
- **`Sarah Jenkins`** (Docs icon / 1-Tap button) par click karke login karein.
- Sidebar par dekhein: `ROLE: DOCUMENTATION STAFF` dikhega.

### 📍 Step 2.2: Menu: `House Bills of Lading (HBL)`
1. Left sidebar ke **MARITIME DOCUMENTATION** section se **`House Bills of Lading (HBL)`** par click karein.
2. Top right par **`+ Create House B/L`** ya **`+ Issue House B/L`** click karein:
   - **Step 1 (Customer):** Wahi customer select karein (*Atlantic Trading Co.*).
   - **Step 2 (Link WRs):** Carlos ne jo Warehouse Receipt banayi thi, use checkbox se select karein (aap ek customer ki 1 ya multiple WRs ek saath check kar sakte hain).
   - **Step 3 (Zero Re-Entry):** System Carlos ke saare WRs ka cargo description, total pieces, weight aur CBM automatically combine karke calculate kar dega.
   - **Step 4 (Issue):** **`Issue House Bill of Lading`** button click karein.
3. System `HBL-2026-XXXX` generate karega jisme legal printable multimodal format, linked WRs aur destination port certified honge.

### 📍 Step 2.3: Menu: `Ocean Manifests (CSV/XML)`
1. Left sidebar se **`Ocean Manifests (CSV/XML)`** open karein.
2. Manifest par click karein:
   - Dekhein: Line items ke andar **House B/L #** (`HBL-2026-XXXX`) display ho raha hai.
   - **`Export CSV`** aur **`Export XML`** button click karke customs file download test karein.

👉 **Ab Bottom Left se `Logout` par click karein.**

---

## 🟣 PHASE 3: Marcus Vance se Login karein (Role: Super Admin / Operations HQ)

> **Marcus ka Kaam:** Sarah ke banaye House B/Ls ko container mein pack (Consolidate) karna, **Master Bill of Lading (MBL)** banana aur **Hold/Release** manage karna.

### 📍 Step 3.1: Login Page par click karein:
- **`Marcus Vance`** (Operations icon / 1-Tap button) par click karke login karein.
- Sidebar par dekhein: `ROLE: SUPER ADMIN` (Pura full console) open hoga.

### 📍 Step 3.2: Menu: `Consolidations`
1. Left sidebar se **`Consolidations`** $\rightarrow$ **`+ Build New Consolidation`** click karein:
   - **Step 1 (Destination):** Destination choose karein (`NAS - Nassau, Bahamas`).
   - Us destination ke un-consolidated **House Bills of Lading (HBLs)** checkboxes se select karein.
   - **Step 2 (Cargo Review):** Live **Container Capacity Fill Bar** dekhein (Container kitna % fill hua).
   - **Step 3 (Vessel & Container):** Ocean Vessel (`MV Island Voyager`), Voyage (`V.2026-19E`), Container # (`CMAU-109482-7`) aur Bolt Seal # confirm karein.
   - **Step 4 (Finalize):** **`Create Consolidation & Generate Master B/L`** par click karein.
2. **Result:** System automatically:
   - Saare selected HBLs aur WRs ko `Consolidated` mark kar dega.
   - Master Ocean Shipment generate karega (6 real-time tracking checkpoints ke saath).
   - **Master Ocean B/L (`BL-KERS-2026-XXXX`)** auto-generate kar dega.

### 📍 Step 3.3: Menu: `Bills of Lading (Master B/L)` & Hold Test
1. Left sidebar se **`Bills of Lading (Master B/L)`** open karein.
2. Naya generate hua Master B/L (`BL-KERS-2026-XXXX`) open karein:
   - Page ke niche dekhein: **"Consolidated House Bills of Lading in this Master B/L"** table dikhegi jisme Sarah ke banaye saare HBLs clickable links ke sath hain.
3. **Hold / Release Feature Test:**
   - Top right se **`Place B/L On Hold`** click karein $\rightarrow$ Document par red **ON HOLD** watermark lag jayega.
   - **`Clear Hold & Release B/L`** click karein $\rightarrow$ Status **RELEASED** ho jayega aur document export unlock ho jayega.

👉 **Ab Bottom Left se `Logout` par click karein.**

---

## 🔴 PHASE 4: Caribbean Express se Login karein (Role: Port Agent - Nassau)

> **David Cartwright ka Kaam:** Destination port (Nassau) par aane wale containers ka status track karna aur strictly B/L hold/release rules follow karke cargo delivery release karna.

### 📍 Step 4.1: Login Page par click karein:
- **`David Cartwright`** (Agent icon / 1-Tap button) par click karke login karein.
- Dekhein: Inhe standard staff sidebar ki jagah **Secure Agent Portal** dikhega (`Nassau Hub`).

### 📍 Step 4.2: Menu: `My Assigned Shipments`
1. Nassau port par aane wale assigned ocean shipments ki list dekhein (Vessel, Voyage, Container #, ETA date).

### 📍 Step 4.3: Menu: `Documents & B/Ls` (Strict Hold Security)
1. **On Hold Document Check:** Jo Master B/L HQ se On Hold hai (`BL-KERS-2026-0092`), use agent open karega toh red lock warning aayegi ki *"Document is locked by HQ — Cannot release cargo"*.
2. **Released Document Check:** Jo Master B/L Released hai, agent use download aur verify karke delivery permit generate kar sakta hai.

---

## 💡 Quick Summary Checklist for Client Demo

| Step | Login Persona | Menu Click | Client Ko Kya Bolna Hai? |
| :--- | :--- | :--- | :--- |
| **1** | **Carlos Mendez** *(Warehouse)* | `Warehouse Receipts` | *"Warehouse staff ne customer select kiya, live L×W×H CFT/CBM calculate karke WR banaya aur 4x6 label print kiya."* |
| **2** | **Sarah Jenkins** *(Docs)* | `House Bills of Lading` | *"Documentation staff ne customer ke multiple WRs ko 1-click mein combine karke House B/L issue kiya bina koi data re-type kiye."* |
| **3** | **Marcus Vance** *(Operations)* | `Consolidation Wizard` | *"Operations manager ne destination ke HBLs ko container mein consolidate kiya jisse Master B/L aur Customs Manifest auto-generate ho gaye."* |
| **4** | **David Cartwright** *(Agent)* | `Agent Portal` | *"Destination port agent ne Nassau hub par incoming container aur released Master B/L receive kiya."* |



Viewed usersData.js:1-140
Viewed LoginPage.jsx:70-225
Viewed LoginPage.jsx:315-350
Created LoginPage.jsx
Ran command: `npm run build`

Login page par **"All 4 Demo Staff Personas"** update kar diya gaya hai aur charon personas ke role badges, titles aur permissions exact 100% match kar diye gaye hain bina kisi doosre component ko break kiye.

---

### 🔑 Correct 4 Logins & Accurate Workflow Mapping:

| # | Staff Name | Exact Role in System | Login Screen Card Badge | Inside Sidebar Menus |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Carlos Mendez** | `Warehouse Staff` | **CFS Terminal Intake** | `Customer Profiles`, `Warehouse Receipts (WR)`, `Cargo Inventory`, `Containers`, `Tracking` |
| **2** | **Sarah Jenkins** | `Documentation Staff` | **Maritime Documentation** | `Customer Profiles`, `House Bills of Lading (HBL)`, `Bills of Lading (Master B/L)`, `Ocean Manifests (CSV/XML)` |
| **3** | **Marcus Vance** | `Super Admin` | **Full HQ & Operations Access** | Full Unrestricted Console (`Consolidations Wizard`, `Master Shipments`, `B/L Hold/Release`, `Users & Roles Matrix`) |
| **4** | **David Cartwright** | `Destination Port Agent` | **Secure Port Agent Portal** | Dedicated Nassau Agent Portal (`My Assigned Shipments`, `Documents & Locked B/Ls`, `Cargo Tracking`) |

---

### 🚀 Ab Testing Flow bilkul seedha aur clear hai:

1. **Step 1:** **`Carlos Mendez`** (Warehouse) se login karein $\rightarrow$ `Warehouse Receipts` mein customer select karein, packages ki length/width/height daal kar live **CFT/CBM calculate** karein aur **4x6 label print** karein $\rightarrow$ Logout.
2. **Step 2:** **`Sarah Jenkins`** (Docs) se login karein $\rightarrow$ `House Bills of Lading (HBL)` mein Carlos ke banaye WRs select karke 1-click mein **House B/L issue** karein $\rightarrow$ Logout.
3. **Step 3:** **`Marcus Vance`** (Super Admin) se login karein $\rightarrow$ `Consolidations Wizard` mein House B/Ls ko container mein consolidate karein $\rightarrow$ Auto-generated **Master B/L** aur **Manifest** check karein $\rightarrow$ Master B/L par **Hold / Release** test karein $\rightarrow$ Logout.
4. **Step 4:** **`David Cartwright`** (Agent) se login karein $\rightarrow$ Nassau agent portal par **Incoming Container** aur **Released Master B/L** verify karein.