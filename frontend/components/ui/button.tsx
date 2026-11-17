import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "bg-accent text-white hover:bg-accent/85",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-white/20 text-white hover:border-white/50 hover:bg-white/5",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white",
  link: "text-accent-soft underline-offset-4 hover:underline",
  premium:
    "bg-white text-ink hover:bg-accent-soft shadow-[0_0_30px_rgba(47,107,255,0.25)]",
} as const;

const SIZES = {
  default: "h-11 px-5 py-2",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-8 text-base",
  xl: "h-14 px-10 text-lg",
  icon: "h-10 w-10",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
