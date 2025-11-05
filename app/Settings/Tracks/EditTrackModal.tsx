"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { UpdateTrackData, LookupItem } from "@/lib/tracks";

const trackSchema = z.object({
  name: z
    .string()
    .min(1, "اسم المسار مطلوب")
    .min(2, "اسم المسار يجب أن يكون حرفين على الأقل"),
  code: z
    .string()
    .min(1, "كود المسار مطلوب")
    .min(2, "كود المسار يجب أن يكون حرفين على الأقل"),
  degreeId: z.number().min(1, "الدرجة العلمية مطلوبة"),
  departmentId: z.number().min(1, "القسم مطلوب"),
});

type TrackFormData = z.infer<typeof trackSchema>;

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateTrackData) => Promise<void>;
  track?: any | null;
  loading?: boolean;
}

export default function EditTrackModal({
  isOpen,
  onClose,
  onSubmit,
  track,
  loading = false,
}: EditTrackModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [degrees, setDegrees] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      name: track?.name || "",
      code: track?.code || "",
      degreeId: track?.degreeId || 0,
      departmentId: track?.degree?.departmentId || 0,
    },
  });

  const watchDepartmentId = watch("departmentId");

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchDepartmentId && watchDepartmentId > 0) {
      loadDegreesByDepartment(watchDepartmentId);
    } else {
      setDegrees([]);
    }
  }, [watchDepartmentId]);

  useEffect(() => {
    if (track) {
      reset({
        name: track.name,
        code: track.code,
        degreeId: track.degreeId || 0,
        departmentId: track.degree?.departmentId || 0,
      });
    }
  }, [track, reset]);

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const token = localStorage.getItem("token");
      const { getDepartments } = await import("@/actions/trackActions");
      const result = await getDepartments(token || "");
      if (result.success && result.data) setDepartments(result.data);
    } catch (error) {
      console.error("❌ Error loading departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadDegreesByDepartment = async (departmentId: number) => {
    setLoadingDegrees(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://professor.runasp.net/api/Degree/by-department/${departmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.succeeded && result.data) {
        setDegrees(result.data.map((d: any) => ({ id: d.id, value: d.name })));
      } else {
        setDegrees([]);
      }
    } catch (error) {
      console.error("❌ Error loading degrees by department:", error);
      setDegrees([]);
    } finally {
      setLoadingDegrees(false);
    }
  };

  const handleDepartmentChange = (deptId: number) => {
    setValue("degreeId", 0);
    if (deptId) {
      loadDegreesByDepartment(deptId);
    } else {
      setDegrees([]);
    }
  };

  const handleFormSubmit = async (data: TrackFormData) => {
    if (!track) return;
    try {
      await onSubmit({
        id: track.id,
        name: data.name,
        code: data.code,
        degreeId: data.degreeId,
        departmentId: data.departmentId,
      });
      onClose();
    } catch (error) {
      console.error("❌ Error saving track:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div
        className={`bg-white rounded-xl shadow-xl max-w-2xl w-full relative z-10 overflow-y-auto transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تعديل المسار</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المسار <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="أدخل اسم المسار"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* الكود */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود المسار <span className="text-red-500">*</span>
            </label>
            <input
              {...register("code")}
              type="text"
              placeholder="أدخل كود المسار"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.code && (
              <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>
          

          {/* القسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              القسم <span className="text-red-500">*</span>
            </label>
            <select
              {...register("departmentId", { valueAsNumber: true })}
              onChange={(e) => {
                const id = Number(e.target.value);
                setValue("departmentId", id);
                handleDepartmentChange(id);
              }}
              disabled={loadingDepartments}
              className={`w-full rounded-md border px-3 py-2 transition focus:ring-2 focus:ring-teal-500 focus:border-none
                ${errors.departmentId ? "border-red-500" : "border-gray-300"}
                ${loadingDepartments ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
              `}
            >
              <option value="">اختر القسم</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.value}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-sm text-red-600 mt-1">{errors.departmentId.message}</p>
            )}
          </div>

          {/* الدرجة العلمية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدرجة العلمية <span className="text-red-500">*</span>
            </label>
            <select
              {...register("degreeId", { valueAsNumber: true })}
              disabled={!watchDepartmentId || loadingDegrees}
              className={`w-full rounded-md border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                ${errors.degreeId ? "border-red-500" : "border-gray-300"}
                ${!watchDepartmentId ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
              `}
            >
              <option value="">اختر الدرجة العلمية</option>
              {degrees.map((deg) => (
                <option key={deg.id} value={deg.id}>
                  {deg.value}
                </option>
              ))}
            </select>
            {errors.degreeId && (
              <p className="text-sm text-red-600 mt-1">{errors.degreeId.message}</p>
            )}
          </div>

          {/* الأزرار */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || loadingDegrees || loadingDepartments}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
