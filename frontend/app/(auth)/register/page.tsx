'use client';
import { Suspense } from "react";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Eye, EyeOff, Loader2, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const courseRedirect = searchParams.get('course');

  const passwordStrength = formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak';

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
      const result = await register(formData.name, formData.email, formData.password);
      // TODO: re-enable email verification once domain is verified in Resend.
      if (result?.requiresVerification) {
        const delivery = result?.emailDelivery?.sent ? 'sent' : result?.emailDelivery?.dev ? 'dev' : 'failed';
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&delivery=${delivery}`);
        return;
      }
      if (courseRedirect) {
        router.push(`/student/dashboard?enroll=${courseRedirect}`);
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center px-4 pb-16 pt-28">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Zap className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-charcoal">EV Training School</span>
          </Link>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Create Account</h1>
          <p className="text-gray-600">Start your EV training journey today</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
            <span className="text-blue-900">Already have an account?</span>
            <Link
              href={`/login${courseRedirect ? `?course=${courseRedirect}` : ''}`}
              className="font-semibold text-blue-700 hover:underline whitespace-nowrap"
            >
              Sign in
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start space-x-2">
              <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                placeholder="John Doe"
              />
            </div>

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
              {formData.password && (
                <div className="mt-2 flex items-center space-x-2 text-sm">
                  <CheckCircle className={`h-4 w-4 ${passwordStrength === 'strong' ? 'text-green-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'}`} />
                  <span className={passwordStrength === 'strong' ? 'text-green-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-red-600'}>
                    {passwordStrength === 'strong' ? 'Strong password' : passwordStrength === 'medium' ? 'Medium strength' : 'Too weak (minimum 8 characters)'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
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

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                id="terms"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Create your account to start learning right away.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The page reads query parameters, which are only available at request time.
 * The Suspense boundary lets the rest of the layout prerender immediately.
 */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft-white" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
