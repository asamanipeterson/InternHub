<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Remove Stripe column if it exists
            if (Schema::hasColumn('bookings', 'stripe_session_id')) {
                $table->dropColumn('stripe_session_id');
            }

            // Add Paystack fields
            $table->string('payment_reference')->unique()->nullable()->after('status');
            $table->string('paystack_transaction_id')->nullable()->after('payment_reference');
            $table->unsignedBigInteger('amount')->nullable()->after('paystack_transaction_id');
            $table->string('currency')->default('GHS')->after('amount');
            $table->text('rejection_reason')->nullable()->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'payment_reference',
                'paystack_transaction_id',
                'amount',
                'currency',
                'rejection_reason'
            ]);

            // Optionally restore stripe column
            $table->string('stripe_session_id')->nullable();
        });
    }
};
