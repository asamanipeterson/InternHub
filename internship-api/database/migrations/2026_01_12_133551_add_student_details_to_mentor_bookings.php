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
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->string('student_university')->nullable()->after('age');
            $table->string('student_course')->nullable()->after('student_university');
            $table->string('student_level')->nullable()->after('student_course');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->dropColumn(['student_university', 'student_course', 'student_level']);
        });
    }
};
