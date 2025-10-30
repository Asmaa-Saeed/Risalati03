"use client";

import { X, Building2 } from "lucide-react";
import { College } from "@/lib/colleges";

interface ViewCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  college: College | null;
}

export default function ViewCollegeModal({ isOpen, onClose, college }: ViewCollegeModalProps) {
  if (!isOpen || !college) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-backdrop-enter">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-2xl w-full border border-teal-200/50 transform transition-all duration-300 animate-modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-teal-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center border-2 border-teal-300">
              <Building2 className="text-teal-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-teal-900">تفاصيل الكلية</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:animate-float"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center space-y-6">
            {/* College Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mx-auto border-2 border-teal-200 shadow-lg">
              <Building2 className="text-teal-600" size={40} />
            </div>

            {/* College ID */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200/50">
              <p className="text-sm font-semibold text-teal-700 mb-2">رقم الكلية</p>
              <p className="text-3xl font-bold text-teal-900">{college.id}</p>
            </div>

            {/* College Name */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-200/50">
              <p className="text-sm font-semibold text-teal-700 mb-2">اسم الكلية</p>
              <p className="text-2xl font-bold text-teal-900">{college.name}</p>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-gray-50 to-teal-50 rounded-xl p-6 text-sm text-gray-700 border border-gray-200/50">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="font-semibold text-green-700">تم استرجاع البيانات من API النظام</p>
              </div>
              <p className="text-center leading-relaxed">
                الكلية نشطة ومسجلة في النظام الأكاديمي
                <br />
                يمكن تعديل البيانات أو حذف الكلية من خلال الأدوات المتاحة
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-8 border-t border-teal-200/50 bg-teal-50/30 rounded-b-2xl p-6">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl hover:from-teal-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
