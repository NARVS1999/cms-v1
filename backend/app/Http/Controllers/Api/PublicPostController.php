<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 15), 100);

        $query = Post::with(['creator', 'featuredImage'])
            ->where('status', 'published');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $hasSearch = $request->has('search');

        if (!$hasSearch) {
            $page = $request->get('page', 1);
            $cacheKey = "public_posts:page_{$page}:per_{$perPage}";

            $posts = Cache::remember($cacheKey, 30, function () use ($query, $perPage) {
                return $query->orderBy('published_at', 'desc')->paginate($perPage);
            });
        } else {
            $posts = $query->orderBy('published_at', 'desc')->paginate($perPage);
        }

        return PostResource::collection($posts)->response();
    }

    public function show(string $slug): JsonResponse
    {
        $post = Post::with(['creator', 'featuredImage'])
            ->where('status', 'published')
            ->where('slug', $slug)
            ->first();

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json(new PostResource($post));
    }
}
