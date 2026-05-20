# KYC Smart Verification Backend API Contract

## Base URL

Local Laravel server:

```bash
http://localhost:8000/api/v1
```

Frontend override:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Allowed frontend origin defaults to:

```bash
FRONTEND_URL=http://localhost:3000
```

## Endpoints

### Platform Scope Endpoints

These endpoints map to the full project scope in `ProjectSummary.md`.

| Method | Endpoint | Scope |
| --- | --- | --- |
| `POST` | `/auth/login` | JWT-ready login with MFA requirement response |
| `POST` | `/auth/forgot-password` | Password reset request |
| `POST` | `/auth/verify-otp` | MFA OTP verification |
| `GET` | `/users` | User management, account status, MFA readiness |
| `GET` | `/roles` | RBAC roles and permissions |
| `GET` | `/clients` | Client KYC profiles, status, ownership, profile history |
| `GET` | `/documents` | Document management, categorization, versioning, expiry |
| `POST` | `/documents/upload` | Secure document upload metadata contract |
| `GET` | `/risk/assessments` | Risk scoring, categorization, risk factors, rule metadata |
| `GET` | `/compliance/screenings` | PEP, sanctions, watchlist, and rule screening |
| `GET` | `/workflows` | Approval stages, assignments, escalation routing |
| `GET` | `/audit-logs` | Immutable audit and activity history |
| `GET` | `/notifications` | Alerts, reminders, and WebSocket event names |
| `GET` | `/reports` | Report catalog and export formats |
| `POST` | `/reports/{reportId}/export` | Queue PDF/CSV/XLSX report export |

### GET `/kyc/overview`

Returns dashboard metrics, alerts, and audit activity.

```json
{
  "data": {
    "metrics": {
      "total_cases": 5,
      "open_cases": 4,
      "high_risk_cases": 2,
      "average_risk_score": 58,
      "active_alerts": 9,
      "sla_hours_remaining": 80,
      "documents_expiring": 1,
      "pending_approvals": 1
    },
    "alerts": [
      {
        "id": "ALT-9001",
        "severity": "critical",
        "message": "SLA breach risk for Northbridge Capital Holdings"
      }
    ],
    "audit_trail": [
      {
        "timestamp": "2026-05-20T10:42:00+08:00",
        "message": "Risk Analyst A. Reyes completed sanctions screening"
      }
    ]
  }
}
```

### GET `/kyc/cases`

Returns the review queue.

Query parameters:

| Name | Type | Description |
| --- | --- | --- |
| `search` | string | Filters by case ID, client name, or owner. |
| `risk_threshold` | number | Score used by alert-only filtering. |
| `alerts_only` | boolean | Returns cases with alerts or score above threshold. |

### GET `/kyc/cases/{caseId}`

Returns case details, documents, workflow stages, and audit history for one KYC case.

### POST `/auth/login`

Request:

```json
{
  "email": "test@example.com",
  "password": "password"
}
```

Returns a demo bearer token, the matched user profile, and `mfa_required: true`.

### POST `/documents/upload`

Request:

```json
{
  "case_id": "KYC-1048",
  "category": "Identification",
  "file_name": "passport.pdf"
}
```

Returns `202 Accepted` with upload metadata queued for the secure document pipeline.

### POST `/reports/{reportId}/export`

Queues a report export and returns a demo download URL.

### POST `/kyc/cases/{caseId}/actions`

Records a reviewer workflow action.

Request:

```json
{
  "action": "approve",
  "notes": "Submitted from KYC frontend Overview workspace."
}
```

Allowed `action` values:

- `approve`
- `reject`
- `escalate`
- `request_documents`
- `recalculate_risk`
- `override_risk`

Success response: `202 Accepted`

```json
{
  "data": {
    "case_id": "KYC-1048",
    "action": "approve",
    "status": "accepted",
    "message": "Workflow action recorded for reviewer processing.",
    "recorded_at": "2026-05-20T02:42:00.000000Z"
  }
}
```

Validation errors return `422`.

## Current Implementation Notes

The controller currently serves deterministic in-memory data so the frontend can be integrated immediately. The next production step is to move these records into migrations/models for:

- users
- roles and permissions
- clients
- kyc_cases
- kyc_documents
- risk_assessments
- screening_results
- workflow_tasks
- notifications
- reports
- compliance_alerts
- workflow_actions
- audit_logs

## Frontend Integration

The Next.js frontend reads from the Laravel API through:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

If the backend is not running, the frontend uses deterministic fallback data and shows `API status: fallback` in the header.

## Run Locally

Backend:

```bash
cd backend
php artisan serve
```

Frontend:

```bash
cd frontend
npm run dev
```
