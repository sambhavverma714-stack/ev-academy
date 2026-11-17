'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowLeft, Calendar, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Mock data - replace with API calls
    setSessions([]);
    setMyBookings([]);
    setLoading(false);
  }, [user, router]);

  const handleBook = async (slotId: string) => {
    // Implement booking logic
    console.log('Booking:', slotId);
  };

  const handleCancel = async (bookingId: string) => {
    // Implement cancel logic
    console.log('Cancelling:', bookingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lab sessions...</p>
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

          <h1 className="text-3xl font-bold text-charcoal mb-8">Lab Sessions</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4">My Bookings</h2>
              {myBookings.length === 0 ? (
                <div className="bg-soft-white p-6 rounded-lg border border-gray-200 text-center">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No lab sessions booked yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-charcoal">{booking.labName}</h3>
                          <p className="text-sm text-gray-600">{new Date(booking.startsAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-charcoal mb-4">Available Sessions</h2>
              {sessions.length === 0 ? (
                <div className="bg-soft-white p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-gray-600">No sessions available at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-charcoal mb-2">{session.labName}</h3>
                      <p className="text-sm text-gray-600 mb-2">{session.location}</p>
                      <p className="text-sm text-gray-600 mb-4">{new Date(session.startsAt).toLocaleString()}</p>
                      <button
                        onClick={() => handleBook(session.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Book Session
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
