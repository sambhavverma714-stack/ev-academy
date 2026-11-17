'use client';
import { Suspense } from "react";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const courseRedirect = searchParams.get('course');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result?.requiresVerification) {
        const d = result.emailDelivery;
        const delivery = d?.sent ? 'sent' : d?.dev ? 'dev' : d?.throttled ? 'throttled' : 'failed';
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&delivery=${delivery}`);
        return;
      }
      if (courseRedirect) {
        router.push(`/student/dashboard?enroll=${courseRedirect}`);
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-white px-4 pb-16 pt-24 sm:pt-28">
      <div className="mx-auto mb-8 flex max-w-md items-center justify-between rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-charcoal">New to EV Training School?</p>
          <p className="text-xs text-gray-500">Create an account in seconds</p>
        </div>
        <Link
          href={`/register${courseRedirect ? `?course=${courseRedirect}` : ''}`}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Create account
        </Link>
      </div>

      <div className="mx-auto flex max-w-md items-center justify-center">
      <div className="w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Zap className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-charcoal">EV Training School</span>
          </Link>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue your learning journey</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-blue-900">New student?</span>
              <Link
                href={`/register${courseRedirect ? `?course=${courseRedirect}` : ''}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-700"
              >
                Create account
              </Link>
            </div>
            <p className="mt-1 text-xs text-blue-800/80">Create an account and start learning right away.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 text-gray-900 placeholder:text-gray-400 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                href={`/register${courseRedirect ? `?course=${courseRedirect}` : ''}`}
                className="text-blue-600 hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/**
 * The page reads query parameters, which are only available at request time.
 * The Suspense boundary lets the rest of the layout prerender immediately.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
