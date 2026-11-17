'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Award, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CertificatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Mock data - replace with API call
    setCertificates([]);
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-charcoal mb-8">My Certificates</h1>

          {certificates.length === 0 ? (
            <div className="bg-soft-white p-8 rounded-lg border border-gray-200 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">No certificates yet</h3>
              <p className="text-gray-600 mb-4">Complete a course assessment to earn your certificate.</p>
              <Link
                href="/courses"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-charcoal">{cert.courseTitle}</h3>
                      <p className="text-sm text-gray-500">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                    <Link
                      href={`/verify-certificate?id=${cert.id}`}
                      target="_blank"
                      className="block w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Verify Online</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
