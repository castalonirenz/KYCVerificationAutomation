# KYC Smart Verification System — Frontend Build Guide

> **Purpose:** This is a step-by-step AI implementation guide for building the complete frontend of the KYC Smart Verification System. Follow each phase in order. Every section includes exact features to build, UI components required, routes, state, and design notes.

---

## Table of Contents

1. [Tech Stack & Project Setup](#1-tech-stack--project-setup)
2. [Project Structure](#2-project-structure)
3. [Design System & Theming](#3-design-system--theming)
4. [Authentication Pages](#4-authentication-pages)
5. [App Shell & Navigation](#5-app-shell--navigation)
6. [Dashboard Module](#6-dashboard-module)
7. [User Management Module](#7-user-management-module)
8. [Client KYC Profile Module](#8-client-kyc-profile-module)
9. [Document Management Module](#9-document-management-module)
10. [Risk Assessment Module](#10-risk-assessment-module)
11. [Compliance Screening Module](#11-compliance-screening-module)
12. [Workflow & Approval Module](#12-workflow--approval-module)
13. [Audit Trail Module](#13-audit-trail-module)
14. [Notifications & Alerts Module](#14-notifications--alerts-module)
15. [Reports Module](#15-reports-module)
16. [Settings Module](#16-settings-module)
17. [Shared Components Library](#17-shared-components-library)
18. [State Management](#18-state-management)
19. [API Integration Layer](#19-api-integration-layer)
20. [Role-Based Access Control (RBAC)](#20-role-based-access-control-rbac)
21. [Testing Checklist](#21-testing-checklist)

---

## 1. Tech Stack & Project Setup

### Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + CSS Variables
- **UI Components:** shadcn/ui (base) + custom components
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query v5)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table v8
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Auth:** NextAuth.js or JWT-based custom auth
- **File Upload:** react-dropzone
- **Date Handling:** date-fns

### Step 1 — Bootstrap the project

```bash
npx create-next-app@latest kyc-system --typescript --tailwind --eslint --app --src-dir
cd kyc-system
```

### Step 2 — Install all dependencies

```bash
npm install @tanstack/react-query @tanstack/react-table zustand react-hook-form zod @hookform/resolvers recharts lucide-react sonner date-fns react-dropzone clsx tailwind-merge class-variance-authority
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card badge dialog sheet table tabs select checkbox radio-group dropdown-menu avatar popover tooltip skeleton progress separator alert command
```

### Step 3 — Configure TypeScript paths in `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@modules/*": ["./src/modules/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

---

## 2. Project Structure

Create the following folder structure exactly:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  ← App shell with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       ├── risk/page.tsx
│   │   │       ├── screening/page.tsx
│   │   │       └── audit/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── risk/page.tsx
│   │   ├── screening/page.tsx
│   │   ├── workflows/page.tsx
│   │   ├── audit/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── risk-rules/page.tsx
│   │       ├── roles/page.tsx
│   │       └── watchlists/page.tsx
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                             ← shadcn/ui base components
│   └── shared/                         ← Custom shared components
├── modules/                            ← Feature-specific components
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── clients/
│   ├── documents/
│   ├── risk/
│   ├── screening/
│   ├── workflows/
│   ├── audit/
│   ├── notifications/
│   └── reports/
├── lib/
│   ├── api.ts                          ← Axios instance
│   ├── auth.ts
│   ├── utils.ts
│   └── validators/                     ← Zod schemas
├── hooks/
│   ├── useAuth.ts
│   ├── usePermission.ts
│   └── useDebounce.ts
├── store/
│   ├── authStore.ts
│   ├── notificationStore.ts
│   └── uiStore.ts
└── types/
    ├── user.ts
    ├── client.ts
    ├── document.ts
    ├── risk.ts
    ├── workflow.ts
    └── audit.ts
```

---

## 3. Design System & Theming

### Step 1 — Define CSS variables in `src/app/globals.css`

```css
:root {
  /* Brand Colors */
  --color-primary: 220 91% 45%;         /* Deep blue */
  --color-primary-foreground: 0 0% 100%;
  --color-accent: 199 89% 48%;          /* Teal accent */
  --color-accent-foreground: 0 0% 100%;

  /* Risk Colors */
  --color-risk-low: 142 71% 45%;        /* Green */
  --color-risk-medium: 38 92% 50%;      /* Amber */
  --color-risk-high: 0 84% 60%;         /* Red */
  --color-risk-critical: 0 100% 45%;    /* Deep Red */

  /* Status Colors */
  --color-status-pending: 38 92% 50%;
  --color-status-approved: 142 71% 45%;
  --color-status-rejected: 0 84% 60%;
  --color-status-review: 220 91% 45%;
  --color-status-escalated: 280 84% 60%;

  /* Surfaces */
  --color-background: 220 20% 97%;
  --color-surface: 0 0% 100%;
  --color-surface-raised: 220 20% 98%;
  --color-border: 220 13% 91%;
  --color-muted: 220 9% 46%;
}

[data-theme="dark"] {
  --color-background: 222 47% 8%;
  --color-surface: 222 47% 11%;
  --color-surface-raised: 222 47% 14%;
  --color-border: 222 47% 20%;
  --color-muted: 220 9% 60%;
}
```

### Step 2 — Risk Badge Colors utility

Create `src/lib/utils.ts`:

```ts
export function getRiskColor(level: 'low' | 'medium' | 'high' | 'critical') {
  const map = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    critical: 'bg-red-200 text-red-900 border-red-300',
  }
  return map[level]
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    'pending': 'bg-amber-100 text-amber-800',
    'under_review': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'escalated': 'bg-purple-100 text-purple-800',
    'requires_documents': 'bg-orange-100 text-orange-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}
```

---

## 4. Authentication Pages

### 4.1 Login Page — `src/app/(auth)/login/page.tsx`

**Build the following UI:**
- Centered card layout on a dark/subtle gradient background
- App logo and name at top: "KYC Smart Verification"
- Form fields:
  - Email input (with validation)
  - Password input (with show/hide toggle)
- "Remember me" checkbox
- "Forgot Password?" link → `/forgot-password`
- Primary submit button: "Sign In"
- Loading state on submit (spinner inside button)
- Error alert shown below form on failed login (e.g., "Invalid credentials")
- Redirect to `/dashboard` on success

**Zod schema** (`src/lib/validators/auth.ts`):
```ts
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})
```

**Behavior:**
- On submit, call `POST /api/auth/login`
- Store JWT token in auth store (Zustand) and optionally in httpOnly cookie
- Redirect based on role: all roles go to `/dashboard`

---

### 4.2 Forgot Password Page — `src/app/(auth)/forgot-password/page.tsx`

**Build the following UI:**
- Same card layout as login
- Email input only
- "Send Reset Link" button
- Success state: shows confirmation message after submit
- "Back to Login" link

---

## 5. App Shell & Navigation

### 5.1 Dashboard Layout — `src/app/(dashboard)/layout.tsx`

Build a **sidebar + topbar** layout:

**Sidebar (left, fixed, collapsible):**
- Logo at top
- Navigation items grouped by section:

```
MAIN
  Dashboard               /dashboard
  
COMPLIANCE
  Clients                 /clients
  Documents               /documents
  Risk Assessment         /risk
  Compliance Screening    /screening
  Workflows               /workflows

MONITORING
  Audit Trail             /audit
  Notifications           /notifications
  Reports                 /reports

ADMIN (visible to Admin + Manager only)
  Users                   /users
  Settings                /settings
  Risk Rules              /settings/risk-rules
  Watchlists              /settings/watchlists
  Roles & Permissions     /settings/roles
```

- Active route highlighted
- Collapsible to icon-only mode (toggle button at bottom)
- User avatar + name + role badge at bottom of sidebar
- Logout button at bottom

**Topbar (top, fixed):**
- Breadcrumb navigation (dynamic, based on current route)
- Search bar (global search — clients, documents)
- Notification bell icon with unread count badge → opens notification panel
- User menu dropdown (Profile, Settings, Logout)
- Theme toggle (light/dark)

**Main content area:**
- Scrollable, padding applied
- `<Suspense>` wrapper with skeleton fallback per page

---

### 5.2 Route Guard

Create `src/components/shared/RouteGuard.tsx`:
- Wrap dashboard layout
- Redirect unauthenticated users to `/login`
- Check user role against allowed roles for each route
- Show 403 page if unauthorized

---

## 6. Dashboard Module

**Route:** `/dashboard`
**File:** `src/modules/dashboard/DashboardPage.tsx`

### Build the following sections:

#### 6.1 KPI Summary Cards (top row, 4 cards)
Each card shows:
- Icon, label, value, trend (% change vs last period)

Cards to build:
1. **Total Clients** — total count + "X new this month"
2. **Pending Verifications** — count with amber color
3. **High Risk Clients** — count with red color
4. **Expiring Documents** — count with orange color (expiring in 30 days)

#### 6.2 Verification Status Overview (pie/donut chart)
- Recharts `PieChart`
- Slices: Pending, Under Review, Approved, Rejected, Escalated
- Legend with counts
- Uses status colors from design system

#### 6.3 Risk Distribution Chart (bar chart)
- Recharts `BarChart`
- X-axis: months (last 6)
- Bars: Low / Medium / High / Critical risk clients
- Stacked bar variant

#### 6.4 Recent Activity Feed (right column)
- Scrollable list of recent audit events
- Each item: user avatar, action text, timestamp (relative time)
- "View all" link → `/audit`

#### 6.5 Pending Actions Table
- Clients awaiting action by the current user
- Columns: Client Name, Risk Level, Status, Assigned To, Days Pending, Action button
- "View" button → client profile
- Max 10 rows, "View all" link → `/workflows`

#### 6.6 Compliance Alerts Panel
- List of active alerts (sanctions hits, expired docs, escalated cases)
- Each alert: severity badge, message, timestamp, dismiss button

---

## 7. User Management Module

**Routes:** `/users`, `/users/[id]`
**Visible to:** System Administrator, Compliance Manager only

### 7.1 Users List Page — `/users`

**Toolbar:**
- "Add User" button (opens modal)
- Search input (filter by name/email)
- Role filter dropdown (All, Compliance Officer, Risk Analyst, Reviewer, Manager, Admin)
- Status filter (Active, Inactive, Suspended)

**Table columns:**
| Column | Details |
|---|---|
| Name | Avatar + full name |
| Email | Email address |
| Role | Role badge |
| Department | Text |
| Status | Active / Inactive / Suspended badge |
| Last Login | Relative timestamp |
| Actions | Edit, Deactivate/Activate, Reset Password |

**Pagination:** 20 rows per page, TanStack Table

### 7.2 Add / Edit User Modal

**Form fields:**
- First Name, Last Name (required)
- Email (required, unique validation)
- Role (dropdown: 5 roles)
- Department / Team (text input)
- Status (Active / Inactive)
- Password (on create only, auto-generated option)
- Send welcome email checkbox

**Validation:** Zod schema, React Hook Form

### 7.3 User Detail Page — `/users/[id]`

**Sections:**
- Profile header (name, role, avatar, status badge)
- Contact info
- Role & permissions summary
- Activity log (last 20 actions by this user)
- Active sessions (if available)
- Danger zone: Deactivate account, Reset password, Force logout

---

## 8. Client KYC Profile Module

**Routes:** `/clients`, `/clients/new`, `/clients/[id]`

### 8.1 Clients List Page — `/clients`

**Toolbar:**
- "Add Client" button → `/clients/new`
- Search input (name, ID, email)
- Filter by: Client Type (Individual / Corporate), Risk Level, Verification Status
- Bulk export button (CSV)

**Table columns:**
| Column | Details |
|---|---|
| Client | Avatar/initial + name + client ID |
| Type | Individual / Corporate badge |
| Risk Level | Colored badge (Low/Medium/High/Critical) |
| Status | Verification status badge |
| Assigned To | Officer name |
| Last Updated | Relative date |
| Actions | View, Edit, Assign |

### 8.2 New Client Form — `/clients/new`

Multi-step form (stepper UI at top showing progress):

**Step 1 — Client Type Selection**
- Two large cards: "Individual" or "Corporate"
- Click to select and proceed

**Step 2 — Personal / Business Information**

For Individual:
- First Name, Last Name (required)
- Date of Birth (date picker)
- Nationality (country select)
- Place of Birth
- Gender
- Civil Status
- Tax Identification Number
- Email, Phone

For Corporate:
- Company Name (required)
- Registration Number (required)
- Date of Incorporation
- Country of Incorporation
- Industry / Business Type (dropdown)
- Registered Address
- Primary Contact Name, Email, Phone

**Step 3 — Identification Documents**
- Upload section (react-dropzone)
- Document Type selector (Government ID, Passport, Business Permit, etc.)
- File upload area (drag and drop)
- Expiry date input
- Preview thumbnails of uploaded files

**Step 4 — Beneficial Ownership** (Corporate only)
- Add beneficial owners (UBO) form
- Fields: Name, Nationality, Ownership %, ID Document
- Add multiple owners (dynamic list)

**Step 5 — Risk Classification**
- Pre-filled risk factors based on entered data
- Manual risk override (with reason, requires approval)
- PEP status toggle
- Review summary

**Step 6 — Review & Submit**
- Summary of all entered data
- Edit links per section
- Submit button

### 8.3 Client Profile Page — `/clients/[id]`

**Layout:** Tabbed interface

**Header section (always visible):**
- Client name, ID, type badge
- Risk level badge (colored, prominent)
- Verification status badge
- Assigned officer
- Quick action buttons: Edit, Assign, Escalate, Export PDF

**Tabs:**

**Tab 1: Overview**
- All personal/business information
- Editable inline or via Edit modal
- Profile update history (expandable)

**Tab 2: Documents** → See Module 9
- Document list specific to this client

**Tab 3: Risk Assessment** → See Module 10
- Risk score card + breakdown

**Tab 4: Compliance Screening** → See Module 11
- Screening results for this client

**Tab 5: Workflow History**
- Timeline of all workflow stages this client passed through
- Who actioned each stage, when, comments

**Tab 6: Audit Log**
- All changes made to this client's profile (filtered audit trail)

---

## 9. Document Management Module

**Routes:** `/documents`, `/clients/[id]/documents`

### 9.1 Documents List Page — `/documents`

**Toolbar:**
- Search by document name or client
- Filter: Document Type, Status (Valid / Expired / Expiring Soon), Client Type
- Upload button (opens upload modal)

**Table columns:**
| Column | Details |
|---|---|
| Document | File icon + name |
| Client | Linked client name |
| Type | Document type badge |
| Uploaded By | User name |
| Upload Date | Date |
| Expiry Date | Date + "Expiring in X days" warning |
| Status | Valid / Expired / Expiring Soon badge |
| Actions | Preview, Download, Replace, Delete |

### 9.2 Document Upload Modal

**Fields:**
- Client search/select (autocomplete)
- Document Type (dropdown)
- File upload area (react-dropzone)
  - Accepted: PDF, JPG, PNG, DOCX
  - Max size: 10MB
  - Multiple files supported
- Expiry Date (optional, date picker)
- Notes / Description
- Version note (if replacing existing)

**Preview:** Show thumbnail or PDF preview after upload

### 9.3 Document Preview Panel (slide-over / drawer)

**Show:**
- File name, type, size
- Uploaded by, upload date
- Expiry date + status indicator
- Version history (list of previous versions with download links)
- Preview (PDF embed or image display)
- Download button
- Replace document button
- Delete button (with confirmation)

### 9.4 Expiration Alerts Component (reusable)

- Banner/alert component showing count of documents expiring in 0–30 days
- Clickable → filters document list to expiring documents

---

## 10. Risk Assessment Module

**Routes:** `/risk`, `/clients/[id]/risk`

### 10.1 Risk Overview Page — `/risk`

**Summary cards (top):**
- Total Low Risk clients count
- Total Medium Risk clients count
- Total High Risk clients count
- Total Critical Risk clients count

**Risk Distribution Chart:**
- Recharts `BarChart` or `RadarChart`
- Breakdown by industry, nationality, PEP status

**High Risk Clients Table:**
- Filtered to High + Critical only
- Columns: Client, Risk Score (0–100), Risk Level, Top Risk Factors, Last Assessed, Action
- "Review" button → client risk tab

### 10.2 Risk Assessment Panel (inside Client Profile — Risk tab)

**Risk Score Card:**
- Large circular/gauge chart showing score (0–100)
- Color: green (<30), amber (30–60), red (60–80), dark red (>80)
- Risk level label: Low / Medium / High / Critical

**Risk Factor Breakdown:**
Each factor shows: label, weight, score, status

| Factor | Display |
|---|---|
| Client Location | Country flag + risk rating |
| Industry Classification | Industry name + risk rating |
| Transaction Profile | Low/Medium/High volume |
| PEP Status | Yes/No toggle |
| Sanctions Hit | None / Pending / Confirmed |

**Risk History Chart:**
- Line chart of risk score over time (last 12 months)

**Manual Override Section:**
- Current override (if any): who set it, when, reason
- "Request Override" button (opens modal)
  - Fields: New Risk Level, Justification/Reason
  - Requires approval from Compliance Manager
  - Status: Pending Approval / Approved / Rejected

### 10.3 Risk Rules Configuration — `/settings/risk-rules`

**Visible to:** System Administrator, Compliance Manager

**List of configured risk rules:**
- Table: Rule Name, Factor, Weight, Threshold, Active toggle, Edit/Delete

**Add/Edit Rule Modal:**
- Rule Name
- Risk Factor (dropdown: location, industry, transaction, PEP, sanctions)
- Weight (0–100 slider)
- Threshold values (low/medium/high breakpoints)
- Active toggle
- Notes

---

## 11. Compliance Screening Module

**Routes:** `/screening`, `/clients/[id]/screening`

### 11.1 Screening Overview Page — `/screening`

**Summary cards:**
- Total Screened Today
- Active Alerts (sanctions/PEP hits)
- Pending Review (hits awaiting decision)
- Cleared (false positives dismissed)

**Screening Queue Table:**
- Clients with screening alerts pending review
- Columns: Client, Alert Type (PEP / Sanctions / Watchlist), Match Score %, Source, Flagged Date, Status, Action
- "Review" button → opens screening review drawer

### 11.2 Screening Panel (inside Client Profile — Screening tab)

**PEP Screening Result:**
- Status: Not a PEP / Potential Match / Confirmed PEP
- Match details (if hit): Name match, DOB match, Country, Source
- "Dismiss as False Positive" button (with reason)
- "Confirm as PEP" button

**Sanctions Screening Result:**
- List of checked databases (OFAC, UN, EU, local)
- Per database: status (Clear / Hit / Pending)
- Hit details: entity name, list source, match score

**Watchlist Screening Result:**
- Internal watchlist check result
- Match details if found

**Screening History:**
- Table of all past screenings: Date, Type, Result, Actioned By

**Run Manual Screening Button:**
- Triggers fresh screening run for this client
- Shows loading state while running

### 11.3 Watchlist Management — `/settings/watchlists`

**Visible to:** System Administrator only

**Internal Watchlist Table:**
- Entry: Name, Type, Added By, Date Added, Notes, Remove button

**Add to Watchlist Button:**
- Modal: Name, Entity Type, Reason, Notes

---

## 12. Workflow & Approval Module

**Routes:** `/workflows`

### 12.1 Workflow Board Page — `/workflows`

**Layout:** Kanban-style columns OR filterable table (build both, toggle between views)

**Kanban Columns:**
1. Pending Verification
2. Under Review
3. Requires Additional Documents
4. Awaiting Approval
5. Escalated

Each card shows: Client name, Risk badge, Assigned officer, Days in stage, Quick action

**Table View columns:**
| Column | Details |
|---|---|
| Client | Name + client ID |
| Risk Level | Badge |
| Current Stage | Status badge |
| Assigned To | Officer name |
| Days in Stage | Number + color (red if >7 days) |
| Last Action | Date |
| Actions | View, Reassign, Advance, Escalate |

**Toolbar:**
- Toggle: Kanban / Table view
- Filter: Stage, Risk Level, Assigned To (my tasks toggle), Days Pending
- Search by client name

### 12.2 Workflow Action Drawer (slide-over)

Opens when clicking "View" or a Kanban card:

**Header:** Client name, current stage, risk badge

**Workflow Timeline:**
- Visual vertical timeline of all stages passed
- Each stage: stage name, who actioned it, timestamp, comment

**Action Panel:**
- Current stage label
- Action buttons (vary by role and stage):
  - "Advance to Next Stage"
  - "Request Additional Documents"
  - "Approve"
  - "Reject"
  - "Escalate"
  - "Reassign"
- Comment/Notes field (required for reject/escalate)
- Confirmation dialog before irreversible actions (Approve, Reject)

### 12.3 My Tasks Panel (Dashboard widget + standalone)

- List of workflow items assigned to the current user
- Sorted by urgency (days pending)
- Quick action buttons per item

---

## 13. Audit Trail Module

**Routes:** `/audit`, `/clients/[id]/audit`

### 13.1 Audit Trail Page — `/audit`

**Filters (toolbar):**
- Date range picker (start date – end date)
- User filter (dropdown, search)
- Action type filter (multi-select):
  - Profile Change
  - Document Upload
  - Risk Score Change
  - Approval Decision
  - Login / Logout
  - Screening Run
  - Workflow Advance
- Client filter (search autocomplete)

**Audit Log Table:**
| Column | Details |
|---|---|
| Timestamp | Full date + time |
| User | Avatar + name + role |
| Action Type | Colored badge |
| Description | Human-readable action text |
| Client | Linked client name (if applicable) |
| IP Address | Masked (show last octets) |
| Details | "View" button → expanded detail panel |

**Export button:** Export filtered results to CSV

### 13.2 Audit Detail Panel

Opens as a slide-over when clicking "View":

- Full action description
- Before/After values for data changes (diff view)
- Session info (IP, browser agent)
- Related client link
- Related document link (if applicable)

---

## 14. Notifications & Alerts Module

**Routes:** `/notifications`

### 14.1 Notification Bell (Topbar Component)

- Bell icon with red badge showing unread count
- Click → opens notification popover (max 5 recent)
- Each item: icon, message, relative time, read/unread state
- "Mark all as read" button
- "View all" link → `/notifications`

### 14.2 Notifications Page — `/notifications`

**Tabs:** All | Unread | Compliance Alerts | Document Expiry | Workflow

**Notification List:**
Each item:
- Icon (type-specific: bell, alert, document, workflow)
- Title + description
- Relative timestamp
- Read/unread indicator
- Action button if applicable (e.g., "Review Client" → opens client)
- Dismiss / Mark as read

**Notification Types to support:**
1. **Document Expiry Warning** — "Client X has 2 documents expiring in 7 days"
2. **Compliance Alert** — "Sanctions hit detected for Client Y"
3. **Workflow Pending** — "Client Z has been waiting 5+ days in Pending Verification"
4. **Approval Request** — "Risk override requested for Client A — requires your approval"
5. **Escalation Notice** — "Client B has been escalated to your queue"
6. **System Alert** — General system messages

### 14.3 Notification Preferences (Settings)

- Toggle each notification type on/off
- Choose delivery: In-app only / Email / Both
- Set quiet hours (optional)

---

## 15. Reports Module

**Routes:** `/reports`

### 15.1 Reports Page — `/reports`

**Layout:** Two sections — Quick Reports and Custom Report Builder

**Quick Reports (pre-built, one-click):**

| Report | Description | Format |
|---|---|---|
| High Risk Clients | All clients rated High or Critical | CSV, PDF |
| Pending Verifications | Clients not yet approved | CSV |
| Expired Documents | Documents past expiry date | CSV |
| Compliance Activity Summary | Actions taken in a date range | PDF |
| PEP & Sanctions Hits | All flagged compliance hits | CSV |
| Audit Log Export | Full audit trail for a date range | CSV |

Each report card:
- Report name + description
- Date range picker
- Optional filters (risk level, client type, etc.)
- "Generate Report" button
- Loading state while generating
- Download button when ready

**Custom Report Builder:**
- Select data type (Clients, Documents, Workflows, Audit)
- Select columns to include (multi-select checkboxes)
- Add filters (dynamic filter builder)
- Preview table (first 10 rows)
- Export as CSV

### 15.2 Report Preview Modal

- Table preview of generated data
- Column visibility toggles
- Download CSV / Print buttons

---

## 16. Settings Module

**Routes:** `/settings`
**Visible to:** System Administrator, Compliance Manager

### 16.1 Settings Layout

Tabbed settings page:

**Tabs:**
- General
- Risk Rules (→ covered in Module 10.3)
- Roles & Permissions (→ covered in Module 7)
- Watchlists (→ covered in Module 11.3)
- Notifications
- Security
- Integrations (placeholder for future)

### 16.2 General Settings

- Organization name
- Default risk rules toggle
- Document retention period (dropdown)
- Max file upload size
- Time zone
- Date format preference
- Save button

### 16.3 Security Settings

- Password policy configuration:
  - Minimum length (slider)
  - Require uppercase, numbers, symbols (checkboxes)
  - Password expiry (days)
- MFA requirement toggle (per role)
- Session timeout (minutes)
- Failed login lockout threshold
- IP allowlist (textarea, one IP per line)
- Save button

### 16.4 Roles & Permissions — `/settings/roles`

**Permissions Matrix Table:**

Rows: Features/Actions
Columns: Roles (Compliance Officer, Risk Analyst, Reviewer, Manager, Admin)

Each cell: Toggle (allowed / denied)

**Features to show in matrix:**
- View Client Profile
- Create Client Profile
- Edit Client Profile
- Delete Client Profile
- Upload Documents
- Delete Documents
- Run Screening
- Override Risk Score
- Approve Workflows
- Reject Workflows
- Escalate Workflows
- View Audit Trail
- Export Reports
- Manage Users
- Manage Settings

---

## 17. Shared Components Library

Build these reusable components in `src/components/shared/`:

### 17.1 StatusBadge
```tsx
// Props: status: string, size?: 'sm' | 'md'
// Uses getStatusColor() utility
// Renders colored pill badge
```

### 17.2 RiskBadge
```tsx
// Props: level: 'low' | 'medium' | 'high' | 'critical', showIcon?: boolean
// Shows colored badge with optional risk icon
```

### 17.3 DataTable
```tsx
// Props: columns, data, pagination, filters, loading, onRowClick
// Wraps TanStack Table with pagination, sort, loading skeleton
// Shows empty state when no data
```

### 17.4 PageHeader
```tsx
// Props: title, description?, actions? (ReactNode for buttons)
// Consistent page title area used across all pages
```

### 17.5 FilterBar
```tsx
// Props: filters (array of filter configs), onFilterChange
// Renders a row of filter inputs (search, select, date range)
// Collapsible on mobile
```

### 17.6 ConfirmDialog
```tsx
// Props: open, title, description, confirmLabel, onConfirm, onCancel, variant ('danger' | 'warning' | 'default')
// Used for all destructive/irreversible actions
```

### 17.7 EmptyState
```tsx
// Props: icon, title, description, action? (button config)
// Shown when tables/lists have no data
```

### 17.8 LoadingSkeleton
```tsx
// Props: variant ('table' | 'card' | 'list' | 'detail'), rows?
// Shimmer skeletons matching the shape of real content
```

### 17.9 FileUploadZone
```tsx
// Props: onDrop, accept, maxSize, multiple, label
// react-dropzone wrapper with styled drag-drop UI
// Shows upload progress, file previews, error states
```

### 17.10 AuditTimeline
```tsx
// Props: events (array of audit events)
// Vertical timeline component reused in workflow drawer + client audit tab
```

### 17.11 GlobalSearch
```tsx
// Command palette (⌘K shortcut) powered by shadcn Command component
// Searches: clients (by name/ID), documents, users
// Shows recent items when empty
// Navigates to result on select
```

---

## 18. State Management

Create Zustand stores:

### 18.1 Auth Store — `src/store/authStore.ts`

```ts
interface AuthStore {
  user: User | null
  token: string | null
  permissions: string[]
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}
```

### 18.2 Notification Store — `src/store/notificationStore.ts`

```ts
interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismiss: (id: string) => void
}
```

### 18.3 UI Store — `src/store/uiStore.ts`

```ts
interface UIStore {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleTheme: () => void
}
```

---

## 19. API Integration Layer

### 19.1 Axios Instance — `src/lib/api.ts`

```ts
// Base URL from env: NEXT_PUBLIC_API_URL
// Request interceptor: attach JWT Authorization header
// Response interceptor:
//   - 401 → clear auth store, redirect to /login
//   - 403 → show "Access Denied" toast
//   - 500 → show generic error toast
```

### 19.2 API Hooks (TanStack Query)

Create one query file per module in `src/lib/queries/`:

**`clients.ts`**
- `useClients(filters)` — paginated client list
- `useClient(id)` — single client
- `useCreateClient()` — mutation
- `useUpdateClient()` — mutation
- `useDeleteClient()` — mutation

**`documents.ts`**
- `useDocuments(filters)` — document list
- `useUploadDocument()` — mutation with progress
- `useDeleteDocument()` — mutation

**`risk.ts`**
- `useRiskAssessment(clientId)` — risk data
- `useRequestRiskOverride()` — mutation

**`screening.ts`**
- `useScreeningResults(clientId)` — screening data
- `useRunScreening(clientId)` — mutation
- `useDismissHit()` — mutation

**`workflows.ts`**
- `useWorkflowQueue(filters)` — queue list
- `useAdvanceWorkflow()` — mutation
- `useApproveClient()` — mutation
- `useRejectClient()` — mutation
- `useEscalateClient()` — mutation

**`audit.ts`**
- `useAuditTrail(filters)` — paginated audit logs

**`notifications.ts`**
- `useNotifications()` — notification list
- `useMarkNotificationRead()` — mutation

**`reports.ts`**
- `useGenerateReport(config)` — mutation, returns download URL

**`users.ts`**
- `useUsers(filters)` — user list
- `useCreateUser()` — mutation
- `useUpdateUser()` — mutation
- `useDeactivateUser()` — mutation

---

## 20. Role-Based Access Control (RBAC)

### 20.1 Permission Hook — `src/hooks/usePermission.ts`

```ts
export function usePermission(permission: string): boolean
export function useRole(): UserRole
export function useIsAdmin(): boolean
```

### 20.2 Protected Component — `src/components/shared/PermissionGuard.tsx`

```tsx
// Props: permission: string, fallback?: ReactNode, children
// Renders children only if user has the required permission
// Shows fallback (or nothing) otherwise
```

### 20.3 Permission Map

Define all permissions as constants:

```ts
export const PERMISSIONS = {
  CLIENT_VIEW: 'client:view',
  CLIENT_CREATE: 'client:create',
  CLIENT_EDIT: 'client:edit',
  CLIENT_DELETE: 'client:delete',
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_DELETE: 'document:delete',
  RISK_OVERRIDE: 'risk:override',
  SCREENING_RUN: 'screening:run',
  SCREENING_DISMISS: 'screening:dismiss',
  WORKFLOW_APPROVE: 'workflow:approve',
  WORKFLOW_REJECT: 'workflow:reject',
  WORKFLOW_ESCALATE: 'workflow:escalate',
  AUDIT_VIEW: 'audit:view',
  REPORT_EXPORT: 'report:export',
  USER_MANAGE: 'user:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const
```

### 20.4 Default Role Permissions Map

```ts
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  compliance_officer: [CLIENT_VIEW, CLIENT_CREATE, CLIENT_EDIT, DOCUMENT_UPLOAD, SCREENING_RUN, WORKFLOW_ESCALATE, AUDIT_VIEW],
  risk_analyst: [CLIENT_VIEW, CLIENT_EDIT, DOCUMENT_UPLOAD, RISK_OVERRIDE, SCREENING_RUN, AUDIT_VIEW],
  reviewer: [CLIENT_VIEW, DOCUMENT_UPLOAD, AUDIT_VIEW],
  compliance_manager: [CLIENT_VIEW, CLIENT_CREATE, CLIENT_EDIT, CLIENT_DELETE, DOCUMENT_UPLOAD, DOCUMENT_DELETE, RISK_OVERRIDE, SCREENING_RUN, SCREENING_DISMISS, WORKFLOW_APPROVE, WORKFLOW_REJECT, WORKFLOW_ESCALATE, AUDIT_VIEW, REPORT_EXPORT, SETTINGS_MANAGE],
  system_admin: ['*'], // All permissions
}
```

---

## 21. Testing Checklist

Before marking any module complete, verify:

### Auth
- [ ] Login with valid credentials redirects to dashboard
- [ ] Login with invalid credentials shows error message
- [ ] Unauthenticated routes redirect to /login
- [ ] Forgot password form submits and shows success state

### Navigation
- [ ] All sidebar links navigate to correct routes
- [ ] Active link is highlighted
- [ ] Sidebar collapses to icon-only mode
- [ ] Breadcrumbs update correctly on navigation
- [ ] Notification bell shows unread count

### Clients
- [ ] Client list loads with pagination
- [ ] Search and filters work correctly
- [ ] Multi-step new client form validates each step
- [ ] Client profile tabs all render correctly
- [ ] Risk badge colors match risk level

### Documents
- [ ] File upload works (drag-drop and click)
- [ ] File preview opens for uploaded docs
- [ ] Expiry dates show correct warning states
- [ ] Version history is displayed

### Risk
- [ ] Risk score gauge renders correctly
- [ ] Risk factor breakdown renders all factors
- [ ] Manual override form submits and shows pending state

### Screening
- [ ] Screening results display per database
- [ ] Dismiss false positive flow works
- [ ] Confirm PEP flow works

### Workflows
- [ ] Kanban and table views both render
- [ ] Workflow action drawer opens and closes
- [ ] Stage advancement triggers confirmation dialog
- [ ] Timeline shows all stages

### Audit
- [ ] Filters (date range, user, action type) all work
- [ ] Audit detail panel shows before/after diffs
- [ ] CSV export triggers download

### Reports
- [ ] All quick reports generate and download
- [ ] Custom report builder renders preview

### Access Control
- [ ] Admin sees all nav items
- [ ] Reviewer cannot see Users or Settings
- [ ] PermissionGuard hides restricted buttons correctly

---

## Appendix: TypeScript Types Reference

```ts
// src/types/user.ts
type UserRole = 'compliance_officer' | 'risk_analyst' | 'reviewer' | 'compliance_manager' | 'system_admin'
interface User { id: string; firstName: string; lastName: string; email: string; role: UserRole; department: string; status: 'active' | 'inactive' | 'suspended'; lastLogin: string; }

// src/types/client.ts
type ClientType = 'individual' | 'corporate'
type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
type VerificationStatus = 'pending' | 'under_review' | 'requires_documents' | 'approved' | 'rejected' | 'escalated'
interface Client { id: string; type: ClientType; name: string; riskLevel: RiskLevel; riskScore: number; status: VerificationStatus; assignedTo: string; createdAt: string; updatedAt: string; }

// src/types/document.ts
type DocumentStatus = 'valid' | 'expired' | 'expiring_soon'
interface KYCDocument { id: string; clientId: string; type: string; fileName: string; fileUrl: string; uploadedBy: string; uploadedAt: string; expiryDate: string | null; status: DocumentStatus; version: number; }

// src/types/workflow.ts
type WorkflowStage = 'pending_verification' | 'under_review' | 'requires_documents' | 'awaiting_approval' | 'escalated' | 'completed'
interface WorkflowEvent { id: string; clientId: string; stage: WorkflowStage; actionedBy: string; timestamp: string; comment: string | null; }

// src/types/audit.ts
type AuditAction = 'profile_change' | 'document_upload' | 'risk_change' | 'approval_decision' | 'login' | 'logout' | 'screening_run' | 'workflow_advance'
interface AuditEvent { id: string; userId: string; action: AuditAction; description: string; clientId?: string; metadata: Record<string, unknown>; ipAddress: string; timestamp: string; }
```

---

## 22. Backend API Contract

> **Purpose:** This section is the single source of truth for the Frontend ↔ Backend interface. Both teams must follow these contracts exactly. Every endpoint includes: HTTP method, route, required headers, request body/params, and full response shape.

---

### 22.0 Global Conventions

#### Base URL
```
NEXT_PUBLIC_API_URL=https://api.kyc-system.internal/v1
```

#### Authentication — Passport JWT Strategy

Every protected endpoint requires:
```
Authorization: Bearer <access_token>
```

The backend uses **Passport.js JWT strategy**. The token is issued on login and contains:
```json
{
  "sub": "user-uuid",
  "email": "user@org.com",
  "role": "compliance_officer",
  "permissions": ["client:view", "document:upload"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

Token rules:
- Access token expires in **24 hours**
- Refresh token expires in **7 days**
- Backend must validate `role` and `permissions` from token on every request (RBAC guard)
- On `401`, frontend clears auth store and redirects to `/login`
- On `403`, frontend shows "Access Denied" toast — does not redirect

#### Standard Response Envelope

All responses (success and error) follow this shape:

```ts
// Success
{
  "success": true,
  "data": <payload>,        // null for DELETE
  "meta"?: {                // present on paginated responses
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",   // machine-readable code
    "message": "Email is required",
    "details"?: [                 // array of field-level errors
      { "field": "email", "message": "must be a valid email" }
    ]
  }
}
```

#### Standard Error Codes

| HTTP Status | Code | When to use |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body/params fail validation |
| 401 | `UNAUTHORIZED` | Missing or expired JWT |
| 403 | `FORBIDDEN` | Valid JWT but insufficient permissions |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource (e.g., email already exists) |
| 422 | `UNPROCESSABLE` | Business logic violation |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

#### Pagination Query Params (all list endpoints)

```
GET /resource?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

#### RBAC Guard Behavior

The backend must apply Passport JWT + RBAC guard on every route:
1. Extract and verify JWT via Passport JWT strategy
2. Attach `req.user` (decoded token payload)
3. Check `req.user.permissions` array against the route's required permission
4. Return `403 FORBIDDEN` if permission is missing

---

### 22.1 Auth Endpoints

#### POST `/auth/login`
**Description:** Authenticate user with email + password. Returns JWT tokens.
**Auth required:** No

**Request body:**
```json
{
  "email": "officer@org.com",
  "password": "SecurePass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "officer@org.com",
      "role": "compliance_officer",
      "permissions": ["client:view", "client:create", "document:upload"],
      "department": "Compliance",
      "status": "active",
      "lastLogin": "2024-01-15T08:30:00Z"
    }
  }
}
```

**Error responses:**
- `401` — invalid credentials
- `403` — account suspended/inactive (code: `ACCOUNT_DISABLED`)

---

#### POST `/auth/refresh`
**Description:** Obtain a new access token using a valid refresh token.
**Auth required:** No

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

#### POST `/auth/logout`
**Description:** Invalidate the current refresh token (server-side revocation).
**Auth required:** Yes
**Required permission:** none (any authenticated user)

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{ "success": true, "data": null }
```

---

#### POST `/auth/forgot-password`
**Description:** Send a password reset email.
**Auth required:** No

**Request body:**
```json
{ "email": "officer@org.com" }
```

**Response `200`:** (always 200 to prevent email enumeration)
```json
{ "success": true, "data": { "message": "If the email exists, a reset link has been sent." } }
```

---

#### POST `/auth/reset-password`
**Description:** Reset password using token from email link.
**Auth required:** No

**Request body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass456!"
}
```

**Response `200`:**
```json
{ "success": true, "data": null }
```

**Error responses:**
- `400` — token expired or invalid (code: `INVALID_RESET_TOKEN`)

---

#### GET `/auth/me`
**Description:** Get the currently authenticated user's profile.
**Auth required:** Yes
**Required permission:** none (any authenticated user)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "officer@org.com",
    "role": "compliance_officer",
    "permissions": ["client:view", "client:create", "document:upload"],
    "department": "Compliance",
    "status": "active",
    "lastLogin": "2024-01-15T08:30:00Z",
    "createdAt": "2023-06-01T00:00:00Z"
  }
}
```

---

### 22.2 User Management Endpoints

**Base route:** `/users`
**Required role:** `system_admin` OR `compliance_manager`

#### GET `/users`
**Required permission:** `user:manage`

**Query params:**
```
?page=1&limit=20&search=maria&role=compliance_officer&status=active&sortBy=createdAt&sortOrder=desc
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "officer@org.com",
      "role": "compliance_officer",
      "department": "Compliance",
      "status": "active",
      "lastLogin": "2024-01-15T08:30:00Z",
      "createdAt": "2023-06-01T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

---

#### GET `/users/:id`
**Required permission:** `user:manage`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "officer@org.com",
    "role": "compliance_officer",
    "department": "Compliance",
    "status": "active",
    "lastLogin": "2024-01-15T08:30:00Z",
    "createdAt": "2023-06-01T00:00:00Z",
    "recentActivity": [
      {
        "action": "client:approve",
        "description": "Approved client profile for Juan Dela Cruz",
        "timestamp": "2024-01-15T09:00:00Z"
      }
    ],
    "activeSessions": [
      {
        "sessionId": "session-uuid",
        "ipAddress": "192.168.1.xxx",
        "lastActive": "2024-01-15T10:00:00Z",
        "userAgent": "Mozilla/5.0..."
      }
    ]
  }
}
```

---

#### POST `/users`
**Required permission:** `user:manage`

**Request body:**
```json
{
  "firstName": "Juan",
  "lastName": "Cruz",
  "email": "jcruz@org.com",
  "role": "risk_analyst",
  "department": "Risk Management",
  "status": "active",
  "password": "TempPass123!",
  "sendWelcomeEmail": true
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Cruz",
    "email": "jcruz@org.com",
    "role": "risk_analyst",
    "department": "Risk Management",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Error responses:**
- `409` — email already exists

---

#### PATCH `/users/:id`
**Required permission:** `user:manage`

**Request body** (all fields optional):
```json
{
  "firstName": "Juan",
  "lastName": "Cruz",
  "role": "compliance_officer",
  "department": "Compliance",
  "status": "inactive"
}
```

**Response `200`:** Updated user object (same shape as GET `/users/:id` data)

---

#### POST `/users/:id/reset-password`
**Required permission:** `user:manage`

**Request body:**
```json
{
  "newPassword": "NewTemp456!",
  "forceChangeOnLogin": true
}
```

**Response `200`:**
```json
{ "success": true, "data": null }
```

---

#### DELETE `/users/:id/sessions`
**Description:** Force logout — invalidate all sessions for a user.
**Required permission:** `user:manage`

**Response `200`:**
```json
{ "success": true, "data": null }
```

---

### 22.3 Client KYC Profile Endpoints

**Base route:** `/clients`

#### GET `/clients`
**Required permission:** `client:view`

**Query params:**
```
?page=1&limit=20&search=juan&type=individual&riskLevel=high&status=pending&assignedTo=uuid&sortBy=updatedAt&sortOrder=desc
```

**Filter values:**
- `type`: `individual` | `corporate`
- `riskLevel`: `low` | `medium` | `high` | `critical`
- `status`: `pending` | `under_review` | `requires_documents` | `approved` | `rejected` | `escalated`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientCode": "KYC-2024-00123",
      "type": "individual",
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "displayName": "Juan Dela Cruz",
      "email": "juan@email.com",
      "riskLevel": "high",
      "riskScore": 72,
      "status": "under_review",
      "assignedTo": {
        "id": "uuid",
        "firstName": "Maria",
        "lastName": "Santos"
      },
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-15T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 230, "totalPages": 12 }
}
```

---

#### GET `/clients/:id`
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientCode": "KYC-2024-00123",
    "type": "individual",
    "status": "under_review",
    "riskLevel": "high",
    "riskScore": 72,
    "assignedTo": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },

    "personalInfo": {
      "firstName": "Juan",
      "lastName": "Dela Cruz",
      "dateOfBirth": "1985-03-22",
      "nationality": "PH",
      "placeOfBirth": "Manila",
      "gender": "male",
      "civilStatus": "married",
      "taxIdentificationNumber": "123-456-789",
      "email": "juan@email.com",
      "phone": "+63 912 345 6789"
    },

    "businessInfo": null,

    "beneficialOwners": [],

    "isPEP": false,
    "pepDetails": null,

    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-15T08:00:00Z",
    "createdBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" }
  }
}
```

---

#### POST `/clients`
**Required permission:** `client:create`

**Request body (Individual):**
```json
{
  "type": "individual",
  "personalInfo": {
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "dateOfBirth": "1985-03-22",
    "nationality": "PH",
    "placeOfBirth": "Manila",
    "gender": "male",
    "civilStatus": "married",
    "taxIdentificationNumber": "123-456-789",
    "email": "juan@email.com",
    "phone": "+63 912 345 6789"
  },
  "isPEP": false
}
```

**Request body (Corporate):**
```json
{
  "type": "corporate",
  "businessInfo": {
    "companyName": "Acme Corp",
    "registrationNumber": "CS202400001",
    "dateOfIncorporation": "2010-05-15",
    "countryOfIncorporation": "PH",
    "industry": "financial_services",
    "registeredAddress": "123 Ayala Ave, Makati City",
    "primaryContactName": "Jose Rizal",
    "primaryContactEmail": "jose@acme.com",
    "primaryContactPhone": "+63 917 000 0000"
  },
  "beneficialOwners": [
    {
      "name": "Pedro Santos",
      "nationality": "PH",
      "ownershipPercentage": 60,
      "idDocumentType": "passport",
      "idDocumentNumber": "P12345678"
    }
  ]
}
```

**Response `201`:** Full client object (same as GET `/clients/:id`)

---

#### PATCH `/clients/:id`
**Required permission:** `client:edit`

**Request body** (partial update, same structure as POST but all fields optional):
```json
{
  "personalInfo": {
    "phone": "+63 912 999 9999"
  }
}
```

**Response `200`:** Updated full client object

---

#### DELETE `/clients/:id`
**Required permission:** `client:delete`

**Response `200`:**
```json
{ "success": true, "data": null }
```

---

#### PATCH `/clients/:id/assign`
**Description:** Assign client to a compliance officer.
**Required permission:** `workflow:advance`

**Request body:**
```json
{ "assignedToId": "user-uuid" }
```

**Response `200`:**
```json
{ "success": true, "data": { "assignedTo": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" } } }
```

---

#### GET `/clients/:id/history`
**Description:** Profile update history log.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "changedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
      "field": "personalInfo.phone",
      "oldValue": "+63 912 345 6789",
      "newValue": "+63 912 999 9999",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 22.4 Document Management Endpoints

**Base route:** `/documents`

#### GET `/documents`
**Required permission:** `document:view` (inferred from `client:view`)

**Query params:**
```
?page=1&limit=20&clientId=uuid&type=government_id&status=expired&expiringWithinDays=30&sortBy=expiryDate&sortOrder=asc
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "clientName": "Juan Dela Cruz",
      "type": "government_id",
      "typeLabel": "Government ID",
      "fileName": "national_id_juan.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileUrl": "https://storage.kyc-system.internal/docs/uuid/national_id_juan.pdf",
      "uploadedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
      "uploadedAt": "2024-01-10T00:00:00Z",
      "expiryDate": "2025-01-10",
      "status": "expiring_soon",
      "version": 2,
      "notes": "Renewed passport copy"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 85, "totalPages": 5 }
}
```

---

#### GET `/documents/:id`
**Required permission:** `client:view`

**Response `200`:** Single document object (same shape as list item) plus:
```json
{
  "success": true,
  "data": {
    "...all fields from list...",
    "versionHistory": [
      {
        "version": 1,
        "fileName": "national_id_juan_v1.pdf",
        "uploadedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
        "uploadedAt": "2023-06-01T00:00:00Z",
        "fileUrl": "https://storage.kyc-system.internal/docs/uuid/v1/national_id_juan.pdf"
      }
    ]
  }
}
```

---

#### POST `/documents/upload`
**Description:** Upload one or more documents for a client.
**Required permission:** `document:upload`
**Content-Type:** `multipart/form-data`

**Form fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `clientId` | string (UUID) | Yes | |
| `type` | string | Yes | e.g. `government_id`, `business_permit`, `proof_of_address`, `articles_of_incorporation`, `financial_statement` |
| `expiryDate` | string (YYYY-MM-DD) | No | |
| `notes` | string | No | |
| `replaceDocumentId` | string (UUID) | No | If replacing an existing document |
| `files` | File[] | Yes | Max 10MB per file, PDF/JPG/PNG/DOCX |

**Response `201`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "type": "government_id",
      "fileName": "national_id_juan.pdf",
      "fileSize": 524288,
      "fileUrl": "https://storage.kyc-system.internal/docs/uuid/national_id_juan.pdf",
      "expiryDate": "2025-01-10",
      "status": "valid",
      "version": 1,
      "uploadedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**Error responses:**
- `400` — unsupported file type or file too large (code: `INVALID_FILE`)
- `404` — `clientId` not found

---

#### DELETE `/documents/:id`
**Required permission:** `document:delete`

**Response `200`:**
```json
{ "success": true, "data": null }
```

---

### 22.5 Risk Assessment Endpoints

**Base route:** `/risk`

#### GET `/risk/overview`
**Description:** Aggregate risk stats for the dashboard/risk overview page.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "low": 120,
      "medium": 85,
      "high": 42,
      "critical": 8
    },
    "trend": [
      {
        "month": "2024-01",
        "low": 112,
        "medium": 80,
        "high": 38,
        "critical": 5
      }
    ],
    "byIndustry": [
      { "industry": "financial_services", "avgScore": 68, "count": 35 }
    ],
    "byNationality": [
      { "country": "PH", "avgScore": 42, "count": 200 }
    ]
  }
}
```

---

#### GET `/risk/clients/:clientId`
**Description:** Full risk assessment for a specific client.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "riskScore": 72,
    "riskLevel": "high",
    "lastAssessed": "2024-01-15T08:00:00Z",
    "assessedBy": "system",

    "factors": {
      "clientLocation": {
        "value": "PH",
        "score": 30,
        "weight": 20,
        "label": "Philippines",
        "riskRating": "medium"
      },
      "industryClassification": {
        "value": "financial_services",
        "score": 65,
        "weight": 25,
        "label": "Financial Services",
        "riskRating": "high"
      },
      "transactionProfile": {
        "value": "high_volume",
        "score": 80,
        "weight": 20,
        "label": "High Volume",
        "riskRating": "high"
      },
      "pepStatus": {
        "value": false,
        "score": 0,
        "weight": 20,
        "label": "Not a PEP",
        "riskRating": "low"
      },
      "sanctionsResult": {
        "value": "none",
        "score": 0,
        "weight": 15,
        "label": "No Hits",
        "riskRating": "low"
      }
    },

    "override": null,

    "history": [
      {
        "date": "2024-01-10T00:00:00Z",
        "score": 65,
        "level": "high",
        "trigger": "screening_update"
      }
    ]
  }
}
```

---

#### POST `/risk/clients/:clientId/override`
**Description:** Request a manual risk override (requires manager approval).
**Required permission:** `risk:override`

**Request body:**
```json
{
  "requestedRiskLevel": "medium",
  "justification": "Client has provided additional documentation that mitigates the risk factors. Verified through direct interview."
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientId": "uuid",
    "requestedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
    "currentRiskLevel": "high",
    "requestedRiskLevel": "medium",
    "justification": "...",
    "status": "pending_approval",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### PATCH `/risk/overrides/:overrideId`
**Description:** Approve or reject a risk override request.
**Required permission:** `risk:override` + role must be `compliance_manager` or `system_admin`

**Request body:**
```json
{
  "action": "approved",
  "comment": "Reviewed additional documentation. Override approved."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "actionedBy": { "id": "uuid", "firstName": "Ben", "lastName": "Reyes" },
    "actionedAt": "2024-01-15T11:00:00Z",
    "comment": "Reviewed additional documentation. Override approved."
  }
}
```

---

#### GET `/risk/rules`
**Description:** List all configured risk rules.
**Required permission:** `settings:manage`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Financial Services Industry",
      "factor": "industry_classification",
      "weight": 25,
      "thresholds": {
        "low": { "min": 0, "max": 30 },
        "medium": { "min": 31, "max": 60 },
        "high": { "min": 61, "max": 80 },
        "critical": { "min": 81, "max": 100 }
      },
      "isActive": true,
      "notes": "Financial sector carries inherent AML risk",
      "createdAt": "2023-06-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/risk/rules`
**Required permission:** `settings:manage`

**Request body:**
```json
{
  "name": "High-Risk Country",
  "factor": "client_location",
  "weight": 30,
  "thresholds": {
    "low": { "min": 0, "max": 20 },
    "medium": { "min": 21, "max": 50 },
    "high": { "min": 51, "max": 75 },
    "critical": { "min": 76, "max": 100 }
  },
  "isActive": true,
  "notes": "Based on FATF grey/black list"
}
```

**Response `201`:** Created rule object

---

#### PATCH `/risk/rules/:ruleId`
**Required permission:** `settings:manage`
**Request body:** Partial update (any field from POST body)
**Response `200`:** Updated rule object

---

#### DELETE `/risk/rules/:ruleId`
**Required permission:** `settings:manage`
**Response `200`:** `{ "success": true, "data": null }`

---

### 22.6 Compliance Screening Endpoints

**Base route:** `/screening`

#### GET `/screening`
**Description:** All clients with pending screening alerts.
**Required permission:** `client:view`

**Query params:**
```
?page=1&limit=20&alertType=sanctions&status=pending_review
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "clientName": "Juan Dela Cruz",
      "alertType": "sanctions",
      "matchScore": 87,
      "source": "OFAC SDN List",
      "flaggedDate": "2024-01-15T00:00:00Z",
      "status": "pending_review"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

---

#### GET `/screening/clients/:clientId`
**Description:** All screening results for a specific client.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "lastScreened": "2024-01-15T08:00:00Z",

    "pep": {
      "status": "no_match",
      "matches": []
    },

    "sanctions": {
      "status": "hit",
      "matches": [
        {
          "id": "uuid",
          "source": "OFAC SDN List",
          "matchedName": "Juan D. Cruz",
          "matchScore": 87,
          "entityType": "individual",
          "listDate": "2022-05-01",
          "status": "pending_review"
        }
      ]
    },

    "watchlist": {
      "status": "clear",
      "matches": []
    },

    "history": [
      {
        "id": "uuid",
        "screenedAt": "2024-01-15T08:00:00Z",
        "screenedBy": "system",
        "type": "full",
        "result": "hit",
        "alertCount": 1
      }
    ]
  }
}
```

---

#### POST `/screening/clients/:clientId/run`
**Description:** Trigger a fresh screening run for a client.
**Required permission:** `screening:run`

**Request body:** (empty body OK)
```json
{}
```

**Response `202`:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid",
    "status": "queued",
    "message": "Screening job queued. Results will be available shortly."
  }
}
```

---

#### GET `/screening/jobs/:jobId`
**Description:** Poll the status of a screening job.
**Required permission:** `screening:run`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid",
    "status": "completed",
    "completedAt": "2024-01-15T08:01:30Z"
  }
}
```

`status` values: `queued` | `running` | `completed` | `failed`

---

#### PATCH `/screening/matches/:matchId`
**Description:** Dismiss a false positive or confirm a hit.
**Required permission:** `screening:dismiss`

**Request body:**
```json
{
  "action": "false_positive",
  "reason": "Name similarity only — different DOB, nationality, and physical description. Confirmed not the same individual after document review."
}
```

`action` values: `false_positive` | `confirmed_hit`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "false_positive",
    "actionedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
    "actionedAt": "2024-01-15T10:00:00Z",
    "reason": "Name similarity only..."
  }
}
```

---

#### GET `/screening/watchlists`
**Description:** Internal watchlist entries.
**Required permission:** `settings:manage`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Pedro Reyes",
      "entityType": "individual",
      "reason": "Previous fraud case",
      "notes": "Linked to case #2022-045",
      "addedBy": { "id": "uuid", "firstName": "Ben", "lastName": "Reyes" },
      "addedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST `/screening/watchlists`
**Required permission:** `settings:manage`

**Request body:**
```json
{
  "name": "Pedro Reyes",
  "entityType": "individual",
  "reason": "Previous fraud case",
  "notes": "Linked to case #2022-045"
}
```

**Response `201`:** Created watchlist entry

---

#### DELETE `/screening/watchlists/:entryId`
**Required permission:** `settings:manage`
**Response `200`:** `{ "success": true, "data": null }`

---

### 22.7 Workflow & Approval Endpoints

**Base route:** `/workflows`

#### GET `/workflows`
**Description:** Workflow queue with optional filters.
**Required permission:** `client:view`

**Query params:**
```
?page=1&limit=20&stage=under_review&riskLevel=high&assignedToMe=true&daysInStagePast=5&sortBy=createdAt&sortOrder=asc
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientId": "uuid",
      "clientName": "Juan Dela Cruz",
      "clientType": "individual",
      "riskLevel": "high",
      "currentStage": "under_review",
      "assignedTo": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
      "daysInCurrentStage": 3,
      "lastActionAt": "2024-01-12T08:00:00Z",
      "createdAt": "2024-01-10T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 67, "totalPages": 4 }
}
```

---

#### GET `/workflows/clients/:clientId`
**Description:** Full workflow timeline for a client.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "currentStage": "under_review",
    "timeline": [
      {
        "id": "uuid",
        "stage": "pending_verification",
        "action": "created",
        "actionedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
        "timestamp": "2024-01-10T09:00:00Z",
        "comment": null,
        "durationInStageMinutes": 1440
      },
      {
        "id": "uuid",
        "stage": "under_review",
        "action": "advanced",
        "actionedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
        "timestamp": "2024-01-11T09:00:00Z",
        "comment": "Initial documents verified",
        "durationInStageMinutes": null
      }
    ]
  }
}
```

---

#### POST `/workflows/clients/:clientId/advance`
**Description:** Move client to the next workflow stage.
**Required permission:** `workflow:advance`

**Request body:**
```json
{
  "comment": "All documents verified. Proceeding to review."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "previousStage": "pending_verification",
    "currentStage": "under_review",
    "actionedBy": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

---

#### POST `/workflows/clients/:clientId/approve`
**Required permission:** `workflow:approve`

**Request body:**
```json
{
  "comment": "All KYC requirements met. Client approved."
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "clientId": "uuid",
    "currentStage": "completed",
    "clientStatus": "approved",
    "approvedBy": { "id": "uuid", "firstName": "Ben", "lastName": "Reyes" },
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

---

#### POST `/workflows/clients/:clientId/reject`
**Required permission:** `workflow:reject`

**Request body:**
```json
{
  "reason": "Incomplete documentation. Missing notarized proof of address.",
  "comment": "Client has been notified to resubmit."
}
```

**Response `200`:** Same shape as approve, with `clientStatus: "rejected"`

---

#### POST `/workflows/clients/:clientId/escalate`
**Required permission:** `workflow:escalate`

**Request body:**
```json
{
  "reason": "Confirmed sanctions hit requires senior review.",
  "escalateTo": "user-uuid"
}
```

**Response `200`:** Same shape as advance, with `currentStage: "escalated"`

---

#### POST `/workflows/clients/:clientId/request-documents`
**Description:** Move client to "requires additional documents" stage.
**Required permission:** `workflow:advance`

**Request body:**
```json
{
  "requiredDocuments": ["proof_of_address", "financial_statement"],
  "message": "Please provide updated proof of address dated within the last 3 months."
}
```

**Response `200`:** Stage update object

---

#### PATCH `/workflows/clients/:clientId/reassign`
**Required permission:** `workflow:advance`

**Request body:**
```json
{ "assignToId": "user-uuid", "comment": "Reassigned due to officer leave." }
```

**Response `200`:** Updated workflow item

---

### 22.8 Audit Trail Endpoints

**Base route:** `/audit`

#### GET `/audit`
**Required permission:** `audit:view`

**Query params:**
```
?page=1&limit=50&userId=uuid&clientId=uuid&action=profile_change,document_upload&dateFrom=2024-01-01&dateTo=2024-01-31&sortBy=timestamp&sortOrder=desc
```

**`action` filter values (comma-separated):**
`profile_change` | `document_upload` | `risk_change` | `approval_decision` | `login` | `logout` | `screening_run` | `workflow_advance`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": { "id": "uuid", "firstName": "Maria", "lastName": "Santos", "role": "compliance_officer" },
      "action": "profile_change",
      "description": "Updated phone number for Juan Dela Cruz",
      "clientId": "uuid",
      "clientName": "Juan Dela Cruz",
      "metadata": {
        "field": "personalInfo.phone",
        "oldValue": "+63 912 345 6789",
        "newValue": "+63 912 999 9999"
      },
      "ipAddress": "192.168.1.xxx",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1240, "totalPages": 25 }
}
```

---

#### GET `/audit/export`
**Description:** Export audit log as CSV download.
**Required permission:** `audit:view`

**Query params:** Same filters as GET `/audit` (no pagination — exports full result set)

**Response `200`:**
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="audit-log-2024-01-01-to-2024-01-31.csv"`
- CSV body with headers matching audit fields

---

### 22.9 Notifications Endpoints

**Base route:** `/notifications`

#### GET `/notifications`
**Required permission:** none (scoped to current user via JWT `sub`)

**Query params:**
```
?page=1&limit=20&type=compliance_alert,document_expiry&isRead=false
```

**`type` filter values:**
`document_expiry` | `compliance_alert` | `workflow_pending` | `approval_request` | `escalation_notice` | `system_alert`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "compliance_alert",
      "title": "Sanctions Hit Detected",
      "message": "Client Juan Dela Cruz has a potential match in the OFAC SDN List.",
      "isRead": false,
      "severity": "high",
      "actionUrl": "/clients/uuid/screening",
      "actionLabel": "Review Now",
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1,
    "unreadCount": 5
  }
}
```

---

#### PATCH `/notifications/:id/read`
**Required permission:** none (scoped to current user)

**Response `200`:**
```json
{ "success": true, "data": { "id": "uuid", "isRead": true } }
```

---

#### PATCH `/notifications/read-all`
**Description:** Mark all notifications as read for the current user.
**Required permission:** none

**Response `200`:**
```json
{ "success": true, "data": { "updatedCount": 5 } }
```

---

#### DELETE `/notifications/:id`
**Required permission:** none (scoped to current user)
**Response `200`:** `{ "success": true, "data": null }`

---

### 22.10 Reports Endpoints

**Base route:** `/reports`

#### POST `/reports/generate`
**Description:** Generate a report. Returns a download URL or inline data.
**Required permission:** `report:export`

**Request body:**
```json
{
  "type": "high_risk_clients",
  "format": "csv",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "riskLevel": ["high", "critical"],
    "clientType": "individual"
  }
}
```

**`type` values:**
`high_risk_clients` | `pending_verifications` | `expired_documents` | `compliance_activity` | `pep_sanctions_hits` | `audit_log_export` | `custom`

**For `custom` type, add:**
```json
{
  "type": "custom",
  "dataSource": "clients",
  "columns": ["id", "displayName", "riskLevel", "status", "createdAt"],
  "filters": { ... }
}
```

**Response `202`:**
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "generating",
    "message": "Report is being generated."
  }
}
```

---

#### GET `/reports/:reportId/status`
**Description:** Poll report generation status.
**Required permission:** `report:export`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "completed",
    "downloadUrl": "https://storage.kyc-system.internal/reports/uuid/report.csv",
    "expiresAt": "2024-01-15T12:00:00Z",
    "rowCount": 42
  }
}
```

`status` values: `generating` | `completed` | `failed`

---

#### GET `/reports/:reportId/preview`
**Description:** Get first 10 rows of a completed report as JSON (for preview table in UI).
**Required permission:** `report:export`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "columns": ["ID", "Client Name", "Risk Level", "Status", "Created At"],
    "rows": [
      ["KYC-2024-00001", "Juan Dela Cruz", "High", "Under Review", "2024-01-10"]
    ],
    "totalRows": 42
  }
}
```

