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
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // We use 'currency' since it's definitely in your original schema
            $table->string('google_meet_link')->nullable()->after('status');
            $table->string('google_calendar_event_id')->nullable()->after('google_meet_link');

            // Optional: Remove the old Zoom columns to keep the DB clean
            $table->dropColumn(['zoom_meeting_id', 'zoom_join_url', 'zoom_start_url']);
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->dropColumn(['google_meet_link', 'google_calendar_event_id']);

            // Restore zoom columns if you roll back
            $table->string('zoom_meeting_id')->nullable();
            $table->string('zoom_join_url')->nullable();
            $table->string('zoom_start_url')->nullable();
        });
    }
};
