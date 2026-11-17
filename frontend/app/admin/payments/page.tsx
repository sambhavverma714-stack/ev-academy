'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, DollarSign, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadPayments();
  }, [user, router]);

  const loadPayments = async () => {
    try {
      const data = await adminApi.getPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-white">
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"><ArrowLeft className="h-4 w-4" /><span>Back to Dashboard</span></Link>
          <h1 className="text-3xl font-bold text-charcoal mb-8">Payments</h1>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm text-charcoal">{payment.courseTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                    <td className="px-6 py-4 text-sm"><span className={payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{payment.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
