<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('first_name', 100)->nullable()->after('company_id');
            $table->string('last_name',  100)->nullable()->after('first_name');
            $table->boolean('has_disability')->nullable()->default(null)->after('university');
            $table->dropColumn('student_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'has_disability']);
        });
    }
};
