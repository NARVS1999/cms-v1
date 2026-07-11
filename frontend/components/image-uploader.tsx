'use client';

import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { api, getMediaUrl, Media } from '@/lib/api';

interface ImageUploaderProps {
  token: string;
  currentImageId: number | null;
  currentImagePath?: string | null;
  onImageSelected: (media: Media) => void;
  onImageRemoved: () => void;
}

export function ImageUploader({
  token,
  currentImageId,
  currentImagePath,
  onImageSelected,
  onImageRemoved,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const media = await api.uploadMedia(token, file);
      onImageSelected(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemoved();
  };

  const previewUrl = currentImagePath ? getMediaUrl(currentImagePath) : null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <label
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isUploading
            ? 'border-muted-foreground/25 bg-muted/30 cursor-wait'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Featured image preview"
              className="w-full h-32 object-cover rounded"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImagePlus className="h-6 w-6 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Click to upload</p>
          </div>
        )}
      </label>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
