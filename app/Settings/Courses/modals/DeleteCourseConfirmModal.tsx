"use client";

import { X, Trash2, AlertTriangle } from "lucide-react";
import { Course } from "@/lib/courses";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  course: Course | null;
  loading?: boolean;
}

export default function DeleteCourseConfirmModal({ isOpen, onClose, onConfirm, course, loading = false }: Props) {
  if (!isOpen || !course) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-lg w-full border border-teal-200/50">
        <div className="flex items-center justify-between p-6 border-b border-teal-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-teal-300">
              <AlertTriangle className="text-teal-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-teal-900">تأكيد الحذف</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="text-right mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">هل أنت متأكد من حذف هذا المقرر؟</h3>
            <div className="bg-gradient-to-r from-gray-50 to-teal-50 p-5 rounded-xl border-2 border-teal-200/50 shadow-inner">
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <p><span className="font-bold text-teal-800">الكود:</span> <span className="text-gray-900 font-medium">{course.code}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                  <p><span className="font-bold text-teal-800">الاسم:</span> <span className="text-gray-900 font-medium">{course.name}</span></p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-200 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-teal-700" size={20} />
              </div>
              <div className="text-teal-900">
                <p className="font-bold mb-2 text-lg">تحذير: إجراء خطير!</p>
                <p className="text-sm leading-relaxed">سيتم حذف البيانات نهائياً من النظام ولن يمكن التراجع عن هذا الإجراء</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-teal-200/50 bg-teal-50/30 rounded-b-2xl p-6">
            <button onClick={onClose} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={loading}>إلغاء</button>
            <button onClick={handleConfirm} disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800">
              <Trash2 size={20} />
              {loading ? "جاري الحذف..." : "حذف"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
