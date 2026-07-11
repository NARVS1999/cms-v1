<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create editor user
        $editor = User::create([
            'name' => 'Editor User',
            'email' => 'editor@example.com',
            'password' => Hash::make('password'),
            'role' => 'editor',
        ]);

        // Create media items
        $mediaItems = [
            [
                'file_name' => 'laravel-hero.png',
                'file_path' => '/uploads/laravel-hero.png',
                'mime_type' => 'image/png',
                'size' => 245000,
                'alt_text' => 'Laravel hero image',
                'uploaded_by' => $admin->id,
            ],
            [
                'file_name' => 'docker-logo.svg',
                'file_path' => '/uploads/docker-logo.svg',
                'mime_type' => 'image/svg+xml',
                'size' => 12000,
                'alt_text' => 'Docker logo',
                'uploaded_by' => $admin->id,
            ],
            [
                'file_name' => 'guide-cover.jpg',
                'file_path' => '/uploads/guide-cover.jpg',
                'mime_type' => 'image/jpeg',
                'size' => 380000,
                'alt_text' => 'Guide cover image',
                'uploaded_by' => $editor->id,
            ],
            [
                'file_name' => 'architecture-diagram.png',
                'file_path' => '/uploads/architecture-diagram.png',
                'mime_type' => 'image/png',
                'size' => 95000,
                'alt_text' => 'System architecture diagram',
                'uploaded_by' => $admin->id,
            ],
            [
                'file_name' => 'api-docs.pdf',
                'file_path' => '/uploads/api-docs.pdf',
                'mime_type' => 'application/pdf',
                'size' => 520000,
                'alt_text' => 'API documentation',
                'uploaded_by' => $admin->id,
            ],
            [
                'file_name' => 'screenshot-dashboard.png',
                'file_path' => '/uploads/screenshot-dashboard.png',
                'mime_type' => 'image/png',
                'size' => 178000,
                'alt_text' => 'Dashboard screenshot',
                'uploaded_by' => $editor->id,
            ],
        ];

        $media = collect($mediaItems)->map(function ($item) {
            return Media::create($item);
        });

        // Create posts
        $posts = [
            [
                'title' => 'Getting Started with Laravel 11',
                'slug' => 'getting-started-with-laravel-11',
                'content' => '<p>Laravel 11 introduces a streamlined application structure that simplifies the framework while maintaining its power.</p>',
                'status' => 'published',
                'featured_image_id' => $media[0]->id,
                'meta_description' => 'Learn how to get started with Laravel 11',
                'published_at' => now()->subDays(1),
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],
            [
                'title' => 'Next.js App Router Best Practices',
                'slug' => 'nextjs-app-router-best-practices',
                'content' => '<p>The App Router in Next.js brings powerful features for modern web applications.</p>',
                'status' => 'published',
                'meta_description' => 'Best practices for Next.js App Router',
                'published_at' => now()->subDays(2),
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],
            [
                'title' => 'Building a Design System with shadcn/ui',
                'slug' => 'building-design-system-shadcn',
                'content' => '<p>shadcn/ui provides a great foundation for design systems.</p>',
                'status' => 'draft',
                'meta_description' => 'How to build a design system with shadcn/ui',
                'created_by' => $editor->id,
                'updated_by' => $editor->id,
            ],
            [
                'title' => 'MySQL Performance Optimization Tips',
                'slug' => 'mysql-performance-optimization',
                'content' => '<p>Optimizing MySQL queries is essential for performance.</p>',
                'status' => 'draft',
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],
            [
                'title' => 'RESTful API Design Guide',
                'slug' => 'restful-api-design-guide',
                'content' => '<p>Good API design is crucial for developer experience.</p>',
                'status' => 'published',
                'meta_description' => 'Guide to designing RESTful APIs',
                'published_at' => now()->subDays(3),
                'created_by' => $editor->id,
                'updated_by' => $editor->id,
            ],
            [
                'title' => 'Docker for PHP Developers',
                'slug' => 'docker-for-php-developers',
                'content' => '<p>Docker simplifies local development environments.</p>',
                'status' => 'published',
                'featured_image_id' => $media[1]->id,
                'meta_description' => 'Introduction to Docker for PHP developers',
                'published_at' => now()->subDays(4),
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],
            [
                'title' => 'TypeScript Advanced Types',
                'slug' => 'typescript-advanced-types',
                'content' => '<p>Master advanced TypeScript type patterns.</p>',
                'status' => 'draft',
                'created_by' => $editor->id,
                'updated_by' => $editor->id,
            ],
            [
                'title' => 'CSS Grid Layout Complete Guide',
                'slug' => 'css-grid-layout-complete-guide',
                'content' => '<p>CSS Grid is a powerful layout system.</p>',
                'status' => 'published',
                'meta_description' => 'Complete guide to CSS Grid layout',
                'published_at' => now()->subDays(5),
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],
        ];

        collect($posts)->map(function ($post) {
            return Post::create($post);
        });
    }
}
