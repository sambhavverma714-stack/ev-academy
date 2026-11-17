'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, User, Lock, CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, paymentsApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setProfileForm({ name: user.name || '' });
    loadPayments();
    setLoading(false);
  }, [user, router]);

  const loadPayments = async () => {
    try {
      const data = await paymentsApi.getMyPayments();
      setPayments(data.payments);
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setMessage('');

    try {
      await authApi.updateProfile(profileForm.name);
      await refreshUser();
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setError('');
    setMessage('');

    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
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
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-charcoal mb-8">Profile Settings</h1>

          {/* Email Verification Status */}
          {!user?.emailVerified && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Your email is not verified. <Link href="/verify-email" className="underline">Verify now</Link>
              </p>
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-charcoal">Personal Information</h2>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-charcoal">Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-charcoal">Payment History</h2>
            </div>

            {payments.length === 0 ? (
              <p className="text-gray-600">No payments yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-soft-white rounded-lg">
                    <div>
                      <p className="font-medium text-charcoal">{payment.courseTitle}</p>
                      <p className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">₹{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
