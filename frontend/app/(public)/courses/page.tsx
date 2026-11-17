"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Gauge, Layers, Search, X } from "lucide-react";
import { coursesApi } from "@/lib/api";
import { LEVELS, PROGRAMMES, type Programme } from "@/lib/catalogue";
import { cn, formatRupees } from "@/lib/utils";

interface CatalogueItem extends Programme {
  moduleCount?: number;
  rating?: { average: number | null; count: number };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CatalogueItem[]>(PROGRAMMES);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    coursesApi
      .getAll()
      .then((data) => {
        if (!cancelled && data.courses?.length) setCourses(data.courses);
      })
      .catch(() => {
        // Fallback catalogue stays in place when the API is unavailable
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = level === "All" || course.level === level;
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term);
      return matchesLevel && matchesTerm;
    });
  }, [courses, level, query]);

  return (
    <div className="bg-ink">
      <section className="relative overflow-hidden border-b border-white/10 pb-14 pt-36 sm:pt-44">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
          <p className="eyebrow text-white/35">Programme catalogue</p>
          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="display max-w-2xl text-[clamp(2.6rem,6vw,4.6rem)] text-white">
              Five disciplines.
              <span className="text-white/30"> One standard.</span>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-white/45">
              Each programme is self-contained, lab-backed and assessed. Start at the foundation
              or configure a pathway across several disciplines.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
              {LEVELS.map((item) => {
                const count =
                  item === "All"
                    ? courses.length
                    : courses.filter((course) => course.level === item).length;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    aria-pressed={level === item}
                    className={cn(
                      "flex shrink-0 items-center gap-2 border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors",
                      level === item
                        ? "border-white bg-white text-ink"
                        : "border-white/15 text-white/50 hover:border-white/40 hover:text-white"
                    )}
                  >
                    {item}
                    <span className={cn("text-[9px]", level === item ? "text-ink/50" : "text-white/30")}>
                      {String(count).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search programmes"
                aria-label="Search programmes"
                className="w-full border-b border-white/15 bg-transparent py-2.5 pl-7 pr-8 text-sm text-white placeholder:text-white/30 focus:border-white/50 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        {loading ? (
          <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="bg-ink p-7">
                <div className="h-2 w-10 animate-pulse bg-white/10" />
                <div className="mt-10 h-6 w-3/4 animate-pulse bg-white/10" />
                <div className="mt-3 h-4 w-full animate-pulse bg-white/5" />
                <div className="mt-8 h-10 w-full animate-pulse bg-white/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-white/15 px-6 py-24 text-center">
            <p className="text-lg font-medium text-white/70">No programme matches that filter.</p>
            <p className="mt-2 text-sm text-white/40">
              Try a different level or clear your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setLevel("All");
                setQuery("");
              }}
              className="mt-8 border border-white/20 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 transition-colors hover:border-white/50 hover:text-white"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((course, index) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-ink"
                >
                  <Link
                    href={`/courses/${course.id}`}
                    className="group relative flex h-full flex-col justify-between overflow-hidden bg-[#080b10] p-7 transition-colors hover:bg-[#0b0f15] sm:p-8"
                  >
                    <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-soft transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

                    <div>
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] tracking-widest text-white/25">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-white/45">
                          {course.level}
                        </span>
                      </div>

                      <h2 className="mt-10 text-xl font-medium leading-snug tracking-tight text-white/90 transition-colors group-hover:text-white">
                        {course.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-white/40">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-9">
                      <div className="flex items-center gap-4 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.16em] text-white/35">
                        <span className="flex items-center gap-1.5">
                          <Gauge className="h-3.5 w-3.5" />
                          {course.hours} h
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" />
                          {(course.moduleCount ?? course.modules) || "—"} modules
                        </span>
                        {course.rating?.count ? (
                          <span className="ml-auto text-accent-soft">
                            ★ {course.rating.average?.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-5 flex items-end justify-between">
                        <span className="text-lg font-medium text-white">
                          {formatRupees(course.price)}
                        </span>
                        <span className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/50 transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <section className="border-t border-white/10 bg-[#070a0e]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="eyebrow text-white/35">Not sure where to start?</p>
            <p className="mt-4 max-w-lg text-lg font-medium text-white/80">
              The foundation programme is the entry point for every other discipline.
            </p>
          </div>
          <Link
            href="/courses/hv-safety"
            className="group inline-flex shrink-0 items-center gap-3 border border-white/20 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-white/60"
          >
            Open HV Safety
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
