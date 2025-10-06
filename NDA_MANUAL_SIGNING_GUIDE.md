# Manual NDA Signing Guide

## 📋 Overview

The supplier onboarding form now includes a **manual NDA signing process** where suppliers download your NDA template, sign it physically, and upload the signed version.

## ✅ What's Configured

### 1. **NDA Template Location**
- **Path**: `public/templates/standard-nda.pdf`
- **Size**: 231 KB
- **Status**: ✅ In place and ready to use

### 2. **Form Integration**
- **Location**: Supplier Onboarding Form (Section 9: Required Documents)
- **Field Name**: "Non-Disclosure Agreement (NDA) - Signed *"
- **Status**: Required field with download button

## 🔄 How It Works

### For Suppliers:

1. **Access Form**
   - Navigate to `/supplier-onboarding-form`
   - Fill in company information

2. **Download NDA**
   - Scroll to "Required Documents" section
   - See blue alert box with NDA instructions
   - Click "Download NDA" button
   - PDF opens in new tab

3. **Sign NDA**
   - Print the downloaded NDA
   - Sign manually (wet signature)
   - Initial pages if required
   - Date the signature

4. **Upload Signed Copy**
   - Scan or photograph the signed document
   - Upload as PDF or image file
   - Submit the form

### For Procurement Team:

1. **Review Submissions**
   - Go to `/admin/supplier-submissions`
   - Review supplier applications

2. **Verify NDA**
   - Check that NDA is uploaded
   - Verify signature is present
   - Verify date and signer information

3. **Approve/Request Revision**
   - If acceptable → Approve supplier
   - If issues → Request revision with notes

## 📝 Form Field Details

### Location in Form:
```
Section 9: Required Documents
Field: "Non-Disclosure Agreement (NDA) - Signed *"
```

### UI Elements:
- **Blue Alert Box**: Shows instructions
- **Download Button**: Opens PDF in new tab
- **File Upload**: Accepts PDF, DOC, DOCX, JPG, PNG
- **Required**: ✅ Yes - form won't submit without it

### What Suppliers See:
```
╔════════════════════════════════════════════════════╗
║ 📄 Please download our standard NDA template      ║
║                                                    ║
║ Download → Sign manually → Upload signed version  ║
║                                          [Download NDA] ║
╚════════════════════════════════════════════════════╝

[Choose Files] No file chosen

Upload: ___________________________________________
```

## 🔧 Customization Options

### Update NDA Template

1. Create/edit your NDA in Word/Google Docs
2. Export as PDF
3. Replace file at: `public/templates/standard-nda.pdf`
4. No code changes needed!

### Change NDA to Optional

Edit `app/supplier-onboarding-form/page.tsx`:

```typescript
// Line 922: Change from
{ key: 'nda', label: 'Non-Disclosure Agreement (NDA) - Signed *', required: true },

// To
{ key: 'nda', label: 'Non-Disclosure Agreement (NDA) - Signed', required: false },
```

### Customize Alert Message

Edit `app/supplier-onboarding-form/page.tsx`, find the NDA alert box (lines 936-956):

```typescript
<p className="text-sm font-medium text-blue-900 mb-1">
  Your custom message here
</p>
<p className="text-xs text-blue-700">
  Your custom instructions here
</p>
```

### Change Button Text

```typescript
<Button...>
  <Upload className="h-4 w-4 mr-2" />
  Your Custom Text
</Button>
```

## 📂 File Storage

### Uploaded Files Location:
```
data/uploads/suppliers/[SUPPLIER_CODE]/v[VERSION]/nda/
```

### File Naming:
- Format: `[timestamp]-[original-filename].pdf`
- Example: `1759745897946-signed-nda-company-xyz.pdf`

### File Handling:
- Multiple files supported
- Accepts: PDF, DOC, DOCX, JPG, PNG
- Max size: Configured in Next.js (default: 4MB per file)

