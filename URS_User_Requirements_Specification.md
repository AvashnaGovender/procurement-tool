# User Requirements Specification (URS)
## Procurement & Supplier Management Application

**Document Version:** 1.0  
**Date:** February 9, 2025  
**Status:** Draft  
**Classification:** Internal

---

## 1. Document Control

| Version | Date       | Author | Description |
|---------|------------|--------|-------------|
| 1.0     | 2025-02-09 | —      | Initial comprehensive URS |

---

## 2. Introduction

### 2.1 Purpose
This User Requirements Specification (URS) defines the functional and non-functional requirements for the Procurement & Supplier Management Application from the end-user and business perspective. It serves as the authoritative source for what the system shall do and under what conditions, and supports validation, traceability, and regulatory readiness.

### 2.2 Scope
The application supports:
- **Supplier initiation and onboarding** (request → approval → invite → form → documents → review → approval/rejection)
- **Supplier master data and document management** (profiles, documents, verification, versions)
- **Approval workflows** (initiation, delegation, requisitions, contracts)
- **Purchase requisitions, purchase orders, contracts, deliveries, and invoices**
- **Supplier evaluation and performance**
- **Reporting, reminders, audit, and administration**

The system is web-based, with authenticated internal users and token-based access for external suppliers. A background worker supports document processing, validation, and email/reminders.

### 2.3 Definitions and Acronyms

| Term / Acronym | Definition |
|----------------|------------|
| URS | User Requirements Specification |
| NDA | Non-Disclosure Agreement |
| CIPC | Companies and Intellectual Property Commission (South Africa) |
| BBBEE / B-BBEE | Broad-Based Black Economic Empowerment (South Africa) |
| SHE | Safety, Health and Environment |
| PO | Purchase Order |
| RP | Responsible Person |
| COD | Cash on Delivery |
| AC | Account (payment method) |
| PM | Procurement Manager / Buyer |
| OCR | Optical Character Recognition |
| AI | Artificial Intelligence (document analysis) |

---

## 3. User Roles and Access

### 3.1 Role Definitions

| Role | Description | Typical Access |
|------|-------------|----------------|
| **ADMIN** | System administration, user management, reminder and email configuration | Full access; admin routes; user CRUD; reminder config; SMTP; Airtable import |
| **MANAGER** | Line manager; approves supplier initiations for direct reports | Dashboard; supplier initiation approval; delegations; supplier list; approvals |
| **PROCUREMENT_MANAGER** | Procurement leadership; second-level approval for initiations | Same as MANAGER plus procurement-level initiation approval; approvals queue |
| **PROCUREMENT_SPECIALIST** | Buyer / procurement specialist; runs onboarding and reviews | Initiate onboarding; review submissions; request revisions; verify documents; supplier list |
| **APPROVER** | Approval authority for requisitions/contracts (as configured) | Requisition/contract approvals; dashboard; delegations |
| **FINANCE** | Finance-related views and actions | Finance-relevant data; invoices; payments (as implemented) |
| **USER** | Standard internal user; may initiate supplier requests | Dashboard; create supplier initiations; view own initiations; delegations |

### 3.2 Authentication and Authorization

- **URS-3.2.1** The system shall require user authentication (email + password) for all internal application pages except explicitly defined public paths.
- **URS-3.2.2** Public paths (no login required) shall be limited to: Login page, Supplier Onboarding Form (token-based), and Credit Application Form (token-based).
- **URS-3.2.3** Access to admin-only areas (e.g. supplier submissions list, approvals, user management, reminder configuration, SMTP) shall be restricted by role (e.g. ADMIN, and role-specific approval queues).
- **URS-3.2.4** The system shall support redirect to the originally requested URL after login (callback URL), except for restricted admin paths which shall not be stored as callback URLs.
- **URS-3.2.5** Supplier access to onboarding and credit application shall be via secure, unique tokens (onboarding token, credit application token) only; no internal user login shall be required for suppliers.

### 3.3 Delegation of Approval Authority

