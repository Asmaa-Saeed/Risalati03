"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { CreateCollegeData } from "@/lib/colleges";

const collegeSchema = z.object({
  name: z.string().min(1, "اسم الكلية مطلوب"),
});

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollegeData) => Promise<void>;
  loading?: boolean;
}

export default function AddCollegeModal({ isOpen, onClose, onSubmit, loading = false }: AddCollegeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCollegeData>({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleFormSubmit = async (data: CreateCollegeData) => {
    try {
      console.log("📝 Form data being submitted:", data);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-backdrop-enter">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 transform transition-all duration-300 animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">إضافة كلية جديدة</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:animate-float"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-8">
          <div className="max-w-lg mx-auto">
            {/* College Name */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                اسم الكلية *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-lg ${
                  errors.name ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 hover:border-gray-300"
                }`}
                placeholder="مثال: كلية الطب البشري"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ الكلية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
