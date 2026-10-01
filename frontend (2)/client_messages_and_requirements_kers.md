# KERS Customs & Logistics — Client Messages & Requirements

> **Purpose:** This document collects the client messages and feedback that were previously shared in the conversation about the **KERS Customs & Logistics / Freight Forwarding & Cargo Consolidation frontend** project.
>
> **Important:** Only the messages whose exact wording was preserved are marked as **Exact client message**. Other items are included as **Client feedback summarized from the user's shared conversation** and should be confirmed against the original chat if exact wording is required.

---

## 1. Client Information

- **Client name/contact shown in conversation:** `kedreana`
- **Project:** KERS Customs & Logistics
- **Application:** Freight Forwarding & Cargo Consolidation frontend
- **Current scope:** Frontend-first implementation; backend to be handled after client approval.

---

## 2. Exact Client Messages

### 2.1 — 1 September 2026

**Client:** kedreana

> “There are a few things that does not work for us. I thought you were going to send a questionnaire. I’m not sure if I understand the workflow. I don’t see the house BL options”

### Meaning captured from the conversation

The client communicated that:

1. Some parts of the application were not working as expected.
2. The client expected a questionnaire.
3. The current workflow was not clear enough.
4. The client could not find the House B/L options.

---

## 3. Other Client Feedback Shared in the Conversation

The following points were shared as the client's detailed feedback/requirements. The exact original wording was not preserved in the available conversation context, so these are documented as summarized requirements.

### 3.1 Customer, Shipper and Consignee

- The customer and consignee may be different people or companies.
- Shipper and consignee must be handled independently.
- Shipper and consignee should be selectable through a dropdown/search interface.
- Reusable customer/company profiles should be supported.

### 3.2 Warehouse Receipt

- Warehouse Receipt intake should be simple and clear.
- After saving a Warehouse Receipt, the form should reset to a blank state for the next entry.
- Package dimensions must be visible:
  - Length
  - Width
  - Height
- Weight and pieces should be visible and usable.
- The warehouse location feature was not required and was requested to be removed.
- Destination should be captured correctly and carried forward into the later workflow.

### 3.3 House B/L

- The client could not find the House B/L options.
- House B/L workflow and available options needed clarification.
- House B/L rates/charges input was unclear.
- Warehouse Receipts should be linkable to a House B/L.
- Linked Warehouse Receipts should remain visible in the relevant House B/L and cargo/inventory views.
- One House B/L may need to connect to one or more Warehouse Receipts, depending on the client's confirmed business rules.

> **Note:** The exact House B/L workflow, rate structure, and option list should not be guessed. These must be confirmed with the client.

### 3.4 Destination Ports and Services

- Custom islands/service destinations and ports are required.
- Destinations/ports should be selected from dropdowns or searchable options.
- The destination/port should not depend only on unrestricted free-text entry.

### 3.5 Manifest

- The Manifest should initially be blank.
- It should populate from saved Master B/L or Master Shipment data.
- The Manifest should not contain unrelated hardcoded data.
- The data flow should be:

  `Saved Master B/L / Master Shipment → Manifest`

### 3.6 Measurements and Volume Display

- CFT should be the primary volume measurement.
- CBM should be shown as the secondary measurement.
- The preferred display format discussed was similar to:

  `45.0 CFT (1.27 CBM)`

---

## 4. Client Concern About Application Complexity

The client also communicated that:

> “the application seams a little complex”

This indicates that the interface and workflow should be made easier to understand without removing required freight-forwarding functionality.

The frontend should therefore focus on:

- Clear role-based navigation.
- A simple and visible end-to-end workflow.
- Clear “next step” actions.
- Less duplication in menus and buttons.
- Simple forms with understandable labels.
- A clear House B/L entry point.
- A clear relationship between:

  `Warehouse Receipt → Cargo Inventory → House B/L → Consolidation → Master B/L → Manifest`

---

## 5. Workflow Requirements Collected From Client Feedback

The following workflow was reconstructed from the client's feedback and the project discussions:

1. Create or select a customer profile.
2. Create a Warehouse Receipt.
3. Enter package description, dimensions, weight and pieces.
4. Select shipper and consignee independently.
5. Select the destination/service port.
6. Save the Warehouse Receipt.
7. Generate or view cargo labels and inventory records.
8. Link one or more Warehouse Receipts to a House B/L.
9. Enter or review House B/L rates/charges.
10. Consolidate eligible House B/Ls or cargo into a shipment/container.
11. Generate or save the Master B/L.
12. Populate the Manifest from saved Master B/L/Master Shipment data.
13. Continue with agent assignment, tracking and delivery workflow as applicable.

---

## 6. Issues the Client Expected to Be Addressed

