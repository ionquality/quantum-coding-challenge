<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Merchant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'created_by',
    ];

    /**
     * Get the user who created the merchant.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function notes(): MorphMany
    {
        return $this->morphMany(Note::class, 'notable');
    }
}
