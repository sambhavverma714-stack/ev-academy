"use client";
import { Suspense } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { coursesApi } from "@/lib/api";
import { findProgramme } from "@/lib/catalogue";
import { cn, formatRupees } from "@/lib/utils";

interface CourseModule {
  id: string;
  title: string;
  preview?: boolean;
  content?: string[];
  figures?: { src?: string; alt?: string; caption?: string }[];
}

interface CourseDetail {
  id: string;
  title: string;
  level: string;
  hours: number;
  passingScore: number;
  description: string;
  price: number;
  modules: CourseModule[];
  questionCount?: number;
  rating?: { average: number | null; count: number };
}

function CourseDetailPageContent() {
  const params = useParams();
  const courseId = String(params.id);
  const fallback = useMemo(() => findProgramme(courseId), [courseId]);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModule, setOpenModule] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    coursesApi
      .getPreview(courseId)
      .then((data) => {
        if (!cancelled) {
          setCourse(data.course);
          setOpenModule(data.course?.modules?.[0]?.id ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "This programme could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const title = course?.title || fallback?.title;
  const level = course?.level || fallback?.level;
  const hours = course?.hours ?? fallback?.hours;
  const price = course?.price ?? fallback?.price;
  const description = course?.description || fallback?.description;
  const modules = course?.modules || [];

  if (!loading && !course && !fallback) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-20 text-center">
        <p className="eyebrow text-white/35">404 · Programme</p>
        <h1 className="mt-5 display text-4xl text-white">This programme does not exist.</h1>
        <Link
          href="/courses"
          className="mt-8 border border-white/20 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
        >
          Back to the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ink">
      <section className="relative overflow-hidden border-b border-white/10 pb-16 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[460px] w-[460px] rounded-full bg-accent/10 blur-[130px]" />

        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Programme catalogue
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {level && (
                  <span className="border border-white/15 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/55">
                    {level}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-white/35">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Lab-backed programme
                </span>
              </div>

              <h1 className="mt-7 display max-w-2xl text-[clamp(2.3rem,5vw,4rem)] text-white">
                {loading && !fallback ? "Loading programme…" : title}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/50">{description}</p>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-white/30">Duration</dt>
                  <dd className="mt-1.5 text-sm text-white/80">{hours} hours</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-white/30">Modules</dt>
                  <dd className="mt-1.5 text-sm text-white/80">
                    {modules.length || fallback?.modules || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-white/30">Pass mark</dt>
                  <dd className="mt-1.5 text-sm text-white/80">
                    {course?.passingScore ?? fallback?.passingScore ?? 80}%
                  </dd>
                </div>
              </dl>
            </div>

            {/* Enrolment panel */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative">
                <div className="absolute -inset-px bg-gradient-to-b from-white/15 to-transparent cut-corner" />
                <div className="relative cut-corner border border-white/10 bg-[#080b10] p-7">
                  <p className="eyebrow text-white/35">Enrolment</p>
                  <div className="mt-5 flex items-end justify-between border-b border-white/10 pb-5">
                    <span className="text-4xl font-medium tracking-tight text-white">
                      {formatRupees(price)}
                    </span>
                    <span className="mb-1 text-[9px] uppercase tracking-[0.18em] text-white/30">
                      One-time
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Lifetime access to the modules",
                      "Hands-on lab session booking",
                      "Assessment and verifiable certificate",
                    ].map((item) => (
                      <p key={item} className="flex items-start gap-2.5 text-[12px] text-white/55">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-soft" />
                        {item}
                      </p>
                    ))}
                  </div>

                  <Link
                    href={`/checkout?course=${courseId}`}
                    className="group mt-7 flex items-center justify-between bg-white px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-accent-soft"
                  >
                    Enrol in this programme
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={`/login?course=${courseId}`}
                    className="mt-2.5 flex items-center justify-center border border-white/15 px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
                  >
                    Sign in to enrol
                  </Link>

                  <p className="mt-4 text-center text-[10px] leading-relaxed text-white/25">
                    Secure payment. Demo mode is active until the academy connects its payment
                    provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-white/35">Curriculum</p>
                <h2 className="mt-4 display text-3xl text-white sm:text-4xl">
                  What you will cover.
                </h2>
              </div>
              <span className="hidden text-[10px] uppercase tracking-[0.18em] text-white/25 sm:block">
                {modules.length || fallback?.modules || 0} modules
              </span>
            </div>

            {loading ? (
              <div className="mt-8 space-y-px bg-white/10">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="bg-ink px-5 py-6">
                    <div className="h-4 w-2/3 animate-pulse bg-white/10" />
                  </div>
                ))}
              </div>
            ) : modules.length > 0 ? (
              <div className="mt-8 border-t border-white/10">
                {modules.map((module, index) => {
                  const isOpen = openModule === module.id;
                  return (
                    <div key={module.id} className="border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => setOpenModule(isOpen ? null : module.id)}
                        aria-expanded={isOpen}
                        className="group flex w-full items-center gap-4 py-5 text-left"
                      >
                        <span className="font-mono text-[10px] tracking-widest text-white/25">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium transition-colors sm:text-base",
                            isOpen ? "text-white" : "text-white/65 group-hover:text-white"
                          )}
                        >
                          {module.title}
                        </span>
                        {module.preview ? (
                          <span className="hidden border border-accent/30 bg-accent/10 px-2 py-1 text-[8px] uppercase tracking-[0.18em] text-accent-soft sm:block">
                            Free preview
                          </span>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-white/20" />
                        )}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-white/30 transition-transform duration-300",
                            isOpen && "rotate-180 text-white/70"
                          )}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-6 pl-8 pr-2">
                              {module.content && module.content.length > 0 ? (
                                <div className="space-y-3">
                                  {module.content.slice(0, 4).map((paragraph, i) => (
                                    <p key={i} className="text-[13px] leading-relaxed text-white/45">
                                      {paragraph}
                                    </p>
                                  ))}
                                  {module.content.length > 4 && (
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/25">
                                      + {module.content.length - 4} more sections after enrolment
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[13px] leading-relaxed text-white/35">
                                  {module.preview
                                    ? "This preview module is being prepared."
                                    : "Enrol to unlock this module's lessons, diagrams and assessment."}
                                </p>
                              )}

                              {module.figures?.length ? (
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                  {module.figures.slice(0, 2).map((figure, i) => (
                                    <figure key={i} className="border border-white/10 bg-white/[0.02] p-3">
                                      {figure.src && (
                                        <img
                                          src={`/${figure.src.replace(/^\//, "")}`}
                                          alt={figure.alt || ""}
                                          className="h-24 w-full object-contain"
                                        />
                                      )}
                                      <figcaption className="mt-2 text-[10px] leading-relaxed text-white/30">
                                        {figure.caption}
                                      </figcaption>
                                    </figure>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 border border-dashed border-white/15 px-6 py-12 text-center">
                <p className="text-sm text-white/60">
                  {error || "The curriculum could not be loaded right now."}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 border border-white/20 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <p className="eyebrow text-white/35">Final assessment</p>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                Complete every module, then pass the assessment at{" "}
                <span className="text-white">{course?.passingScore ?? fallback?.passingScore ?? 80}%</span>{" "}
                or above. You can retake it, and your best score is recorded.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/30">
                <Sparkles className="h-3.5 w-3.5 text-accent-soft" />
                {course?.questionCount ?? fallback?.questions ?? 5} questions
              </div>
            </div>

            <div className="border border-white/10 bg-[#070a0e] p-6">
              <p className="eyebrow text-white/35">Lab session</p>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                Book a hands-on session in a dedicated bay once you are enrolled. Group sizes are
                capped so every student gets time on the equipment.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/30">
                <Clock className="h-3.5 w-3.5" />
                Booked from your dashboard
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#070a0e]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="eyebrow text-white/35">Ready when you are</p>
            <p className="mt-4 max-w-lg text-lg font-medium text-white/80">
              Enrol, work through the modules, then book your lab session.
            </p>
          </div>
          <Link
            href={`/checkout?course=${courseId}`}
            className="group inline-flex shrink-0 items-center gap-3 bg-white px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-accent-soft"
          >
            Enrol — {formatRupees(price)}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <CourseDetailPageContent />
    </Suspense>
  );
}