- **URS-3.3.1** Users with approval authority shall be able to delegate that authority to another user for a defined period (start date, end date).
- **URS-3.3.2** Delegation types shall include: All Approvals, Manager Approvals (supplier initiations), Procurement Approvals, Requisition Approvals, Contract Approvals.
- **URS-3.3.3** The system shall prevent self-delegation and shall validate that the delegate user exists and is active.
- **URS-3.3.4** When determining pending approvals, the system shall consider active delegations so that delegated approvals appear in the delegate’s queue and can be acted upon by the delegate.
- **URS-3.3.5** Delegations shall be viewable (given and received) and deactivatable by the delegator or admin.

---

## 4. Functional Requirements by Module

### 4.1 Supplier Initiation (Pre-Onboarding)

Supplier initiation is the process of requesting and approving the onboarding of a new supplier before an invitation is sent.

- **URS-4.1.1** Authorized users shall be able to create and save draft supplier initiations with: business unit(s), supplier name/email/contact, product/service category, requester name, relationship declaration, supplier location (local/foreign), currency (required if foreign), purchase type (regular/once-off/shared IP), annual purchase value, credit application (Y/N and reason), payment method (COD/AC), COD reason if applicable, and onboarding reason.
- **URS-4.1.2** The system shall support checklist confirmations: process read and understood, due diligence completed.
- **URS-4.1.3** Initiations shall have statuses: Draft, Submitted, Manager Approved, Procurement Approved, Approved, Rejected, Email Sent, Supplier Emailed.
- **URS-4.1.4** Submitted initiations shall require Manager approval first; upon approval, Procurement Manager approval shall be required (configurable by role).
- **URS-4.1.5** Approvers shall be able to approve or reject with comments; rejection shall set the initiation to Rejected and may notify the initiator.
- **URS-4.1.6** Once fully approved, the system shall allow sending the supplier onboarding pack (email with link to onboarding form); sending shall be tracked (e.g. email sent flag and timestamp).
- **URS-4.1.7** The system shall support listing initiations with filters (e.g. status, initiator) and role-based visibility (e.g. manager sees direct reports; procurement sees all or by business unit).

### 4.2 Supplier Onboarding (Invitation, Form, Documents)

- **URS-4.2.1** Authorized users shall be able to initiate supplier onboarding (linked to an approved initiation when applicable), providing contact name, email, business type, sector, and generating a unique onboarding token.
- **URS-4.2.2** The system shall send an email to the supplier containing a link to the supplier onboarding form that includes the token so the supplier can access the form without logging in.
- **URS-4.2.3** The supplier onboarding form shall collect the full set of required business data (e.g. 39+ fields as defined: company name, registration number, addresses, contact details, banking, responsible persons for Banking/Quality/SHE/BBBEE, BBBEE level, certifications, etc.) and support file uploads for defined document categories.
- **URS-4.2.4** Required document categories shall include at least: NDA (signed), Company Registration (CIPC), Tax Clearance or Letter of Good Standing, Bank Confirmation Letter, B-BBEE Certificate; the system shall support configuration of required vs optional categories.
- **URS-4.2.5** The system shall support manual NDA workflow: supplier downloads standard NDA template, signs manually, and uploads signed copy (e.g. PDF/image).
- **URS-4.2.6** Onboarding shall have defined steps/states (e.g. Initiate, Pending Supplier Response, Review, Revision Requested, Awaiting Final Approval, Complete) and overall status (e.g. Initiated, Email Sent, Awaiting Response, Documents Received, Under Review, Revision Needed, Awaiting Final Approval, Approved, Rejected, Completed).
- **URS-4.2.7** When the supplier submits the form and documents, the system shall record submission timestamps and store form data and files; a timeline/audit trail shall record key events (e.g. email sent, documents uploaded, review completed).

### 4.3 Credit Application (Supplier-Facing)

- **URS-4.3.1** The system shall support optional credit application per onboarding; an onboarding may have a unique credit application token and a separate credit application form.
- **URS-4.3.2** Suppliers shall access the credit application form via a token-based link (no login).
- **URS-4.3.3** The system shall allow submission of credit application data and, where applicable, a signed credit application document; signed documents shall be stored and retrievable (e.g. by authorized users or by supplier via token where designed).
- **URS-4.3.4** Credit controller assignment (e.g. name/code) shall be supportable at onboarding for reference.

### 4.4 Document Management and Verification

