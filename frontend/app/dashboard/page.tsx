'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Image,
  Sparkles,
} from 'lucide-react';
import { api, DashboardStats, Post } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (token) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      Promise.all([
        api.getDashboardStats(token, controller.signal),
        api.getRecentActivity(token, controller.signal),
      ])
        .then(([statsData, postsData]) => {
          setStats(statsData);
          setRecentPosts(postsData);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') console.error(err);
        })
        .finally(() => setIsLoading(false));

      return () => controller.abort();
    }
  }, [token]);

  return (
    <AdminLayout>
      <div className="flex-1 p-6 bg-muted/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-shippori)]">Dashboard</h2>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-8 border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground">Total Content</p>
                  <p className="text-3xl font-bold">{stats?.total_posts || 0}</p>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-600" />
                  <span className="text-muted-foreground">Published:</span>
                  <span className="font-medium">{stats?.published_posts || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-muted-foreground" />
                  <span className="text-muted-foreground">Drafts:</span>
                  <span className="font-medium">{stats?.draft_posts || 0}</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4 border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-accent/10 flex items-center justify-center">
                  <Image className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-muted-foreground">Media</p>
                  <p className="text-3xl font-bold">{stats?.total_media || 0}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">files uploaded</p>
            </div>

            <div className="col-span-12 lg:col-span-8 border bg-card">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold font-[family-name:var(--font-shippori)]">Recent Posts</h3>
                <Link href="/posts" className="text-sm text-accent hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y">
                {recentPosts.slice(0, 4).map((post) => (
                  <div key={post.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 border bg-card p-4">
              <h3 className="font-semibold mb-4 font-[family-name:var(--font-shippori)]">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This week</span>
                  <span className="text-sm font-medium">+2 posts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Storage used</span>
                  <span className="text-sm font-medium">1.2 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last login</span>
                  <span className="text-sm font-medium">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="text-sm font-medium capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
