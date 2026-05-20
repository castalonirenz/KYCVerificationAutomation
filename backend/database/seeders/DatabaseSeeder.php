<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'System Administrator'],
            [
                'description' => 'Temporary bootstrap administrator with full access.',
                'permissions' => [
                    'users.manage',
                    'roles.manage',
                    'clients.manage',
                    'cases.manage',
                    'documents.manage',
                    'reports.export',
                ],
            ],
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@kyc.local'],
            [
                'name' => 'Temporary Admin',
                'password' => Hash::make('TempAdmin123!'),
                'department' => 'Administration',
                'status' => 'Active',
                'mfa_enabled' => false,
            ],
        );

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
    }
}
