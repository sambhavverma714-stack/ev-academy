// Shared domain types for the EV Academy frontend.

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  emailVerified: boolean;
}

export interface Course {
  id: string;
  title: string;
  level: string;
  hours: number;
  passingScore: number;
  description: string;
  price: number;
  moduleCount: number;
  modules?: Module[];
  assessment?: AssessmentQuestion[];
  questionCount?: number;
  rating?: RatingSummary;
  locked?: boolean;
  progress?: Progress;
}

export interface Module {
  id: string;
  title: string;
  preview?: boolean;
  content?: string[];
  figures?: Figure[];
}

export interface Figure {
  src?: string;
  video?: string;
  alt?: string;
  caption?: string;
  after?: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface Progress {
  courseId: string;
  title: string;
  price: number;
  enrolled: boolean;
  completedModules: number;
  totalModules: number;
  completedModuleIds: string[];
  assessmentUnlocked: boolean;
  attempts: number;
  bestScore: number | null;
  passed: boolean;
}

export interface RatingSummary {
  average: number | null;
  count: number;
}

export interface Review {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  status: string;
  method: string;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface Booking {
  id: string;
  slotId: string;
  courseTitle: string;
  labName: string;
  location: string;
  startsAt: string;
  started: boolean;
  createdAt: string;
}

export interface Slot {
  id: string;
  courseId: string;
  courseTitle: string;
  labName: string;
  location: string;
  startsAt: string;
  capacity: number;
  spotsLeft: number;
  started: boolean;
  bookedByMe: boolean;
}

export interface Certificate {
  id: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
  revoked: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface Message {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  handled: boolean;
}

export interface AdminStats {
  students: number;
  newStudentsThisWeek: number;
  enrolments: number;
  revenue: number;
  certificates: number;
  upcomingSessions: number;
  upcomingBookings: number;
  perCourse: any[];
}

export interface PaymentConfig {
  mode: "razorpay" | "demo";
  keyId: string | null;
  currency: string;
  methods: Record<string, string>;
}
