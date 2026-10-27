"use client";
import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (
    message?: string,
    type?: ToastType,
  ) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message?: string, type: ToastType = "success") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const finalMessage =
        message ||
        (type === "success"
          ? "İşlem başarıyla gerçekleştirildi."
          : "İşlem sırasında bir hata oluştu.");

      setToasts((prev) => [...prev, { id, type, message: finalMessage }]);

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (message?: string) => showToast(message, "success"),
    [showToast],
  );

  const showError = useCallback(
    (message?: string) => showToast(message, "error"),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      {/* Sağ üst / Mobil üst sabit bildirim alanı */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
              t.type === "success"
                ? "bg-emerald-950/95 text-emerald-100 border-emerald-700/80"
                : "bg-rose-950/95 text-rose-100 border-rose-700/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-400 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Bildirimi kapat"
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
