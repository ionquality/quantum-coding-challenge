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
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->text('note');
            $table->unsignedBigInteger('notable_id');
            $table->string('notable_type');
            $table->index(
                ['notable_type', 'notable_id'],
                'notes_notable_type_id_index'
            );
            $table->foreignId('created_by')->constrained('users');
            $table->index('created_at', 'notes_created_at_index');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropIndex('notes_created_at_index');
            $table->dropIndex('notes_notable_type_id_index');
        });

        Schema::dropIfExists('notes');
    }
};
