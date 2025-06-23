<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add certificate_text column to training_templates table
        Schema::table('training_templates', function (Blueprint $table) {
            $table->text('certificate_text')->nullable()->after('exit_message');
        });

        // Add certificate_text column to user_trainings table
        Schema::table('user_trainings', function (Blueprint $table) {
            $table->text('certificate_text')->nullable()->after('exit_message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove certificate_text column from user_trainings table
        Schema::table('user_trainings', function (Blueprint $table) {
            $table->dropColumn('certificate_text');
        });

        // Remove certificate_text column from training_templates table
        Schema::table('training_templates', function (Blueprint $table) {
            $table->dropColumn('certificate_text');
        });
    }
};
