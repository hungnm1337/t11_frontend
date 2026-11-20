"use client";

import * as React from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

export const API_TOAST_EVENT = "t11-api-toast";

let lastToastKey: string | null = null;

export function showApiToast(
  type: ToastType,
  title: string,
  message: string
) {
  const key = JSON.stringify({ type, title, message });
  if (lastToastKey === key) {
    return;
  }
  lastToastKey = key;
  window.setTimeout(() => {
    lastToastKey = null;
  }, 300);

  window.dispatchEvent(
    new CustomEvent<Omit<ToastMessage, "id">>(API_TOAST_EVENT, {
      detail: { type, title, message },
    })
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<Omit<ToastMessage, "id">>).detail;
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, ...detail }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4000);
    };

    window.addEventListener(API_TOAST_EVENT, handleToast);
    return () => window.removeEventListener(API_TOAST_EVENT, handleToast);
  }, []);

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg"
          role={toast.type === "error" ? "alert" : "status"}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-primary">
              {toast.title}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            className="text-text-muted hover:text-text-primary"
            aria-label="Đóng thông báo"
            onClick={() =>
              setToasts((current) =>
                current.filter((item) => item.id !== toast.id)
              )
            }
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
