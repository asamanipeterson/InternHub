<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mentor_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('mentors')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('student_name');
            $table->string('student_email');
            $table->string('student_phone')->nullable();
            $table->dateTime('scheduled_at');
            $table->string('paystack_reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('GHS');
            $table->string('zoom_meeting_id')->nullable();
            $table->string('zoom_join_url')->nullable();
            $table->string('zoom_start_url')->nullable();
            $table->enum('status', ['pending', 'paid', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_bookings');
    }
};
