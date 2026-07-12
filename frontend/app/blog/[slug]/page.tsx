'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { api, Post, getMediaUrl } from '@/lib/api';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    api.getPublicPost(slug)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Post not found'}</p>
        <Link href="/" className="text-accent hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <article>
          <h1 className="text-4xl font-bold leading-tight font-[family-name:var(--font-shippori)]">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mt-4 text-xs tracking-wider uppercase text-muted-foreground">
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

          {post.featured_image && (
            <div className="mt-8 overflow-hidden">
              <img
                src={getMediaUrl(post.featured_image.file_path)}
                alt={post.featured_image.alt_text || post.title}
                className="w-full h-auto max-h-[500px] object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div
            className="mt-8 prose prose-lg max-w-none font-[family-name:var(--font-noto-serif)]"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </article>
      </main>

      <footer className="newspaper-rule mt-20">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-xs tracking-wider uppercase text-muted-foreground">
          Powered by CMS
        </div>
      </footer>
    </div>
  );
}
