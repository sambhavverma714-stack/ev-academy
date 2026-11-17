"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SYSTEMS = [
  {
    id: "01",
    name: "Battery",
    headline: "Energy storage, decoded",
    copy: "Pack architecture, cell chemistry, thermal behaviour and the Battery Management System. Learn how a pack fails before it fails.",
    specs: [
      ["Cells", "Series / parallel"],
      ["Focus", "SOH & insulation"],
      ["Lab", "Battery station"],
    ],
    bullets: [
      "Pack architecture and cell chemistry",
      "BMS sensing, balancing and protection",
      "Insulation resistance and state of health",
      "Thermal events: prevention and response",
    ],
  },
  {
    id: "02",
    name: "Drive",
    headline: "Torque under control",
    copy: "Traction motors, inverters and resolvers. Follow the signal from the resolver to the phase cable and isolate the real fault.",
    specs: [
      ["Motor", "PMSM"],
      ["Switching", "IGBT / SiC"],
      ["Focus", "Fault isolation"],
    ],
    bullets: [
      "Traction motor construction and operation",
      "Inverter switching and DC bus behaviour",
      "Resolver and rotor position signals",
      "Structured diagnosis of drive DTCs",
    ],
  },
  {
    id: "03",
    name: "Charging",
    headline: "The conversation with the grid",
    copy: "AC and DC charging, pilot signals and the onboard charger. Understand the handshake that decides whether a vehicle charges at all.",
    specs: [
      ["AC", "7–22 kW"],
      ["DC", "CCS / CHAdeMO"],
      ["Focus", "Handshake faults"],
    ],
    bullets: [
      "AC charging equipment and pilot signals",
      "DC fast charging sequence",
      "Onboard charger operation and faults",
      "Safe diagnosis of charging complaints",
    ],
  },
  {
    id: "04",
    name: "Safety",
    headline: "The discipline that comes first",
    copy: "Isolation, PPE, lockout and emergency response. The non-negotiable foundation for every other module in the academy.",
    specs: [
      ["Standard", "HV safe work"],
      ["PPE", "Class 0 / 00"],
      ["Focus", "Live work refusal"],
    ],
    bullets: [
      "Hazards of AC and DC high voltage",
      "Correct PPE selection and inspection",
      "Five-step isolation and verification",
      "Emergency response to a damaged EV",
    ],
  },
];

export function SystemExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = SYSTEMS[activeIndex];

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <div>
        <p className="eyebrow text-white/35">Inside the vehicle</p>
        <h2 className="mt-5 display text-4xl text-white sm:text-5xl">
          Four systems.
          <br />
          <span className="text-white/35">One method.</span>
        </h2>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/50">
          Every programme maps to a physical system on the vehicle. Select a discipline to see
          what you will learn to test, measure and repair.
        </p>

        <div className="mt-10 border-t border-white/10">
          {SYSTEMS.map((system, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={system.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
                className={cn(
                  "group relative flex w-full items-center justify-between gap-4 border-b border-white/10 py-5 text-left transition-colors",
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                )}
              >
                <span className="flex items-baseline gap-5">
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-widest transition-colors",
                      isActive ? "text-accent-soft" : "text-white/25"
                    )}
                  >
                    {system.id}
                  </span>
                  <span className="text-xl font-medium tracking-tight sm:text-2xl">{system.name}</span>
                </span>
                <span
                  className={cn(
                    "h-px transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive ? "w-16 bg-accent" : "w-6 bg-white/20 group-hover:w-10"
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -left-10 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full border border-white/5 lg:block" />
        <div className="pointer-events-none absolute -left-4 top-1/2 hidden h-40 w-40 -translate-y-1/2 rounded-full border border-accent/10 lg:block" />

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative border border-white/10 bg-white/[0.02] p-7 sm:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="eyebrow text-accent-soft">{active.name}</p>
                <h3 className="mt-4 display text-3xl text-white sm:text-4xl">{active.headline}</h3>
              </div>
              <span className="font-mono text-5xl text-white/10">{active.id}</span>
            </div>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/55">{active.copy}</p>

            <ul className="mt-8 grid gap-3 border-t border-white/10 pt-6">
              {active.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm text-white/65">
                  <span className="mt-[7px] h-1 w-1 shrink-0 bg-accent-soft" />
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {active.specs.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">{label}</p>
                  <p className="mt-1.5 text-xs font-medium text-white/75">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
