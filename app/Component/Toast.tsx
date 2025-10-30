"use client";

import { useEffect, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";
export type ToastPosition = "top-right" | "top-center" | "bottom-center";

interface ToastProps {
  show: boolean;
  type?: ToastType;
  message: string;
  duration?: number; // ms
  onClose: () => void;
  position?: ToastPosition;
}

const typeStyles: Record<ToastType, { container: string; icon: ReactNode }> = {
  success: {
    container: "bg-green-50 text-green-800 border-green-200",
    icon: <CheckCircle2 className="text-green-600" size={20} />,
  },
  error: {
    container: "bg-red-50 text-red-800 border-red-200",
    icon: <AlertTriangle className="text-red-600" size={20} />,
  },
  info: {
    container: "bg-blue-50 text-blue-800 border-blue-200",
    icon: <Info className="text-blue-600" size={20} />,
  },
  warning: {
    container: "bg-yellow-50 text-yellow-800 border-yellow-200",
    icon: <AlertTriangle className="text-yellow-600" size={20} />,
  },
};

export default function Toast({ show, type = "info", message, duration = 3000, onClose, position = "top-right" }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [show, duration, onClose]);

  const style = typeStyles[type];

  // Positioning classes
  const base = "fixed z-[1000] transition-all duration-300 transform";
  const posCls =
    position === "top-right"
      ? "top-6 right-6"
      : position === "top-center"
      ? "top-6 left-1/2 -translate-x-1/2"
      : "bottom-6 left-1/2 -translate-x-1/2"; // bottom-center

  const visibility = show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none";

  return (
    <div className={`${base} ${posCls} ${visibility}`}>
      <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${style.container} w-[360px] max-w-[90vw]`}>
        <div className="mt-0.5">{style.icon}</div>
        <div className="flex-1 text-sm leading-6">{message}</div>
        <button
          onClick={onClose}
          aria-label="Close toast"
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
