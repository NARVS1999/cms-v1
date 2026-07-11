'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Upload,
  Trash2,
  Download,
  File,
  FileText as FileTextIcon,
  FileImage,
  Info,
} from 'lucide-react';
import { api, Media } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';

function getMediaIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/pdf') return FileTextIcon;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { token, user } = useAuth();
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (token) {
      api.getMedia(token, { search: searchQuery || undefined })
        .then((response) => setMedia(response.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token, searchQuery]);

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
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <AdminLayout>
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-64"
          />
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 cursor-pointer">
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
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">{media.length} files</p>
          {uploadError && (
            <div className="mt-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {uploadError}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {media.map((item, index) => {
              const Icon = getMediaIcon(item.mime_type);
              const heights = ['h-32', 'h-48', 'h-40', 'h-56', 'h-36', 'h-44'];
              const height = heights[index % heights.length];

              return (
                <div
                  key={item.id}
                  className="break-inside-avoid rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div
                    className={`${height} bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative`}
                  >
                    <Icon className="h-12 w-12 text-muted-foreground/50" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-white/90 rounded-lg hover:bg-white">
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
                      <button className="p-1 rounded hover:bg-muted">
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
