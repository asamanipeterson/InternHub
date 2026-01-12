<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->unsignedTinyInteger('age')->nullable()->after('student_phone');
            // unsignedTinyInteger = 0–255, perfect for age
            // nullable = safe for old rows + any future guest-like cases
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->dropColumn('age');
        });
    }
};