- **URS-4.4.1** Uploaded supplier documents shall be stored with metadata: document type/category, file name, size, path, MIME type, link to onboarding/supplier, upload time.
- **URS-4.4.2** The system shall support document versioning (e.g. by version number and category) so that multiple versions of the same document type can be retained.
- **URS-4.4.3** Authorized reviewers shall be able to mark documents as “Verified” (with optional notes); verification status, verifier, and timestamp shall be stored and displayed.
- **URS-4.4.4** The system shall detect and display missing compulsory documents (e.g. NDA, CIPC, Tax/Letter of Good Standing, Bank Confirmation, B-BBEE) and allow requesting revision with a single action (e.g. “Request Revision – Missing Documents”) with notes.
- **URS-4.4.5** Authorized users shall be able to view/download documents (e.g. by supplier, version, category, file) with access controlled by role and ownership.

### 4.5 Revision Request and Re-Submission

- **URS-4.5.1** Reviewers shall be able to request revisions from the supplier, specifying which document categories (or documents) need revision and providing notes.
- **URS-4.5.2** The system shall send a revision request (e.g. email) to the supplier with clear instructions and, where applicable, a link to resubmit.
- **URS-4.5.3** Onboarding shall track revision count, revision requested flag, revision notes, and documents to revise; when the supplier resubmits, the system shall record the new submission and update status accordingly.

### 4.6 Final Approval and Rejection of Onboarding

- **URS-4.6.1** Authorized users shall be able to approve or reject an onboarding after review; approval/rejection shall be recorded with status, timestamp, and (for rejection) reason.
- **URS-4.6.2** On approval, the supplier record (if created/linked) shall be set to an approved state and linked to the onboarding; on rejection, the supplier (if any) may be set to rejected and the rejection reason stored.
- **URS-4.6.3** The system shall support an “Awaiting Final Approval” state and, where applicable, a dedicated action to “Request Final Approval” for visibility to approvers.

### 4.7 Supplier Master Data and List

- **URS-4.7.1** The system shall maintain a supplier master with: supplier code (unique), name, contact person, company name, trading name, registration number, addresses, contact details, banking, responsible persons, BBBEE, sector, business type, status (e.g. Pending, Under Review, Awaiting Final Approval, Approved, Rejected, Suspended, Inactive), and timestamps.
- **URS-4.7.2** Suppliers shall be listable and filterable (e.g. by status, sector, search); role-based visibility shall apply where configured.
- **URS-4.7.3** Authorized users shall be able to view supplier detail (including documents and verification status) and, where permitted, update status or key fields.
- **URS-4.7.4** The system shall support creation of a supplier from onboarding (e.g. on approval) and linking of onboarding to an existing supplier where applicable.

### 4.8 AI / Worker Document Processing (Optional Enhancement)

- **URS-4.8.1** The system may provide integration with a background worker to process uploaded documents (e.g. OCR, extraction, validation).
- **URS-4.8.2** When implemented, the worker may perform checks such as: CIPC document presence and company name/registration number match with form data; B-BBEE certificate presence and level/ownership alignment; tax/bank document checks as designed.
- **URS-4.8.3** Results of such processing shall be storable and displayable to reviewers (e.g. analysis results, pass/fail, notes) to assist—not replace—human verification.

### 4.9 Reminder System

- **URS-4.9.1** The system shall support configurable automated reminders for: (1) Supplier document submission (supplier has not uploaded documents after onboarding email), (2) Manager approval pending (initiation), (3) Procurement/Buyer review pending (documents submitted, not yet reviewed), (4) Supplier revision pending (revision requested, not yet resubmitted).
- **URS-4.9.2** Reminder schedule shall be configurable (e.g. first, second, final reminder after X hours); each reminder type may be enabled or disabled.
- **URS-4.9.3** Reminders shall be sent by email; each sent reminder shall be logged (recipient, type, reference, status, sent time, errors if any).
- **URS-4.9.4** The system shall avoid sending duplicate reminders for the same action and shall stop reminders when the relevant action is completed.

### 4.10 Email and Notifications

- **URS-4.10.1** The system shall send transactional emails for: onboarding invitation, revision request, approval/rejection notifications, reminders, and other configured events.
- **URS-4.10.2** Email sending shall use configurable SMTP (host, port, credentials, from address); admins shall be able to configure and test SMTP from the application.
- **URS-4.10.3** Sent emails shall be logged (recipient, subject, type, reference, status, message ID, errors) for troubleshooting and audit.
- **URS-4.10.4** In-app notifications may be used for internal users (e.g. approval needed, requisition approved); types and delivery shall be as implemented.

