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
        // Show success toast matching the add/edit style
        toast.success(result.message || "تم حذف الدرجة العلمية بنجاح ");
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || "حدث خطأ أثناء حذف الدرجة العلمية");
      }
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(errorMessage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
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