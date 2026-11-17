"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NODES = [
  {
    id: "pack",
    label: "Battery pack",
    value: "398",
    unit: "V nominal",
    note: "96S Li-ion · thermal management",
    x: 78,
    y: 158,
  },
  {
    id: "inverter",
    label: "Inverter",
    value: "650",
    unit: "V DC bus",
    note: "IGBT switching · phase current",
    x: 232,
    y: 158,
  },
  {
    id: "motor",
    label: "Drive motor",
    value: "12,000",
    unit: "rpm max",
    note: "PMSM · resolver feedback",
    x: 352,
    y: 158,
  },
  {
    id: "charger",
    label: "Onboard charger",
    value: "11",
    unit: "kW AC",
    note: "AC/DC conversion · pilot signal",
    x: 78,
    y: 66,
  },
  {
    id: "isolation",
    label: "Isolation monitor",
    value: "500",
    unit: "Ω/V minimum",
    note: "Insulation resistance · IMD",
    x: 232,
    y: 250,
  },
];

const HEADLINE = ["Engineered", "for the", "electric era."];

export function Hero() {
  const [active, setActive] = useState(NODES[0]);
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  const reduce = useReducedMotion();

  return (
    <section
      className="relative isolate overflow-hidden pt-20"
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-lines opacity-[0.55]" />
        <div
          className="absolute inset-0 transition-[background] duration-500"
          style={{
            background: `radial-gradient(680px circle at ${pointer.x}% ${pointer.y}%, rgba(47,107,255,0.16), transparent 62%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink to-transparent" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4"
          >
            <span className="flex items-center gap-2 border border-white/12 bg-white/[0.03] px-3 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-soft opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-soft" />
              </span>
              <span className="eyebrow text-white/65">High-voltage institute</span>
            </span>
            <span className="eyebrow text-white/30">Est. for the EV era</span>
          </motion.div>

          <h1 className="mt-8 display text-[clamp(2.9rem,7.2vw,5.6rem)] text-white">
            {HEADLINE.map((line, index) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 1.05,
                    delay: 0.12 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {index === 2 ? (
                    <>
                      <span className="text-outline">electric</span> era
                      <span className="text-accent">.</span>
                    </>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg"
          >
            Five disciplines. One standard. Learn to isolate, diagnose and repair electric
            vehicles in a working high-voltage lab — then prove it with a certificate employers
            can verify in seconds.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62 }}
            className="mt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden bg-white px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink"
              >
                <span className="absolute inset-0 -translate-x-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
                <span className="relative transition-colors duration-500 group-hover:text-white">
                  Create your account
                </span>
                <ArrowRight className="relative h-4 w-4 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white" />
              </Link>
              <Link
                href="/verify-certificate"
                className="inline-flex items-center justify-center gap-3 border border-white/20 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75 transition-colors hover:border-white/50 hover:text-white"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify a certificate
              </Link>
            </div>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45 transition-colors hover:text-white"
            >
              Explore the range
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.dl
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-14 grid max-w-xl grid-cols-3 border-t border-white/10 pt-6"
          >
            {[
              { term: "Programmes", detail: "5 certified" },
              { term: "Lab capacity", detail: "Small groups" },
              { term: "Assessment", detail: "80% to pass" },
            ].map((item) => (
              <div key={item.term}>
                <dt className="text-[9px] uppercase tracking-[0.24em] text-white/35">{item.term}</dt>
                <dd className="mt-2 text-sm font-medium text-white/80">{item.detail}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Interactive HV system map */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-px bg-gradient-to-b from-white/15 via-white/5 to-transparent cut-corner" />
          <div className="relative cut-corner border border-white/10 bg-[#080b10]/80 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-white/40">HV system map</p>
              <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.24em] text-accent-soft">
                <span className="h-1 w-1 animate-pulse rounded-full bg-accent-soft" />
                Training schematic
              </span>
            </div>

            <div className="relative mt-5 overflow-hidden border border-white/8 bg-black/30">
              <div className="absolute inset-0 grid-lines opacity-40" />
              <svg viewBox="0 0 430 300" className="relative w-full" role="img" aria-label="Electric vehicle high-voltage system schematic">
                <defs>
                  <linearGradient id="hv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2F6BFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8FB4FF" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                {/* HV bus lines */}
                <path d="M120 158 H206" stroke="url(#hv)" strokeWidth="2" fill="none" />
                <path d="M258 158 H326" stroke="url(#hv)" strokeWidth="2" fill="none" />
                <path d="M92 96 V132" stroke="#2F6BFF" strokeOpacity="0.5" strokeWidth="1.5" />
                <path d="M92 184 V236 H206" stroke="#2F6BFF" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Battery */}
                <g
                  className={cn(
                    "cursor-pointer transition-all duration-300",
                    active.id === "pack" ? "opacity-100" : "opacity-60"
                  )}
                >
                  <rect x="26" y="126" width="94" height="64" fill="none" stroke={active.id === "pack" ? "#8FB4FF" : "#3b4552"} />
                  {[0, 1, 2].map((row) =>
                    [0, 1, 2, 3].map((col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={34 + col * 21}
                        y={134 + row * 18}
                        width="15"
                        height="12"
                        fill={active.id === "pack" ? "rgba(47,107,255,0.35)" : "#1a2129"}
                        stroke="#2b3540"
                        strokeWidth="0.6"
                      />
                    ))
                  )}
                  <text x="26" y="212" fill="#6b7684" fontSize="8" letterSpacing="2">HV PACK</text>
                </g>

                {/* Inverter */}
                <g className={cn("transition-opacity duration-300", active.id === "inverter" ? "opacity-100" : "opacity-60")}>
                  <rect x="206" y="136" width="52" height="44" fill="none" stroke={active.id === "inverter" ? "#8FB4FF" : "#3b4552"} />
                  <path d="M216 166 l8 -16 l6 22 l8 -16" fill="none" stroke={active.id === "inverter" ? "#8FB4FF" : "#4b5663"} strokeWidth="1.4" />
                  <text x="206" y="200" fill="#6b7684" fontSize="8" letterSpacing="2">INVERTER</text>
                </g>

                {/* Motor */}
                <g className={cn("transition-opacity duration-300", active.id === "motor" ? "opacity-100" : "opacity-60")}>
                  <circle cx="360" cy="158" r="30" fill="none" stroke={active.id === "motor" ? "#8FB4FF" : "#3b4552"} />
                  <circle cx="360" cy="158" r="12" fill="none" stroke={active.id === "motor" ? "#8FB4FF" : "#4b5663"} strokeDasharray="2 3" />
                  <path d="M360 128 V140 M360 176 V188 M330 158 H342 M378 158 H390" stroke="#2b3540" strokeWidth="1.2" />
                  <text x="336" y="212" fill="#6b7684" fontSize="8" letterSpacing="2">MOTOR</text>
                </g>

                {/* Charger inlet */}
                <g className={cn("transition-opacity duration-300", active.id === "charger" ? "opacity-100" : "opacity-60")}>
                  <rect x="74" y="56" width="36" height="40" rx="3" fill="none" stroke={active.id === "charger" ? "#8FB4FF" : "#3b4552"} />
                  <circle cx="86" cy="68" r="3" fill="#2b3540" />
                  <circle cx="98" cy="68" r="3" fill="#2b3540" />
                  <circle cx="92" cy="82" r="3" fill="#2b3540" />
                  <text x="66" y="44" fill="#6b7684" fontSize="8" letterSpacing="2">AC INLET</text>
                </g>

                {/* Isolation monitor */}
                <g className={cn("transition-opacity duration-300", active.id === "isolation" ? "opacity-100" : "opacity-60")}>
                  <rect x="206" y="236" width="44" height="26" fill="none" stroke={active.id === "isolation" ? "#8FB4FF" : "#3b4552"} />
                  <path d="M214 249 h8 l4 -8 l6 16 l4 -8 h8" fill="none" stroke={active.id === "isolation" ? "#8FB4FF" : "#4b5663"} strokeWidth="1.2" />
                  <text x="258" y="253" fill="#6b7684" fontSize="8" letterSpacing="2">IMD</text>
                </g>
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setActive(node)}
                  onFocus={() => setActive(node)}
                  onClick={() => setActive(node)}
                  aria-pressed={active.id === node.id}
                  className={cn(
                    "border px-2 py-2 text-left text-[9px] uppercase tracking-[0.14em] transition-colors",
                    active.id === node.id
                      ? "border-accent/60 bg-accent/10 text-white"
                      : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
                  )}
                >
                  {node.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.24em] text-white/35">{active.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={active.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="font-mono text-3xl tracking-tight text-white"
                    >
                      {active.value}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {active.unit}
                  </span>
                </div>
              </div>
              <p className="max-w-[52%] text-right text-[10px] leading-relaxed text-white/35">
                {active.note}
              </p>
            </div>
          </div>

          <Link
            href="/courses"
            className="mt-4 flex items-center justify-between border border-white/10 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-white/45 transition-colors hover:border-accent/50 hover:text-white"
          >
            Every system above is a taught module
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