### 4.11 Purchase Requisitions

- **URS-4.11.1** Users shall be able to create and edit requisitions with: title, description, justification, department, priority, budget code, estimated total amount, currency, required-by date, and line items (description, quantity, UOM, unit price, total, suggested supplier, specifications, notes).
- **URS-4.11.2** Requisitions shall have statuses such as: Draft, Submitted, Pending Approval, Approved, Rejected, Cancelled, Converted to PO, Completed.
- **URS-4.11.3** The system shall support a multi-level approval workflow for requisitions; each approval level shall record approver, status, decision, comments, and timestamps.
- **URS-4.11.4** Requisitions may support attachments and comments (internal/external as designed).

### 4.12 Purchase Orders (PO)

- **URS-4.12.1** The system shall support creation of purchase orders linked to a requisition and supplier, with line items, amounts, payment/delivery terms, and dates.
- **URS-4.12.2** PO statuses shall include: Draft, Issued, Acknowledged, In Progress, Partially Delivered, Delivered, Completed, Cancelled.
- **URS-4.12.3** The system may track supplier acknowledgment of the PO and expected/actual delivery dates.

### 4.13 Contracts

- **URS-4.13.1** The system shall support contract creation and maintenance: contract number, supplier, name, type (e.g. fixed price, time and materials, framework, SLA), description, value, currency, payment/delivery terms, start/end/renewal dates, auto-renewal and notice period.
- **URS-4.13.2** Contract statuses shall include: Draft, Pending Approval, Approved, Active, Expired, Terminated, Renewed.
- **URS-4.13.3** Contract approval workflow shall record approver, status, comments, and timestamps.
- **URS-4.13.4** The system may support contract documents and amendments; renewal reminders may be sent when approaching end date.

### 4.14 Deliveries and Invoices

- **URS-4.14.1** The system shall support recording deliveries against POs: delivery number, expected/actual dates, status (e.g. scheduled, in transit, delivered, delayed), lead time, and notes.
- **URS-4.14.2** The system shall support recording invoices: invoice number, PO/supplier, dates, amounts, tax, status (e.g. pending, approved, paid, overdue), and payment details.

### 4.15 Supplier Evaluation and Reviews

- **URS-4.15.1** The system shall support supplier evaluations with period, scores (e.g. quality, delivery, price, service, compliance, overall), performance rating, and optional metrics (on-time delivery rate, defect rate, response time) and comments.
- **URS-4.15.2** The system may support simpler supplier reviews (rating and comment) by a reviewer.

### 4.16 Dashboard and Reporting

- **URS-4.16.1** The dashboard shall present a summary of key metrics (e.g. total suppliers, active orders, spend, lead time) where data is available.
- **URS-4.16.2** The application shall provide navigation to modules: Supplier Onboarding, Purchase Requisition, Price Benchmarking, Spend Analysis, Demand Forecasting, Supplier Evaluation, Contract Management, Lead Time Tracking, Delivery Optimization.
- **URS-4.16.3** Role-based visibility shall determine which modules and stats each user sees.

### 4.17 Admin and Configuration

- **URS-4.17.1** Admins shall be able to manage users: create, edit, deactivate, assign role, department, and manager (where applicable).
- **URS-4.17.2** Admins shall be able to configure reminder timings and enable/disable reminder types.
- **URS-4.17.3** Admins shall be able to configure SMTP and email templates (where implemented) and send test emails.
- **URS-4.17.4** The system may support Airtable import (or similar) for supplier/data sync as designed; admin-only.

### 4.18 Audit and Compliance

- **URS-4.18.1** The system shall maintain an audit log of significant actions (e.g. create, update, delete, approve) with: user (or identifier), action, entity type, entity ID, timestamp, and optionally before/after values and IP/user agent.
- **URS-4.18.2** Onboarding timeline and document verification records shall provide a traceable history for supplier onboarding and compliance reviews.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **URS-5.1.1** Page load and navigation shall be responsive under normal load; target for key pages (e.g. dashboard, supplier list) to load within a few seconds on typical corporate networks.
- **URS-5.1.2** Document upload shall support typical file sizes (e.g. PDFs up to several MB per file) with progress indication and clear error messages on failure.
- **URS-5.1.3** List and search operations shall remain usable with hundreds of suppliers/initiations; pagination or lazy loading shall be used where appropriate.

