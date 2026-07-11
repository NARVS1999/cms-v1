'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Masthead */}
      <div className="text-center mb-10">
        <div className="border-t-2 border-accent inline-block pt-4 mb-4">
          <h1 className="text-4xl font-bold tracking-[0.15em] uppercase font-[family-name:var(--font-playfair)]">
            CMS
          </h1>
        </div>
        <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
          Content Management System
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <div className="border border-border bg-card p-8">
          <h2 className="text-lg font-semibold mb-6 font-[family-name:var(--font-playfair)]">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs tracking-wider uppercase text-muted-foreground font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 border-b bg-transparent text-sm outline-none focus:border-foreground transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs tracking-wider uppercase text-muted-foreground font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 border-b bg-transparent text-sm outline-none focus:border-foreground transition-colors"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[10px] tracking-wider uppercase text-muted-foreground">
                Demo credentials
              </span>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-muted/50">
              <p className="font-medium">Admin</p>
              <p className="text-muted-foreground text-xs">
                admin@example.com / password
              </p>
            </div>
            <div className="p-2 bg-muted/50">
              <p className="font-medium">Editor</p>
              <p className="text-muted-foreground text-xs">
                editor@example.com / password
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          CMS v1.0 MVP
        </p>
      </div>
    </div>
  );
}
