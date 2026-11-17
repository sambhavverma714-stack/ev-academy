import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
{/* Content */}
      <section className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-charcoal mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: November 2026
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              enrol in a course, or contact us. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Name and email address</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Course progress and assessment results</li>
              <li>Messages and support requests</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell, trade, or rent your personal information to others. We may share 
              information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Service providers who perform services on our behalf (e.g., payment processing)</li>
              <li>When required by law or to protect our rights</li>
              <li>With your consent for specific purposes</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. This includes 
              encryption, secure servers, and regular security reviews.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: privacy@evschool.com<br />
              Address: EV Training Center, Tech Park, Sector 15, Bangalore, India 560001
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
