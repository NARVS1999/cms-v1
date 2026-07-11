const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    
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
  async getPublicPosts(params?: { search?: string; page?: number; per_page?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Post>>(`/public/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicPost(slug: string) {
    return this.request<Post>(`/public/posts/${slug}`);
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
  async getDashboardStats(token: string) {
    return this.request<DashboardStats>('/dashboard/stats', { token });
  }

  async getRecentActivity(token: string) {
    return this.request<Post[]>('/dashboard/activity', { token });
  }

  // Posts
  async getPosts(token: string, params?: PostFilters) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Post>>(`/posts${queryString ? `?${queryString}` : ''}`, { token });
  }

  async getPost(token: string, id: number) {
    return this.request<Post>(`/posts/${id}`, { token });
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
  async getMedia(token: string, params?: MediaFilters) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.mime_type) searchParams.set('mime_type', params.mime_type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Media>>(`/media${queryString ? `?${queryString}` : ''}`, { token });
  }

  async uploadMedia(token: string, file: File, altText?: string): Promise<Media> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);

    const response = await fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
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
  content: string;
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
  uploaded_by: number;
  created_at: string;
  updated_at: string;
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
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
