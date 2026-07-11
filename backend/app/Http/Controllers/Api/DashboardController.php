<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(): JsonResponse
    {
        $totalPosts = Post::count();
        $publishedPosts = Post::where('status', 'published')->count();
        $draftPosts = Post::where('status', 'draft')->count();
        $totalMedia = Media::count();

        return response()->json([
            'total_posts' => $totalPosts,
            'published_posts' => $publishedPosts,
            'draft_posts' => $draftPosts,
            'total_media' => $totalMedia,
        ]);
    }

    /**
     * Get recent activity
     */
    public function recentActivity(): JsonResponse
    {
        $recentPosts = Post::with(['creator', 'featuredImage'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($recentPosts);
    }
}
