// Centralized API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(0, 'Unable to reach the server. Make sure the API is running and NEXT_PUBLIC_API_URL/CORS are configured correctly.');
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = isJson ? data.error || data.message : response.statusText;
    throw new ApiError(response.status, errorMessage);
  }

  return data as T;
}

// Auth API
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: any; emailDelivery?: { sent?: boolean; dev?: boolean } | null; requiresVerification?: boolean; emailVerificationEnabled?: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any; requiresVerification?: boolean; emailVerificationEnabled?: boolean; emailDelivery?: { sent?: boolean; dev?: boolean; throttled?: boolean } | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () =>
    request<{ user: any }>('/api/auth/me'),

  verifyEmail: (email: string, code: string) =>
    request<{ ok: boolean; user: any }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: () =>
    request<{ ok: boolean; emailDelivery?: { sent?: boolean; dev?: boolean } }>('/api/auth/resend-verification', {
      method: 'POST',
    }),

  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updateProfile: (name: string) =>
    request<{ user: any }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    }),
};

// Courses API
export const coursesApi = {
  getAll: () =>
    request<{ courses: any[] }>('/api/courses'),

  getPreview: (id: string) =>
    request<{ course: any }>('/api/courses/' + id + '/preview'),

  getMyProgress: () =>
    request<{ progress: any[] }>('/api/courses/my/progress'),

  getCourse: (id: string) =>
    request<{ locked: boolean; course: any; progress: any }>('/api/courses/' + id),

  completeModule: (courseId: string, moduleId: string) =>
    request<{ progress: any }>(`/api/courses/${courseId}/modules/${moduleId}/complete`, {
      method: 'POST',
    }),

  getAssessment: (courseId: string) =>
    request<{ passingScore: number; questions: any[] }>(`/api/courses/${courseId}/assessment`),

  submitAssessment: (courseId: string, answers: Record<string, number>) =>
    request<{
      score: number;
      correct: number;
      total: number;
      passed: boolean;
      passingScore: number;
      certificateId: string | null;
      review: any[];
    }>(`/api/courses/${courseId}/assessment`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// Payments API
export const paymentsApi = {
  getConfig: () =>
    request<{ mode: string; keyId: string | null; currency: string; methods: Record<string, string> }>('/api/payments/config'),

  getMyPayments: () =>
    request<{ payments: any[] }>('/api/payments/me'),

  createOrder: (courseId: string, paymentMethod: string) =>
    request<{
      mode: string;
      paymentId: string;
      orderId: string;
      amount: number;
      paymentMethod: string;
      keyId: string | null;
      courseTitle: string;
    }>('/api/payments/order', {
      method: 'POST',
      body: JSON.stringify({ courseId, paymentMethod }),
    }),

  verifyPayment: (orderId: string, razorpayPaymentId: string, signature: string) =>
    request<{ payment: any }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, razorpayPaymentId, signature }),
    }),

  confirmDemoPayment: (paymentId: string) =>
    request<{ payment: any }>('/api/payments/demo-confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),
};

// Bookings API
export const bookingsApi = {
  book: (slotId: string) =>
    request<{ booking: any }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    }),

  cancel: (bookingId: string) =>
    request<{ message: string }>(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    }),
};

// Certificates API
export const certificatesApi = {
  verify: (id: string) =>
    request<{
      valid: boolean;
      revoked?: boolean;
      certificate?: any;
    }>('/api/certificates/verify/' + id),
};

// Site API
export const siteApi = {
  getAnnouncements: () =>
    request<{ announcements: any[] }>('/api/site/announcements'),

  getFeaturedReviews: () =>
    request<{ reviews: any[] }>('/api/site/reviews/featured'),

  getCourseReviews: (courseId: string) =>
    request<{ reviews: any[]; summary: any }>('/api/site/reviews/' + courseId),

  submitReview: (courseId: string, rating: number, comment: string) =>
    request<{ review: any; summary: any }>('/api/site/reviews/' + courseId, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }),

  contact: (name: string, email: string, subject: string, message: string) =>
    request<{ message: string }>('/api/site/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, subject, message }),
    }),

  requestPasswordReset: (email: string) =>
    request<{ message: string }>('/api/site/password-reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// Admin API
export const adminApi = {
  getStats: () =>
    request<{
      students: number;
      newStudentsThisWeek: number;
      enrolments: number;
      revenue: number;
      certificates: number;
      upcomingSessions: number;
      upcomingBookings: number;
      perCourse: any[];
    }>('/api/admin/stats'),

  getStudents: (search?: string) =>
    request<{ students: any[] }>('/api/admin/students?search=' + (search || '')),

  updateStudent: (userId: string, data: any) =>
    request<{ student: any }>('/api/admin/students/' + userId, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getCourses: () =>
    request<{ courses: any[] }>('/api/admin/courses'),

  updateCoursePrice: (courseId: string, price: number) =>
    request<{ course: any }>('/api/admin/courses/' + courseId + '/price', {
      method: 'PUT',
      body: JSON.stringify({ price }),
    }),

  getPayments: () =>
    request<{ payments: any[] }>('/api/admin/payments'),

  getCertificates: (search?: string) =>
    request<{ certificates: any[] }>('/api/admin/certificates?search=' + (search || '')),

  revokeCertificate: (certId: string) =>
    request<{ certificate: any }>('/api/admin/certificates/' + certId, {
      method: 'PATCH',
      body: JSON.stringify({ revoked: true }),
    }),

  restoreCertificate: (certId: string) =>
    request<{ certificate: any }>('/api/admin/certificates/' + certId, {
      method: 'PATCH',
      body: JSON.stringify({ revoked: false }),
    }),

  getSessions: () =>
    request<{ slots: any[] }>('/api/admin/slots'),

  createSession: (session: any) =>
    request<{ slot: any }>('/api/bookings/slots', {
      method: 'POST',
      body: JSON.stringify(session),
    }),

  updateSession: (sessionId: string, data: any) =>
    request<{ slot: any }>('/api/admin/slots/' + sessionId, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSession: (sessionId: string) =>
    request<{ message: string }>('/api/admin/slots/' + sessionId, {
      method: 'DELETE',
    }),

  getMessages: () =>
    request<{ messages: any[]; open: number }>('/api/site/admin/messages'),

  handleMessage: (messageId: string, handled: boolean) =>
    request<{ message: any }>('/api/site/admin/messages/' + messageId, {
      method: 'PATCH',
      body: JSON.stringify({ handled }),
    }),

  deleteMessage: (messageId: string) =>
    request<{ message: string }>('/api/site/admin/messages/' + messageId, {
      method: 'DELETE',
    }),

  getAnnouncements: () =>
    request<{ announcements: any[] }>('/api/site/admin/announcements'),

  createAnnouncement: (title: string, body: string) =>
    request<{ announcement: any }>('/api/site/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    }),

  deleteAnnouncement: (announcementId: string) =>
    request<{ message: string }>('/api/site/admin/announcements/' + announcementId, {
      method: 'DELETE',
    }),

  getReviews: () =>
    request<{ reviews: any[] }>('/api/site/admin/reviews'),

  deleteReview: (reviewId: string) =>
    request<{ message: string }>('/api/site/admin/reviews/' + reviewId, {
      method: 'DELETE',
    }),

  getProfile: () =>
    request<{ user: any }>('/api/admin/profile'),

  updateProfile: (data: { name?: string; password?: string }) =>
    request<{ user: any }>('/api/admin/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export { ApiError };
