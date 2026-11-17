"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BadgeCheck, FlaskConical, Gauge, Layers, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/interactive/hero";
import { Reveal } from "@/components/interactive/reveal";
import { Counter } from "@/components/interactive/counter";
import { SystemExplorer } from "@/components/interactive/system-explorer";
import { ProgrammeConfigurator } from "@/components/interactive/programme-configurator";
import { coursesApi, siteApi } from "@/lib/api";
import { PROGRAMMES, type Programme } from "@/lib/catalogue";
import { formatRupees } from "@/lib/utils";

interface CatalogueItem extends Programme {
  moduleCount?: number;
  rating?: { average: number | null; count: number };
}

const TICKER = [
  "HV Safety",
  "Battery Diagnostics",
  "Charging Systems",
  "Drive Systems",
  "HV Wiring",
  "Lab Training",
  "Verifiable Certificates",
];

const PRINCIPLES = [
  {
    index: "01",
    title: "Safety before speed",
    copy: "High voltage is not a topic, it is a boundary. Isolation and PPE are taught first, in every programme.",
  },
  {
    index: "02",
    title: "Lab, not just lecture",
    copy: "Small cohorts work on real EV equipment in dedicated bays, guided by practising technicians.",
  },
  {
    index: "03",
    title: "Measured, not assumed",
    copy: "Every module ends in a check. Every programme ends in an assessment with a fixed pass mark.",
  },
  {
    index: "04",
    title: "Proof that travels",
    copy: "Certificates carry a signed ID, so an employer can confirm the result online in seconds.",
  },
];