### 5.2 Availability and Reliability

- **URS-5.2.1** The application shall be available for use during defined business hours (targets to be agreed); planned maintenance shall be communicated.
- **URS-5.2.2** Transient failures (e.g. network, worker unavailable) shall be handled gracefully with user-friendly messages and retry where appropriate.

### 5.3 Security

- **URS-5.3.1** Passwords shall be stored using a strong one-way hash (e.g. bcrypt); they shall never be stored or transmitted in plain text.
- **URS-5.3.2** Supplier token links shall be unguessable (e.g. long random tokens) and tied to the specific onboarding/credit application instance.
- **URS-5.3.3** All authenticated sessions shall use secure practices (e.g. HTTP-only cookies, secure in production); session secret shall be configurable and kept confidential.
- **URS-5.3.4** API routes shall enforce authentication and authorization; public APIs shall be limited to defined endpoints (e.g. form submit, get-by-token).

### 5.4 Data Integrity and Backup

- **URS-5.4.1** Critical data (users, suppliers, initiations, onboarding, documents metadata, approvals, audit log) shall be stored in a persistent database with referential integrity.
- **URS-5.4.2** File uploads shall be stored in a designated store with path recorded in the database; backup and retention policies shall be defined operationally.

### 5.5 Usability and Accessibility

- **URS-5.5.1** The user interface shall be consistent and navigable; forms shall provide clear labels, validation messages, and required-field indication.
- **URS-5.5.2** The supplier-facing form shall be usable on common browsers and devices (responsive where implemented); required documents and NDA instructions shall be clearly stated.

### 5.6 Localisation and Compliance (South Africa)

- **URS-5.6.1** The system shall support South African business context: BBBEE, CIPC company registration, tax clearance / letter of good standing, ZAR currency, and local address fields.
- **URS-5.6.2** Document verification and AI checks (when used) shall align with local expectations (e.g. CIPC document authenticity, B-BBEE certificate validity) as documented in validation guides.

---

## 6. Interfaces and Integrations

- **URS-6.1** The application shall integrate with an SMTP server for outbound email; configuration shall be via environment or admin UI.
- **URS-6.2** The application shall use a PostgreSQL database for persistent data; connection and schema shall be configurable.
- **URS-6.3** An optional background worker (Python/Celery or similar) may be used for document processing and reminder scheduling; the main application shall communicate with it via defined APIs (e.g. upload, process, status, results).
- **URS-6.4** Optional integration with Airtable (or similar) for import/sync shall be as designed; webhook or scheduled import may be supported.

---

## 7. Assumptions and Constraints

### 7.1 Assumptions
- Users have valid email addresses and access to email for links and reminders.
- Approvers and reviewers have appropriate authority and training.
- SMTP and database are provisioned and maintained separately.
- Supplier-facing links are shared only with intended recipients; token secrecy is the primary control.
- Business units (e.g. Schauenburg Systems 200, Schauenburg Pty Ltd 300) and document requirements are as configured in the system.

### 7.2 Constraints
- Supplier access is token-based only; no supplier user accounts in the main application.
- Some modules (e.g. Price Benchmarking, Spend Analysis, Demand Forecasting, Lead Time, Delivery Optimization) may be placeholders or partially implemented; requirements above reflect intended scope.
- AI/worker validation is supportive only; final verification and approval remain with authorized users.

---

## 8. Traceability and Approval

### 8.1 Traceability
- Each requirement is uniquely identified (URS-X.Y.Z) for traceability to design, testing (e.g. UAT, IQ/OQ/PQ), and validation documentation.
- Future documents (FS, DS, test cases) should reference these URS IDs.

### 8.2 Approval (To be completed)

| Role           | Name | Signature | Date |
|----------------|------|-----------|------|
| Business Owner |      |           |      |
| Quality / Compliance | |       |      |
| IT / Project  |      |           |      |

---

*End of User Requirements Specification*
