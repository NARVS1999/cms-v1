<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * Display a listing of media
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('uploader');

        // Search by file name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('file_name', 'like', "%{$search}%");
        }

        // Filter by mime type
        if ($request->has('mime_type')) {
            $query->where('mime_type', 'like', "%{$request->mime_type}%");
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $media = $query->paginate($request->get('per_page', 15));

        return response()->json($media);
    }

    /**
     * Store a newly uploaded media
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimes:jpg,jpeg,png,gif,svg,pdf,docx',
            'alt_text' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        
        if (!$file || !$file->isValid()) {
            return response()->json(['message' => 'File upload failed'], 422);
        }
        
        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        $filepath = $file->storeAs('uploads', $filename, 'public');

        $media = Media::create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => '/storage/' . $filepath,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $request->alt_text,
            'uploaded_by' => $request->user()->id,
        ]);

        $media->load('uploader');

        return response()->json($media, 201);
    }

    /**
     * Display the specified media
     */
    public function show(Media $media): JsonResponse
    {
        $media->load('uploader');

        return response()->json($media);
    }

    /**
     * Update the specified media
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:255',
        ]);

        $media->update($validated);
        $media->load('uploader');

        return response()->json($media);
    }

    /**
     * Remove the specified media
     */
    public function destroy(Request $request, Media $media): JsonResponse
    {
        // Only admins can delete media
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        $filePath = str_replace('/storage/', '', $media->file_path);
        if (Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $media->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }
}
