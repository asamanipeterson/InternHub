<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            // Renames the column while preserving existing email data
            $table->renameColumn('zoom_email', 'google_calendar_email');
        });
    }

    public function down(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->renameColumn('google_calendar_email', 'zoom_email');
        });
    }
};
