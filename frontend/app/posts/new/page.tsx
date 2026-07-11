'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { api, CreatePostData, Media, getMediaUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin-layout';
import { ImageUploader } from '@/components/image-uploader';

export default function NewPostPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [metaDescription, setMetaDescription] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [featuredImageId, setFeaturedImageId] = useState<number | null>(null);
  const [featuredImagePath, setFeaturedImagePath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInsertingImage, setIsInsertingImage] = useState(false);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

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

      await api.createPost(token, data);
      router.push('/posts');
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(generateSlug(value));
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

  return (
    <AdminLayout>
      <header className="h-14 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/posts"
            className="p-2 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h2 className="font-semibold">New Post</h2>
          <div className="flex items-center gap-2 ml-4">
            <div className={`h-2 w-2 rounded-full ${status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-muted-foreground capitalize">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>
      <main className="flex-1 flex">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col border-r">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold border-none outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
            {[
              { icon: Bold, label: 'Bold' },
              { icon: Italic, label: 'Italic' },
              { icon: List, label: 'List' },
              { icon: Link2, label: 'Link' },
              { icon: Code, label: 'Code' },
              { icon: Quote, label: 'Quote' },
            ].map((tool) => (
              <button
                key={tool.label}
                className="p-2 rounded hover:bg-muted"
                title={tool.label}
              >
                <tool.icon className="h-4 w-4" />
              </button>
            ))}
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImageUpload}
            />
            <button
              className="p-2 rounded hover:bg-muted"
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
              <button className="p-2 rounded hover:bg-muted">
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            className="flex-1 p-4 outline-none resize-none"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Live Preview
            </span>
            <button className="p-1 rounded hover:bg-muted">
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <article className="prose max-w-none">
              <h1 className="text-3xl font-bold mb-4">
                {title || 'Post Title'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
                <span>Updated just now</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: content || '<p>Start writing...</p>' }} />
            </article>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="w-72 border-l p-4 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatus(status === 'draft' ? 'published' : 'draft')}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm w-full"
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
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
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
            <label className="block text-sm font-medium mb-2">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 h-20 resize-none text-sm"
              placeholder="Brief description for SEO..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metaDescription.length}/160 characters
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
