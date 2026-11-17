'use client';
import { Suspense } from "react";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token || '', formData.password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center px-4 pb-16 pt-28">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <Zap className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-charcoal">EV Training School</span>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-2">Password Reset!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-4 pb-16 pt-28">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Zap className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-charcoal">EV Training School</span>
          </Link>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to Login
            </Link>
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
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft-white" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
