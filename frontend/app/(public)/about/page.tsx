import Link from 'next/link';
import { Zap, Shield, Award, Users, Target, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
{/* Hero */}
      <section className="pt-32 pb-16 bg-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-charcoal mb-4">About EV Training School</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            We are dedicated to providing world-class training in electric vehicle maintenance, 
            focusing on safety, practical skills, and industry-recognized certification.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-charcoal mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-4">
              As the automotive industry accelerates toward electrification, the demand for skilled 
              EV technicians is growing rapidly. Our mission is to bridge the skills gap by providing 
              accessible, high-quality training that prepares technicians for the future of mobility.
            </p>
            <p className="text-lg text-gray-600">
              Our courses are developed by industry experts with decades of experience in high-voltage 
              systems, battery technology, and electric drivetrains. We focus on practical, hands-on 
              learning that directly applies to real-world scenarios.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-soft-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600">Comprehensive training for every stage of your EV career</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Safety-First Approach</h3>
              <p className="text-gray-600">
                All our courses emphasize high-voltage safety protocols, PPE usage, and emergency response procedures.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Target className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Industry-Focused Curriculum</h3>
              <p className="text-gray-600">
                Content aligned with manufacturer specifications and industry standards including NFPA 70E and SAE guidelines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Award className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Verifiable Certification</h3>
              <p className="text-gray-600">
                Earn certificates that employers can verify online, demonstrating your expertise to potential employers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Hands-On Lab Sessions</h3>
              <p className="text-gray-600">
                Apply your knowledge in practical lab sessions with real EV equipment and guidance from experienced instructors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <CheckCircle className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Flexible Learning</h3>
              <p className="text-gray-600">
                Study at your own pace with online modules, progress tracking, and assessments you can retake as needed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Zap className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-charcoal mb-2">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from professionals with real-world experience in EV service centers and manufacturing facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-4">Our Training Programs</h2>
            <p className="text-xl text-gray-600">Five comprehensive courses covering essential EV systems</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'High-Voltage Safety & PPE', level: 'Foundation', hours: 4 },
              { title: 'Battery Diagnostics', level: 'Intermediate', hours: 6 },
              { title: 'EV Charging Systems', level: 'Intermediate', hours: 5 },
              { title: 'Motor and Inverter Systems', level: 'Advanced', hours: 6 },
              { title: 'HV Wiring and Repair', level: 'Advanced', hours: 5 },
            ].map((course, index) => (
              <div key={index} className="p-6 bg-soft-white rounded-lg">
                <div className="text-sm font-medium text-blue-600 mb-2">{course.level}</div>
                <h3 className="text-lg font-semibold text-charcoal mb-2">{course.title}</h3>
                <div className="text-sm text-gray-500">{course.hours} hours</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-charcoal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your EV Career Today</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the next generation of automotive technicians trained for the electric future.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
