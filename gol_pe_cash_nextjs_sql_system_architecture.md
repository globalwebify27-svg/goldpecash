# Gol Pe Cash — Next.js + SQL Application Architecture & Development Plan

## Overview
Gol Pe Cash is a gold-buying business platform with:

- Super Admin portal
- Branch management
- Sub-admin/user management
- Customer onboarding with Aadhaar verification
- Gold purchase workflow
- Agreement generation & printing
- Activity tracking & audit logs
- Centralized SQL database

The platform will be built using:

- Frontend: Next.js (App Router)
- Backend APIs: Next.js API Routes / Route Handlers
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth/Auth.js + RBAC
- File Storage: AWS S3 / Cloudinary
- Aadhaar Verification: Sandbox API
- PDF Agreement Generation: React PDF / PDFKit
- Deployment: Vercel + Managed PostgreSQL

---

# Core User Roles

## 1. Super Admin

Can:

- Login to master dashboard
- Create branches
- Create sub-admins/users
- Assign admins to branches
- Track all branch activities
- View all customers
- View all transactions
- View reports
- Monitor audit logs
- Configure pricing & policies

---

## 2. Branch Admin / Sub Admin

Can:

- Login to assigned branch
- Onboard customers
- Verify Aadhaar
- Capture customer photo
- Capture gold photos
- Upload invoices
- Add gold valuation details
- Generate agreement
- Print agreement
- Search existing customers
- View branch-specific records

---

# Complete Customer Flow

## Scenario A — New Customer

### Step 1: Aadhaar Verification

Fields:

- Aadhaar Number
- Mobile Number
- OTP

Flow:

1. Admin enters Aadhaar number
2. Sandbox API sends OTP
3. Customer enters OTP
4. API verifies Aadhaar
5. System auto-fetches:
   - Full Name
   - DOB
   - Gender
   - Address
   - Aadhaar photo (if available)

Store verification logs.

Validation:

- Aadhaar already exists?
- Blacklisted customer?
- Duplicate mobile?

---

## Step 2: Customer Details

Additional fields:

- Alternate mobile
- PAN number
- Occupation
- Email
- Nominee
- Emergency contact

---

## Step 3: Capture Customer Live Photo

Features:

- Webcam capture
- Retake photo
- Save image
- Compress image before upload

Store:

- Timestamp
- Branch
- Admin
- Device info

---

## Step 4: Gold Photos

Capture:

- Multiple gold images
- Close-up images
- Hallmark image
- Invoice image upload

Features:

- Multiple uploads
- Drag/drop
- Mobile camera support

---

## Step 5: Gold Valuation

Fields:

| Field | Type |
|---|---|
| Gold Type | Dropdown |
| Ornament Name | Text |
| Gross Weight | Decimal |
| Net Weight | Decimal |
| Stone Weight | Decimal |
| Purity | Decimal |
| Rate Per Gram | Decimal |
| Final Amount | Decimal |
| Deductions | Decimal |
| Loan/Buy Amount | Decimal |
| Notes | Text |

Auto calculations:

- Net weight
- Pure gold weight
- Market valuation
- Final payout

---

## Step 6: Customer Signature

Features:

- Signature pad
- Touch/mobile support
- Save as PNG

---

## Step 7: Agreement Generation

Generate PDF agreement with:

- Company branding
- Customer details
- Aadhaar details
- Gold details
- Captured photos
- Signature
- Terms & conditions
- Branch details
- Agreement number

Features:

- Print
- Download PDF
- Reprint anytime

---

# Scenario B — Existing Customer

Flow:

1. Search by:
   - Aadhaar
   - Mobile
   - Customer ID

2. If customer exists:
   - Skip Aadhaar verification
   - Skip customer data step
   - Start from Gold Details step

Still capture:

- New customer live photo (optional)
- New gold images
- New agreement

---

# Suggested System Architecture

## Frontend

### Next.js App Router Structure

```bash
/app
  /(auth)
    /login

  /(dashboard)
    /dashboard
    /customers
    /transactions
    /branches
    /users
    /reports
    /settings

  /api
```

---

## Backend APIs

Suggested APIs:

```bash
/api/auth/*
/api/customers
/api/customers/search
/api/customers/verify-aadhaar
/api/customers/photo
/api/gold
/api/agreements
/api/branches
/api/users
/api/reports
/api/uploads
/api/audit-logs
```

---

# Database Design (PostgreSQL)

## users

```sql
id
name
email
phone
password_hash
role
branch_id
status
created_at
updated_at
```

Roles:

- SUPER_ADMIN
- ADMIN
- STAFF

---

## branches

```sql
id
name
code
address
city
state
pincode
manager_name
phone
status
created_at
```

---

## customers

```sql
id
customer_code
aadhaar_number
aadhaar_verified
full_name
dob
gender
mobile
alternate_mobile
email
pan_number
address
occupation
photo_url
created_by
branch_id
created_at
updated_at
```

---

## customer_documents

```sql
id
customer_id
document_type
file_url
created_at
```

Document types:

- CUSTOMER_PHOTO
- AADHAAR_FRONT
- AADHAAR_BACK
- GOLD_IMAGE
- INVOICE
- SIGNATURE

---

## transactions

```sql
id
transaction_number
customer_id
branch_id
created_by
status
total_weight
purity
market_rate
final_amount
agreement_pdf
created_at
```

---

## gold_items

```sql
id
transaction_id
gold_type
ornament_name
gross_weight
stone_weight
net_weight
purity
rate_per_gram
final_value
notes
created_at
```

---

## audit_logs

```sql
id
user_id
branch_id
action
entity_type
entity_id
ip_address
device_info
created_at
```

