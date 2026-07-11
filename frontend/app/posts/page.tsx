'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  GripVertical,
} from 'lucide-react';
import { api, Post } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';

export default function PostsPage() {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      api.getPosts(token, { search: searchQuery || undefined })
        .then((response) => setPosts(response.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [token, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await api.deletePost(token, id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const draftPosts = posts.filter(p => p.status === 'draft');
  const publishedPosts = posts.filter(p => p.status === 'published');

  return (
    <AdminLayout>
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-64"
          />
        </div>
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </header>
      <main className="flex-1 p-6 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex gap-6 min-w-max">
            {/* Draft Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 bg-muted-foreground" />
                <h3 className="font-semibold text-sm tracking-wider uppercase">Drafts</h3>
                <span className="text-sm text-muted-foreground">
                  ({draftPosts.length})
                </span>
              </div>
              <div className="space-y-3">
                {draftPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border bg-card p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="p-1 hover:bg-muted"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1 hover:bg-muted text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{post.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {post.meta_description || 'No description'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(post.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {draftPosts.length === 0 && (
                  <div className="border border-dashed p-8 text-center text-muted-foreground text-sm">
                    No draft posts
                  </div>
                )}
              </div>
            </div>

            {/* Published Column */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 bg-green-600" />
                <h3 className="font-semibold text-sm tracking-wider uppercase">Published</h3>
                <span className="text-sm text-muted-foreground">
                  ({publishedPosts.length})
                </span>
              </div>
              <div className="space-y-3">
                {publishedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border bg-card p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="p-1 hover:bg-muted"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1 hover:bg-muted text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{post.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {post.meta_description || 'No description'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : 'Not published'}
                    </div>
                  </div>
                ))}
                {publishedPosts.length === 0 && (
                  <div className="border border-dashed p-8 text-center text-muted-foreground text-sm">
                    No published posts
                  </div>
                )}
              </div>
            </div>

            {/* Empty Column Placeholder */}
            <div className="w-80 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 bg-muted-foreground/30" />
                <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground">Archived</h3>
                <span className="text-sm text-muted-foreground">(0)</span>
              </div>
              <div className="border border-dashed p-8 text-center text-muted-foreground text-sm">
                Drag posts here to archive
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
