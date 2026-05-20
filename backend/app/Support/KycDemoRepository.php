<?php

namespace App\Support;

use Illuminate\Support\Collection;

class KycDemoRepository
{
    public function cases(): Collection
    {
        return collect([
            [
                'id' => 'KYC-1048',
                'client_id' => 'CL-1001',
                'name' => 'Northbridge Capital Holdings',
                'type' => 'Corporate',
                'owner' => 'M. Santos',
                'country' => 'Philippines',
                'industry' => 'Financial services',
                'status' => 'Escalated',
                'risk' => 'Critical',
                'score' => 92,
                'sla' => 6,
                'docs' => 9,
                'alerts' => 5,
                'last_activity' => 'Risk override requested',
            ],
            [
                'id' => 'KYC-1047',
                'client_id' => 'CL-1002',
                'name' => 'Elena V. Cruz',
                'type' => 'Individual',
                'owner' => 'A. Reyes',
                'country' => 'Singapore',
                'industry' => 'Private banking',
                'status' => 'Under Review',
                'risk' => 'High',
                'score' => 78,
                'sla' => 14,
                'docs' => 6,
                'alerts' => 3,
                'last_activity' => 'PEP screening matched',
            ],
            [
                'id' => 'KYC-1046',
                'client_id' => 'CL-1003',
                'name' => 'Maritime One Logistics',
                'type' => 'Corporate',
                'owner' => 'J. Lim',
                'country' => 'Malaysia',
                'industry' => 'Shipping',
                'status' => 'Requires Documents',
                'risk' => 'Medium',
                'score' => 54,
                'sla' => 28,
                'docs' => 4,
                'alerts' => 1,
                'last_activity' => 'Proof of address expired',
            ],
            [
                'id' => 'KYC-1045',
                'client_id' => 'CL-1004',
                'name' => 'Tala Renewable Energy Corp.',
                'type' => 'Corporate',
                'owner' => 'C. Mendoza',
                'country' => 'Philippines',
                'industry' => 'Energy',
                'status' => 'Pending Verification',
                'risk' => 'Medium',
                'score' => 47,
                'sla' => 32,
                'docs' => 7,
                'alerts' => 0,
                'last_activity' => 'Documents uploaded',
            ],
            [
                'id' => 'KYC-1044',
                'client_id' => 'CL-1005',
                'name' => 'Daniel Foster',
                'type' => 'Individual',
                'owner' => 'R. Tan',
                'country' => 'United States',
                'industry' => 'Consulting',
                'status' => 'Approved',
                'risk' => 'Low',
                'score' => 21,
                'sla' => 0,
                'docs' => 5,
                'alerts' => 0,
                'last_activity' => 'Reviewer approved profile',
            ],
        ]);
    }

    public function users(): array
    {
        return [
            ['id' => 'USR-001', 'name' => 'Maria Santos', 'role' => 'Compliance Manager', 'department' => 'RM Compliance', 'mfa_enabled' => true, 'status' => 'Active'],
            ['id' => 'USR-002', 'name' => 'Ana Reyes', 'role' => 'Risk Analyst', 'department' => 'Risk Review', 'mfa_enabled' => true, 'status' => 'Active'],
            ['id' => 'USR-003', 'name' => 'Carlo Mendoza', 'role' => 'Reviewer', 'department' => 'KYC Operations', 'mfa_enabled' => false, 'status' => 'Password reset required'],
            ['id' => 'USR-004', 'name' => 'Jasmine Lim', 'role' => 'Compliance Officer', 'department' => 'AML Screening', 'mfa_enabled' => true, 'status' => 'Active'],
        ];
    }

    public function roles(): array
    {
        return [
            ['role' => 'Compliance Officer', 'permissions' => ['clients.read', 'documents.review', 'screening.run']],
            ['role' => 'Risk Analyst', 'permissions' => ['risk.read', 'risk.override.request', 'screening.read']],
            ['role' => 'Reviewer', 'permissions' => ['cases.review', 'cases.approve', 'documents.request']],
            ['role' => 'Compliance Manager', 'permissions' => ['cases.escalate', 'risk.override.approve', 'reports.export']],
            ['role' => 'System Administrator', 'permissions' => ['users.manage', 'roles.manage', 'settings.manage']],
        ];
    }

    public function clientProfiles(): array
    {
        return $this->cases()->map(fn (array $case): array => [
            'id' => $case['client_id'],
            'case_id' => $case['id'],
            'name' => $case['name'],
            'type' => $case['type'],
            'status' => $case['status'],
            'risk_classification' => $case['risk'],
            'relationship_manager' => $case['owner'],
            'beneficial_owners' => $case['type'] === 'Corporate' ? ['Primary UBO verified', 'Secondary UBO pending'] : [],
            'profile_history' => ['Profile created', $case['last_activity']],
        ])->all();
    }

    public function documents(): array
    {
        return [
            ['id' => 'DOC-501', 'case_id' => 'KYC-1048', 'name' => 'Government ID', 'category' => 'Identification', 'status' => 'Reviewed', 'version' => 3, 'expires_on' => '2028-04-10', 'note' => 'Valid until 2028'],
            ['id' => 'DOC-502', 'case_id' => 'KYC-1048', 'name' => 'Business permit', 'category' => 'Corporate registration', 'status' => 'Ready to review', 'version' => 2, 'expires_on' => '2027-12-01', 'note' => 'Uploaded today'],
            ['id' => 'DOC-503', 'case_id' => 'KYC-1046', 'name' => 'Proof of address', 'category' => 'Address verification', 'status' => 'Awaiting data', 'version' => 1, 'expires_on' => '2026-05-17', 'note' => 'Expired 3 days ago'],
            ['id' => 'DOC-504', 'case_id' => 'KYC-1048', 'name' => 'Beneficial ownership', 'category' => 'Ownership', 'status' => 'Unmatched', 'version' => 4, 'expires_on' => null, 'note' => 'Needs reviewer decision'],
        ];
    }

