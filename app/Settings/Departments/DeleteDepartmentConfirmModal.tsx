"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Department } from "@/lib/departments";

interface DeleteDepartmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  department?: Department | null; // تمرير object القسم بالكامل
  loading?: boolean;
}

export default function DeleteDepartmentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  department,
  loading = false
}: DeleteDepartmentConfirmModalProps) {
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

  const handleConfirm = async () => {
    if (!department) return;

    try {
      await onConfirm();
    } catch (error: any) {
      const errorMessage = error?.message || 'حدث خطأ غير متوقع';
      
      // Handle specific error cases
      if (errorMessage.includes('500') || 
          errorMessage.includes('related') || 
          errorMessage.includes('مرتبط') ||
          errorMessage.includes('cannot be deleted')) {
        toast.error('لا يمكن حذف هذا القسم لأنه مرتبط ببيانات أخرى في النظام. يرجى التأكد من عدم وجود أقسام فرعية أو شعب أو طلاب مرتبطين بهذا القسم أولاً.', {
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
      // Handle network/CORS errors
      else if (errorMessage.includes('Failed to fetch') || 
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
            direction: 'rtl'
          },
          icon: '🔌',
        });
      }
      // Handle 404 - Not Found
      else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        toast.error('لم يتم العثور على القسم المحدد. قد يكون قد تم حذفه مسبقاً.', {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl'
          },
          icon: '🔍',
        });
      }
      // Handle 403/401 - Unauthorized/Forbidden
      else if (errorMessage.includes('403') || 
               errorMessage.includes('401') || 
               errorMessage.includes('Unauthorized') || 
               errorMessage.includes('Forbidden')) {
        toast.error('ليس لديك صلاحية حذف هذا القسم. يرجى مراجعة المسؤول.', {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl'
          },
          icon: '🚫',
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
            direction: 'rtl'
          },
          icon: '❌',
        });
      }
      
      // Close the modal after showing the error
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}></div>

      {/* Modal Content */}
      <div className={`bg-white rounded-xl shadow-xl max-w-md w-full relative z-10 transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تأكيد الحذف</h2>
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">حذف القسم</h3>
              <p className="text-sm text-gray-600">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-red-800 text-sm mb-2">
              هل أنت متأكد من أنك تريد حذف القسم التالي؟
            </p>

            {/* Department Info - Simplified */}
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">{department?.name}</div>
              {/* <div className="text-gray-500 text-xs">الرقم التعريفي: {department?.id}</div> */}
              {/* <div className="text-gray-500 text-xs">عدد الطلاب: {department?.totalStudents}</div> */}
            </div>
          </div>

          {/* Warning - Simplified */}
          <div className="mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <strong>تحذير:</strong> سيتم حذف القسم وجميع البيانات المرتبطة به نهائياً.
                تأكد من عدم وجود طلاب أو مواد دراسية مرتبطة بهذا القسم قبل الحذف.
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
  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
  {loading ? "جاري الحذف..." : "حذف القسم"}
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
