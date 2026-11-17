import { cn } from "@/lib/utils";

const LEVELS: Record<string, string> = {
  Foundation: "border-accent/30 bg-accent/10 text-accent-soft",
  Intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Advanced: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export interface LevelBadgeProps {
  level: string;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        LEVELS[level] || LEVELS.Foundation,
        className
      )}
    >
      {level}
    </span>
  );
}
