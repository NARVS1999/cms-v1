<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    private const ALLOWED_SORT_COLUMNS = ['created_at', 'updated_at', 'title', 'published_at'];

    private const MAX_PER_PAGE = 100;

    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['creator', 'updater', 'featuredImage']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $sortBy = $request->get('sort_by', 'created_at');
        if (!in_array($sortBy, self::ALLOWED_SORT_COLUMNS)) {
            $sortBy = 'created_at';
        }
        $sortOrder = $request->get('sort_order', 'desc') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min((int) $request->get('per_page', 15), self::MAX_PER_PAGE);
        $posts = $query->paginate($perPage);

        return PostResource::collection($posts)->response();
    }

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

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        if (!isset($validated['status'])) {
            $validated['status'] = 'draft';
        }

        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $validated['created_by'] = $request->user()->id;
        $validated['updated_by'] = $request->user()->id;

        $post = Post::create($validated);
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json(new PostResource($post), 201);
    }

    public function show(Post $post): JsonResponse
    {
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json(new PostResource($post));
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:posts,slug,' . $post->id,
            'content' => 'sometimes|required|string',
            'status' => 'sometimes|in:draft,published',
            'featured_image_id' => 'nullable|exists:media,id',
            'meta_description' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['title']) && !isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        if (isset($validated['status'])) {
            if ($validated['status'] === 'published' && empty($validated['published_at'])) {
                $validated['published_at'] = $post->published_at ?? now();
            } elseif ($validated['status'] === 'draft') {
                $validated['published_at'] = null;
            }
        }

        $validated['updated_by'] = $request->user()->id;

        $post->update($validated);
        $post->load(['creator', 'updater', 'featuredImage']);

        return response()->json(new PostResource($post));
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
