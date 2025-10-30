"use client";

import { X, Calendar, Clock, User, Building2, GraduationCap } from "lucide-react";
import { Course } from "@/lib/faculty-courses";

interface ViewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export default function ViewCourseModal({ isOpen, onClose, course }: ViewCourseModalProps) {
  if (!isOpen || !course) return null;

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
          <h2 className="text-xl font-bold text-gray-900">تفاصيل المقرر</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-bold">ID</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم المقرر</p>
                    <p className="font-medium text-gray-900">{course.courseId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الحالة</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.status === 'active' ? 'نشط' :
                       course.status === 'inactive' ? 'غير نشط' : 'مسودة'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل المقرر</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المقرر
                  </label>
                  <p className="text-gray-900 font-medium">{course.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <p className="text-gray-600">{course.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الساعات المعتمدة
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-gray-900 font-medium">{course.credits} ساعات</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدة الزمنية
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={16} />
                      <span className="text-gray-900 font-medium">{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات المحاضر</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">اسم المحاضر</p>
                    <p className="font-medium text-gray-900">{course.instructor}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    معرف المحاضر
                  </label>
                  <p className="text-gray-600 font-mono text-sm bg-gray-50 px-3 py-1 rounded">
                    {course.instructorId}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">المعلومات الأكاديمية</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">القسم</p>
                    <p className="font-medium text-gray-900">{course.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الكلية</p>
                    <p className="font-medium text-gray-900">{course.college}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building2 className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الجامعة</p>
                    <p className="font-medium text-gray-900">{course.university}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-900 font-medium">{formatDate(course.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">آخر تحديث</label>
                  <p className="text-gray-900 font-medium">{formatDate(course.updatedAt)}</p>
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
