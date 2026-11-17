'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Search, CheckCircle, XCircle, Award } from 'lucide-react';
import { certificatesApi } from '@/lib/api';

export default function VerifyCertificatePage() {
  const [certificateId, setCertificateId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'not-found'>('idle');
  const [certificate, setCertificate] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setStatus('loading');
    try {
      const result = await certificatesApi.verify(certificateId);
      if (result.valid && result.certificate) {
        setCertificate(result.certificate);
        setStatus(result.certificate.revoked ? 'invalid' : 'valid');
      } else {
        setStatus('not-found');
      }
    } catch (err) {
      setStatus('not-found');
    }
  };

  return (
    <div className="min-h-screen bg-white">
{/* Hero */}
      <section className="pt-32 pb-16 bg-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Verify a Certificate</h1>
          <p className="text-xl text-gray-600">Enter the certificate ID to verify its authenticity</p>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleVerify} className="mb-12">
            <div className="flex gap-4">
              <input
                type="text"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter Certificate ID (e.g., EVT-2025-A3F9C1)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {status === 'valid' && certificate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-green-800">Valid Certificate</h2>
              </div>

              <div className="bg-white rounded-lg p-6 border border-green-200">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-charcoal">{certificate.courseTitle}</h3>
                    <p className="text-gray-600">Issued to: {certificate.userName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Certificate ID:</span>
                    <p className="font-medium text-charcoal">{certificate.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Issue Date:</span>
                    <p className="font-medium text-charcoal">
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'invalid' && certificate && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <XCircle className="h-8 w-8 text-red-600" />
                <h2 className="text-2xl font-bold text-red-800">Revoked Certificate</h2>
              </div>
              <p className="text-gray-600">
                This certificate has been revoked and is no longer valid. Contact the school for more information.
              </p>
            </div>
          )}

          {status === 'not-found' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="flex items-center space-x-3 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
                <h2 className="text-2xl font-bold text-red-800">Certificate Not Found</h2>
              </div>
              <p className="text-gray-600">
                No certificate with this ID was found. Please check the ID and try again.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="py-16 bg-soft-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal mb-4">About Certificate Verification</h2>
          <p className="text-gray-600 mb-6">
            Every certificate issued by EV Training School has a unique ID that can be verified 
            online. This allows employers and institutions to confirm the authenticity of 
            credentials presented by candidates.
          </p>
          <p className="text-gray-600">
            The verification system uses cryptographic signatures to ensure that certificates 
            cannot be forged or tampered with.
          </p>
        </div>
      </section>
    </div>
  );
}
