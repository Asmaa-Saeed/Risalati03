"use client";

import { X, Calendar, Clock, FolderOpen, GraduationCap } from "lucide-react";
import { Degree } from "@/lib/degrees";

interface ViewDegreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  degree: Degree | null;
}

export default function ViewDegreeModal({ isOpen, onClose, degree }: ViewDegreeModalProps) {
  if (!isOpen || !degree) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تفاصيل الدرجة العلمية</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-bold">ID</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الدرجة</p>
                    <p className="font-medium text-gray-900">{degree.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Degree Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الدرجة العلمية</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الدرجة العلمية
                  </label>
                  <p className="text-gray-900 font-medium">{degree.name}</p>
                </div>

                {degree.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف
                    </label>
                    <p className="text-gray-600">{degree.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    مدة الدراسة
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="text-gray-400" size={16} />
                    <span className="text-gray-900 font-medium">
                      {degree.standardDurationYears
                        ? `${degree.standardDurationYears} سنة`
                        : "غير محدد"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات القسم</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">اسم القسم</p>
                    <p className="font-medium text-gray-900">{degree.departmentName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم القسم
                  </label>
                  <p className="text-gray-600 font-mono text-sm bg-gray-50 px-3 py-1 rounded">
                    {degree.departmentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-900 font-medium">{formatDate(degree.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">آخر تحديث</label>
                  <p className="text-gray-900 font-medium">{formatDate(degree.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
