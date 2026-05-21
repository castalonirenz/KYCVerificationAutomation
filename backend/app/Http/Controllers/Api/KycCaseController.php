<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Document;
use App\Models\KycCase;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class KycCaseController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', $credentials['email'])->with('roles')->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'This account is not active.'], 403);
        }

        $permissions = $this->userPermissions($user);

        return response()->json([
            'data' => [
                'message' => 'Login successful.',
                'token_type' => 'Bearer',
                'access_token' => $user->createToken('kyc-web')->accessToken,
                'mfa_required' => false,
                'user' => $this->userResource($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->userResource($request->user()->load('roles'))]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->token()?->revoke();

        return response()->json(['data' => ['message' => 'Passport token revoked.']]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        return response()->json(['data' => ['message' => 'Password reset request received. Configure mail to deliver reset links.']]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        return response()->json(['data' => ['message' => 'OTP verification endpoint is ready for your MFA provider.']]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->authorizePermission($request->user(), 'users.manage');

        return response()->json(['data' => User::with('roles')->latest()->get()->map(fn (User $user) => $this->userResource($user))->values()]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $this->authorizePermission($request->user(), 'users.manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'department' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['Active', 'Disabled', 'Password reset required'])],
            'mfa_enabled' => ['boolean'],
            'role_ids' => ['array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $roleIds = $data['role_ids'] ?? [];
        unset($data['role_ids']);
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        $user->roles()->sync($roleIds);

        return response()->json(['data' => $this->userResource($user->load('roles'))], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->authorizePermission($request->user(), 'users.manage');

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'department' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'required', Rule::in(['Active', 'Disabled', 'Password reset required'])],
            'mfa_enabled' => ['boolean'],
            'role_ids' => ['array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $roleIds = $data['role_ids'] ?? null;
        unset($data['role_ids']);

        if (array_key_exists('password', $data)) {
            if ($data['password'] === null || $data['password'] === '') {
                unset($data['password']);
            } else {
                $data['password'] = Hash::make($data['password']);
            }
        }

        $user->update($data);

        if ($roleIds !== null) {
            $user->roles()->sync($roleIds);
        }

        return response()->json(['data' => $this->userResource($user->fresh('roles'))]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        $this->authorizePermission($request->user(), 'users.manage');

        if ($request->user()?->is($user)) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->tokens()->update(['revoked' => true]);
        $user->delete();

        return response()->json(['data' => ['message' => 'User deleted.']]);
    }

    public function roles(Request $request): JsonResponse
    {
        $this->authorizePermission($request->user(), 'users.manage');

        return response()->json(['data' => Role::latest()->get()]);
    }

    public function storeRole(Request $request): JsonResponse
    {
        $this->authorizePermission($request->user(), 'roles.manage');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', 'max:100'],
        ]);

        return response()->json(['data' => Role::create($data)], 201);
    }

    public function clients(): JsonResponse
    {
        return response()->json(['data' => Client::with('kycCases')->latest()->get()->map(fn (Client $client) => $this->clientResource($client))->values()]);
    }

    public function storeClient(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['Individual', 'Corporate'])],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'country' => ['nullable', 'string', 'max:100'],
            'industry' => ['nullable', 'string', 'max:120'],
            'relationship_manager' => ['nullable', 'string', 'max:255'],
        ]);

        $client = Client::create($data + ['status' => 'Draft', 'risk_classification' => 'Unrated']);
        $client->kycCases()->create([
            'owner_id' => $request->user()?->id,
            'status' => 'Draft',
            'risk' => 'Unrated',
            'last_activity' => 'Client created',
        ]);

        return response()->json(['data' => $this->clientResource($client->load('kycCases'))], 201);
    }

    public function showClient(Client $client): JsonResponse
    {
        return response()->json(['data' => $this->clientResource($client->load('kycCases.documents'))]);
    }

    public function documents(Request $request): JsonResponse
    {
        $caseId = $request->query('case_id');
        $documents = Document::with('kycCase.client')
            ->when($caseId, fn ($query) => $query->where('kyc_case_id', $caseId))
            ->latest()
            ->get()
            ->map(fn (Document $document) => $this->documentResource($document))
            ->values();

        return response()->json(['data' => $documents]);
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $data = $request->validate([
            'case_id' => ['required', 'integer', 'exists:kyc_cases,id'],
            'category' => ['required', 'string', 'max:120'],
            'file_name' => ['required', 'string', 'max:255'],
            'expires_on' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $document = Document::create([
            'kyc_case_id' => $data['case_id'],
            'name' => $data['file_name'],
            'category' => $data['category'],
            'expires_on' => $data['expires_on'] ?? null,
            'note' => $data['note'] ?? null,
        ]);

        return response()->json(['data' => $this->documentResource($document->load('kycCase.client'))], 201);
    }

    public function overview(): JsonResponse
    {
        $cases = KycCase::query();

        return response()->json([
            'data' => [
                'metrics' => [
                    'total_cases' => (clone $cases)->count(),
                    'open_cases' => (clone $cases)->whereNotIn('status', ['Approved', 'Rejected'])->count(),
                    'high_risk_cases' => (clone $cases)->where('score', '>=', 60)->count(),
                    'average_risk_score' => (int) round((clone $cases)->avg('score') ?? 0),
                    'active_alerts' => (clone $cases)->sum('alerts'),
                    'sla_hours_remaining' => (clone $cases)->sum('sla_hours'),
                    'documents_expiring' => Document::whereNotNull('expires_on')->whereDate('expires_on', '<=', now()->addDays(30))->count(),
                    'pending_approvals' => (clone $cases)->where('status', 'Manager Approval')->count(),
                ],
                'alerts' => [],
                'audit_trail' => [],
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = strtolower((string) $request->query('search', ''));

        $cases = KycCase::with(['client', 'owner'])
            ->when($query !== '', fn ($builder) => $builder->whereHas('client', fn ($clientQuery) => $clientQuery->where('name', 'like', "%{$query}%")))
            ->latest()
            ->get()
            ->map(fn (KycCase $case) => $this->caseResource($case))
            ->values();

        return response()->json(['data' => $cases, 'meta' => ['count' => $cases->count()]]);
    }

    public function show(string $caseId): JsonResponse
    {
        $case = KycCase::with(['client', 'owner', 'documents'])->findOrFail($caseId);

        return response()->json(['data' => $this->caseResource($case) + ['documents' => $case->documents->map(fn (Document $document) => $this->documentResource($document))->values()]]);
    }

    public function storeAction(Request $request, string $caseId): JsonResponse
    {
        $case = KycCase::with('client')->findOrFail($caseId);
        $data = $request->validate([
            'action' => ['required', Rule::in(['approve', 'reject', 'escalate', 'request_documents', 'recalculate_risk', 'override_risk'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $status = match ($data['action']) {
            'approve' => 'Approved',
            'reject' => 'Rejected',
            'escalate' => 'Escalated',
            'request_documents' => 'Requires Additional Documents',
            'recalculate_risk' => 'Under Review',
            'override_risk' => 'Manager Approval',
        };

        $case->update(['status' => $status, 'last_activity' => $data['notes'] ?? "Action recorded: {$data['action']}"]);
        $case->client->update(['status' => $status]);

        return response()->json(['data' => $this->caseResource($case->fresh(['client', 'owner']))]);
    }

    public function riskAssessments(): JsonResponse
    {
        return response()->json(['data' => KycCase::with('client')->latest()->get()->map(fn (KycCase $case) => [
            'case_id' => $case->id,
            'client' => $case->client?->name,
            'score' => $case->score,
            'category' => $case->risk,
            'factors' => [],
        ])->values()]);
    }

    public function screenings(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function workflows(): JsonResponse
    {
        return response()->json([
            'data' => KycCase::with(['client', 'owner'])->latest()->get()->map(fn (KycCase $case) => [
                'case_id' => $case->id,
                'client' => $case->client?->name,
                'stage' => $case->status,
                'assignee' => $case->owner?->name ?? 'Unassigned',
                'next_action' => $case->status === 'Approved' ? 'Completed' : 'Review case',
            ])->values(),
            'stages' => ['Draft', 'Pending Verification', 'Under Review', 'Requires Additional Documents', 'Manager Approval', 'Approved', 'Rejected', 'Escalated'],
        ]);
    }

    public function auditLogs(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function notifications(): JsonResponse
    {
        return response()->json(['data' => [], 'events' => ['notification:new', 'kyc:approved', 'document:uploaded', 'case:escalated']]);
    }

    public function reports(): JsonResponse
    {
        return response()->json(['data' => [], 'export_formats' => ['pdf', 'csv', 'xlsx']]);
    }

    public function exportReport(string $reportId): JsonResponse
    {
        return response()->json(['data' => ['report_id' => $reportId, 'status' => 'queued', 'message' => 'Report export queued.']], 202);
    }

    private function userResource(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'department' => $user->department,
            'status' => $user->status,
            'mfa_enabled' => $user->mfa_enabled,
            'roles' => $user->roles->pluck('name')->values()->all(),
            'role_ids' => $user->roles->pluck('id')->values()->all(),
            'permissions' => $this->userPermissions($user),
        ];
    }

    private function authorizePermission(?User $user, string $permission): void
    {
        abort_unless($user?->loadMissing('roles')->hasPermission($permission), 403, 'This action requires administrator access.');
    }

    /**
     * @return array<int, string>
     */
    private function userPermissions(User $user): array
    {
        return $user->roles
            ->flatMap(fn (Role $role) => $role->permissions ?? [])
            ->unique()
            ->values()
            ->all();
    }

    private function clientResource(Client $client): array
    {
        $case = $client->kycCases->first();

        return [
            'id' => $client->id,
            'case_id' => $case?->id,
            'name' => $client->name,
            'type' => $client->type,
            'email' => $client->email,
            'phone' => $client->phone,
            'country' => $client->country,
            'industry' => $client->industry,
            'status' => $client->status,
            'risk_classification' => $client->risk_classification,
            'relationship_manager' => $client->relationship_manager,
        ];
    }

    private function caseResource(KycCase $case): array
    {
        return [
            'id' => $case->id,
            'client_id' => $case->client_id,
            'name' => $case->client?->name,
            'type' => $case->client?->type,
            'owner' => $case->owner?->name ?? 'Unassigned',
            'country' => $case->client?->country,
            'industry' => $case->client?->industry,
            'status' => $case->status,
            'risk' => $case->risk,
            'score' => $case->score,
            'sla' => $case->sla_hours,
            'alerts' => $case->alerts,
            'last_activity' => $case->last_activity,
        ];
    }

    private function documentResource(Document $document): array
    {
        return [
            'id' => $document->id,
            'case_id' => $document->kyc_case_id,
            'client' => $document->kycCase?->client?->name,
            'name' => $document->name,
            'category' => $document->category,
            'status' => $document->status,
            'version' => $document->version,
            'expires_on' => $document->expires_on?->toDateString(),
            'note' => $document->note,
        ];
    }
}
