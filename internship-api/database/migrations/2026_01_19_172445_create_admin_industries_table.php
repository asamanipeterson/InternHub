<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_industries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('industry');
            $table->timestamps();

            // Prevent duplicate assignments for the same user-industry pair
            $table->unique(['user_id', 'industry']);
        });

        // Optional: add a flag on companies to mark industries as assigned
        // (you can skip this if you prefer checking admin_industries table only)
        if (!Schema::hasColumn('companies', 'admin_assigned')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->boolean('admin_assigned')->default(false)->after('industry');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_industries');

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('admin_assigned');
        });
    }
};
