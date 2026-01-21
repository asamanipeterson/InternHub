<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (!Schema::hasColumn('companies', 'applications_open')) {
                $table->boolean('applications_open')
                    ->default(true)
                    ->after('available_slots');
                // ->comment('Whether new internship applications are allowed for this company');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (Schema::hasColumn('companies', 'applications_open')) {
                $table->dropColumn('applications_open');
            }
        });
    }
};
