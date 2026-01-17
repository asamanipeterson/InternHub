<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->text('zoom_access_token')->nullable();
            $table->text('zoom_refresh_token')->nullable();
            $table->timestamp('zoom_expires_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->dropColumn(['zoom_access_token', 'zoom_refresh_token', 'zoom_expires_at']);
        });
    }
};
