<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Passport\Client as PassportClientModel;

class PassportClient extends PassportClientModel
{
    /**
     * Convert SQL Server raw UUID bytes into a canonical UUID string.
     */
    protected function id(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): ?string => $this->normalizeUuid($value),
        );
    }

    /**
     * Normalize a 16-byte SQL Server uniqueidentifier to a UUID string.
     */
    protected function normalizeUuid(?string $value): ?string
    {
        if (! is_string($value) || strlen($value) !== 16) {
            return $value;
        }

        $hex = bin2hex($value);

        return substr($hex, 0, 8)
            . '-' . substr($hex, 8, 4)
            . '-' . substr($hex, 12, 4)
            . '-' . substr($hex, 16, 4)
            . '-' . substr($hex, 20);
    }
}
