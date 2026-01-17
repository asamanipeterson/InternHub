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
        Schema::table('mentors', function (Blueprint $table) {
            // 1. Drop the old Zoom columns
            $table->dropColumn(['zoom_access_token', 'zoom_refresh_token', 'zoom_expires_at']);

            // 2. Add the new Google columns
            // We use 'after' to keep the database organized
            $table->text('google_access_token')->nullable()->after('email');
            $table->text('google_refresh_token')->nullable()->after('google_access_token');
            $table->integer('google_token_expires_in')->nullable()->after('google_refresh_token');
            $table->timestamp('google_token_created_at')->nullable()->after('google_token_expires_in');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            // Rollback: Remove Google columns
            $table->dropColumn([
                'google_access_token',
                'google_refresh_token',
                'google_token_expires_in',
                'google_token_created_at'
            ]);

            // Rollback: Put Zoom columns back
            $table->text('zoom_access_token')->nullable();
            $table->text('zoom_refresh_token')->nullable();
            $table->timestamp('zoom_expires_at')->nullable();
        });
    }
};
