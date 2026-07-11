<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $stats = Cache::remember('dashboard_stats', 60, function () {
            $statusCounts = Post::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $totalMedia = Media::count();

            return [
                'total_posts' => $statusCounts->sum(),
                'published_posts' => $statusCounts->get('published', 0),
                'draft_posts' => $statusCounts->get('draft', 0),
                'total_media' => $totalMedia,
            ];
        });

        return response()->json($stats);
    }

    public function recentActivity(): JsonResponse
    {
        $recentPosts = Cache::remember('dashboard_recent_activity', 60, function () {
            return Post::with(['creator', 'featuredImage'])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get();
        });

        return response()->json(
            PostResource::collection($recentPosts)->resolve(request())
        );
    }
}
