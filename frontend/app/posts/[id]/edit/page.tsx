'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Eye,
  Bold,
  Italic,
  List,
  Link2,
  Code,
  Quote,
  ImagePlus,
  Maximize2,
  Minimize2,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { api, Post, CreatePostData, Media, getMediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';
import { ImageUploader } from '@/components/image-uploader';
import { useEditorActions } from '@/hooks/use-editor-actions';

export default function PostEditorPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id ? Number(params.id) : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [metaDescription, setMetaDescription] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
  const [featuredImagePath, setFeaturedImagePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInsertingImage, setIsInsertingImage] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { bold, italic, code, quote, link, list } = useEditorActions({
    content,
    setContent,
    textareaRef,
  });

  useEffect(() => {
    if (postId && token) {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setFetchError(null);
      api.getPost(token, postId, controller.signal)
        .then((post) => {
          setTitle(post.title);
          setContent(post.content || '');
          setSlug(post.slug);
          setStatus(post.status);
          setMetaDescription(post.meta_description || '');
          setPublishedAt(post.published_at ? post.published_at.slice(0, 16) : '');
          setFeaturedImageId(post.featured_image_id);
          setFeaturedImagePath(post.featured_image?.file_path || null);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setFetchError(err.message || 'Failed to load post');
            console.error(err);
          }
        })
        .finally(() => setIsLoading(false));

      return () => controller.abort();
    }
  }, [postId, token]);

  const handleSave = async () => {
    if (!token) return;

    setIsSaving(true);
    try {
      const data: CreatePostData = {
        title,
        content,
        slug: slug || undefined,
        status,
        meta_description: metaDescription || undefined,
        published_at: publishedAt || undefined,
        featured_image_id: featuredImageId,
      };

      if (postId) {
        await api.updatePost(token, postId, data);
      } else {
        await api.createPost(token, data);
      }
      router.push('/posts');
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!postId) {
      setSlug(generateSlug(value));
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsInsertingImage(true);
    try {
      const media = await api.uploadMedia(token, file);
      const imgTag = `<img src="${getMediaUrl(media.file_path)}" alt="${media.alt_text || media.file_name}" />`;
      setContent((prev) => prev + '\n' + imgTag);
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsInsertingImage(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (fetchError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-destructive">{fetchError}</p>
          <Link
            href="/posts"
            className="text-sm text-accent hover:underline"
          >
            Back to posts
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/posts"
            className="p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="font-semibold">{postId ? 'Edit Post' : 'New Post'}</h2>
          <div className="flex items-center gap-2 ml-4">
            <div className={`h-2 w-2 ${status === 'published' ? 'bg-green-600' : 'bg-muted-foreground'}`} />
            <span className="text-sm text-muted-foreground capitalize">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 border text-sm hover:bg-muted">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      <main className="flex-1 flex">
        <div className="flex-1 flex flex-col border-r">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold border-none outline-none bg-transparent font-[family-name:var(--font-shippori)]"
            />
          </div>
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            <button onClick={bold} className="p-2 hover:bg-muted" title="Bold">
              <Bold className="h-4 w-4" />
            </button>
            <button onClick={italic} className="p-2 hover:bg-muted" title="Italic">
              <Italic className="h-4 w-4" />
            </button>
            <button onClick={list} className="p-2 hover:bg-muted" title="List">
              <List className="h-4 w-4" />
            </button>
            <button onClick={link} className="p-2 hover:bg-muted" title="Link">
              <Link2 className="h-4 w-4" />
            </button>
            <button onClick={code} className="p-2 hover:bg-muted" title="Code">
              <Code className="h-4 w-4" />
            </button>
            <button onClick={quote} className="p-2 hover:bg-muted" title="Quote">
              <Quote className="h-4 w-4" />
            </button>
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImageUpload}
            />
            <button
              className="p-2 hover:bg-muted"
              title="Insert Image"
              onClick={() => inlineImageInputRef.current?.click()}
              disabled={isInsertingImage}
            >
              {isInsertingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                className="p-2 hover:bg-muted"
                title={isEditorMaximized ? 'Restore' : 'Maximize'}
                onClick={() => setIsEditorMaximized(!isEditorMaximized)}
              >
                {isEditorMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="flex-1 p-4 outline-none resize-none font-[family-name:var(--font-noto-serif)]"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {!isEditorMaximized && (
          <>
            <div className="flex-1 flex flex-col bg-card">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="text-xs tracking-wider uppercase text-muted-foreground">
                  Live Preview
                </span>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <article className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-4 font-[family-name:var(--font-shippori)]">
                    {title || 'Post Title'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className={`px-2 py-0.5 text-xs font-medium tracking-wider uppercase ${
                      status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span>Updated just now</span>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: (content || '<p>Start writing...</p>').replace(/\n/g, '<br />') }} />
                </article>
              </div>
            </div>

            <div className="w-72 border-l p-4 space-y-4 overflow-auto">
              <div>
                <label className="block text-xs tracking-wider uppercase text-muted-foreground font-medium mb-2">Status</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                    className="flex items-center gap-2 px-3 py-2 border text-sm w-full"
                  >
                    {status === 'draft' ? (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        Draft
                      </>
                    ) : (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        Published
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-muted-foreground font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border px-3 py-2 text-sm bg-transparent"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-muted-foreground font-medium mb-2">
                  Featured Image
                </label>
                <ImageUploader
                  token={token || ''}
                  currentImageId={featuredImageId}
                  currentImagePath={featuredImagePath}
                  onImageSelected={(media) => {
                    setFeaturedImageId(media.id);
                    setFeaturedImagePath(media.file_path);
                  }}
                  onImageRemoved={() => {
                    setFeaturedImageId(null);
                    setFeaturedImagePath(null);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-muted-foreground font-medium mb-2">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full border px-3 py-2 h-20 resize-none text-sm bg-transparent"
                  placeholder="Brief description for SEO..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>
              <div>
                <label className="block text-xs tracking-wider uppercase text-muted-foreground font-medium mb-2">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full border px-3 py-2 text-sm bg-transparent"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
}
