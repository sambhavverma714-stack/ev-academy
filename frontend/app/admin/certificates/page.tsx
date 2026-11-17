'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadCertificates();
  }, [user, router]);

  const loadCertificates = async () => {
    try {
      const data = await adminApi.getCertificates();
      setCertificates(data.certificates);
    } catch (err) {
      console.error('Failed to load certificates:', err);
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
          <h1 className="text-3xl font-bold text-charcoal mb-8">Certificates</h1>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {certificates.map((cert) => (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 text-sm text-charcoal">{cert.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cert.userName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cert.courseTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm"><span className={cert.revoked ? 'text-red-600' : 'text-green-600'}>{cert.revoked ? 'Revoked' : 'Valid'}</span></td>
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
