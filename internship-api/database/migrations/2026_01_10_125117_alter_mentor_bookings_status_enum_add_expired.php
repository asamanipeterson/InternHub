<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // Change enum to include 'expired'
            $table->enum('status', [
                'pending',
                'paid',
                'completed',
                'cancelled',
                'expired'           // ← added
            ])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // Revert (remove 'expired' if you rollback)
            $table->enum('status', [
                'pending',
                'paid',
                'completed',
                'cancelled'
            ])->default('pending')->change();
        });
    }
};
