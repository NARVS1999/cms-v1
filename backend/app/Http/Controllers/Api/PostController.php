<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Display a listing of posts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['creator', 'updater', 'featuredImage']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by title
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $posts = $query->paginate($request->get('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Store a newly created post
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:posts,slug',
            'content' => 'required|string',
            'status' => 'in:draft,published',
            'featured_image_id' => 'nullable|exists:media,id',
            'meta_description' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Set status and published_at
        if (!isset($validated['status'])) {
            $validated['status'] = 'draft';
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        // Set creator and updater
        $validated['created_by'] = $request->user()->id;
        $validated['updated_by'] = $request->user()->id;

        $post = Post::create($validated);
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json($post, 201);
    }

    /**
     * Display the specified post
     */
    public function show(Post $post): JsonResponse
    {
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json($post);
    }

    /**
     * Update the specified post
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        // Check if user can delete (only admins can delete, but editors can update)
        // For now, allow both admins and editors to update

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:posts,slug,' . $post->id,
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|in:draft,published',
            'featured_image_id' => 'nullable|exists:media,id',
            'meta_description' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
        ]);

        // Auto-generate slug if title changed but slug not provided
        if (isset($validated['title']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            
            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle status change
        if (isset($validated['status'])) {
            if ($validated['status'] === 'published' && empty($validated['published_at'])) {
                $validated['published_at'] = $post->published_at ?? now();
            } elseif ($validated['status'] === 'draft') {
                $validated['published_at'] = null;
            }
        }

        // Set updater
        $validated['updated_by'] = $request->user()->id;

        $post->update($validated);
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json($post);
    }

    /**
     * Remove the specified post
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        // Only admins can delete posts
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
