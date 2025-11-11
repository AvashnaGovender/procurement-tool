# Document Verification and Missing Documents Feature

## Overview
This feature suite provides buyers/reviewers with comprehensive document review capabilities during the supplier onboarding process:
1. Mark documents as "Verified" to track review progress
2. Automatic detection of missing compulsory documents
3. Quick access to request document revisions

## Implementation Details

### Database Schema
- Added a new `DocumentVerification` model in `prisma/schema.prisma`
- Tracks verification status by:
  - Supplier ID
  - Document version number
  - Document category (e.g., "companyRegistration", "nda")
  - File name
- Stores verification metadata:
  - `isVerified`: Boolean flag
  - `verifiedAt`: Timestamp when verified
  - `verifiedBy`: User ID who verified the document
  - `verificationNotes`: Optional notes (for future use)

### API Endpoints
Created `/api/suppliers/documents/verify/route.ts` with two endpoints:

1. **POST** - Toggle verification status
   - Request body: `{ supplierId, version, category, fileName, isVerified }`
   - Creates or updates verification record
   - Returns updated verification status

2. **GET** - Fetch all verifications for a supplier
   - Query param: `supplierId`
   - Returns a map of verification statuses keyed by `{version}-{category}-{fileName}`

### UI Updates
Modified `/app/admin/supplier-submissions/[supplierId]/page.tsx`:

#### 1. Document Verification Checkboxes
- Added a checkbox labeled "Verified" next to each document in the Documents tab
- Checkbox state is persisted to the database
- Visual indicators:
  - Checkbox shows verification status
  - Green "Verified" badge appears next to verified documents
  - Works across all document versions

#### 2. Missing Compulsory Documents Alert
- Automatic detection of 5 mandatory documents:
  1. Non-Disclosure Agreement (NDA)
  2. Company Registration (CIPC Documents)
  3. Tax Clearance Certificate OR Letter of Good Standing (either acceptable)
  4. Bank Confirmation Letter
  5. B-BBEE Certificate
- **Red alert** displayed when documents are missing
- **Green success alert** when all documents are present
- Each missing document shown with distinctive icon

#### 3. Quick Revision Request Button
- "Request Revision - Missing Documents" button appears below the missing documents alert
- Same functionality as the button in the Actions tab
- Opens the revision dialog pre-filled with context about missing documents
- Disabled if supplier is already APPROVED or REJECTED

## User Experience

### For Buyers/Reviewers:

#### Workflow in Documents Tab:
1. Navigate to the supplier detail page
2. Go to the "Documents" tab

#### Step 1: Check for Missing Documents
- At the top of the tab, you'll see either:
  - **Red Alert**: Lists all missing compulsory documents with icons
  - **Green Success**: Confirms all 5 mandatory documents are present
- If documents are missing:
  - Click "Request Revision - Missing Documents" button
  - Add specific notes about what's needed
  - System sends email to supplier with your feedback

#### Step 2: Review Each Document
3. For each document version, you'll see:
   - File name and type
   - Preview button (for PDFs/images)
   - **Verification checkbox** labeled "Verified"
4. Click Preview to review the document
5. Check the "Verified" checkbox after completing review
6. A green "Verified" badge appears next to verified documents
7. Verification status persists across sessions and revisions

### Benefits:
- **Immediate Feedback**: Know instantly if critical documents are missing
- **Streamlined Workflow**: Request revisions directly from the Documents tab
- **Track Progress**: Easily see which documents have been reviewed
- **Multiple Revisions**: Distinguish between checked and unchecked versions across document revisions
- **Team Collaboration**: Multiple reviewers can see what's already been verified
- **Audit Trail**: System tracks who verified each document and when
- **Smart Detection**: Accepts either Tax Clearance OR Good Standing certificate

## Technical Notes

- Verification status is independent for each file version
- If a supplier uploads a new version of a document, the verification status starts fresh
- The system automatically handles concurrent updates
- No impact on existing approval workflows
- **Cross-Version Document Checking**: The system now checks for mandatory documents across ALL versions, not just the latest one. This is because when suppliers submit revisions, they only upload the missing documents, so previously uploaded documents remain valid.

## Future Enhancements

Potential improvements that could be added:
- Bulk verification (verify all documents at once)
- Verification notes field (add comments per document)
- Verification history (see who verified and when in the UI)
- Required verification count (e.g., "5 of 10 documents verified")
- Email notifications when all documents are verified