---

### 22.11 Dashboard Endpoints

**Base route:** `/dashboard`

#### GET `/dashboard/summary`
**Description:** All KPI stats for the main dashboard.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalClients": {
      "count": 255,
      "newThisMonth": 18
    },
    "pendingVerifications": {
      "count": 34,
      "trend": "+5 vs last month"
    },
    "highRiskClients": {
      "count": 50,
      "trend": "-2 vs last month"
    },
    "expiringDocuments": {
      "count": 12,
      "expiringWithin30Days": 12
    },
    "verificationStatusBreakdown": {
      "pending": 34,
      "under_review": 28,
      "requires_documents": 9,
      "approved": 165,
      "rejected": 12,
      "escalated": 7
    },
    "riskDistributionByMonth": [
      { "month": "2023-08", "low": 90, "medium": 60, "high": 30, "critical": 5 }
    ]
  }
}
```

---

#### GET `/dashboard/recent-activity`
**Description:** Recent audit events for the activity feed.
**Required permission:** `audit:view`

**Query params:** `?limit=20`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "firstName": "Maria", "lastName": "Santos", "role": "compliance_officer" },
      "description": "Approved client Juan Dela Cruz",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### GET `/dashboard/pending-actions`
**Description:** Workflow items requiring action from the current user.
**Required permission:** `client:view`

**Query params:** `?limit=10`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "clientId": "uuid",
      "clientName": "Juan Dela Cruz",
      "riskLevel": "high",
      "status": "under_review",
      "assignedTo": { "id": "uuid", "firstName": "Maria", "lastName": "Santos" },
      "daysPending": 3
    }
  ]
}
```

