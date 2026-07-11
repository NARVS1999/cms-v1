const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  token?: string;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, signal, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Public blog (no auth)
  async getPublicPosts(params?: { search?: string; page?: number; per_page?: number }, signal?: AbortSignal) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Post>>(`/public/posts${queryString ? `?${queryString}` : ''}`, { signal });
  }

  async getPublicPost(slug: string, signal?: AbortSignal) {
    return this.request<Post>(`/public/posts/${slug}`, { signal });
  }

  async logout(token: string) {
    return this.request<{ message: string }>('/logout', {
      method: 'POST',
      token,
    });
  }

  async getUser(token: string) {
    return this.request<User>('/user', { token });
  }

  // Dashboard
  async getDashboardStats(token: string, signal?: AbortSignal) {
    return this.request<DashboardStats>('/dashboard/stats', { token, signal });
  }

  async getRecentActivity(token: string, signal?: AbortSignal) {
    return this.request<Post[]>('/dashboard/activity', { token, signal });
  }

  // Posts
  async getPosts(token: string, params?: PostFilters, signal?: AbortSignal) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Post>>(`/posts${queryString ? `?${queryString}` : ''}`, { token, signal });
  }

  async getPost(token: string, id: number, signal?: AbortSignal) {
    return this.request<Post>(`/posts/${id}`, { token, signal });
  }

  async createPost(token: string, data: CreatePostData) {
    return this.request<Post>('/posts', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async updatePost(token: string, id: number, data: Partial<CreatePostData>) {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  async deletePost(token: string, id: number) {
    return this.request<{ message: string }>(`/posts/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Media
  async getMedia(token: string, params?: MediaFilters, signal?: AbortSignal) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.mime_type) searchParams.set('mime_type', params.mime_type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Media>>(`/media${queryString ? `?${queryString}` : ''}`, { token, signal });
  }

  async uploadMedia(token: string, file: File, altText?: string): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async deleteMedia(token: string, id: number) {
    return this.request<{ message: string }>(`/media/${id}`, {
      method: 'DELETE',
      token,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

export function getMediaUrl(filePath: string): string {
  if (filePath.startsWith('http')) return filePath;
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}${filePath}`;
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  preview?: string;
  status: 'draft' | 'published';
  featured_image_id: number | null;
  meta_description: string | null;
  published_at: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  updater?: User;
  featured_image?: Media;
}

export interface Media {
  id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  alt_text: string | null;
  created_at?: string;
  uploader?: User;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_media: number;
}

export interface CreatePostData {
  title: string;
  slug?: string;
  content: string;
  status?: 'draft' | 'published';
  featured_image_id?: number | null;
  meta_description?: string;
  published_at?: string;
}

export interface PostFilters {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface MediaFilters {
  search?: string;
  mime_type?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    path: string;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
