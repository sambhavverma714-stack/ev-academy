'use client';
import { Suspense } from "react";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi, paymentsApi } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'init' | 'confirming' | 'processing' | 'success' | 'error'>('init');

  const courseId = searchParams.get('course');

  useEffect(() => {
    if (!user) {
      router.push(`/login?course=${courseId}`);
      return;
    }

    if (!courseId) {
      router.push('/courses');
      return;
    }

    loadCourseAndConfig();
  }, [user, courseId, router]);

  const loadCourseAndConfig = async () => {
    setLoading(true);
    try {
      const [courseData, configData] = await Promise.all([
        coursesApi.getPreview(courseId as string),
        paymentsApi.getConfig()
      ]);
      setCourse(courseData.course);
      setPaymentConfig(configData);
      setStatus('confirming');
    } catch (err: any) {
      setError(err.message || 'Failed to load course');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrol = async () => {
    if (!course || !user) return;

    // Check email verification
    if (!user.emailVerified) {
      setError('Please verify your email address before enrolling in a course.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create payment order
      const order = await paymentsApi.createOrder(course.id, paymentMethod);
      
      if (paymentConfig.mode === 'demo') {
        // Demo mode - direct confirmation
        await paymentsApi.confirmDemoPayment(order.paymentId);
        setStatus('success');
      } else {
        // Razorpay mode - open checkout
        await openRazorpayCheckout(order);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create payment order');
      setProcessing(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true });
        existing.addEventListener('error', () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const openRazorpayCheckout = async (order: any) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || typeof window === 'undefined' || !(window as any).Razorpay) {
      setError('Could not load Razorpay checkout. Please check your internet connection and try again.');
      setStatus('error');
      setProcessing(false);
      return;
    }

    const options = {
      key: paymentConfig.keyId,
      amount: order.amount * 100,
      currency: paymentConfig.currency,
      name: 'EV Training School',
      description: course.title,
      order_id: order.orderId,
      handler: async (response: any) => {
        try {
          await paymentsApi.verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          setStatus('success');
        } catch (err: any) {
          setError('Payment verification failed. Please contact support.');
          setStatus('error');
        }
        setProcessing(false);
      },
      prefill: {
        name: user?.name,
        email: user?.email,
      },
      theme: {
        color: '#1769FF',
      },
      method: {
        netbanking: paymentMethod === 'netbanking',
        card: paymentMethod === 'card',
        upi: paymentMethod === 'upi',
        wallet: paymentMethod === 'wallet',
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Enrolment Successful!</h1>
          <p className="text-gray-600 mb-8">
            You are now enrolled in <strong>{course?.title}</strong>. You can start learning immediately.
          </p>
          <Link
            href={`/student/learn/${courseId}`}
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Start Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Link>

          <h1 className="text-3xl font-bold text-charcoal mb-8">Complete Your Enrolment</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Course Summary */}
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4">Course Summary</h2>
              {course && (
                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-charcoal mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Level</span>
                      <span className="text-charcoal">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-charcoal">{course.hours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Modules</span>
                      <span className="text-charcoal">{course.modules.length}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-charcoal">Total</span>
                      <span className="text-2xl font-bold text-charcoal">₹{course.price}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4">Payment Method</h2>
              <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                {paymentConfig && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Payment Method
                      </label>
                      <div className="space-y-2">
                        {Object.entries(paymentConfig.methods).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={key}
                              checked={paymentMethod === key}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-charcoal">{label as string}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {paymentConfig.mode === 'demo' && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> No actual payment will be processed. This is for testing purposes.
                      </div>
                    )}

                    <button
                      onClick={handleEnrol}
                      disabled={processing}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span>Pay ₹{course?.price}</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      Secure payment powered by {paymentConfig.mode === 'razorpay' ? 'Razorpay' : 'Demo Mode'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * The page reads query parameters, which are only available at request time.
 * The Suspense boundary lets the rest of the layout prerender immediately.
 */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-soft-white" />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
