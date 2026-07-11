<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clean up orphaned featured_image_id references before adding FK
        DB::statement('UPDATE posts SET featured_image_id = NULL WHERE featured_image_id IS NOT NULL AND featured_image_id NOT IN (SELECT id FROM media)');

        Schema::table('posts', function (Blueprint $table) {
            $table->index(['status', 'published_at'], 'posts_status_published_at_index');
            $table->index('updated_at', 'posts_updated_at_index');
            $table->index('deleted_at', 'posts_deleted_at_index');
            $table->index('featured_image_id', 'posts_featured_image_id_index');
        });

        Schema::table('media', function (Blueprint $table) {
            $table->index('created_at', 'media_created_at_index');
        });

        try {
            Schema::table('posts', function (Blueprint $table) {
                $table->foreign('featured_image_id')
                    ->references('id')
                    ->on('media')
                    ->nullOnDelete();
            });
        } catch (\Exception $e) {
            // Foreign key may already exist from a previous partial run
        }
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_status_published_at_index');
            $table->dropIndex('posts_updated_at_index');
            $table->dropIndex('posts_deleted_at_index');
            $table->dropIndex('posts_featured_image_id_index');

            try {
                $table->dropForeign(['featured_image_id']);
            } catch (\Exception $e) {
                // Foreign key may not exist
            }
        });

        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex('media_created_at_index');
        });
    }
};