---

#### GET `/dashboard/alerts`
**Description:** Active compliance alerts for the dashboard alert panel.
**Required permission:** `client:view`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "severity": "critical",
      "type": "sanctions_hit",
      "message": "Client Juan Dela Cruz has an unresolved OFAC match (score: 87%)",
      "clientId": "uuid",
      "timestamp": "2024-01-15T08:00:00Z"
    }
  ]
}
```

---

### 22.12 Settings Endpoints

**Base route:** `/settings`
**Required permission:** `settings:manage` (all endpoints in this section)

#### GET `/settings`
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "organizationName": "ABC Compliance Services",
    "documentRetentionDays": 2555,
    "maxUploadSizeMB": 10,
    "timezone": "Asia/Manila",
    "dateFormat": "YYYY-MM-DD",
    "security": {
      "passwordMinLength": 8,
      "passwordRequireUppercase": true,
      "passwordRequireNumbers": true,
      "passwordRequireSymbols": true,
      "passwordExpiryDays": 90,
      "sessionTimeoutMinutes": 30,
      "maxFailedLoginAttempts": 5,
      "mfaRequiredRoles": ["compliance_manager", "system_admin"]
    }
  }
}
```

---

#### PATCH `/settings`
**Request body** (partial update of any field from GET response):
```json
{
  "organizationName": "XYZ Compliance Services",
  "security": {
    "sessionTimeoutMinutes": 60
  }
}
```