- Some existing functions were not working correctly.
- The questionnaire was missing or had not yet been provided.
- The overall workflow was difficult to understand.
- House B/L options were not visible.
- The application felt too complex.
- Customer, shipper and consignee relationships needed clearer handling.
- Warehouse Receipt dimensions were not sufficiently visible.
- Warehouse Receipt reset behavior needed improvement.
- House B/L rates/charges needed a clearer interface.
- Warehouse Receipts needed to remain connected to House B/L and cargo inventory.
- Custom destinations and ports needed dropdown/search support.
- Manifest data needed to come from saved Master B/L/Master Shipment records.
- CFT and CBM display priority needed to be corrected.

---

## 7. Important Clarifications Still Needed From the Client

These points should be confirmed before claiming that the frontend fully matches the client's process:

- Exact House B/L workflow and all available options.
- Whether a House B/L can link multiple Warehouse Receipts in every case.
- Exact House B/L rate and charge fields.
- Exact customer, shipper and consignee rules.
- Complete list of service destinations and ports.
- Exact Manifest fields and export format.
- Whether CSV/XML output must follow a specific external/customs schema.
- Exact roles and permissions required by the client.
- Final preferred terminology for shipments, House B/L, Master B/L and cargo records.

---

## 8. Implementation Rules Based on the Client Feedback

- Do not remove working core features without client approval.
- Do not invent missing House B/L business rules.
- Keep the workflow connected through shared frontend state/data.
- Ensure saved records are reused in later pages.
- Make the interface understandable for a first-time user.
- Keep the application responsive on desktop, tablet and mobile.
- Do not claim that everything is 100% tested unless browser/manual testing has actually been completed.
- Separate code verification/build verification from real browser QA.

---

## 9. Source and Accuracy Note

This file is based on the client messages and requirements previously shared in the conversation. One exact client message is preserved above. The remaining requirements are included as reconstructed summaries because their complete original wording is not available in the current context.

For a legally or contractually exact record, compare this document with the original client chat, WhatsApp messages, email, or project PDF and update the wording accordingly.




date:-21-9-26 client requriement


[8:32 pm, 21/9/2026] +91 93038 32031: Hello. I am trying to review this weekend. You will get some feedback tomorrow
[8:32 pm, 21/9/2026] +91 93038 32031: Let me send you my logo and business name
[8:33 pm, 21/9/2026] +91 93038 32031: VI Customs Brokers & Logistics
[8:33 pm, 21/9/2026] +91 93038 32031: Hello,

After deciding to test the latest version of the application, I went through some of the core functions and noted the following issues and changes that are required.

### Issues Identified During Testing

*1. Clear Slate / Reset*

I selected the option to clear the slate/reset the application. However, while some information appeared to be cleared, the *customer database was not cleared*. All previously entered customer information remained in the system.

*2. Warehouse Staff – Unable to Add Customers*

I signed in under the Warehouse Staff role and was unable to add a new customer.

Because Warehouse/Operations staff will be receiving cargo, they need the ability to create a customer when cargo arrives for someone who is not already in the system.

*3. Warehouse Receipt (WR) Numbering*

Warehouse Receipt numbers do not need to begin with "WR."

I would prefer the system-generated Warehouse Receipt number to be *numeric only*.

Example: *100245* instead of *WR100245*. Lets start at 3100

There should also be an option for authorized *Documentation and Admin staff* to manually enter or edit a WR number, as some shipments may arrive with an existing warehouse receipt/reference number that we need to use.

### User Roles & Permissions
After reviewing the current setup, I believe we can simplify the user roles. This is not a large operation, so we do not need highly separated roles for every individual function. Some responsibilities can be combined.

#### Warehouse / Operations
This role should be able to:

* Add and access customers
* Receive cargo
* Enter cargo dimensions and weight
* Create Warehouse Receipts
* Print cargo/warehouse labels
* Prepare House Bills of Lading

#### Documentation
This should be a broader operational role with access to:

* Add and access customers
* Enter cargo dimensions and weight
* Create Warehouse Receipts
* Print labels
* Prepare House Bills of Lading
* Review and edit House Bills of Lading
* Prepare manifests
* Issue and clear holds
* Add/manage vessel names
* Assign shipments/cargo to a consolidation or container
* Edit Warehouse Receipt numbers
* Access and manage consolidation information

This role essentially handles the documentation and shipment-management side of the operation and therefore requires broader access than the Warehouse/Operations role.

K
Profile Image
kedreana

20 Sept, 21:05
#### Agent
Please replace the current *Destination Agent* role name with simply *Agent*, as some agents may also use the system for export operations rather than only receiving inbound cargo.

The Agent role should allow the user to:

* Access manifests assigned to their location/agency
* Export/download manifest data
* Access Bills of Lading assigned to them
* View the relevant consolidation/container information
* Update consolidation status, including:

  * Arrived at port
  * Container unloaded
  * Documents released
* Receive and measure cargo where applicable
* Print labels
* Prepare House Bills of Lading

Agents should only have access to the shipments, consolidations, manifests and Bills of Lading relevant to their assigned location/agency.

I did not complete a WR because I was unable to add Client information. Additionally, please UNLINK Customer to the Consignee.. Thats not always the case.