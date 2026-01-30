<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            // Add NEW columns (all nullable at first = safe)
            $table->string('first_name')->nullable()->after('user_id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->date('date_of_birth')->nullable()->after('last_name');

            // phone becomes required later — keep nullable now
            $table->string('phone')->nullable()->after('student_email');

            // renamed from student_university
            $table->string('student_institution')->nullable()->after('phone');

            $table->text('topic_description')->nullable()->after('student_level');

            // Indexes (optional but good for performance)
            $table->index('phone');
            $table->index('student_email');
            $table->index('date_of_birth');
        });
    }

    public function down(): void
    {
        Schema::table('mentor_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'date_of_birth',
                'phone',
                'student_institution',
                'topic_description',
            ]);
        });
    }
};
