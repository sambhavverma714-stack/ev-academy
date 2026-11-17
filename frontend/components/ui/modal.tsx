import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-lg border border-silver/10 bg-charcoal shadow-premium animate-in zoom-in-95 slide-in-from-bottom-4",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-silver/10">
          <div>
            {title && <h2 className="font-manrope text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-grey mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-grey hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}