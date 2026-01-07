<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Mentor;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // Step 1: Add the column as nullable first (no unique constraint yet)
        Schema::table('mentors', function (Blueprint $table) {
            $table->string('uuid')->nullable()->after('id');
        });

        // Step 2: Generate and save a unique UUID for every existing mentor
        Mentor::all()->each(function ($mentor) {
            $mentor->uuid = Str::random(32); // or (string) Str::uuid() for real UUIDs
            $mentor->save();
        });

        // Step 3: Now make the column NOT nullable and add unique constraint
        Schema::table('mentors', function (Blueprint $table) {
            $table->string('uuid')->unique()->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
