<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mentor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained()->onDelete('cascade');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->unique(['mentor_id', 'day_of_week', 'start_time', 'end_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentor_availabilities');
    }
};
