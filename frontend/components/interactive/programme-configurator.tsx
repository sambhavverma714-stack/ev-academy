"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { cn, formatRupees } from "@/lib/utils";
import { PROGRAMMES } from "@/lib/catalogue";

/**
 * A vehicle-configurator pattern applied to training: pick programmes,
 * watch hours, modules and investment build up in the summary panel.
 */
export function ProgrammeConfigurator() {
  const [selected, setSelected] = useState<string[]>(["hv-safety", "battery-diagnostics"]);

  const summary = useMemo(() => {
    const chosen = PROGRAMMES.filter((p) => selected.includes(p.id));
    return {
      chosen,
      hours: chosen.reduce((total, p) => total + p.hours, 0),
      modules: chosen.reduce((total, p) => total + p.modules, 0),
      price: chosen.reduce((total, p) => total + p.price, 0),
      labs: chosen.length,
    };
  }, [selected]);

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  return (
    <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-[1.35fr_1fr]">
      <div className="bg-[#070a0e] p-6 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow text-white/35">Configure your pathway</p>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-[10px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-white"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {PROGRAMMES.map((programme) => {
            const isSelected = selected.includes(programme.id);
            return (
              <button
                key={programme.id}
                type="button"
                onClick={() => toggle(programme.id)}
                aria-pressed={isSelected}
                className="group flex w-full items-center gap-4 py-5 text-left"
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
                    isSelected
                      ? "border-accent bg-accent text-white"
                      : "border-white/20 text-transparent group-hover:border-white/40"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium transition-colors",
                      isSelected ? "text-white" : "text-white/55 group-hover:text-white/80"
                    )}
                  >
                    {programme.title}
                  </span>
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-white/30">
                    {programme.level} · {programme.hours} h · {programme.modules} modules
                  </span>
                </span>
                <span className="hidden text-sm tabular-nums text-white/45 sm:block">
                  {formatRupees(programme.price)}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[11px] leading-relaxed text-white/30">
          Every programme includes lab access, module assessments and a verifiable certificate.
          Fees are set by the academy and can be changed by an administrator.
        </p>
      </div>

      <div className="relative flex flex-col justify-between bg-[#05070a] p-6 sm:p-9">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px beam" />
        <div>
          <p className="eyebrow text-white/35">Your configuration</p>

          <div className="mt-8 flex items-end justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-white/30">Investment</p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={summary.price}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-2 text-4xl font-medium tracking-tight text-white tabular-nums"
                >
                  {formatRupees(summary.price)}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/30">
              {summary.chosen.length} selected
            </span>
          </div>

          <dl className="mt-6 space-y-4">
            {[
              ["Learning hours", summary.hours, "h"],
              ["Modules", summary.modules, ""],
              ["Lab programmes", summary.labs, ""],
            ].map(([label, value, unit]) => (
              <div key={label as string} className="flex items-baseline justify-between">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-white/35">{label}</dt>
                <dd className="font-mono text-lg text-white/85 tabular-nums">
                  {value as number}
                  {unit as string}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 space-y-2">
            {summary.chosen.length === 0 ? (
              <p className="border border-dashed border-white/15 px-3 py-4 text-center text-[11px] text-white/35">
                Select a programme to begin.
              </p>
            ) : (
              summary.chosen.map((programme) => (
                <div key={programme.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[11px] text-white/50">{programme.shortTitle}</span>
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] text-white/70 tabular-nums">
                    {formatRupees(programme.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(programme.id)}
                    aria-label={`Remove ${programme.title}`}
                    className="text-white/25 transition-colors hover:text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-10">
          <Link
            href={summary.chosen.length === 1 ? `/courses/${summary.chosen[0].id}` : "/courses"}
            className={cn(
              "group flex items-center justify-between border border-white/20 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:border-white/60",
              summary.chosen.length === 0 && "pointer-events-none opacity-40"
            )}
          >
            {summary.chosen.length === 1 ? "Open programme" : "View programmes"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/25">
            <Plus className="h-3 w-3" />
            Add or remove programmes at any time
          </p>
        </div>
      </div>
    </div>
  );
}
