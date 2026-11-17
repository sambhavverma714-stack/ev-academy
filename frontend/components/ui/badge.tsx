import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "border-transparent bg-accent/15 text-accent-soft",
  secondary: "border-transparent bg-white/10 text-white/60",
  destructive: "border-transparent bg-red-600/15 text-red-400",
  outline: "border-white/20 text-white/70",
  success: "border-transparent bg-green-600/15 text-green-400",
  warning: "border-transparent bg-amber-600/15 text-amber-400",
  info: "border-transparent bg-accent/15 text-accent-soft",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANTS;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
