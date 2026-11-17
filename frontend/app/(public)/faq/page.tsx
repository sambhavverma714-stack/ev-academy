'use client';

import Link from 'next/link';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'What is the pass mark, and can I retake the assessment?',
    answer: 'You need 80% to pass and you can retake the assessment as often as you like. There is no limit on attempts, so you can keep trying until you achieve the passing score.'
  },
  {
    question: 'How does an employer check my certificate?',
    answer: 'Every certificate has a unique ID that anyone can enter on our Verify page to confirm it is genuine. The verification shows the certificate details, issue date, and current status (valid or revoked).'
  },
  {
    question: 'How do the lab sessions work?',
    answer: 'After enrolling in a course, you can book hands-on lab sessions from your dashboard. Sessions have limited capacity and are held at our training center. You can cancel your booking anytime before the session starts.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, debit/credit cards, net banking, and digital wallets through Razorpay. In demo mode, no actual payment is processed - this is for testing the platform.'
  },
  {
    question: 'How long do I have access to a course?',
    answer: 'Once you enrol in a course, you have lifetime access. You can study at your own pace, revisit modules, and retake assessments whenever you need.'
  },
  {
    question: 'Are the courses accredited?',
    answer: 'Our courses are designed to meet industry standards and follow guidelines from organizations like NFPA, OSHA, and SAE. While not formally accredited, our certificates are recognized by many employers in the EV industry.'
  },
  {
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'Refunds are handled on a case-by-case basis. If you haven\'t started the course, you may be eligible for a refund. Contact our support team for assistance.'
  },
  {
    question: 'Do I need prior EV experience?',
    answer: 'Our foundation course (High-Voltage Safety & PPE) requires no prior EV experience, though basic electrical knowledge is helpful. Intermediate and advanced courses build on the foundation course.'
  },
  {
    question: 'What equipment do I need for the online courses?',
    answer: 'You only need a computer or tablet with internet access. All course materials are delivered online. For lab sessions, all equipment is provided at our training center.'
  },
  {
    question: 'Can I download the course materials?',
    answer: 'Course materials are available online through our learning platform. You can access them anytime from your account. Downloading is not supported to protect our intellectual property.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
{/* Hero */}
      <section className="pt-32 pb-16 bg-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-charcoal mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about our courses and platform</p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-soft-white transition-colors"
                >
                  <span className="text-lg font-medium text-charcoal pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 bg-soft-white">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-soft-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-charcoal mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Can't find the answer you're looking for? Please reach out to our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
