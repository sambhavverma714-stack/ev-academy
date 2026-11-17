'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { siteApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await siteApi.requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
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
          <h1 className="text-3xl font-bold text-charcoal mb-2">Reset Password</h1>
          <p className="text-gray-600">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                If an account exists for {email}, we've sent a password reset link. 
                Please check your inbox.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-white"
                    placeholder="your@email.com"
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
