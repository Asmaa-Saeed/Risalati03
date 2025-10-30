"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Track } from "@/lib/tracks";

interface DeleteTrackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  track?: Track | null;
  loading?: boolean;
}

export default function DeleteTrackConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  track,
  loading = false
}: DeleteTrackConfirmModalProps) {
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
    if (!track) return;

    try {
      await onConfirm();
    } catch (error) {
      // Error handling is now done in the management component
      console.error("Delete track error:", error);
    } finally {
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
              <h3 className="text-lg font-semibold text-gray-900">حذف المسار</h3>
              <p className="text-sm text-gray-600">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              هل أنت متأكد من أنك تريد حذف المسار التالي؟
            </p>
          </div>

          {/* Track Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-1">معلومات المسار:</div>
              <div className="text-gray-700">{track?.name}</div>
              <div className="text-gray-500 text-xs mt-1">الرقم التعريفي: {track?.id}</div>
              <div className="text-gray-500 text-xs mt-1">الدرجة العلمية: {track?.degree.name}</div>
              <div className="text-gray-500 text-xs mt-1">القسم: {track?.departmentName}</div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <strong>تحذير:</strong> سيتم حذف المسار وجميع البيانات المرتبطة به نهائياً.
                تأكد من عدم وجود طلاب أو مواد دراسية مرتبطة بهذا المسار قبل الحذف.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              disabled={loading}
            >
              إلغاء
            </button>
           <button
  onClick={handleConfirm}
  disabled={loading}
  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
>
  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
  {loading ? "جاري الحذف..." : "حذف المسار"}
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
