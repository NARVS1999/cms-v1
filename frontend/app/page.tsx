'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
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
      {/* Masthead Header */}
      <header className="border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 pt-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="border-t-2 border-accent inline-block pt-4 mb-2">
            <h1 className="text-5xl font-bold tracking-[0.2em] uppercase font-[family-name:var(--font-playfair)]">
              The Blog
            </h1>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mt-3">
            Thoughts, stories, and ideas
          </p>
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
          <div>
            {posts.map((post, index) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`} className="block py-8">
                  {post.featured_image && (
                    <div className="mb-4 overflow-hidden">
                      <img
                        src={getMediaUrl(post.featured_image.file_path)}
                        alt={post.featured_image.alt_text || post.title}
                        className="w-full h-64 object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-bold group-hover:text-accent transition-colors font-[family-name:var(--font-playfair)]">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2 text-xs tracking-wider uppercase text-muted-foreground">
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
                        <span>&middot;</span>
                        <span>By {post.creator.name}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-muted-foreground line-clamp-2 font-[family-name:var(--font-newsreader)]">
                    {post.content.replace(/<[^>]+>/g, '').slice(0, 180)}
                    {post.content.length > 180 && '...'}
                  </p>
                </Link>
                {index < posts.length - 1 && <div className="border-t" />}
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-xs tracking-wider uppercase text-muted-foreground">
          Powered by CMS
        </div>
      </footer>
    </div>
  );
}
