<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->decimal('session_price', 10, 2)->default(200.00)->after('rating');
            $table->string('zoom_email')->nullable()->after('session_price');
            $table->string('email')->nullable()->after('zoom_email');
        });
    }

    public function down(): void
    {
        Schema::table('mentors', function (Blueprint $table) {
            $table->dropColumn(['session_price', 'zoom_email', 'email']);
        });
    }
};