export default function HomePage() {
  const [courses, setCourses] = useState<CatalogueItem[]>(PROGRAMMES);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [catalogue, featured] = await Promise.all([
          coursesApi.getAll().catch(() => ({ courses: [] as any[] })),
          siteApi.getFeaturedReviews().catch(() => ({ reviews: [] as any[] })),
        ]);
        if (cancelled) return;
        if (catalogue.courses?.length) {
          setCourses(catalogue.courses.map((course: any) => ({ ...course, price: course.price })));
        }
        setReviews(featured.reviews || []);
      } catch {
        // The fallback catalogue keeps the page complete without the API
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleCourses = courses.slice(0, 5);

  return (
    <div className="bg-ink">
      <Hero />

      {/* Ticker */}
      <div className="relative overflow-hidden border-y border-white/10 bg-[#070a0e] py-4">
        <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
              {TICKER.map((item) => (
                <span key={item + copy} className="flex items-center gap-10">
                  <span className="eyebrow text-white/35">{item}</span>
                  <span className="h-1 w-1 bg-accent/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Academy statement */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <Reveal>
                <p className="eyebrow text-white/35">The academy</p>
                <h2 className="mt-6 display text-4xl text-white sm:text-5xl">
                  Built for the people who keep electric vehicles on the road.
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-8 max-w-md text-sm leading-relaxed text-white/50">
                  Electrification changed the workshop. It did not remove the need for judgement.
                  EV Academy teaches the systems, the measurements and the discipline that make
                  high-voltage work repeatable and safe.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-7">
                  {[
                    { value: 5, suffix: "", label: "Programmes" },
                    { value: 27, suffix: "", label: "Modules" },
                    { value: 26, suffix: "h", label: "Guided learning" },
                    { value: 80, suffix: "%", label: "Pass mark" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-medium text-white tabular-nums sm:text-4xl">
                        <Counter value={stat.value} suffix={stat.suffix} />
                      </p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/35">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:pt-16">
              {PRINCIPLES.map((principle, index) => (
                <Reveal key={principle.index} delay={index * 0.07}>
                  <div className="group flex gap-6 border-t border-white/10 py-6 transition-colors hover:border-white/25">
                    <span className="font-mono text-[10px] tracking-widest text-accent-soft/80">
                      {principle.index}
                    </span>
                    <div>
                      <h3 className="text-base font-medium text-white/90">{principle.title}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
                        {principle.copy}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* System explorer */}
      <section className="border-t border-white/10 bg-[#070a0e] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <SystemExplorer />
          </Reveal>
        </div>
      </section>

      {/* Programme range */}
      <section className="border-t border-white/10 py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-white/35">The range</p>
                <h2 className="mt-5 display text-4xl text-white sm:text-5xl">Five programmes.</h2>
              </div>
              <Link
                href="/courses"
                className="group inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white"
              >
                Full catalogue
                <span className="flex h-9 w-9 items-center justify-center border border-white/15 transition-colors group-hover:border-white/50">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course, index) => (
              <Reveal key={course.id} delay={(index % 3) * 0.06} className="bg-ink">
                <Link
                  href={`/courses/${course.id}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden bg-[#080b10] p-7 transition-colors hover:bg-[#0b0f15]"
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

                    <h3 className="mt-10 max-w-[15ch] text-xl font-medium leading-snug tracking-tight text-white/90 transition-colors group-hover:text-white">
                      {course.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-white/40">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-10">
                    <div className="flex items-center gap-4 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.16em] text-white/35">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="h-3.5 w-3.5" />
                        {course.hours} h
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        {(course.moduleCount ?? course.modules) || "—"} modules
                      </span>
                    </div>
                    <div className="mt-5 flex items-end justify-between">
                      <span className="text-lg font-medium text-white">
                        {formatRupees(course.price)}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/50 transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={0.12} className="bg-ink">
              <Link
                href="/courses"
                className="group flex h-full min-h-[300px] flex-col justify-between bg-[#05070a] p-7 transition-colors hover:bg-[#080c12]"
              >
                <div>
                  <p className="eyebrow text-white/30">Not sure yet?</p>
                  <h3 className="mt-10 display text-3xl text-white/80">
                    Start with the
                    <br />
                    foundation.
                  </h3>
                  <p className="mt-4 max-w-[26ch] text-[13px] leading-relaxed text-white/40">
                    High-voltage safety is the entry point for every other discipline in the
                    academy.
                  </p>
                </div>
                <span className="mt-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50 group-hover:text-white">
                  Open the foundation programme
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="border-t border-white/10 bg-[#070a0e] py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-white/35">Pathway</p>
                <h2 className="mt-5 display text-4xl text-white sm:text-5xl">
                  Build your training plan.
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/40">
                Choose the disciplines you need. The summary updates with hours, modules and
                total investment.
              </p>
            </div>
            <ProgrammeConfigurator />
          </Reveal>
        </div>
      </section>

      {/* Certification */}
      <section className="border-t border-white/10 py-24 sm:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
            <Reveal>
              <p className="eyebrow text-white/35">Certification</p>
              <h2 className="mt-6 display text-4xl text-white sm:text-5xl">
                A certificate that checks out.
              </h2>
              <p className="mt-7 max-w-md text-sm leading-relaxed text-white/50">
                Each certificate carries a unique ID and a signed record. Anyone can enter that
                ID on the public registry and see whether the result is genuine, revoked, or
                does not exist.
              </p>

              <ul className="mt-9 space-y-4">
                {[
                  { icon: ShieldCheck, text: "Issued only after a passed assessment" },
                  { icon: BadgeCheck, text: "Tamper-evident signed record" },
                  { icon: FlaskConical, text: "Linked to the programme and lab work" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-white/60">
                    <item.icon className="h-4 w-4 shrink-0 text-accent-soft" />
                    {item.text}
                  </li>
                ))}
              </ul>

              <Link
                href="/verify-certificate"
                className="group mt-10 inline-flex items-center gap-3 border border-white/20 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-white/60"
              >
                Open the registry
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative">
                <div className="absolute -inset-px bg-gradient-to-br from-white/15 via-white/5 to-transparent cut-corner" />
                <div className="relative cut-corner border border-white/10 bg-[#080b10] p-7 sm:p-9">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="eyebrow text-white/35">Certificate of completion</p>
                      <p className="mt-4 text-2xl font-medium tracking-tight text-white">
                        HV Wiring & Connector Repair
                      </p>
                    </div>
                    <div className="grid h-14 w-14 grid-cols-4 gap-0.5 border border-white/15 p-1.5">
                      {Array.from({ length: 16 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index % 3 === 0 || index === 6 || index === 13
                              ? "bg-white/70"
                              : "bg-white/10"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-9 grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                    {[
                      ["Awarded to", "Student name"],
                      ["Certificate ID", "EVT-2026-XXXXXX"],
                      ["Issued", "On assessment pass"],
                      ["Verified by", "Signature check"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">{label}</p>
                        <p className="mt-1.5 text-xs text-white/70">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                    <span className="text-[9px] uppercase tracking-[0.24em] text-white/25">
                      EV Academy · Registry
                    </span>
                    <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-accent-soft">
                      <span className="h-1 w-1 rounded-full bg-accent-soft" />
                      Signed record
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Reviews, when the academy has published some */}
      {reviews.length > 0 && (
        <section className="border-t border-white/10 bg-[#070a0e] py-24">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <Reveal>
              <p className="eyebrow text-white/35">Student feedback</p>
              <h2 className="mt-5 display text-4xl text-white sm:text-5xl">From the workshop.</h2>
            </Reveal>
            <div className="mt-12 grid gap-px bg-white/10 md:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-[#080b10] p-7">
                  <div className="flex gap-1 text-accent-soft">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} className={index < review.rating ? "opacity-100" : "opacity-20"}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/60">“{review.comment}”</p>
                  <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/35">
                    {review.name} · {review.courseTitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Before you enrol */}
      <section className="border-t border-white/10 py-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow text-white/35">Before you enrol</p>
            <h2 className="mt-6 display text-4xl text-white sm:text-5xl">Practical questions.</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
              Still unsure which programme fits? Contact the academy and we will point you to the
              right entry level.
            </p>
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50 hover:text-white"
            >
              Talk to the academy
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="border-t border-white/10">
              {[
                {
                  q: "Do I need previous EV experience?",
                  a: "No. The High-Voltage Safety programme is the foundation and is the recommended entry point. Intermediate and advanced programmes build on it.",
                },
                {
                  q: "Is the training online or in a lab?",
                  a: "Modules are studied online at your own pace. Each programme also has hands-on lab sessions in small groups, booked from your student dashboard.",
                },
                {
                  q: "How does certification work?",
                  a: "Complete every module, then pass the final assessment at 80% or above. A certificate with a signed ID is issued immediately and can be verified publicly.",
                },
                {
                  q: "Can an employer verify my certificate?",
                  a: "Yes. Your certificate ID can be checked on the public registry at any time, including whether it has been revoked.",
                },
              ].map((item) => (
                <details key={item.q} className="group border-b border-white/10">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-base font-medium text-white/80 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      <span className="absolute h-px w-3 bg-white/50" />
                      <span className="absolute h-3 w-px bg-white/50 transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
                    </span>
                  </summary>
                  <p className="max-w-xl pb-6 pr-10 text-sm leading-relaxed text-white/45">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-28 sm:px-8 sm:py-36">
          <Reveal>
            <p className="eyebrow text-white/35">Next intake</p>
            <h2 className="mt-7 max-w-3xl display text-[clamp(2.5rem,6vw,4.8rem)] text-white">
              The vehicles are already electric.
              <span className="text-white/30"> The technicians are not, yet.</span>
            </h2>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-accent-soft"
              >
                Create your account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-3 border border-white/20 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75 transition-colors hover:border-white/60 hover:text-white"
              >
                Compare programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
