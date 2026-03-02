# Procurement & Supplier Management Application  
## User Manual

**Version:** 1.0  
**Last updated:** February 2025

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Navigation and Dashboard](#3-navigation-and-dashboard)
4. [User Roles at a Glance](#4-user-roles-at-a-glance)
5. [Supplier Initiation (Request a New Supplier)](#5-supplier-initiation-request-a-new-supplier)
6. [Supplier Onboarding Workflow](#6-supplier-onboarding-workflow)
7. [Approving Supplier Initiations](#7-approving-supplier-initiations)
8. [Reviewing Supplier Submissions](#8-reviewing-supplier-submissions)
9. [Suppliers List and Search](#9-suppliers-list-and-search)
10. [Settings](#10-settings)
11. [Other Modules](#11-other-modules)
12. [Supplier-Facing Forms](#12-supplier-facing-forms)
13. [Troubleshooting and FAQ](#13-troubleshooting-and-faq)

---

## 1. Introduction

This application supports the full lifecycle of **supplier onboarding** and related procurement activities:

- **Request** a new supplier (Supplier Initiation) and get Manager and Procurement approval  
- **Invite** the supplier to complete the onboarding form and upload documents  
- **Review** submissions, verify documents, request revisions, and approve or reject  
- **Manage** supplier data, requisitions, contracts, and approvals in one place  

Internal users sign in with email and password. Suppliers do **not** log in; they use secure links sent by email to complete the onboarding and credit application forms.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the application URL in your browser (e.g. `https://your-company.com` or `http://localhost:3000`).
2. If you are not signed in, you will be redirected to the **Login** page.
3. Enter your **Email** and **Password**.
4. Click **Sign In**.
5. On success, you will be taken to the **Dashboard** (or to the page you were trying to open, if you had been redirected from a link).

**Notes:**

- Use the email and password provided by your administrator.
- If you see an error (e.g. "Invalid credentials"), check that your account is active and the password is correct. Contact your admin if you cannot log in.
- **Forgot password:** If this option is shown, use it to request a reset. Otherwise, ask your administrator to reset your password.

### 2.2 Logging Out

1. In the left sidebar, click **Logout** at the bottom.
2. You will be signed out and returned to the Login page.

---

## 3. Navigation and Dashboard

### 3.1 Sidebar Navigation

The left sidebar is visible when you are logged in. It contains:

| Item | Description | Who sees it |
|------|-------------|-------------|
| **Dashboard** | Home page with summary and module shortcuts | All users |
| **Analytics** | Analytics (if enabled) | All users (may show “Coming soon”) |
| **Suppliers** | List of all suppliers; link to onboard new ones | All users |
| **Supplier Initiations** | List of initiation requests and their status | All users |
| **PM Approvals** | Queue of initiations waiting for your approval | Managers and Procurement Managers |
| **Supplier Submissions** | List of suppliers for review (detail view) | Not in sidebar; PM/Admin go to `/admin/supplier-submissions` or open a supplier from **Suppliers** |
| **Reports** | Reports (if enabled) | All users (may show “Coming soon”) |
| **Settings** | User and system settings | All users (some sections admin-only) |
| **Logout** | Sign out | All users |

Click any item to go to that section. The current page is highlighted.

### 3.2 Dashboard

The Dashboard shows:

- A welcome message and short summary.
- **Key statistics** (when available), such as total suppliers, active orders, spend, and average lead time.
- **Module cards** that link to main areas:
  - Supplier Onboarding  
  - Purchase Requisition (may be “Coming soon”)  
  - Price Benchmarking, Spend Analysis, Demand Forecasting  
  - Supplier Evaluation, Contract Management  
  - Lead Time Tracking, Delivery Optimization  

Click a card to open that module. Some modules may still be in development and show a “Coming soon” message.

### 3.3 User Menu

In the top-right of the Dashboard (and other pages), you may see your name or a user menu. Use it to access profile or account options if available.

---

## 4. User Roles at a Glance

Your role controls what you can see and do:

| Role | Typical responsibilities |
|------|---------------------------|
| **User** | Create supplier initiations (drafts and submit); view own initiations; use Delegation. |
| **Manager** | Everything a User can do; **approve or reject** supplier initiations for their direct reports (PM Approvals). |
| **Procurement Manager** | Everything a Manager can do; **second-level approval** of initiations; access **Supplier Submissions** to review and approve/reject onboarding. |
| **Procurement Specialist** | Initiate onboarding; review supplier submissions; verify documents; request revisions; approve/reject onboarding. |
| **Admin** | Full access; **User Management**, **Reminder configuration**, **SMTP/Email**; access to **Supplier Submissions** and admin-only pages. |

If you do not see a menu item (e.g. PM Approvals or Supplier Submissions), your role may not have access. Contact your administrator if you need different permissions.

---

## 5. Supplier Initiation (Request a New Supplier)

Supplier Initiation is the process of **requesting** that a new supplier be onboarded. It requires Manager approval and then Procurement Manager approval before the supplier can be invited.

### 5.1 Starting a New Initiation

1. Go to **Dashboard** and click **Supplier Onboarding**, or go to **Suppliers** and use the option to start onboarding.
2. You will see the **Supplier Onboarding** workflow with steps: Initiation → Supplier Response → Review → Complete.
3. Under **Step 1: Initiation**, choose **Start new initiation** (or open an existing draft if you have one).

### 5.2 Filling In the Initiation Form

Complete the form with the following (required fields are marked):

- **Business unit(s)** – e.g. Schauenburg Systems 200, Schauenburg Pty Ltd 300.
- **Checklist** – Confirm that you have read and understood the process and completed due diligence.
- **Supplier details** – Supplier name, email, contact person, product/service category.
- **Your details** – Requester name (often pre-filled from your profile).
- **Relationship declaration** – How your organisation relates to the supplier.
- **Supplier location** – Local or Foreign; if Foreign, select **Currency** (e.g. USD, EUR, GBP).
- **Purchase type** – Regular purchase, once-off, or shared IP; if regular, **Annual purchase value** and whether a **Credit application** is required (and reason).
- **Payment method** – e.g. COD or Account; if COD, provide **COD reason**.
- **Onboarding reason** – Why this supplier is being onboarded.

You can **Save as draft** and return later, or **Submit** when ready.

### 5.3 Submitting the Initiation

1. When the form is complete, click **Submit**.
2. The initiation status will change to **Submitted**. It will then appear in your **Manager’s** approval queue (PM Approvals).
3. After your Manager approves, it will go to **Procurement Manager** for second approval.
4. You can track status on the **Supplier Initiations** page.

### 5.4 Tracking Your Initiations

1. In the sidebar, click **Supplier Initiations**.
2. You will see a list of initiations (yours and/or your team’s, depending on role).
3. Use filters or search to find a specific initiation.
4. Statuses you may see: **Draft**, **Submitted**, **Manager Approved**, **Procurement Approved**, **Approved**, **Rejected**, **Email Sent**, **Supplier Emailed**.
5. Click a row or **View** to see full details and approval history.

**Tip:** As a regular user, you can also use the note on the **Suppliers** page that directs you to **Supplier Initiations** for real-time updates on document submissions and approvals.

---

## 6. Supplier Onboarding Workflow

After an initiation is **fully approved**, a Procurement Specialist or authorised user can **send the onboarding pack** to the supplier and then track the response.

### 6.1 Sending the Onboarding Email

1. Go to **Dashboard** → **Supplier Onboarding** (or **Suppliers** → start onboarding).
2. Ensure the initiation is in a state that allows sending (e.g. **Approved** or **Email Sent**).
3. In the workflow, after the initiation is approved, you will see an option to **Send onboarding email** or **Resend** (if already sent).
4. The system sends an email to the supplier’s address with a **unique link** to the supplier onboarding form. The supplier does not need to log in; they use this link only.

### 6.2 Workflow Steps (Internal View)

The onboarding workflow is shown as four steps:

1. **Initiation** – Checklist and approval (see Section 5).
2. **Supplier Response** – Waiting for the supplier to complete the form and upload documents.
3. **Review** – Procurement/Buyer reviews the submission, verifies documents, and may request revisions or approve.
4. **Complete** – Supplier is approved or rejected; record is updated.

You can use **Back to Dashboard** or **Suppliers** to leave the onboarding flow and return later.

### 6.3 Resending the Onboarding Email

If the supplier did not receive the email or the link expired:

1. Open the relevant initiation or onboarding record (e.g. from **Supplier Initiations** or **Supplier Submissions**).
2. Use **Resend onboarding email** (or equivalent). The system will send the invitation again.

---

## 7. Approving Supplier Initiations

If you are a **Manager** or **Procurement Manager**, you will see **PM Approvals** in the sidebar. Use it to approve or reject supplier initiations.

### 7.1 Opening the Approval Queue

1. Click **PM Approvals** in the sidebar.
2. You will see initiations waiting for your approval (Manager approvals first, then Procurement).

### 7.2 Reviewing an Initiation

1. Click an initiation row or **View** to open the details.
2. Review: business unit, supplier name/email/contact, category, requester, relationship, purchase type, value, credit application, payment method, onboarding reason, and any comments.
3. If you are approving on behalf of someone else (delegation), you may see an indicator that the item is delegated to you.

### 7.3 Approving or Rejecting

1. Choose **Approve** or **Reject**.
2. If **Reject**, enter **Comments** (reason for rejection). The requester may see this.
3. Confirm. The status will update (e.g. **Manager Approved** or **Procurement Approved**, or **Rejected**).
4. If you reject, the initiation stops and the requester can see the rejection (and comments if shown).

**Manager approval** is required first; then **Procurement Manager** approval. Only after both can the onboarding email be sent to the supplier.

### 7.4 Delegation

If you have delegated your approval authority to another user (see Section 10.1), they will see your pending approvals in **PM Approvals** and can approve or reject on your behalf. You can still see initiations in **Supplier Initiations**; delegated items may be marked as delegated.

---

## 8. Reviewing Supplier Submissions

Authorised users (e.g. Procurement Manager, Admin) can review supplier submissions, verify documents, request revisions, and approve or reject onboarding. This is done from **Admin → Supplier Submissions** (or the link shown for your role).

### 8.1 Opening the Submissions List

1. If your role is **Procurement Manager** or **Admin**, open the **Supplier Submissions** list by going to: **`/admin/supplier-submissions`** (you can bookmark this URL). Some deployments may also show a link under Admin or from the Dashboard.
2. You will see a list of suppliers that have been invited or have submitted the onboarding form.
3. Use search and filters to find a supplier. Click a row to open the **supplier detail** page.
4. **Alternative:** From **Suppliers**, click a supplier card or use **View** on a supplier to open the same supplier detail page (if your role has access).

### 8.2 Supplier Detail Page – Tabs

The supplier detail page is organised into **tabs**, for example:

- **Details** – Company name, contact, address, banking, responsible persons, BBBEE, certifications, etc.
- **Documents** – All uploaded documents by category and version; verification checkboxes; missing-documents alert.
- **Actions** – Request revision, approve, reject, assign credit controller, resend approval pack, upload signed credit application, run AI analysis (if enabled).
- **Timeline / History** – Key events (email sent, form submitted, revision requested, approved/rejected).

### 8.3 Verifying Documents

1. Open the **Documents** tab.
2. You will see a list of document categories and files (e.g. NDA, Company Registration, Tax Clearance, Bank Letter, B-BBEE).
3. **Missing compulsory documents** – If any required document is missing, a **red alert** lists them. When all are present, a **green success** message is shown.
4. Next to each document there is a **Verified** checkbox. Check it when you have reviewed that document and accept it. Verification is saved automatically; you can add notes if the system supports it.

### 8.4 Requesting a Revision

If the supplier must correct or add documents:

1. In the **Documents** tab, you can use **Request Revision – Missing Documents** (when compulsory documents are missing) to open the revision dialog with context.
2. Or go to the **Actions** tab and use **Request Revision**.
3. In the dialog, enter **Revision notes** (what the supplier must do) and, if applicable, select which document categories need revision.
4. Submit. The system will send an email to the supplier with your instructions. The onboarding status will reflect that a revision was requested (e.g. **Revision Needed**). When the supplier resubmits, you can review again.

### 8.5 Approving or Rejecting Onboarding

1. When you are satisfied with the submission and documents, go to the **Actions** tab (or the equivalent section).
2. **Approve** – Confirm approval. The supplier status will be set to **Approved** and the process marked complete. Optional: assign **Credit controller** and add completion notes if the system allows.
3. **Reject** – If you reject, provide a **Rejection reason**. The supplier may be notified and the record updated to **Rejected**.

### 8.6 Credit Application (Optional)

If the initiation required a **Credit application**:

- The supplier may receive a separate link to complete a **Credit Application** form and upload a signed copy.
- In the supplier detail page you may see: **Credit controller** assignment, **Credit application form** submission status, and an option to **Upload signed credit application** (e.g. if the supplier sent it by email). Use the **Actions** tab for these.

### 8.7 AI Document Analysis (If Enabled)

If your organisation uses the AI/worker integration:

- In the supplier detail page there may be an option to **Run AI analysis** or **Process documents**.
- The system will analyse uploaded documents (e.g. CIPC, B-BBEE, tax) and show results to assist your review. **You still must verify and approve;** the AI is an aid only.

### 8.8 Resending Approval Pack

If the supplier needs the onboarding email or documents again:

- Use **Resend approval pack** (or similar) from the **Actions** tab. The system will resend the configured email/link.

---

## 9. Suppliers List and Search

### 9.1 Viewing the Suppliers List

1. Click **Suppliers** in the sidebar.
2. You will see a list of all suppliers (subject to role-based access).
3. **Statistics** at the top may show counts by status (e.g. Pending, Approved, Under Review).

### 9.2 Searching and Filtering

- Use the **search** box to find suppliers by name, code, contact, or other searchable fields.
- Use **filters** (e.g. status, category, location) to narrow the list.
- Apply or clear filters as needed.

### 9.3 Opening a Supplier

- Click a supplier row to open the **supplier detail** page (if you have access). **Procurement Managers and Admins** can open the full review screen (Documents, Actions, Approve/Reject) from here; it is the same as the supplier detail page under **Supplier Submissions** (Section 8). To see the full list of submissions, go to **`/admin/supplier-submissions`**.

### 9.4 Starting New Onboarding

- From **Suppliers** or **Dashboard**, use the button or link to **Supplier Onboarding** to start a new initiation (Section 5) or send an onboarding email (Section 6).

---

## 10. Settings

Click **Settings** in the sidebar to access:

- **Delegation** (all users with approval authority)
- **User Management** (Admin only)
- **Reminder configuration** (Admin only)
- **Email / SMTP configuration** (Admin only)

### 10.1 Delegation Management

Delegation allows you to **assign your approval authority** to another user for a period (e.g. when you are on leave).

1. In **Settings**, open **Delegation Management**.
2. **Create a delegation**
   - Click **Create delegation** (or similar).
   - Select the **Delegate** (the user who will act on your behalf).
   - Choose **Delegation type**: e.g. All Approvals, Manager Approvals only, Procurement Approvals only, Requisition or Contract Approvals only.
   - Set **Start date** and **End date**.
   - Optionally add **Reason** and **Notes**.
   - Save. The delegate will receive an email and will see your approval items in **PM Approvals** (or the relevant queue).
3. **View delegations**
   - **Delegations given** – Delegations you created.
   - **Delegations received** – Delegations where you are the delegate.
4. **Deactivate** – You (or an admin) can deactivate an active delegation before the end date if needed.

### 10.2 User Management (Admin Only)

Admins can:

- **List users** – See all users, roles, and status.
- **Create user** – Add a new user (email, name, password, role, department, manager if applicable).
- **Edit user** – Change role, department, name, or deactivate account.
- **Reset password** – Set a new password for a user (process depends on implementation).

Use the **User Management** section under **Settings** and follow the on-screen actions.

### 10.3 Reminder Configuration (Admin Only)

The system can send **automatic reminders** (e.g. to suppliers who have not submitted documents, or to managers with pending approvals).

1. In **Settings**, open **Reminder Configuration**.
2. For each **Reminder type** you can:
   - **Enable or disable** it.
   - Set **First**, **Second**, and **Final** reminder timing (hours after the trigger event).
3. Optionally override **Email subject** and **Body** templates if the system supports it.
4. **Save** each type. Reminders will run according to the configured schedule.

Reminder types typically include: Supplier document submission, Manager approval pending, PM/Buyer review pending, Supplier revision pending.

### 10.4 Email / SMTP Configuration (Admin Only)

To send emails (onboarding invitations, reminders, notifications), the application must use an SMTP server.

1. In **Settings**, open **Email Configuration** / **SMTP**.
2. Enter **SMTP host**, **Port**, **User**, **Password**, and **From** address.
3. Use **Test** (or **Send test email**) to verify that emails are sent successfully.
4. Save. All application emails will use these settings.

---

## 11. Other Modules

The Dashboard may show links to additional modules. Below is a brief overview; availability depends on configuration.

- **Requisitions** – Create and track purchase requisitions; multi-level approval; convert to Purchase Order when supported.
- **Contracts** – Create and manage contracts with suppliers; track dates and renewals.
- **Supplier Evaluation** – Record evaluation scores and performance ratings.
- **Spend Analysis / Demand Forecasting / Lead Time / Delivery** – Reporting and analytics; use the navigation and on-screen help in each module.

If a module shows **Coming soon**, it is not yet available.

---

## 12. Supplier-Facing Forms

Suppliers **do not log in**. They use links sent by email.

### 12.1 Supplier Onboarding Form

1. The supplier receives an email with a link like: `https://your-company.com/supplier-onboarding-form?token=...`
2. They open the link in a browser and complete the **form** (company name, registration number, addresses, contacts, banking, responsible persons, BBBEE, certifications, etc.).
3. They **upload documents** in the required categories (e.g. NDA, Company Registration, Tax Clearance or Letter of Good Standing, Bank Confirmation, B-BBEE Certificate).
4. For the **NDA**, they can **download** your standard NDA template, sign it manually, and **upload** the signed copy (PDF or image).
5. They **submit** the form. Your team will see the submission in **Supplier Submissions** and can review as in Section 8.

**Important:** The link is unique and secret. Suppliers should not share it. If they lose the email, your team can **Resend onboarding email** from the application.

### 12.2 Credit Application Form

If the initiation required a credit application:

1. The supplier may receive a separate email with a link to the **Credit Application** form.
2. They complete the form and, if required, upload a **signed credit application** document.
3. Your team can see the submission and signed document in the supplier detail page (Section 8.6).

---

## 13. Troubleshooting and FAQ

### I cannot log in.

- Confirm your **email** and **password**. Passwords are case-sensitive.
- If your organisation has “Forgot password,” use it; otherwise ask your **administrator** to reset your password or confirm your account is active.

### I don’t see “PM Approvals” or “Supplier Submissions”.

- These are restricted by **role**. **PM Approvals** is for Managers and Procurement Managers. **Supplier Submissions** is typically for Procurement Manager and Admin. Contact your administrator to confirm your role.

### I submitted an initiation but nothing happens.

- The initiation must be **approved by your Manager** first, then by **Procurement Manager**. Ask them to check **PM Approvals** and approve or reject. If rejected, check the comments and correct the initiation or submit a new one.

### The supplier says they didn’t receive the onboarding email.

- Check the supplier’s **email address** in the initiation/onboarding record.
- Use **Resend onboarding email** (or **Resend approval pack**) from the initiation or supplier detail page.
- Ask the supplier to check **spam/junk** and to add your company’s email to their safe senders.

### How do I know which documents are compulsory?

- In the **Documents** tab of the supplier detail page, a **red alert** lists **missing compulsory documents**. Typically: NDA, Company Registration (CIPC), Tax Clearance or Letter of Good Standing, Bank Confirmation Letter, B-BBEE Certificate. When all are present, a **green** message is shown.

### Can I change the reminder schedule?

- Yes, if you are an **Admin**. Go to **Settings** → **Reminder Configuration**, adjust the hours for each reminder type, and save.

### How do I delegate my approvals while I’m away?

- Go to **Settings** → **Delegation Management**, create a new delegation, choose the delegate and dates, and save. The delegate will see your approval items in **PM Approvals** and can act on your behalf.

### Who do I contact for access or technical issues?

- Contact your **system administrator** or **IT support** for: new accounts, role changes, password resets, and application errors. For process or policy questions, contact your **Procurement** or **Compliance** team.

---

*End of User Manual*
