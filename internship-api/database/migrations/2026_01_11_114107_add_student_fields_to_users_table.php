<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add the columns we actually need
            $table->string('university')->nullable()->after('name');
            $table->string('course')->nullable()->after('university');
            $table->string('year')->nullable()->after('course');           // Level / Academic year
            $table->string('phone')->nullable()->after('email');
            $table->string('nationality')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'university',
                'course',
                'year',
                'phone',
                'nationality',
            ]);
        });
    }
};
