'use client';
import { Suspense } from "react";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Send, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const email = (searchParams.get('email') || user?.email || '').trim().toLowerCase();
  const delivery = searchParams.get('delivery');
  // TODO: re-enable email verification once domain is verified in Resend.
  const verificationEnabled = delivery === 'sent' || delivery === 'dev' || delivery === 'failed' || delivery === 'throttled';

  useEffect(() => {
    if (!email) {
      router.push('/login');
      return;
    }
    if (user?.emailVerified) {
      setStatus('verified');
      setMessage('Your email is already verified.');
      return;
    }
    // TODO: re-enable email verification once domain is verified in Resend.
    if (!verificationEnabled) {
      setStatus('pending');
      setMessage('Email verification is currently disabled. If you already have an account, you can sign in and continue.');
      return;
    }
    if (delivery === 'sent') {
      setMessage('A 6-digit verification code has been sent to your email.');
    } else if (delivery === 'dev') {
      setStatus('error');
      setMessage('Email delivery is not configured, so the code was not sent to Gmail. Check the backend terminal where the API is running to see your 6-digit verification code.');
    } else if (delivery === 'throttled') {
      setStatus('pending');
      setMessage('A verification code was sent recently. Please check your email or backend terminal, or wait a moment before requesting a new code.');
    } else if (delivery === 'failed') {
      setStatus('error');
      setMessage('A verification code could not be sent to your email right now. Use “Resend code” and check backend email configuration/logs, or check the backend terminal in dev mode.');
    }
  }, [email, user, router, delivery, verificationEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setStatus('error');
      setMessage('Please enter the 6-digit verification code.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await authApi.verifyEmail(email, code.trim());
      await refreshUser().catch(() => undefined);
      setStatus('verified');
      setMessage('Email verified successfully! Your account is now ready.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      const result = await authApi.resendVerification();
      setResendTimer(60);
      if (result.emailDelivery?.sent) {
        setStatus('pending');
        setMessage('A new verification code has been sent to your email.');
      } else if (result.emailDelivery?.dev) {
        setStatus('pending');
        setMessage('Email delivery is not configured on the server. Check the backend terminal for your 6-digit verification code, or configure Brevo/Resend to send emails to Gmail.');
      } else {
        setStatus('error');
        setMessage('The code was generated but the email could not be sent. Please check backend email configuration (BREVO_API_KEY/RESEND_API_KEY and MAIL_FROM_EMAIL) or the server logs.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          {status === 'verified' ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-charcoal mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Link
                href={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-charcoal mb-2">Verify Your Email</h1>
              <p className="text-gray-600 mb-6">
                Enter the 6-digit verification code for <strong>{email}</strong> to verify your account.
                {delivery === 'sent' ? ' We sent the code to your email inbox.' : ''}
                {delivery === 'dev' ? ' Email delivery is not configured, so check the backend terminal for the code.' : ''}
                {delivery === 'throttled' ? ' A code was sent recently — check your inbox or backend terminal.' : ''}
              </p>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${status === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                  {message}
                </div>
              )}

              {/* TODO: re-enable email verification once domain is verified in Resend. */}
              {verificationEnabled ? (
                <>
                  <form onSubmit={handleVerify} className="space-y-4 text-left">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification code
                      </label>
                      <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-[0.4em] text-center text-xl font-semibold text-gray-900 placeholder:text-gray-400 bg-white"
                        placeholder="000000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || code.length !== 6}
                      className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify Email</span>
                      )}
                    </button>
                  </form>

                  <button
                    onClick={handleResend}
                    disabled={resending || resendTimer > 0}
                    className="mt-4 inline-flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendTimer > 0 ? (
                      <span>Resend in {resendTimer}s</span>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Resend code</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="mt-2 space-y-3">
                  <p className="text-sm text-gray-600">You can continue to your account without email verification for now.</p>
                  <Link
                    href={user ? (user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/login'}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {user ? 'Go to Dashboard' : 'Go to Login'}
                  </Link>
                </div>
              )}

              {verificationEnabled && (
                <p className="mt-4 text-sm text-gray-500">
                  Didn&apos;t receive the code? Check your spam folder. You must be signed in to resend a code.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The page reads query parameters, which are only available at request time.
 * The Suspense boundary lets the rest of the layout prerender immediately.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft-white" />}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
