'use client';
import { Suspense } from "react";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Gauge,
  Loader2,
  PlayCircle,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesApi, siteApi } from '@/lib/api';

function pct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function StudentDashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [error, setError] = useState('');

  const enrollCourse = searchParams.get('enroll');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadData() {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const [progressData, announcementsData] = await Promise.all([
          coursesApi.getMyProgress(),
          siteApi.getAnnouncements(),
        ]);
        setProgress(progressData.progress || []);
        setAnnouncements(announcementsData.announcements || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (user) loadData();
  }, [user, authLoading, router]);

  const enrolledCourses = useMemo(() => progress.filter((p) => p.enrolled), [progress]);
  const completedCourses = useMemo(() => progress.filter((p) => p.passed), [progress]);
  const activeCourses = useMemo(
    () => enrolledCourses.filter((p) => !p.passed),
    [enrolledCourses]
  );
  const continueCourse = useMemo(() => {
    const inProgress = activeCourses.filter((p) => (p.completedModules || 0) > 0);
    const list = inProgress.length ? inProgress : activeCourses;
    return [...list].sort(
      (a, b) => pct(b.completedModules || 0, b.totalModules || 1) - pct(a.completedModules || 0, a.totalModules || 1)
    )[0];
  }, [activeCourses]);
  const avgProgress = useMemo(() => {
    if (!enrolledCourses.length) return 0;
    return Math.round(
      enrolledCourses.reduce((sum, c) => sum + pct(c.completedModules || 0, c.totalModules || 1), 0) /
        enrolledCourses.length
    );
  }, [enrolledCourses]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-soft mx-auto mb-4" />
          <p className="text-white/50 text-sm tracking-wide">Loading your academy…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { label: 'Enrolled', value: enrolledCourses.length, icon: BookOpen },
    { label: 'Active', value: activeCourses.length, icon: PlayCircle },
    { label: 'Completed', value: completedCourses.length, icon: Award },
    { label: 'Avg. progress', value: `${avgProgress}%`, icon: Gauge },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <main className="relative overflow-hidden pt-28 pb-16">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <div className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-[-10%] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="panel cut-corner p-7 sm:p-8">
              <p className="eyebrow text-accent-soft/80">Student command center</p>
              <h1 className="display mt-4 text-4xl sm:text-5xl text-white">
                Welcome back, {user.name?.split(' ')[0] || 'Student'}.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
                Track your EV training, jump back into active modules, and manage certificates and lab sessions from one place.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={continueCourse ? `/student/learn/${continueCourse.courseId}` : '/courses'}
                  className="group inline-flex items-center gap-2 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-accent-soft"
                >
                  {continueCourse ? 'Continue learning' : 'Browse courses'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/student/profile"
                  className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.03] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 transition hover:border-white/35 hover:bg-white/[0.06]"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </div>
            </div>

            <div className="panel cut-corner p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <p className="eyebrow text-white/40">Momentum</p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-5xl font-medium tracking-tight">{avgProgress}%</span>
                  <span className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">overall</span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-all"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-white/50">
                  {completedCourses.length} completed · {activeCourses.length} active · {enrolledCourses.length} total enrolled
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/55">
                <div className="border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-white/35 uppercase tracking-[0.18em] text-[10px]">Email</p>
                  <p className={`mt-1 font-medium ${user.emailVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {user.emailVerified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-white/35 uppercase tracking-[0.18em] text-[10px]">Account</p>
                  <p className="mt-1 font-medium text-white/80 truncate" title={user.email}>{user.email}</p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {announcements.length > 0 && (
            <div className="mb-6 panel border-accent/25 bg-accent/10 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-accent-soft flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-soft">Announcements</h3>
                  {announcements.map((a) => (
                    <div key={a.id} className="text-sm text-white/75">
                      <span className="font-medium text-white">{a.title}:</span> {a.body}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!user.emailVerified && (
            <div className="mb-6 border border-amber-400/30 bg-amber-400/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-300 flex-shrink-0" />
              <p className="flex-1 text-sm text-amber-100">Verify your email to unlock course enrolment and payments.</p>
              <Link href="/verify-email" className="text-sm font-semibold text-amber-200 underline underline-offset-4">
                Verify now
              </Link>
            </div>
          )}

          {enrollCourse && (
            <div className="mb-6 border border-emerald-400/30 bg-emerald-400/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-100">Ready to enrol?</h3>
                <p className="text-sm text-emerald-100/70 mt-1">Continue to your selected course and complete checkout.</p>
              </div>
              <Link
                href={`/courses/${enrollCourse}`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-300 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black hover:bg-emerald-200 transition"
              >
                Open course <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="panel panel-hover p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{s.label}</p>
                    <Icon className="h-4 w-4 text-accent-soft" />
                  </div>
                  <p className="mt-4 text-3xl font-medium tracking-tight text-white">{s.value}</p>
                </div>
              );
            })}
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-6">
              {continueCourse && (
                <div className="panel cut-corner p-6 sm:p-7 border-accent/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-accent-soft/80">Pick up where you left off</p>
                      <h2 className="mt-3 text-2xl font-medium text-white">{continueCourse.title || 'Your course'}</h2>
                      <p className="mt-2 text-sm text-white/50">
                        {continueCourse.completedModules || 0} of {continueCourse.totalModules || 0} modules completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-medium text-white">{pct(continueCourse.completedModules || 0, continueCourse.totalModules || 1)}%</p>
                    </div>
                  </div>
                  <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent via-sky-400 to-cyan-300"
                      style={{ width: `${pct(continueCourse.completedModules || 0, continueCourse.totalModules || 1)}%` }}
                    />
                  </div>
                  <Link
                    href={`/student/learn/${continueCourse.courseId}`}
                    className="mt-6 inline-flex items-center gap-2 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black hover:bg-accent-soft transition"
                  >
                    Resume course <PlayCircle className="h-4 w-4" />
                  </Link>
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-medium text-white">My courses</h2>
                  <Link href="/courses" className="text-xs uppercase tracking-[0.18em] text-accent-soft hover:text-white transition">
                    Browse all
                  </Link>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="panel p-10 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-white/25" />
                    <h3 className="mt-4 text-lg font-medium text-white">No courses yet</h3>
                    <p className="mt-2 text-sm text-white/45">Enroll in a programme to start building your EV expertise.</p>
                    <Link
                      href="/courses"
                      className="mt-6 inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:border-white/45 hover:bg-white/[0.04] transition"
                    >
                      Explore courses <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {enrolledCourses.map((course) => {
                      const progressPct = pct(course.completedModules || 0, course.totalModules || 1);
                      return (
                        <Link
                          key={course.courseId}
                          href={`/student/learn/${course.courseId}`}
                          className="panel panel-hover group p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${course.passed ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-accent/30 bg-accent/10 text-accent-soft'}`}>
                              {course.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                              {course.passed ? 'Completed' : 'In progress'}
                            </span>
                            <span className="text-sm font-medium text-white/80">{progressPct}%</span>
                          </div>
                          <h3 className="mt-4 text-lg font-medium leading-snug text-white group-hover:text-accent-soft transition-colors">
                            {course.title}
                          </h3>
                          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full ${course.passed ? 'bg-emerald-400' : 'bg-gradient-to-r from-accent to-cyan-400'}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className="mt-3 text-xs text-white/40">
                            {course.completedModules || 0}/{course.totalModules || 0} modules
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <h2 className="text-xl font-medium text-white">Quick actions</h2>
              {[
                { href: '/courses', icon: BookOpen, title: 'Explore courses', desc: 'Enroll in a new EV programme' },
                { href: '/student/certificates', icon: Award, title: 'Certificates', desc: 'View and verify achievements' },
                { href: '/student/bookings', icon: Calendar, title: 'Lab sessions', desc: 'Book hands-on training slots' },
                { href: '/student/profile', icon: Settings, title: 'Profile & security', desc: 'Manage your account details' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="panel panel-hover group flex items-center gap-4 p-5">
                    <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.03] text-accent-soft group-hover:border-accent/40">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="text-xs text-white/45 mt-0.5">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/25 group-hover:text-white/70 transition-colors" />
                  </Link>
                );
              })}

              <div className="panel p-5 border-white/10">
                <p className="eyebrow text-white/35">Learning tip</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Complete modules in order and retake assessments to improve your score — your best result is the one that counts toward certification.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * The page reads query parameters, which are only available at request time.
 * The Suspense boundary lets the rest of the layout prerender immediately.
 */
export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05070a]" />}>
      <StudentDashboardPageContent />
    </Suspense>
  );
}
