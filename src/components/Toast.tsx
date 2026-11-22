import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[400px] px-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyle =
    toast.type === "success"
      ? "bg-[#176b48] text-white"
      : toast.type === "error"
      ? "bg-[#d32f2f] text-white"
      : "bg-[#202c24] text-white";

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${bgStyle}`}
    >
      <div className="flex items-center gap-2.5 text-sm font-medium">
        {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-[#c8ed83] shrink-0" />}
        {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />}
        {toast.type === "info" && <Info className="w-5 h-5 text-emerald-200 shrink-0" />}
        <span className="leading-snug">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/70 hover:text-white p-1 rounded-full transition-colors shrink-0"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
