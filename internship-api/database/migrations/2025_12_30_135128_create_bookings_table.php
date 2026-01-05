<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('student_name');
            $table->string('student_email');
            $table->string('student_phone');
            $table->string('student_id');
            $table->string('university');
            $table->string('cv_path');
            $table->enum('status', ['pending', 'approved', 'paid', 'rejected', 'expired'])->default('pending');
            $table->string('stripe_session_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
