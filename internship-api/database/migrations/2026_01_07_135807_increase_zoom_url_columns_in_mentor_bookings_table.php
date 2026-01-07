<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->text('zoom_join_url')->nullable()->change();
            $table->text('zoom_start_url')->nullable()->change();
            // Optional: also increase zoom_meeting_id if needed
            $table->string('zoom_meeting_id', 50)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->string('zoom_join_url', 255)->nullable()->change();
            $table->string('zoom_start_url', 255)->nullable()->change();
            $table->string('zoom_meeting_id', 20)->nullable()->change();
        });
    }
};
