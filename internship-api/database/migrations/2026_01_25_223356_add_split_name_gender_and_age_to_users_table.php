<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Previous additions (name split + gender)
            $table->string('first_name', 100)->after('id');
            $table->string('middle_name', 100)->nullable()->after('first_name');
            $table->string('last_name', 100)->after('middle_name');
            $table->string('gender', 50)->nullable()->after('nationality');

            // New: Date of Birth
            $table->date('date_of_birth')->nullable()->after('gender');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'middle_name',
                'last_name',
                'gender',
                'date_of_birth',
            ]);
        });
    }
};
