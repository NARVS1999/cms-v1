'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  Upload,
  Trash2,
  Download,
  File,
  FileText as FileTextIcon,
  FileImage,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api, Media, getMediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';
import { useDebounce } from '@/hooks/use-debounce';

const getMediaIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/pdf') return FileTextIcon;
  return File;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaPage() {
  const { token, user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (token) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      api.getMedia(token, { search: debouncedSearch || undefined, page, per_page: 20 }, controller.signal)
        .then((response) => {
          setMedia(response.data);
          setLastPage(response.meta.last_page);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.error(err);
        })
        .finally(() => setIsLoading(false));

      return () => controller.abort();
    }
  }, [token, debouncedSearch, page]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setUploadError('');
    try {
      const uploaded = await api.uploadMedia(token, file);
      setMedia([uploaded, ...media]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(message);
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Are you sure you want to delete this file?')) return;

    try {
      await api.deleteMedia(token, id);
      setMedia(media.filter(m => m.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete file';
      alert(message);
      console.error('Failed to delete file:', error);
    }
  };

  const handleDownload = useCallback((item: Media) => {
    const url = getMediaUrl(item.file_path);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return (
    <AdminLayout>
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-64"
          />
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 cursor-pointer">
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      </header>
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-shippori)]">Media Library</h2>
          <p className="text-muted-foreground">{media.length} files</p>
          {uploadError && (
            <div className="mt-2 p-3 bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {media.map((item, index) => {
                const Icon = getMediaIcon(item.mime_type);
                const heights = ['h-32', 'h-48', 'h-40', 'h-56', 'h-36', 'h-44'];
                const height = heights[index % heights.length];

                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid border bg-card overflow-hidden hover:border-accent/50 transition-colors group"
                  >
                    <div
                      className={`${height} bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden`}
                    >
                      {item.mime_type.startsWith('image/') ? (
                        <img
                          src={getMediaUrl(item.file_path)}
                          alt={item.alt_text || item.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Icon className="h-12 w-12 text-muted-foreground/50" />
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 bg-background/90 hover:bg-background text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1.5 bg-background/90 hover:bg-background"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">
                        {item.file_name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatSize(item.size)}
                        </p>
                        <button className="p-1 hover:bg-muted">
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-2 border text-sm hover:bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {lastPage}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage}
                  className="inline-flex items-center gap-1 px-3 py-2 border text-sm hover:bg-muted disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AdminLayout>
  );
}
