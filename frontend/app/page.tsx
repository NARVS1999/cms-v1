'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Post, getMediaUrl } from '@/lib/api';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getPublicPosts({ per_page: 20 })
      .then((res) => setPosts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold">My Blog</h1>
          <p className="text-muted-foreground mt-2">Thoughts, stories, and ideas.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-20">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No posts yet.</p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featured_image && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={getMediaUrl(post.featured_image.file_path)}
                        alt={post.featured_image.alt_text || post.title}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    )}
                    {post.creator && (
                      <>
                        <span>·</span>
                        <span>{post.creator.name}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-muted-foreground line-clamp-2">
                    {post.content.replace(/<[^>]+>/g, '').slice(0, 180)}
                    {post.content.length > 180 && '...'}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Powered by CMS
        </div>
      </footer>
    </div>
  );
}
