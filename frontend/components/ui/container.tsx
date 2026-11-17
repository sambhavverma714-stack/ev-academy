import { cn } from "@/lib/utils";

const SIZES = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-none",
} as const;

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof SIZES;
}

export function Container({ className, size = "lg", ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", SIZES[size], className)} {...props} />;
}
