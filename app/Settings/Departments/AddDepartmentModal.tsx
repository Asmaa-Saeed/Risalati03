"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { DepartmentsService, Program, CreateDepartmentData } from "@/lib/departments";

const departmentSchema = z.object({
  name: z.string().min(1, "اسم القسم مطلوب").min(2, "اسم القسم يجب أن يكون حرفين على الأقل"),
  description: z.string().min(1, "وصف القسم مطلوب").min(5, "الوصف يجب أن يكون 5 أحرف على الأقل"),
  programId: z.string().min(1, "البرنامج مطلوب"),
  programName: z.string().min(1, "اسم البرنامج مطلوب"),
});
  
type DepartmentFormData = z.infer<typeof departmentSchema>;

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentData) => Promise<void>;
  loading?: boolean;
}

export default function AddDepartmentModal({ isOpen, onClose, onSubmit, loading = false }: AddDepartmentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  // Load programs on mount
  useEffect(() => {
    if (isOpen) {
      loadPrograms();
    }
  }, [isOpen]);

  const loadPrograms = async () => {
    setLoadingPrograms(true);
    console.log("🔄 Loading programs...");
    try {
      const response = await DepartmentsService.getPrograms();
      console.log("🔹 Programs response:", response);
      if (response.success) {
        console.log("✅ Programs loaded successfully:", response.data);
        setPrograms(response.data);
      } else {
        console.error("❌ Failed to load programs:", response.message);
      }
    } catch (error) {
      console.error("❌ Error loading programs:", error);
    } finally {
      setLoadingPrograms(false);
    }
  };

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
    setValue,
    watch,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const watchedProgramId = watch("programId");

  useEffect(() => {
    if (watchedProgramId) {
      const selectedProgramData = programs.find(p => p.id.toString() === watchedProgramId);
      setValue("programName", selectedProgramData?.value || '');
    }
  }, [watchedProgramId, programs, setValue]);

  const handleFormSubmit = async (data: DepartmentFormData) => {
    try {
      // Add default values for required fields that are not in the form
      const completeData = {
        ...data,
        departmentId: `DEPT_${Date.now()}`,
        collegeId: '1', // Default college
        collegeName: '', // Empty college name
        headOfDepartment: 'لم يحدد',
        headOfDepartmentId: `HOD_${Date.now()}`,
        totalStudents: 0,
        totalCourses: 0,
        status: 'active' as const,
        establishedYear: new Date().getFullYear(),
        phone: 'لم يحدد',
        email: 'department@university.edu.eg',
        room: 'لم يحدد',
      };

      await onSubmit(completeData);
      reset();
      setSelectedProgram("");
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    setSelectedProgram("");
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
      <div className={`bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-10 transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">إضافة قسم جديد</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Department Name */}
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
              onChange={(e) => {
                register("programId").onChange(e);
                setSelectedProgram(e.target.value);
              }}
            >
              <option value="">
                {loadingPrograms ? "جاري تحميل البرامج..." : "اختر البرنامج"}
              </option>
              {(() => {
                console.log("📋 Programs in dropdown:", programs);
                return programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.value}
                  </option>
                ));
              })()}
            </select>
            {errors.programId && (
              <p className="mt-1 text-sm text-red-600">{errors.programId.message}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
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
              disabled={loading || loadingPrograms}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ القسم"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
