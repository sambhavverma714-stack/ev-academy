'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Users, BookOpen, Award, DollarSign, Calendar, MessageSquare, LogOut, Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Admin Dashboard</h1>

          {stats && (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Students</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal">{stats.students}</div>
                  <div className="text-sm text-green-600">+{stats.newStudentsThisWeek} this week</div>
                </div>

                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <span className="text-sm text-gray-600">Enrolments</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal">{stats.enrolments}</div>
                </div>

                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal">₹{stats.revenue.toLocaleString()}</div>
                </div>

                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="h-6 w-6 text-blue-600" />
                    <span className="text-sm text-gray-600">Certificates</span>
                  </div>
                  <div className="text-3xl font-bold text-charcoal">{stats.certificates}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-charcoal">Lab Sessions</h2>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upcoming sessions</span>
                      <span className="font-medium">{stats.upcomingSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booked seats</span>
                      <span className="font-medium">{stats.upcomingBookings}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-soft-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-semibold text-charcoal">Quick Actions</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/students" className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                      <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-sm">Students</span>
                    </Link>
                    <Link href="/admin/courses" className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                      <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-sm">Courses</span>
                    </Link>
                    <Link href="/admin/payments" className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-sm">Payments</span>
                    </Link>
                    <Link href="/admin/certificates" className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
                      <Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-sm">Certificates</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-charcoal mb-4">Course Performance</h2>
                <div className="bg-soft-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.perCourse.map((course: any) => (
                        <tr key={course.courseId}>
                          <td className="px-6 py-4 text-sm text-charcoal">{course.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.enrolled}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.started}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{course.passed}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">₹{course.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
