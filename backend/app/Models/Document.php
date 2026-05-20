<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['kyc_case_id', 'name', 'category', 'status', 'version', 'expires_on', 'note'])]
class Document extends Model
{
    protected function casts(): array
    {
        return [
            'expires_on' => 'date',
        ];
    }

    public function kycCase(): BelongsTo
    {
        return $this->belongsTo(KycCase::class);
    }
}
