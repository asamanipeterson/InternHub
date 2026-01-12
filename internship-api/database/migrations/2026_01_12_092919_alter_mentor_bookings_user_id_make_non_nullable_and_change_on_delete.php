<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // 1. Drop the old foreign key (important!)
            $table->dropForeign(['user_id']);

            // 2. Make column NOT NULL (old NULL rows must be handled first!)
            $table->foreignId('user_id')->nullable(false)->change();

            // 3. Re-add foreign key with different onDelete behavior
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');     // or 'cascade' or 'no action'
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // Reverse: drop new FK, make nullable again, re-add original FK
            $table->dropForeign(['user_id']);

            $table->foreignId('user_id')->nullable()->change();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }
};