---

# Authentication & Authorization

## Authentication

Use:

- Auth.js / NextAuth
- JWT sessions
- Refresh tokens
- Secure HTTP-only cookies

---

## Role-Based Access Control (RBAC)

Middleware checks:

```ts
SUPER_ADMIN:
- Full access

ADMIN:
- Branch restricted access

STAFF:
- Limited onboarding access
```

---

# Aadhaar Sandbox API Integration

## Aadhaar Verification Flow

### APIs Needed

1. Send OTP
2. Verify OTP
3. Fetch Aadhaar KYC

---

## Security Considerations

IMPORTANT:

- Aadhaar numbers should be encrypted
- Mask Aadhaar in UI
- Do not expose full Aadhaar
- Use encrypted database fields
- Log all Aadhaar access

---

# File Upload System

## Recommended Storage

Use:

- AWS S3
OR
- Cloudinary

---

## Files to Store

- Customer photos
- Gold photos
- Invoices
- Agreement PDFs
- Signatures

---

# Agreement PDF Generation

## Recommended Libraries

- react-pdf
OR
- pdfkit

---

## Agreement Number Format

Example:

```bash
GPC/BR001/2026/00001
```

---

# Dashboard Features

## Super Admin Dashboard

Widgets:

- Total branches
- Total customers
- Today transactions
- Branch-wise business
- Total payout
- Active admins
- Pending agreements

Charts:

- Daily purchase chart
- Monthly branch comparison
- Gold valuation trend

---

## Branch Dashboard

Widgets:

- Today's customers
- Today's transactions
- Total gold purchased
- Pending verifications

---

# Reports Module

## Reports Needed

- Daily purchase report
- Branch-wise report
- Admin-wise report
- Customer transaction history
- Gold valuation report
- Audit report
- Agreement report

Export:

- PDF
- Excel

---

# Recommended Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 |
| UI | Tailwind + shadcn/ui |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Auth.js |
| Storage | S3 |
| PDF | React PDF |
| Deployment | Vercel |
| Validation | Zod |
| Forms | React Hook Form |
| State | Zustand |

---

# Recommended Folder Structure

```bash
src/
 ├── app/
 ├── components/
 ├── modules/
 │    ├── auth/
 │    ├── customers/
 │    ├── gold/
 │    ├── agreements/
 │    ├── branches/
 │    ├── reports/
 │    └── users/
 ├── lib/
 ├── services/
 ├── prisma/
 ├── hooks/
 ├── types/
 └── utils/
```

---

# Suggested Development Phases

## Phase 1 — Foundation

- Next.js setup
- Database setup
- Auth system
- RBAC
- Branch management
- User management

---

## Phase 2 — Customer Module

- Aadhaar verification
- Customer onboarding
- Customer search
- Existing customer flow

---

## Phase 3 — Gold Purchase Flow

- Gold image capture
- Gold valuation
- Pricing calculation
- Signature module

---

## Phase 4 — Agreement System

- PDF generation
- Print support
- Agreement history

---

## Phase 5 — Dashboard & Reports

- Reports
- Analytics
- Audit logs
- Filters
- Exports

---

# Critical Security Requirements

## Must Have

- HTTPS only
- Aadhaar encryption
- Audit logs
- Session expiry
- File validation
- SQL injection protection
- Rate limiting
- API validation
- Role-based restrictions

---

# Suggested Prisma Models

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String
  password  String
  role      Role
  branchId  String?
  branch    Branch?  @relation(fields: [branchId], references: [id])
  createdAt DateTime @default(now())
}

model Branch {
  id        String  @id @default(cuid())
  name      String
  code      String  @unique
  address   String
  users     User[]
  customers Customer[]
}

model Customer {
  id               String   @id @default(cuid())
  customerCode     String   @unique
  aadhaarNumber    String
  aadhaarVerified  Boolean  @default(false)
  fullName         String
  mobile           String
  branchId         String
  branch           Branch   @relation(fields: [branchId], references: [id])
  transactions     Transaction[]
  createdAt        DateTime @default(now())
}

model Transaction {
  id                String   @id @default(cuid())
  transactionNumber String   @unique
  customerId        String
  customer          Customer @relation(fields: [customerId], references: [id])
  finalAmount       Float
  createdAt         DateTime @default(now())
}

enum Role {
  SUPER_ADMIN
  ADMIN
  STAFF
}
```

---

# UI Pages Required

## Auth

- Login
- Forgot password

---

## Super Admin

- Dashboard
- Branch management
- User management
- Reports
- Audit logs
- Settings

---

## Customer Module

- New customer onboarding
- Existing customer search
- Customer profile
- Customer transaction history

---

## Gold Purchase

- Gold valuation form
- Image capture
- Signature capture
- Agreement preview

---

# Recommended Additional Features

## Optional but Highly Useful

### 1. Webcam Auto Capture

Auto-detect face before capture.

---

### 2. GPS Location Capture

Store branch/device location during onboarding.

---

### 3. WhatsApp Agreement

Send PDF agreement to customer WhatsApp.

---

### 4. SMS Notifications

Transaction confirmation.

---

### 5. Biometric Verification

Future upgrade.

---

# Final Recommendation

For scalability and maintainability:

- Use PostgreSQL instead of MySQL
- Use Prisma ORM
- Use modular architecture
- Keep Aadhaar APIs isolated in services layer
- Store images outside DB
- Add strong audit logging from day one
- Build onboarding as a stepper workflow
- Use server-side validation for every step

This architecture can easily scale to:

- Multiple states
- Hundreds of branches
- Thousands of daily transactions
- Multi-role operations
- Centralized compliance tracking

