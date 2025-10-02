# 📝 Supplier Onboarding Form Guide

## 🎯 Overview

You now have a **custom HTML supplier onboarding form** that collects all 39 fields plus file uploads, completely replacing the need for Airtable!

---

## 🔗 Form URL

### Development:
```
http://localhost:3000/supplier-onboarding-form
```

### Production:
Once deployed, your form will be at:
```
https://your-domain.com/supplier-onboarding-form
```

---

## ✨ Features

✅ **All 39 Fields** - Captures every piece of information from your original Airtable form  
✅ **File Uploads** - Supports multiple document categories with drag-and-drop  
✅ **Beautiful UI** - Professional, responsive design with your company logo  
✅ **Validation** - Required field checking before submission  
✅ **Auto-Save to Database** - Directly saves to Supabase with all data  
✅ **Document Storage** - Files stored in `data/uploads/suppliers/`  
✅ **Audit Trail** - Creates timeline entries for each submission  

---

## 📋 What Gets Collected

### 1. Basic Information
- Supplier Name
- Contact Person
- Name of Business
- Trading Name
- Company Registration No.

### 2. Address Details
- Physical Address
- Postal Address

### 3. Contact Information
- Contact Number
- E-mail Address

### 4. Business Details
- Nature of Business
- Products and/or Services
- Associated Company Info
- Branch Contact Numbers

### 5. Banking Information
- Bank Account Details
- Branch Information
- Account Numbers

### 6. Responsible Persons
- Banking Contact
- Quality Management Contact
- SHE (Safety, Health & Environment) Contact
- BBBEE Contact

### 7. BBBEE & Employment
- BBBEE Status
- Number of Employees
- Associated Company Branch Name

### 8. Certifications
- Quality Management Certification
- SHE Certification

### 9. Document Uploads (17 Categories)
- Company Registration Documents *
- CM29 - List of Directors
- Shareholder Certificates
- Proof of Shareholding
- BBBEE Accreditation *
- BBBEE Scorecard Report
- Tax Clearance Certificate *
- VAT Registration Certificate
- Bank Confirmation Letter *
- NDA
- Health and Safety Policy
- Credit Application Form
- Quality Certification
- Letter of Good Standing
- Sector Registrations
- Updated Company Organogram
- Company Profile

**Note:** * = Required documents

### 10. Authorization
- Agreement checkbox confirming accuracy

---

## 🚀 How to Share the Form

### Option 1: Send Direct Link
Simply send suppliers the form URL:
```
http://localhost:3000/supplier-onboarding-form
```

### Option 2: Email Template
Use this email template:

```
Subject: Supplier Onboarding - Complete Your Registration

Dear [Supplier Name],

Thank you for your interest in becoming an approved supplier for [Your Company Name].

To complete your onboarding, please fill out our online supplier registration form:

🔗 Complete Form: http://localhost:3000/supplier-onboarding-form

The form will take approximately 15-20 minutes to complete. Please have the following ready:
✓ Company registration documents
✓ Banking details
✓ BBBEE certificates
✓ Tax clearance
✓ Bank confirmation letter

If you have any questions, please don't hesitate to contact us.

Best regards,
[Your Name]
Procurement Team
```

### Option 3: QR Code
Generate a QR code pointing to your form URL and include it in:
- PDF documents
- Email signatures
- Business cards
- Presentations

---

## 📊 What Happens After Submission

1. ✅ **Form Submitted** - Supplier fills out form and uploads documents
2. 💾 **Data Saved** - All 39 fields saved to Supabase `suppliers` table
3. 📁 **Files Stored** - Documents saved to `data/uploads/suppliers/SUP-xxxxx/`
4. 📧 **Onboarding Created** - Supplier onboarding workflow record created
5. 📝 **Timeline Entry** - Audit log entry added
6. ✉️ **Confirmation** - Supplier sees success message

---

## 🔍 Viewing Submissions

### View All Suppliers:
```
http://localhost:3000/suppliers
```

### View Onboarding Status:
```
http://localhost:3000/suppliers/onboard
```

### View in Database:
```bash
npm run db:studio
```
Then navigate to the `suppliers` table

---

## 📁 File Storage Structure

Files are stored in:
```
data/
└── uploads/
    └── suppliers/
        └── SUP-1234567890/
            ├── companyRegistration/
            │   └── 1234567890-document.pdf
            ├── bbbeeAccreditation/
            │   └── 1234567890-certificate.pdf
            ├── taxClearance/
            │   └── 1234567890-tax-cert.pdf
            └── ...
```

---

## 🎨 Customization

### Change Logo
Replace `/public/logo.png` with your company logo

### Change Colors
Edit the form in `app/supplier-onboarding-form/page.tsx`:
- Background gradient: `bg-gradient-to-br from-blue-50 to-indigo-100`
- Button colors: Tailwind CSS classes

### Add/Remove Fields
Edit both:
1. `app/supplier-onboarding-form/page.tsx` (frontend)
2. `app/api/supplier-form/submit/route.ts` (backend)

---

## 🔒 Security Notes

1. **Public Form** - This form is publicly accessible (no login required)
2. **Rate Limiting** - Consider adding rate limiting for production
3. **File Size** - Currently no file size limit enforced
4. **CAPTCHA** - Consider adding Google reCAPTCHA to prevent spam
5. **Email Notifications** - Set up email notifications when forms are submitted

---

## 🚀 Production Deployment

### 1. Deploy to Vercel/Netlify
```bash
git push origin main
```

### 2. Update Environment Variables
Ensure `.env.local` values are set in your hosting platform

### 3. Update Form URL
Replace all instances of `http://localhost:3000` with your production domain

### 4. Test Thoroughly
Submit a test form to ensure:
- All fields save correctly
- Files upload successfully
- Database records are created
- Emails are sent (if configured)

---

## 📞 Support

If suppliers encounter issues:
1. Check browser console for errors
2. Verify all required fields are filled
3. Ensure files are in supported formats (PDF, DOC, DOCX, JPG, JPEG, PNG)
4. Check file sizes aren't too large
5. Try a different browser

---

## ✅ Checklist

- [ ] Test form submission locally
- [ ] Verify all 39 fields save to database
- [ ] Test file uploads (multiple files per category)
- [ ] Check uploads folder is created and files are saved
- [ ] Verify supplier record appears in database
- [ ] Test form on mobile devices
- [ ] Set up email notifications (optional)
- [ ] Deploy to production
- [ ] Test production form
- [ ] Share form URL with suppliers

---

**Your custom supplier onboarding form is ready to use! 🎉**

