"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import {
  DepartmentsService,
  Program,
  UpdateDepartmentData,
  Department,
} from "@/lib/departments";

// ✅ Validation Schema
const departmentSchema = z.object({
  name: z.string().min(2, "اسم القسم يجب أن يكون حرفين على الأقل"),
  code: z.string().min(1, "كود القسم مطلوب").min(2, "كود القسم يجب أن يكون حرفين على الأقل").max(3, "كود القسم يجب أن يكون 3 أحرف بالضبط"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  programId: z.string().min(1, "البرنامج مطلوب"),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateDepartmentData) => Promise<void>;
  department: Department | null;
  loading?: boolean;
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  department,
  loading = false,
}: EditDepartmentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // ✅ Load programs when modal opens
  useEffect(() => {
    if (isOpen) loadPrograms();
  }, [isOpen]);

  const loadPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const response = await DepartmentsService.getPrograms();
      if (response.success && Array.isArray(response.data)) {
        setPrograms(response.data);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  // ✅ Modal visibility animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || "",
      code: department?.code || "",
      description: department?.description || "",
      programId: department?.programId?.toString() || "",
    },
  });

  // ✅ Reset form when department changes
  useEffect(() => {
    if (department) {
      reset({
        name: department.name ?? "",
        code: department.code ?? "",
        description: department.description ?? "",
        programId: department.programId ? String(department.programId) : "",
      });
    }
  }, [department, reset]);

  // ✅ Handle form submission
  const handleFormSubmit = async (data: DepartmentFormData) => {
    if (!department) return;

    try {
      // Ensure code is at least 2 characters long after trimming
      const trimmedCode = data.code.trim();
      if (trimmedCode.length < 2) {
        console.error("Code must be at least 2 characters long");
        return;
      }

      // Find the selected program
      const selectedProgram = programs.find(p => p.id === Number(data.programId));
      
      // Create the update data with all required fields
      const updateData: UpdateDepartmentData = {
        id: department.id,
        name: data.name.trim(),
        code: trimmedCode,
        description: data.description.trim(),
        programId: data.programId,
        programName: selectedProgram?.value || '',
        // Include all required fields from the department object
        departmentId: department.departmentId,
        collegeId: department.collegeId || '1',
        collegeName: department.collegeName || 'كلية الحاسبات والمعلومات',
        headOfDepartment: department.headOfDepartment || '',
        headOfDepartmentId: department.headOfDepartmentId || '',
        totalStudents: department.totalStudents || 0,
        totalCourses: department.totalCourses || 0,
        status: department.status || 'active',
        establishedYear: department.establishedYear || new Date().getFullYear(),
        phone: department.phone || '',
        email: department.email || '',
        room: department.room || ''
      };

      // This will be handled by the parent component (DepartmentsManagement)
      await onSubmit(updateData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className={`bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10 transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تعديل القسم</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Department Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم القسم *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="مثال: قسم علوم الحاسوب"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود القسم *
              </label>
              <input
                {...register("code")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="مثال: CS"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البرنامج *
            </label>
            <select
              {...register("programId")}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.programId ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loadingPrograms}
            >
              <option value="">
                {loadingPrograms ? "جاري تحميل البرامج..." : "اختر البرنامج"}
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.value}
                </option>
              ))}
            </select>
            {errors.programId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.programId.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف القسم *
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="وصف تفصيلي للقسم وأهدافه..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || loadingPrograms}
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
