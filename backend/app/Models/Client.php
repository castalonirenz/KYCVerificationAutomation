<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'type', 'email', 'phone', 'country', 'industry', 'relationship_manager', 'status', 'risk_classification'])]
class Client extends Model
{
    public function kycCases(): HasMany
    {
        return $this->hasMany(KycCase::class);
    }
}
