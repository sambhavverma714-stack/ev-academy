import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Programmes",
    links: [
      { label: "High-Voltage Safety", href: "/courses/hv-safety" },
      { label: "Battery Diagnostics", href: "/courses/battery-diagnostics" },
      { label: "Charging Systems", href: "/courses/charging-systems" },
      { label: "Motor & Inverter", href: "/courses/motor-inverter" },
      { label: "HV Wiring & Repair", href: "/courses/hv-wiring-repair" },
    ],
  },
  {
    title: "Academy",
    links: [
      { label: "About", href: "/about" },
      { label: "Course catalogue", href: "/courses" },
      { label: "Verify a certificate", href: "/verify-certificate" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
      { label: "Student dashboard", href: "/student/dashboard" },
      { label: "Lab bookings", href: "/student/bookings" },
      { label: "My certificates", href: "/student/certificates" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#04060a]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px beam opacity-60" />
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-white/15 bg-white/[0.03]">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" aria-hidden="true">
                  <path d="M18.5 3 7 18h6.2L12 29l12-16h-6.4L18.5 3Z" fill="currentColor" />
                </svg>
              </span>
              <span className="leading-none">
                <span className="block text-[13px] font-semibold tracking-[0.26em] text-white">
                  EV ACADEMY
                </span>
                <span className="mt-1 block text-[8.5px] tracking-[0.34em] text-white/40">
                  HIGH-VOLTAGE INSTITUTE
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/45">
              A specialist training school for the people who keep electric vehicles on the road.
              High-voltage safety, diagnostics and drive systems — taught in a working lab.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Next.js", "Express.js", "MongoDB"].map((tech) => (
                <span
                  key={tech}
                  className="border border-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.22em] text-white/35"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="eyebrow mb-5 text-white/35">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            © EV Academy · All rights reserved
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70">
              Terms
            </Link>
            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white"
            >
              Certificate registry
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