    public function riskAssessments(): array
    {
        return [
            ['case_id' => 'KYC-1048', 'score' => 92, 'category' => 'Critical', 'factors' => ['High-risk jurisdiction', 'Sanctions partial match', 'Manual override pending']],
            ['case_id' => 'KYC-1047', 'score' => 78, 'category' => 'High', 'factors' => ['PEP match', 'Private banking profile']],
            ['case_id' => 'KYC-1046', 'score' => 54, 'category' => 'Medium', 'factors' => ['Shipping industry', 'Expired proof of address']],
            ['case_id' => 'KYC-1045', 'score' => 47, 'category' => 'Medium', 'factors' => ['Energy sector', 'New corporate onboarding']],
            ['case_id' => 'KYC-1044', 'score' => 21, 'category' => 'Low', 'factors' => ['Low-risk country', 'No watchlist match']],
        ];
    }

    public function screenings(): array
    {
        return [
            ['id' => 'SCR-7001', 'case_id' => 'KYC-1048', 'type' => 'Sanctions', 'source' => 'Public sanctions database', 'result' => 'Potential match', 'confidence' => 86, 'status' => 'Escalated'],
            ['id' => 'SCR-7002', 'case_id' => 'KYC-1047', 'type' => 'PEP', 'source' => 'Public PEP list', 'result' => 'Confirmed PEP relationship', 'confidence' => 91, 'status' => 'Under Review'],
            ['id' => 'SCR-7003', 'case_id' => 'KYC-1046', 'type' => 'Watchlist', 'source' => 'Internal watchlist', 'result' => 'No match', 'confidence' => 99, 'status' => 'Reviewed'],
            ['id' => 'SCR-7004', 'case_id' => 'KYC-1045', 'type' => 'Rule Check', 'source' => 'BSP Circular 706 checklist', 'result' => 'Additional docs required', 'confidence' => 74, 'status' => 'Pending Verification'],
        ];
    }

    public function workflows(): array
    {
        return [
            ['case_id' => 'KYC-1048', 'stage' => 'Escalated', 'assignee' => 'Compliance Manager', 'next_action' => 'Approve risk override'],
            ['case_id' => 'KYC-1047', 'stage' => 'Under Review', 'assignee' => 'Reviewer', 'next_action' => 'Confirm PEP disposition'],
            ['case_id' => 'KYC-1046', 'stage' => 'Requires Additional Documents', 'assignee' => 'Compliance Officer', 'next_action' => 'Request updated proof of address'],
            ['case_id' => 'KYC-1045', 'stage' => 'Pending Verification', 'assignee' => 'Risk Analyst', 'next_action' => 'Complete risk scoring'],
        ];
    }

    public function alerts(): array
    {
        return [
            ['id' => 'ALT-9001', 'severity' => 'critical', 'message' => 'SLA breach risk for Northbridge Capital Holdings', 'channel' => 'system'],
            ['id' => 'ALT-9002', 'severity' => 'high', 'message' => 'PEP match requires reviewer confirmation', 'channel' => 'email'],
            ['id' => 'ALT-9003', 'severity' => 'medium', 'message' => 'Proof of address expiration reminder sent', 'channel' => 'system'],
            ['id' => 'ALT-9004', 'severity' => 'medium', 'message' => 'Pending approval reminder for escalated case KYC-1048', 'channel' => 'system'],
        ];
    }

    public function auditTrail(): array
    {
        return [
            ['timestamp' => '2026-05-20T10:42:00+08:00', 'event' => 'screening.completed', 'actor' => 'A. Reyes', 'message' => 'Risk Analyst A. Reyes completed sanctions screening'],
            ['timestamp' => '2026-05-20T10:35:00+08:00', 'event' => 'risk.flagged', 'actor' => 'M. Santos', 'message' => 'Compliance Officer M. Santos added high-risk jurisdiction flag'],
            ['timestamp' => '2026-05-20T10:28:00+08:00', 'event' => 'risk.recalculated', 'actor' => 'System', 'message' => 'System recalculated AML score after document update'],
            ['timestamp' => '2026-05-20T10:21:00+08:00', 'event' => 'document.requested', 'actor' => 'C. Mendoza', 'message' => 'Reviewer C. Mendoza requested additional proof of address'],
        ];
    }

    public function reports(): array
    {
        return [
            ['id' => 'RPT-001', 'name' => 'High-risk client report', 'format' => 'PDF/CSV', 'records' => 2],
            ['id' => 'RPT-002', 'name' => 'Pending verification report', 'format' => 'PDF/Excel', 'records' => 4],
            ['id' => 'RPT-003', 'name' => 'Expired document report', 'format' => 'CSV/Excel', 'records' => 1],
            ['id' => 'RPT-004', 'name' => 'Compliance activity summary', 'format' => 'PDF', 'records' => 24],
        ];
    }
}
