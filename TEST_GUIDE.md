# Procurement Tool - Comprehensive Test Guide

## Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Supplier Initiation Journey](#supplier-initiation-journey)
4. [Supplier Onboarding Form](#supplier-onboarding-form)
5. [Document Management](#document-management)
6. [Approval Workflows](#approval-workflows)
7. [Credit Application Scenarios](#credit-application-scenarios)
8. [Document Revision Workflows](#document-revision-workflows)
9. [UI/UX Testing](#uiux-testing)
10. [Edge Cases and Error Handling](#edge-cases-and-error-handling)
11. [Email Notifications](#email-notifications)

---

## Test Environment Setup

### Prerequisites
- Access to the application (URL: _______________)
- Test user accounts for each role (see User Roles section)
- Sample documents for upload testing (PDF format)
- Email access for notification testing

### Test Data Preparation
- Prepare sample supplier information:
  - Company name, contact person, email, phone
  - Business type, sector, registration number
  - Bank details (for bank confirmation letter)
- Prepare sample documents:
  - Company Registration Certificate (PDF)
  - Bank Confirmation Letter (PDF)
  - B-BBEE Certificate (PDF)
  - Tax Clearance Certificate (PDF)
  - Letter of Good Standing (PDF)
  - NDA document (PDF)
  - Credit Application Form (PDF)

---

## User Roles and Permissions

### Test Users Required
1. **Initiator** - Can initiate supplier requests
2. **Manager** - Can approve/reject initiation requests
3. **Procurement Manager (PM)** - Can approve final supplier submissions
4. **Admin** - Full access to all features

### Test Scenarios

#### TC-001: Role-Based Access Control
**Objective**: Verify users can only access features appropriate to their role

**Steps**:
1. Log in as Initiator
2. Verify you can see "Supplier Initiations" menu
3. Verify you CANNOT see "Supplier Submissions" (admin only)
4. Log out
5. Log in as Procurement Manager
6. Verify you can see "Approvals" tab with "Final Approvals"
7. Verify you can see "Supplier Submissions"
8. Log out
9. Log in as Admin
10. Verify you have access to all menus and features

**Expected Results**:
- Each role sees only appropriate menu items
- Unauthorized actions show error messages
- Navigation is intuitive for each role

---

## Supplier Initiation Journey

### TC-002: Create New Supplier Initiation (Regular Purchase)
**Objective**: Test the complete supplier initiation process for a regular purchase

**Steps**:
1. Log in as Initiator
2. Navigate to "Supplier Initiations" → "New Initiation"
3. Fill in all required fields:
   - Business Unit: Select from dropdown
   - Supplier Name: "Test Supplier ABC"
   - Supplier Email: "test@supplierabc.com"
   - Supplier Contact Person: "John Doe"
   - Product/Service Category: Select or add new
   - Purchase Type: **REGULAR**
   - Credit Application: **Unchecked**
   - Annual Purchase Value: Enter amount
   - Onboarding Reason: Enter reason
4. Check "I have read and understood the process"
5. Check "Due diligence completed"
6. Check "No relationship declaration"
7. Click "Submit Initiation Request"

**Expected Results**:
- Success message displayed
- Initiation appears in "My Initiations" list
- Status shows as "SUBMITTED"
- Email sent to Manager for approval
- Email sent to Procurement Manager for approval

### TC-003: Create Supplier Initiation (Once-Off Purchase)
**Objective**: Test initiation for once-off purchase type

**Steps**:
1. Follow TC-002 steps but select:
   - Purchase Type: **ONCE_OFF**
   - Credit Application: **Unchecked**

**Expected Results**:
- Same as TC-002
- Only Company Registration and Bank Confirmation are required (no B-BBEE, Tax Clearance, or NDA)

### TC-004: Create Supplier Initiation (Shared IP Purchase)
**Objective**: Test initiation for shared IP purchase type

**Steps**:
1. Follow TC-002 steps but select:
   - Purchase Type: **SHARED_IP**
   - Credit Application: **Unchecked**

**Expected Results**:
- Same as TC-002
- All documents required including NDA

### TC-005: Create Supplier Initiation with Credit Application
**Objective**: Test initiation with credit application requirement

**Steps**:
1. Follow TC-002 steps but:
   - Purchase Type: **REGULAR** or **SHARED_IP**
   - Credit Application: **Checked**
   - Credit Application Reason: Leave blank (not required when checked)

**Expected Results**:
- Credit Application becomes a mandatory document
- Credit Application field appears in supplier form
- PM must upload signed credit application before final approval

### TC-006: Manager Approval of Initiation
**Objective**: Test manager approval workflow

**Steps**:
1. Log in as Manager
2. Navigate to "Approvals" → "Initiations" tab
3. Find the initiation created in TC-002
4. Review initiation details
5. Click "Approve" or "Reject"
6. If rejecting, enter rejection reason
7. Click "Confirm"

**Expected Results**:
- Status updates to "MANAGER_APPROVED" or "REJECTED"
- If rejected, initiator receives email notification
- If approved, Procurement Manager receives notification
- Timeline shows approval action

### TC-007: Procurement Manager Approval of Initiation
**Objective**: Test PM approval workflow

**Steps**:
1. After Manager approval (TC-006), log in as Procurement Manager
2. Navigate to "Approvals" → "Initiations" tab
3. Find the initiation
4. Review details
5. Click "Approve" or "Reject"
6. If rejecting, enter rejection reason
7. Click "Confirm"

**Expected Results**:
- Status updates to "PROCUREMENT_APPROVED" or "REJECTED"
- If both approvals complete, supplier record is created
- Supplier receives onboarding email with form link
- Status changes to "APPROVED" and "SUPPLIER_EMAILED"

---

## Supplier Onboarding Form

### TC-008: Complete Supplier Onboarding Form (Regular Purchase)
**Objective**: Test supplier form submission

**Steps**:
1. Open the onboarding email link (or navigate to form)
2. Fill in all required fields:
   - Company Name
   - Contact Person
   - Email, Phone
   - Business Type
   - Registration Number
   - VAT Number
   - Physical Address
   - Bank Details (Bank, Account Type, Account Number)
3. Upload required documents:
   - Company Registration Certificate
   - Bank Confirmation Letter
   - B-BBEE Certificate
   - Tax Clearance Certificate OR Letter of Good Standing
4. Verify only mandatory documents show with asterisk (*)
5. Click "Submit"

**Expected Results**:
- Form validates all required fields
- Only mandatory documents marked with *
- Success message displayed
- Supplier appears in "Supplier Submissions" list
- Status shows as "UNDER_REVIEW"
- Documents are uploaded and visible

### TC-009: Complete Supplier Onboarding Form (Once-Off Purchase)
**Objective**: Test form for once-off purchase

**Steps**:
1. Follow TC-008 but for once-off purchase type
2. Verify only Company Registration and Bank Confirmation are mandatory
3. Verify B-BBEE, Tax Clearance, and NDA are NOT shown

**Expected Results**:
- Only 2 mandatory documents required
- Form accepts submission with only these documents

### TC-010: Complete Supplier Onboarding Form (Shared IP Purchase)
**Objective**: Test form for shared IP purchase

**Steps**:
1. Follow TC-008 but for shared IP purchase type
2. Verify NDA is shown and mandatory
3. Upload all documents including NDA

**Expected Results**:
- NDA is mandatory and marked with *
- Form requires all documents including NDA

### TC-011: Complete Supplier Onboarding Form with Credit Application
**Objective**: Test form when credit application is required

**Steps**:
1. Follow TC-008 but for initiation with credit application checked
2. Verify Credit Application field appears
3. Upload Credit Application document
4. Verify it's marked as mandatory with *

**Expected Results**:
- Credit Application field visible
- Credit Application is mandatory
- Form requires credit application upload

### TC-012: Custom Product/Service Category
**Objective**: Test adding custom categories

**Steps**:
1. As Initiator, create new initiation
2. In Product/Service Category field, type a new category name
3. Select "Add new: [category name]"
4. Submit initiation
5. Later, as Supplier, verify the custom category appears in the form

**Expected Results**:
- Custom category is saved
- Category appears in dropdown for future use
- Supplier form shows the custom category

### TC-013: Custom Bank and Account Type
**Objective**: Test adding custom banks and account types

**Steps**:
1. As Supplier, fill onboarding form
2. In Bank field, type a new bank name
3. Select "Add new: [bank name]"
4. In Account Type field, type a new account type
5. Select "Add new: [account type]"
6. Submit form

**Expected Results**:
- Custom bank and account type are saved
- Options appear in dropdowns for future use

---

## Document Management

### TC-014: Document Upload and Display
**Objective**: Test document upload functionality

**Steps**:
1. As Supplier, upload documents in onboarding form
2. Verify documents appear in the upload list
3. Verify file names are displayed correctly
4. Verify file sizes are shown
5. Test uploading multiple files for same document type

**Expected Results**:
- Documents upload successfully
- File names and sizes displayed correctly
- Multiple files can be uploaded per document type
- Upload progress indicators work

### TC-015: Document Download
**Objective**: Test document download functionality

**Steps**:
1. As Admin/PM, navigate to supplier submission
2. Go to "Documents" tab
3. Click download icon for a document
4. Verify file downloads correctly
5. Open downloaded file and verify content

**Expected Results**:
- Documents download successfully
- File names are preserved
- File content is correct
- PDF files open correctly

### TC-016: Document Versioning
**Objective**: Test document version management

**Steps**:
1. As Supplier, submit initial documents
2. As Admin, request revision
3. As Supplier, upload new versions of documents
4. As Admin, verify all versions are visible
5. Verify versions are sorted correctly (newest first)
6. Verify older versions are greyed out
7. Verify "Current" badge on latest version

**Expected Results**:
- All document versions are visible
- Versions sorted chronologically (newest first)
- Older versions visually distinct (greyed out)
- Current version clearly marked
- Previous versions marked as "Previous"

---

## Approval Workflows

### TC-017: Document Verification by Initiator
**Objective**: Test document verification process

**Steps**:
1. As Initiator, navigate to supplier submission
2. Go to "Documents" tab
3. Review each uploaded document
4. Check "Verified" checkbox for each mandatory document
5. Verify verification status is saved
6. Verify verified documents show checkmark

**Expected Results**:
- Verification checkboxes work correctly
- Status persists after page refresh
- Verified documents show visual indicator
- Verification can be toggled on/off

### TC-018: Request Final Approval (All Documents Verified)
**Objective**: Test final approval request when all mandatory documents are verified

**Steps**:
1. As Initiator, verify all mandatory documents (TC-017)
2. Navigate to "Actions" tab
3. Verify "Request Final Approval" button is enabled
4. Click "Request Final Approval"
5. Confirm in dialog
6. Verify status changes to "AWAITING_FINAL_APPROVAL"
7. Verify email sent to Procurement Manager

**Expected Results**:
- Button enabled when all mandatory documents verified
- Status updates correctly
- Email sent to PM with supplier details
- PM sees supplier in "Final Approvals" tab

### TC-019: Request Final Approval (Missing Verified Documents)
**Objective**: Test that final approval cannot be requested without verifying all mandatory documents

**Steps**:
1. As Initiator, verify only some mandatory documents
2. Navigate to "Actions" tab
3. Verify "Request Final Approval" button is disabled
4. Verify alert message shows unverified documents
5. Verify list of unverified mandatory documents is displayed

**Expected Results**:
- Button disabled when documents not verified
- Clear alert message displayed
- List of unverified documents shown
- User cannot proceed without verifying all

### TC-020: PM Final Approval (Without Credit Application)
**Objective**: Test PM approval when credit application not required

**Steps**:
1. As PM, navigate to "Approvals" → "Final Approvals" tab
2. Find supplier awaiting final approval
3. Click "Review & Approve"
4. Review supplier details and documents
5. Navigate to "Actions" tab
6. Click "Approve Supplier"
7. Confirm in dialog
8. Verify status changes to "APPROVED"
9. Verify emails sent to supplier and initiator

**Expected Results**:
- Supplier approved successfully
- Status updates to "APPROVED"
- Email sent to supplier with approval notification
- Email sent to initiator with "proceed with purchasing" message
- Supplier visible to all users
- Supplier sorted alphabetically in list

### TC-021: PM Final Approval (With Credit Application)
**Objective**: Test PM approval when credit application is required

**Steps**:
1. As PM, navigate to supplier with credit application required
2. Verify credit application document is visible and downloadable
3. Download credit application
4. Sign the document (manually or digitally)
5. Navigate to "Actions" tab
6. Click "Approve Supplier"
7. In approval dialog, verify file upload field for signed credit application
8. Upload signed credit application (PDF)
9. Click "Confirm Approval"
10. Verify approval succeeds
11. Verify signed document included in approval email to supplier

**Expected Results**:
- File upload field visible when credit application required
- Only PDF files accepted
- Approval disabled until signed document uploaded
- Signed document included in supplier approval email
- Download link works in email

### TC-022: PM Cannot Approve Without Signed Credit Application
**Objective**: Test that PM cannot approve without uploading signed credit application

**Steps**:
1. As PM, navigate to supplier with credit application required
2. Navigate to "Actions" tab
3. Click "Approve Supplier"
4. Try to approve without uploading signed document
5. Verify error message
6. Upload signed document
7. Verify approval now works

**Expected Results**:
- Approval button disabled or shows error without signed document
- Clear error message displayed
- Approval works after uploading signed document

---

## Credit Application Scenarios

### TC-023: Credit Application Upload by Supplier
**Objective**: Test credit application upload in supplier form

**Steps**:
1. As Supplier, complete onboarding form with credit application required
2. Verify Credit Application field appears
3. Upload Credit Application document (PDF)
4. Submit form
5. Verify document appears in submissions

**Expected Results**:
- Credit Application field visible when required
- Document uploads successfully
- Document visible to PM for review

### TC-024: Credit Application Download by PM
**Objective**: Test PM can download credit application

**Steps**:
1. As PM, navigate to supplier with credit application
2. Go to "Documents" tab
3. Find Credit Application document
4. Click download
5. Verify document downloads correctly

**Expected Results**:
- Download works correctly
- File name preserved
- Document content correct

### TC-025: Signed Credit Application Upload by PM
**Objective**: Test PM uploads signed credit application

**Steps**:
1. As PM, download credit application (TC-024)
2. Sign the document
3. Navigate to supplier "Actions" tab
4. Click "Approve Supplier"
5. Upload signed credit application in dialog
6. Verify upload succeeds
7. Verify document appears in supplier's documents

**Expected Results**:
- Upload succeeds
- Only PDF files accepted
- Document stored correctly
- Document accessible to supplier

---

## Document Revision Workflows

### TC-026: Request Revision - Missing Documents
**Objective**: Test revision request for missing documents

**Steps**:
1. As Admin/Initiator, navigate to supplier submission
2. Go to "Documents" tab
3. Verify some mandatory documents are missing
4. Go to "Actions" tab
5. Click "Request Revision - Missing Documents"
6. Review pre-filled email template
7. Verify missing documents listed in email
8. Edit email if needed
9. Click "Send Revision Request"
10. Verify email sent to supplier
11. Verify revision count increments
12. Verify status updates

**Expected Results**:
- Button visible when documents missing
- Email template pre-filled with missing documents
- Email sent successfully
- Revision count increments
- Supplier receives email with missing documents list

### TC-027: Request Revision - Incorrect Documents
**Objective**: Test revision request for incorrect documents

**Steps**:
1. As Admin/Initiator, navigate to supplier submission
2. Go to "Documents" tab
3. Check "Incorrect" checkbox for documents that are wrong
4. Go to "Actions" tab
5. Verify "Request Revision - Incorrect Documents" button appears
6. Click button
7. Review pre-filled email template for incorrect documents
8. Edit email if needed
9. Click "Send Revision Request"
10. Verify email sent
11. Verify incorrect documents marked in system

**Expected Results**:
- "Incorrect" checkbox works
- Button appears when documents marked incorrect
- Email template lists incorrect documents
- Email sent successfully
- Incorrect status persists

### TC-028: Request Revision - General (No Missing/Incorrect)
**Objective**: Test general revision request

**Steps**:
1. As Admin/Initiator, navigate to supplier submission
2. Verify all documents present and none marked incorrect
3. Go to "Actions" tab
4. Verify "Request Revision" button appears (general)
5. Click button
6. Draft custom email message
7. Send revision request
8. Verify email sent

**Expected Results**:
- General revision button visible when no missing/incorrect
- Custom email can be drafted
- Email sent successfully

### TC-029: Supplier Submits Revised Documents
**Objective**: Test supplier submits new document versions

**Steps**:
1. After revision request (TC-026, TC-027, or TC-028)
2. As Supplier, open revision email link
3. Upload new/revised documents
4. Submit form
5. Verify new version created
6. Verify previous versions still visible
7. Verify version number increments

**Expected Results**:
- New documents upload successfully
- Version number increments correctly
- Previous versions remain visible
- Versions sorted correctly (newest first)

---

## UI/UX Testing

### TC-030: Dark Theme Support
**Objective**: Test dark theme functionality

**Steps**:
1. Enable dark theme in browser/system
2. Navigate through all pages:
   - Dashboard
   - Supplier Initiations
   - Supplier Submissions
   - Approvals
   - Settings
3. Verify all text is readable
4. Verify all backgrounds are appropriate
5. Verify buttons and interactive elements visible
6. Verify cards and containers have proper contrast
7. Verify tables are readable
8. Verify forms are usable

**Expected Results**:
- All text readable in dark theme
- No grey-on-grey text issues
- All UI elements visible and usable
- Proper contrast throughout
- Consistent theme application

### TC-031: Responsive Design
**Objective**: Test application on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on laptop (1366x768)
3. Test on tablet (768x1024)
4. Test on mobile (375x667)
5. Verify layouts adapt correctly
6. Verify all features accessible
7. Verify forms usable on mobile

**Expected Results**:
- Layouts adapt to screen size
- All features accessible on all devices
- Forms usable on mobile
- Navigation works on all sizes
- Tables scrollable on mobile

### TC-032: Navigation and Breadcrumbs
**Objective**: Test navigation throughout application

**Steps**:
1. Navigate through all main sections
2. Verify sidebar navigation works
3. Verify breadcrumbs appear where applicable
4. Verify back buttons work
5. Verify deep linking works (direct URLs)
6. Verify browser back/forward buttons work

**Expected Results**:
- Navigation intuitive and consistent
- Breadcrumbs show current location
- Back buttons work correctly
- Direct URLs load correctly
- Browser navigation works

---

## Edge Cases and Error Handling

### TC-033: Duplicate Supplier Code Prevention
**Objective**: Test race condition handling for supplier codes

**Steps**:
1. Simultaneously submit two supplier initiations (use two browsers/tabs)
2. Verify both get unique supplier codes
3. Verify no duplicate code errors
4. Verify codes are sequential

**Expected Results**:
- No duplicate supplier codes
- Codes generated sequentially
- No database constraint errors
- System handles concurrent requests

### TC-034: Large File Upload
**Objective**: Test handling of large document files

**Steps**:
1. Try uploading a very large PDF (e.g., 50MB+)
2. Verify appropriate error or handling
3. Upload normal-sized files (1-5MB)
4. Verify uploads work correctly

**Expected Results**:
- Large files handled appropriately (error or success)
- Normal files upload successfully
- Clear error messages if file too large

### TC-035: Invalid File Types
**Objective**: Test file type validation

**Steps**:
1. Try uploading non-PDF files (e.g., .docx, .jpg, .txt)
2. Verify appropriate error message
3. Upload valid PDF files
4. Verify uploads work

**Expected Results**:
- Invalid file types rejected
- Clear error messages displayed
- Valid PDFs accepted
- File type validation works

### TC-036: Network Error Handling
**Objective**: Test behavior during network issues

**Steps**:
1. Start a form submission
2. Simulate network disconnection (disable network)
3. Try to submit
4. Verify error handling
5. Re-enable network
6. Retry submission

**Expected Results**:
- Appropriate error messages
- Data not lost (if possible)
- Retry mechanism works
- User informed of issues

### TC-037: Concurrent Document Verification
**Objective**: Test multiple users verifying documents simultaneously

**Steps**:
1. As Initiator 1, start verifying documents
2. As Initiator 2 (or Admin), simultaneously verify same documents
3. Verify both can verify independently
4. Verify status updates correctly for both

**Expected Results**:
- No conflicts in verification
- Status updates correctly
- Both users see current state
- No data loss

### TC-038: Supplier Deletion
**Objective**: Test supplier deletion functionality

**Steps**:
1. As Admin/PM, navigate to supplier submission
2. Click "Delete Supplier"
3. Confirm deletion
4. Verify supplier removed from list
5. Verify related initiation also removed (if applicable)
6. Verify documents deleted

**Expected Results**:
- Deletion works correctly
- Confirmation dialog appears
- Supplier removed from all lists
- Related records cleaned up
- No orphaned data

### TC-039: Initiation Deletion
**Objective**: Test initiation deletion

**Steps**:
1. As Admin/PM, navigate to initiations list
2. Find an initiation that hasn't been submitted by supplier
3. Click "Delete"
4. Confirm deletion
5. Verify initiation removed
6. Try to delete initiation where supplier has submitted form
7. Verify appropriate error message

**Expected Results**:
- Deletable initiations can be deleted
- Non-deletable initiations show error
- Clear error messages
- Related records cleaned up

---

## Email Notifications

### TC-040: Initiation Submission Email
**Objective**: Test email sent when initiation submitted

**Steps**:
1. Submit new initiation (TC-002)
2. Check Manager's email
3. Check Procurement Manager's email
4. Verify email content correct
5. Verify links in email work
6. Verify email formatting

**Expected Results**:
- Emails sent to both approvers
- Email content accurate
- Links work correctly
- Professional formatting

### TC-041: Approval/Rejection Emails
**Objective**: Test approval and rejection emails

**Steps**:
1. Approve/reject initiation (TC-006, TC-007)
2. Check initiator's email
3. Verify email content
4. Verify status updates in email
5. Test rejection email with reason

**Expected Results**:
- Emails sent correctly
- Content accurate
- Rejection reasons included
- Links work

### TC-042: Supplier Onboarding Email
**Objective**: Test email sent to supplier after approvals

**Steps**:
1. Complete approval process (TC-007)
2. Check supplier's email
3. Verify onboarding link works
4. Verify email content
5. Click link and verify form loads

**Expected Results**:
- Email sent to supplier
- Link works correctly
- Form loads with correct data
- Email content clear and professional

### TC-043: Revision Request Email
**Objective**: Test revision request emails

**Steps**:
1. Request revision (TC-026, TC-027, TC-028)
2. Check supplier's email
3. Verify email content
4. Verify missing/incorrect documents listed
5. Verify links work

**Expected Results**:
- Email sent to supplier
- Content accurate
- Documents listed correctly
- Links functional

### TC-044: Final Approval Request Email
**Objective**: Test email sent to PM for final approval

**Steps**:
1. Request final approval (TC-018)
2. Check PM's email
3. Verify supplier details in email
4. Verify credit application download link (if applicable)
5. Verify link to supplier page works

**Expected Results**:
- Email sent to PM
- All supplier details included
- Credit application link works (if applicable)
- Link to supplier page functional

### TC-045: Supplier Approval Email
**Objective**: Test email sent to supplier upon final approval

**Steps**:
1. Approve supplier (TC-020, TC-021)
2. Check supplier's email
3. Verify approval notification
4. Verify signed credit application download link (if applicable)
5. Verify email content

**Expected Results**:
- Email sent to supplier
- Approval message clear
- Signed credit application link works (if applicable)
- Professional formatting

### TC-046: Initiator Approval Notification Email
**Objective**: Test email sent to initiator upon supplier approval

**Steps**:
1. Approve supplier (TC-020, TC-021)
2. Check initiator's email
3. Verify "proceed with purchasing" message
4. Verify supplier details
5. Verify link to supplier page

**Expected Results**:
- Email sent to initiator
- "Proceed with purchasing" message clear
- Supplier details included
- Link works correctly

### TC-047: Email Failure Handling
**Objective**: Test behavior when email sending fails

**Steps**:
1. Configure invalid SMTP settings (temporarily)
2. Perform action that triggers email (e.g., approval)
3. Verify error handling
4. Verify status still updates
5. Verify "Resend Email" button appears
6. Fix SMTP settings
7. Use "Resend Email" button
8. Verify email sent

**Expected Results**:
- Error handled gracefully
- Status updates even if email fails
- "Resend Email" button visible
- Resend functionality works
- User informed of email status

---

## Test Checklist Summary

### Critical Paths (Must Test)
- [ ] TC-002: Regular purchase initiation
- [ ] TC-008: Supplier form submission
- [ ] TC-017: Document verification
- [ ] TC-018: Request final approval
- [ ] TC-020: PM final approval
- [ ] TC-021: PM approval with credit application

### Purchase Types (Must Test)
- [ ] TC-003: Once-off purchase
- [ ] TC-004: Shared IP purchase
- [ ] TC-009: Once-off form
- [ ] TC-010: Shared IP form

### Credit Application (Must Test)
- [ ] TC-005: Initiation with credit application
- [ ] TC-011: Form with credit application
- [ ] TC-021: PM approval with credit application
- [ ] TC-022: PM cannot approve without signed document

### Document Management (Should Test)
- [ ] TC-014: Document upload
- [ ] TC-015: Document download
- [ ] TC-016: Document versioning
- [ ] TC-026: Revision - missing documents
- [ ] TC-027: Revision - incorrect documents

### UI/UX (Should Test)
- [ ] TC-030: Dark theme
- [ ] TC-031: Responsive design
- [ ] TC-032: Navigation

### Edge Cases (Nice to Test)
- [ ] TC-033: Duplicate code prevention
- [ ] TC-034: Large file upload
- [ ] TC-035: Invalid file types
- [ ] TC-038: Supplier deletion
- [ ] TC-039: Initiation deletion

### Email Notifications (Should Test)
- [ ] TC-040: Initiation submission email
- [ ] TC-044: Final approval request email
- [ ] TC-045: Supplier approval email
- [ ] TC-046: Initiator notification email
- [ ] TC-047: Email failure handling

---

## Test Execution Notes

### Test Data Management
- Use consistent test data across team
- Document any test data created
- Clean up test data after session (optional)

### Bug Reporting Template
When reporting bugs, include:
1. **Test Case ID**: (e.g., TC-018)
2. **Severity**: Critical / High / Medium / Low
3. **Steps to Reproduce**: Detailed steps
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happened
6. **Screenshots**: If applicable
7. **Browser/Device**: Chrome, Edge, Mobile, etc.
8. **User Role**: Initiator, PM, Admin, etc.

### Test Session Schedule
- **Session 1**: Critical paths (2 hours)
- **Session 2**: Purchase types and credit application (2 hours)
- **Session 3**: Document management and revisions (1.5 hours)
- **Session 4**: UI/UX and edge cases (1.5 hours)
- **Session 5**: Email notifications and final review (1 hour)

---

## Post-Testing

### Test Results Summary
After testing, compile:
- Total test cases executed
- Passed test cases
- Failed test cases
- Blocked test cases
- Bugs found (with severity)
- Recommendations

### Sign-off
- [ ] All critical paths tested
- [ ] All high-priority bugs fixed
- [ ] User acceptance criteria met
- [ ] Ready for production deployment

---

**Last Updated**: [Date]
**Version**: 1.0
**Prepared By**: [Your Name]