**Response `200`:** Updated settings object

---

#### GET `/settings/roles`
**Description:** Permission matrix for all roles.
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "roles": ["compliance_officer", "risk_analyst", "reviewer", "compliance_manager", "system_admin"],
    "permissions": [
      {
        "key": "client:view",
        "label": "View Client Profile",
        "assignments": {
          "compliance_officer": true,
          "risk_analyst": true,
          "reviewer": true,
          "compliance_manager": true,
          "system_admin": true
        }
      }
    ]
  }
}
```

---

#### PATCH `/settings/roles`
**Description:** Update the permission matrix.

**Request body:**
```json
{
  "role": "reviewer",
  "permission": "document:upload",
  "granted": true
}
```

**Response `200`:**
```json
{ "success": true, "data": { "role": "reviewer", "permission": "document:upload", "granted": true } }
```

---

### 22.13 Permission Reference Table

This table is the authoritative RBAC mapping. Both frontend guards and backend Passport guards must enforce it.

| Permission Key | Compliance Officer | Risk Analyst | Reviewer | Compliance Manager | System Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| `client:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `client:create` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `client:edit` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `client:delete` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `document:upload` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `document:delete` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `risk:override` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `screening:run` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `screening:dismiss` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `workflow:advance` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `workflow:approve` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `workflow:reject` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `workflow:escalate` | ✅ | ❌ | ❌ | ✅ | ✅ |
| `audit:view` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `report:export` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `user:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `settings:manage` | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 22.14 Backend NestJS Guard Implementation Notes

The backend (NestJS + Passport) must implement the following pattern for every protected route:

```ts
// 1. JWT Strategy — validates token and attaches req.user
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}

// 2. Permissions Guard — checks req.user.permissions
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!required) return true;
    const { user } = context.switchToHttp().getRequest();
    if (user.role === 'system_admin') return true; // Admin bypasses all
    return required.every(p => user.permissions.includes(p));
  }
}

// 3. Usage on controller methods
@Get('clients')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('client:view')
getClients() { ... }
```

Permissions array in the JWT must match exactly the permission keys in section 22.13.

---

*End of Frontend Build Guide + API Contract*
*Version 2.0 — KYC Smart Verification System*
