"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

import { University } from "@/lib/universities";

interface DeleteUniversityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<{ success: boolean; message?: string; data?: any }>; // الدالة اللي هتحذف الجامعة
  university?: University | null; // تمرير object الجامعة بالكامل
  loading?: boolean;
  onSuccess?: () => void; // callback لتحديث القائمة بعد الحذف
}

export default function DeleteUniversityConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  university,
  loading = false,
  onSuccess
}: DeleteUniversityConfirmModalProps) {
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
    if (!university) return;

    try {
      const result = await onConfirm(university.id);

      if (result.success) {
        // Show success toast matching the add/edit style
        toast.success(result.message || "تم حذف الجامعة بنجاح 🎉");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "حدث خطأ أثناء حذف الجامعة");
      }
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(errorMessage);
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
              <h3 className="text-lg font-semibold text-gray-900">حذف الجامعة</h3>
              <p className="text-sm text-gray-600">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              هل أنت متأكد من أنك تريد حذف الجامعة التالية؟
            </p>
          </div>

          {/* University Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">معلومات الجامعة:</div>
              <div className="text-gray-700">{university?.name}</div>
              {/* <div className="text-gray-500 text-xs mt-1">الرقم التعريفي: {university?.id}</div> */}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <strong>تحذير:</strong> سيتم حذف الجامعة وجميع البيانات المرتبطة بها نهائياً.
                تأكد من عدم وجود كليات أو درجات علمية مرتبطة بهذه الجامعة قبل الحذف.
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
  {loading ? "جاري الحذف..." : "حذف الجامعة"}
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
