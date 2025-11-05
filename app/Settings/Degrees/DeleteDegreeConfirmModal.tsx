"use client";

import { useState, useEffect } from "react";
import { X, Trash2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Degree } from "@/lib/degrees";

interface DeleteDegreeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<{ success: boolean; message?: string }>;
  degree: Degree | null;
  loading?: boolean;
  onSuccess?: () => void;
}

export default function DeleteDegreeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  degree,
  loading = false,
  onSuccess,
}: DeleteDegreeConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !degree) return null;

  const handleConfirm = async () => {
    if (!degree) return;

    try {
      const result = await onConfirm(degree.id);

      if (result.success) {
        // Show success toast with consistent styling
        toast.success(result.message || "تم حذف الدرجة العلمية بنجاح", {
          duration: 3000,
          position: 'top-center',
          style: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            padding: '16px',
            color: '#065f46',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '✅',
        });
        onSuccess?.();
        onClose();
      } else {
        // Handle API error response (non-200 status)
        const errorMessage = result.message || "حدث خطأ أثناء حذف الدرجة العلمية";
        
        if (errorMessage.includes('500') || 
            errorMessage.includes('related') || 
            errorMessage.includes('مرتبط') ||
            errorMessage.includes('cannot be deleted')) {
          toast.error('لا يمكن حذف هذه الدرجة العلمية لأنها مرتبطة ببيانات أخرى في النظام. يرجى التأكد من عدم وجود طلاب أو مواد دراسية مرتبطة بهذه الدرجة أولاً.', {
            duration: 5000,
            position: 'top-center',
            style: {
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '16px',
              color: '#991b1b',
              fontFamily: 'Tajawal, sans-serif',
              textAlign: 'right',
              direction: 'rtl',
              maxWidth: '500px',
              margin: '0 auto'
            },
            icon: '⚠️',
          });
        } else {
          toast.error(errorMessage, {
            duration: 4000,
            position: 'top-center',
            style: {
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '16px',
              color: '#991b1b',
              fontFamily: 'Tajawal, sans-serif',
              textAlign: 'right',
              direction: 'rtl',
              maxWidth: '500px',
              margin: '0 auto'
            },
            icon: '❌',
          });
        }
      }
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      
      // Handle network/CORS errors
      if (errorMessage.includes('Failed to fetch') || 
           errorMessage.includes('NetworkError') || 
           errorMessage.includes('CORS')) {
        toast.error('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الشبكة والمحاولة مرة أخرى.', {
          duration: 5000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '🔌',
        });
      } 
      // Handle 404 - Not Found
      else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        toast.error('لم يتم العثور على الدرجة العلمية المحددة. قد تكون قد حُذفت مسبقاً.', {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '🔍',
        });
      }
      // Handle 403/401 - Unauthorized/Forbidden
      else if (errorMessage.includes('403') || 
               errorMessage.includes('401') || 
               errorMessage.includes('Unauthorized') || 
               errorMessage.includes('Forbidden')) {
        toast.error('ليس لديك صلاحية حذف هذه الدرجة العلمية. يرجى مراجعة المسؤول.', {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '🚫',
        });
      }
      // Handle 500 errors
      else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        toast.error('لا يمكن حذف هذه الدرجة العلمية لأنها مرتبطة ببيانات أخرى في النظام. يرجى التأكد من عدم وجود طلاب أو مواد دراسية مرتبطة بهذه الدرجة أولاً.', {
          duration: 5000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '⚠️',
        });
      }
      // For other errors, show the error message
      else {
        toast.error(`حدث خطأ: ${errorMessage}`, {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl',
            maxWidth: '500px',
            margin: '0 auto'
          },
          icon: '❌',
        });
      }
      
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`bg-white rounded-xl shadow-xl max-w-md w-full relative z-10 transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">تأكيد الحذف</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-right mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              هل أنت متأكد من حذف هذه الدرجة العلمية؟
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">اسم الدرجة:</span> {degree.name}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-0.5" size={20} />
              <div className="text-red-800">
                <p className="font-medium mb-1">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                <p className="text-sm">سيتم حذف جميع البيانات المتعلقة بهذه الدرجة العلمية نهائياً، بما في ذلك:</p>
                <ul className="text-sm mt-2 space-y-1 mr-4">
                  <li>• بيانات الدرجة العلمية الأساسية</li>
                  <li>• معلومات القسم والتخصص</li>
                  <li>• سجلات الطلاب المسجلين</li>
                  <li>• المتطلبات والمقررات المرتبطة</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              {loading ? "جاري الحذف..." : "حذف الدرجة العلمية"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}