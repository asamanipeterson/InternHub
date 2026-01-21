<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Only add columns if they don't already exist (safe for production)
            if (!Schema::hasColumn('companies', 'is_paid')) {
                $table->boolean('is_paid')
                    ->default(true)
                    ->after('available_slots');
            }

            if (!Schema::hasColumn('companies', 'requirements')) {
                $table->text('requirements')
                    ->nullable()
                    ->after('is_paid');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Only drop if columns exist
            if (Schema::hasColumn('companies', 'is_paid')) {
                $table->dropColumn('is_paid');
            }
            if (Schema::hasColumn('companies', 'requirements')) {
                $table->dropColumn('requirements');
            }
        });
    }
};