## 🧪 Testing

### Test the Download:
1. Navigate to: `http://localhost:3001/supplier-onboarding-form`
2. Scroll to "Required Documents"
3. Find NDA section
4. Click "Download NDA"
5. Verify PDF opens correctly

### Test the Upload:
1. Download the NDA template
2. Create a test signed copy (or use any PDF)
3. Upload via the form
4. Check file appears in file list
5. Submit form
6. Verify file saved in `data/uploads/suppliers/`

## 📋 Supplier Requirements

### What Suppliers Need:
- ✅ Ability to view PDF files
- ✅ Printer (for physical signing)
- ✅ Scanner or phone camera (to digitize)
- ✅ Basic computer literacy

### Alternative for Digital-Only:
If suppliers don't have printers:
- They can sign on a tablet/touchscreen
- They can use PDF signing software (DocuSign, Adobe Sign)
- They can use digital drawing apps

## 🔒 Legal Considerations

### Valid Signatures:
- **Wet signatures** (pen on paper) - ✅ Most legally binding
- **Digital signatures** (from PDF tools) - ✅ Usually acceptable
- **Electronic signatures** (typed name) - ⚠️ Check with legal team

### Best Practices:
1. **Date the signature**: Ensure NDA includes date field
2. **Witness if needed**: Add witness line if required
3. **Company stamp**: Add space for company stamp if applicable
4. **Multiple copies**: Suppliers should keep a copy

### Audit Trail:
- Upload timestamp recorded automatically
- File stored with version history
- Original filename preserved
- Admin can view/download at any time

## 🆘 Troubleshooting

### "Download button not working"
- Check file exists: `public/templates/standard-nda.pdf`
- Check file permissions
- Try opening directly: `http://localhost:3001/templates/standard-nda.pdf`

### "Can't upload signed NDA"
- Check file size (max 4MB default)
- Check file format (PDF, DOC, JPG, PNG only)
- Try different file format
- Compress large PDF files

### "Form submits without NDA"
- Verify `required: true` is set
- Check browser dev console for errors
- Try refreshing the page

### "PDF not opening"
- Check PDF is valid (not corrupted)
- Try opening in different browser
- Re-export from source document

## 📊 Admin View

### Where to See Uploaded NDAs:

1. **Review Dashboard**
   - Navigate to: `/admin/supplier-submissions`
   - Click on a supplier
   - Go to "Documents" tab
   - Find NDA in document list

2. **File System**
   - Location: `data/uploads/suppliers/[SUPPLIER_CODE]/`
   - Open folder in file explorer
   - View PDF directly

3. **Database**
   - Stored in: `SupplierDocument` table
   - Fields: `documentType: 'NDA'`, `filePath`, `fileName`

## ✅ Benefits of This Approach

1. **Simple**: No complex electronic signature system
2. **Reliable**: Works for all suppliers
3. **Legally Sound**: Physical signatures widely accepted
4. **Flexible**: Suppliers can use any signing method
5. **No Dependencies**: No third-party services needed
6. **Cost-Free**: No subscription fees
7. **Full Control**: Your template, your process

## 🚀 Production Checklist

- [ ] Replace template with your company's official NDA
- [ ] Test download functionality
- [ ] Test upload functionality
- [ ] Verify file storage location
- [ ] Test with different file formats
- [ ] Review with legal team
- [ ] Add company branding to template
- [ ] Set appropriate file size limits
- [ ] Configure backup for uploaded files
- [ ] Train procurement team on verification

## 📞 Support

### For Suppliers:
- Email: procurement@yourcompany.com
- Phone: Your support number
- Help text is shown on the form

### For Internal Team:
- Check this guide
- Review `app/supplier-onboarding-form/page.tsx`
- Check file storage at `data/uploads/suppliers/`

---

**Status**: ✅ Ready for Production

Your manual NDA signing process is configured and ready to use!

