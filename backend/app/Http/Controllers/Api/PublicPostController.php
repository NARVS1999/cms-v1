<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPostController extends Controller
{
    /**
     * Display published posts (public, no auth required)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::with(['creator', 'featuredImage'])
            ->where('status', 'published');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $posts = $query->orderBy('published_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Display a single published post by slug (public, no auth required)
     */
    public function show(string $slug): JsonResponse
    {
        $post = Post::with(['creator', 'featuredImage'])
            ->where('status', 'published')
            ->where('slug', $slug)
            ->first();

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($post);
    }
}
