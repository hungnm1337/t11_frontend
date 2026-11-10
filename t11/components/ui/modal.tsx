"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  bodyClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
  className,
  bodyClassName,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 m-2 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 w-[80vw] rounded-lg border border-border bg-surface shadow-xl transition-all",
          "animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/80" style={{ padding: "16px 32px" }}>
          <div className="space-y-1 pr-6">
            <h2
              id="modal-title"
              className="text-base font-semibold text-text-primary leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-text-secondary leading-normal">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
            aria-label="Đóng hộp thoại"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div
          className="max-h-[calc(85vh-130px)] overflow-y-auto"
        >
          <div
            className={cn(bodyClassName)}
            style={{ padding: "24px 32px" }}
          >
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border/80 bg-surface-muted/30 rounded-b-lg" style={{ padding: "16px 32px" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

