import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
{/* Content */}
      <section className="pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-charcoal mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: November 2026
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using EV Training School, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Account Registration</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of our service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Course Enrolment and Access</h2>
            <p className="text-gray-600 mb-4">
              Upon successful payment, you will receive access to the enrolled course. Access is 
              granted for the lifetime of the course, subject to our continued operation of the platform.
            </p>
            <p className="text-gray-600 mb-4">
              Course content is protected by copyright and intellectual property laws. You may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Copy, reproduce, or distribute course materials</li>
              <li>Use course content for commercial purposes</li>
              <li>Share your account credentials with others</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Payments and Refunds</h2>
            <p className="text-gray-600 mb-4">
              All payments are processed through Razorpay. By making a payment, you agree to Razorpay's 
              terms of service. Refunds are handled on a case-by-case basis and are not guaranteed.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Certificates</h2>
            <p className="text-gray-600 mb-4">
              Certificates are issued upon successful completion of course assessments (80% pass mark). 
              Certificates are the property of EV Training School and may be revoked for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Violation of these terms</li>
              <li>Fraudulent assessment completion</li>
              <li>Misrepresentation of credentials</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Lab Sessions</h2>
            <p className="text-gray-600 mb-4">
              Hands-on lab sessions are subject to availability. Bookings can be cancelled before the 
              session start time. No-shows may affect your ability to book future sessions.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">User Conduct</h2>
            <p className="text-gray-600 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Interfere with or disrupt the service</li>
              <li>Attempt to gain unauthorized access</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              EV Training School shall not be liable for any indirect, incidental, special, or 
              consequential damages arising from your use of the service.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these terms at any time. Continued use of the service 
              constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mt-8 mb-4">Contact</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: legal@evschool.com<br />
              Address: EV Training Center, Tech Park, Sector 15, Bangalore, India 560001
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
