"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { PROGRAMMES } from "@/lib/catalogue";

const NAV_LINKS = [
  { href: "/courses", label: "Programmes" },
  { href: "/about", label: "Academy" },
  { href: "/verify-certificate", label: "Verify" },
  { href: "/contact", label: "Contact" },
];

function Mark() {
  return (
    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden border border-white/15 bg-white/[0.03]">
      <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
        <path d="M18.5 3 7 18h6.2L12 29l12-16h-6.4L18.5 3Z" fill="currentColor" />
      </svg>
      <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-soft to-transparent" />
    </span>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [programmesOpen, setProgrammesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        setScrolled(y > 12);
        setProgress(height > 0 ? Math.min(1, y / height) : 0);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProgrammesOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openProgrammes = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setProgrammesOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setProgrammesOpen(false), 140);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent"
      )}
    >
      {/* reading progress — a thin instrument line, not a bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5">
        <div
          className="h-px bg-gradient-to-r from-accent to-accent-soft transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="EV Academy home">
          <Mark />
          <span className="leading-none">
            <span className="block text-[13px] font-semibold tracking-[0.26em] text-white">
              EV ACADEMY
            </span>
            <span className="mt-1 block text-[8.5px] tracking-[0.34em] text-white/40">
              HIGH-VOLTAGE INSTITUTE
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={openProgrammes}
            onMouseLeave={scheduleClose}
            onFocus={openProgrammes}
            onBlur={scheduleClose}
          >
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] transition-colors",
                isActive("/courses") ? "text-white" : "text-white/55 hover:text-white"
              )}
              aria-expanded={programmesOpen}
              aria-haspopup="true"
              onClick={() => setProgrammesOpen((v) => !v)}
            >
              Programmes
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform duration-300", programmesOpen && "rotate-180")}
              />
            </button>

            <AnimatePresence>
              {programmesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -left-6 top-full w-[420px] pt-6"
                >
                  <div className="border border-white/10 bg-[#080b10]/95 p-2 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] backdrop-blur-2xl">
                    <p className="px-4 pb-2 pt-3 text-[9px] uppercase tracking-[0.3em] text-white/35">
                      Five disciplines · Certified
                    </p>
                    {PROGRAMMES.map((p) => (
                      <Link
                        key={p.id}
                        href={`/courses/${p.id}`}
                        className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-white/[0.05]"
                      >
                        <span>
                          <span className="block text-sm font-medium text-white/85 group-hover:text-white">
                            {p.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] uppercase tracking-[0.18em] text-white/35">
                            {p.level} · {p.hours} h
                          </span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-soft" />
                      </Link>
                    ))}
                    <Link
                      href="/courses"
                      className="mt-1 flex items-center justify-between border-t border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/50 hover:text-white"
                    >
                      Full programme catalogue
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-active={isActive(link.href)}
              className={cn(
                "underline-sweep text-[11px] font-medium uppercase tracking-[0.22em] transition-colors",
                isActive(link.href) ? "text-white" : "text-white/55 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <Link
              href={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white sm:block"
            >
              My academy
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white sm:block"
            >
              Sign in
            </Link>
          )}

          <Link
            href="/register"
            className="group relative hidden items-center gap-2 overflow-hidden border border-white/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-white/60 sm:flex"
          >
            <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
            <span className="relative transition-colors duration-500 group-hover:text-ink">
              Enrol now
            </span>
            <ArrowUpRight className="relative h-3.5 w-3.5 transition-all duration-500 group-hover:text-ink" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink lg:hidden"
          >
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
                <Mark />
                <span className="text-[13px] font-semibold tracking-[0.26em]">EV ACADEMY</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/80"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-8">
              <p className="eyebrow mb-5 text-white/35">Programmes</p>
              <div className="mb-10 space-y-1">
                {PROGRAMMES.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4 }}
                  >
                    <Link
                      href={`/courses/${p.id}`}
                      className="flex items-baseline justify-between border-b border-white/8 py-4"
                    >
                      <span className="text-lg font-medium text-white/90">{p.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                        {p.level}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <p className="eyebrow mb-5 text-white/35">Academy</p>
              <div className="space-y-1">
                {NAV_LINKS.slice(1).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block border-b border-white/8 py-4 text-lg font-medium text-white/90"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-10 grid gap-3">
                <Link
                  href={user ? (user.role === "admin" ? "/admin/dashboard" : "/student/dashboard") : "/login"}
                  className="border border-white/20 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white"
                >
                  {user ? "My academy" : "Sign in"}
                </Link>
                <Link
                  href="/register"
                  className="bg-white py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-ink"
                >
                  Create account
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Static shell rendered before the route-aware navigation streams in. */
function NavbarShell() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="EV Academy home">
          <Mark />
          <span className="leading-none">
            <span className="block text-[13px] font-semibold tracking-[0.26em] text-white">
              EV ACADEMY
            </span>
            <span className="mt-1 block text-[8.5px] tracking-[0.34em] text-white/40">
              HIGH-VOLTAGE INSTITUTE
            </span>
          </span>
        </Link>
        <div className="h-10 w-24" />
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<NavbarShell />}>
      <NavbarContent />
    </Suspense>
  );
}
