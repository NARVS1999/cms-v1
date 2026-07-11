<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'status' => $this->status,
            'meta_description' => $this->meta_description,
            'published_at' => $this->published_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'featured_image_id' => $this->featured_image_id,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
        ];

        if ($this->relationLoaded('creator') && $this->creator) {
            $data['creator'] = new UserResource($this->creator);
        }

        if ($this->relationLoaded('updater') && $this->updater) {
            $data['updater'] = new UserResource($this->updater);
        }

        if ($this->relationLoaded('featuredImage') && $this->featuredImage) {
            $data['featured_image'] = new MediaResource($this->featuredImage);
        }

        if ($this->isAdminListingRoute($request)) {
            $data['preview'] = str($this->content)->stripTags()->limit(200)->value();
        } else {
            $data['content'] = $this->content;
            $data['preview'] = str($this->content)->stripTags()->limit(200)->value();
        }

        return $data;
    }

    private function isAdminListingRoute(Request $request): bool
    {
        $route = $request->route();

        if (!$route) {
            return false;
        }

        return $route->named('posts.index');
    }
}
