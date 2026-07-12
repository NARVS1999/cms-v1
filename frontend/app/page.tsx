'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { api, Post, getMediaUrl } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    api.getPublicPosts({ per_page: 10, page })
      .then((res) => {
        setPosts(res.data);
        setLastPage(res.meta.last_page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-background">
      {/* Masthead Header */}
      <header className="border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 pt-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center relative">
          <div className="border-t-2 border-accent inline-block pt-4 mb-2 relative">
            <span className="hanko absolute -left-12 top-1/2 -translate-y-1/2 max-sm:hidden">印</span>
            <span className="vertical-accent absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground opacity-60 max-sm:hidden">第壹號</span>
            <h1 className="text-5xl font-bold tracking-[0.2em] uppercase font-[family-name:var(--font-shippori)]">
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
          <>
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
                          loading="lazy"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold group-hover:text-accent transition-colors font-[family-name:var(--font-shippori)]">
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
                    <p className="mt-3 text-muted-foreground line-clamp-2 font-[family-name:var(--font-noto-serif)]">
                      {post.preview || post.content?.replace(/<[^>]+>/g, '').slice(0, 180) || ''}
                      {(post.preview?.length ?? 0) >= 180 ? '...' : ''}
                    </p>
                  </Link>
                  {index < posts.length - 1 && <div className="border-t border-double" />}
                </article>
              ))}
            </div>

            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-4 py-2 border text-sm hover:bg-muted disabled:opacity-50 transition-colors"
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
                  className="inline-flex items-center gap-1 px-4 py-2 border text-sm hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="newspaper-rule mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-xs tracking-wider uppercase text-muted-foreground">
          Powered by CMS
        </div>
      </footer>
    </div>
  );
}
