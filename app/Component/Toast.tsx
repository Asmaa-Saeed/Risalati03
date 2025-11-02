"use client";

import { useEffect, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";
// Only support top-center position to match the design

interface ToastProps {
  show: boolean;
  type?: ToastType;
  message: string;
  duration?: number; // ms
  onClose: () => void;
}

const typeStyles = {
  success: {
    bgColor: "bg-[#10b981]",
    textColor: "text-white",
    icon: <CheckCircle2 size={20} className="text-white" />,
  },
  error: {
    bgColor: "bg-[#ef4444]", // Slightly darker red
    textColor: "text-white",
    icon: <AlertTriangle size={20} />,
  },
  info: {
    bgColor: "bg-[#3b82f6]", // Standard blue
    textColor: "text-white",
    icon: <Info size={20} />,
  },
  warning: {
    bgColor: "bg-[#eab308]", // Standard yellow
    textColor: "text-white",
    icon: <AlertTriangle size={20} />,
  },
} as const;

export default function Toast({ show, type = "info", message, duration = 3000, onClose }: ToastProps) {
  // Debug log the incoming props
  console.log('Toast props:', { show, type, message });
  
  // Ensure type is one of the valid types, default to 'info' if invalid
  const toastType: ToastType = (['success', 'error', 'info', 'warning'].includes(type) 
    ? type as ToastType 
    : 'info');
    
  console.log('Resolved toastType:', toastType);
  
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [show, duration, onClose]);

  const style = typeStyles[toastType];
  const base = "fixed z-[1000] transition-all duration-300 transform";
  const posCls = "top-6 left-1/2 -translate-x-1/2";
  const visibility = show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none";

  // Debug: Log the final style object
  console.log('Final style object:', style);

  // Define colors for each type
  const getBackgroundColor = () => {
    switch(toastType) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      case 'warning': return '#eab308';
      default: return '#3b82f6';
    }
  };

  return (
    <div className={`${base} ${posCls} ${visibility}`}>
      <div 
        className="flex items-center gap-3 rounded-md px-4 py-3 shadow-lg min-w-[300px] max-w-[90vw] text-white"
        style={{
          animation: show ? 'toast-enter 0.3s ease-out' : 'toast-exit 0.3s ease-in forwards',
          direction: 'rtl',
          fontFamily: 'inherit',
          borderRadius: '0.375rem',
          backgroundColor: getBackgroundColor(),
        }}
      >
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="text-sm font-medium flex-1 text-right">{message}</div>
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={18} className={style.textColor} />
        </button>
      </div>
      <style jsx global>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
