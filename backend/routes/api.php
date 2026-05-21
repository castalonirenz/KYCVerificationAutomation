<?php

use App\Http\Controllers\Api\KycCaseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/login', [KycCaseController::class, 'login']);
    Route::post('/auth/forgot-password', [KycCaseController::class, 'forgotPassword']);
    Route::post('/auth/verify-otp', [KycCaseController::class, 'verifyOtp']);

    Route::middleware('auth:api')->group(function (): void {
        Route::get('/auth/me', [KycCaseController::class, 'me']);
        Route::post('/auth/logout', [KycCaseController::class, 'logout']);
        Route::get('/users', [KycCaseController::class, 'users']);
        Route::post('/users', [KycCaseController::class, 'storeUser']);
        Route::put('/users/{user}', [KycCaseController::class, 'updateUser']);
        Route::patch('/users/{user}', [KycCaseController::class, 'updateUser']);
        Route::delete('/users/{user}', [KycCaseController::class, 'destroyUser']);
        Route::get('/roles', [KycCaseController::class, 'roles']);
        Route::post('/roles', [KycCaseController::class, 'storeRole']);
        Route::get('/clients', [KycCaseController::class, 'clients']);
        Route::post('/clients', [KycCaseController::class, 'storeClient']);
        Route::get('/clients/{client}', [KycCaseController::class, 'showClient']);
        Route::get('/documents', [KycCaseController::class, 'documents']);
        Route::post('/documents/upload', [KycCaseController::class, 'uploadDocument']);
        Route::get('/risk/assessments', [KycCaseController::class, 'riskAssessments']);
        Route::get('/compliance/screenings', [KycCaseController::class, 'screenings']);
        Route::get('/workflows', [KycCaseController::class, 'workflows']);
        Route::get('/audit-logs', [KycCaseController::class, 'auditLogs']);
        Route::get('/notifications', [KycCaseController::class, 'notifications']);
        Route::get('/reports', [KycCaseController::class, 'reports']);
        Route::post('/reports/{reportId}/export', [KycCaseController::class, 'exportReport']);
        Route::get('/kyc/overview', [KycCaseController::class, 'overview']);
        Route::get('/kyc/cases', [KycCaseController::class, 'index']);
        Route::get('/kyc/cases/{caseId}', [KycCaseController::class, 'show']);
        Route::post('/kyc/cases/{caseId}/actions', [KycCaseController::class, 'storeAction']);
    });

    Route::get('/test-token', function () {
    $user = \App\Models\User::first();

    return [
        'token' => $user->createToken('Postman')->accessToken
    ];
});
});

Route::options('/{any}', fn () => response('', 204))->where('any', '.*');
