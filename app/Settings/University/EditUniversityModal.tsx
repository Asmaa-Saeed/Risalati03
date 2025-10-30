"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { University, UpdateUniversityData } from "@/lib/universities";

const universitySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "اسم الجامعة مطلوب").min(2, "اسم الجامعة يجب أن يكون حرفين على الأقل"),
});

interface EditUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUniversityData) => Promise<void>;
  university: University | null;
  loading?: boolean;
}

export default function EditUniversityModal({ isOpen, onClose, onSubmit, university, loading = false }: EditUniversityModalProps) {
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ id: number; name: string }>({
    resolver: zodResolver(universitySchema),
  });

  // Reset form when university changes
  useEffect(() => {
    if (university) {
      reset({
        id: university.id,
        name: university.name,
      });
    }
  }, [university, reset]);

  const handleFormSubmit = async (data: { id: number; name: string }) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    onClose();
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
      <div className={`bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تعديل الجامعة</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* University Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الجامعة *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="مثال: جامعة القاهرة"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* University Info
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium text-gray-900 mb-1">معلومات الجامعة:</div>
                <div>الرقم التعريفي: {university?.id}</div>
                {university?.createdAt && (
                  <div>تاريخ الإنشاء: {new Date(university.createdAt).toLocaleDateString('ar-EG')}</div>
                )}
              </div>
            </div> */}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
