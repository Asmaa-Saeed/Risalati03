"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { CreateTrackData, TracksService, LookupItem } from "@/lib/tracks";

const trackSchema = z.object({
  name: z.string().min(1, "اسم المسار مطلوب").min(2, "اسم المسار يجب أن يكون حرفين على الأقل"),
  degreeId: z.number().min(1, "الدرجة العلمية مطلوبة"),
  departmentId: z.number().min(1, "القسم مطلوب"),
});

type TrackFormData = z.infer<typeof trackSchema>;

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTrackData) => Promise<void>;
  loading?: boolean;
}

export default function AddTrackModal({ isOpen, onClose, onSubmit, loading = false }: AddTrackModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [degrees, setDegrees] = useState<LookupItem[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [msarat, setMsarat] = useState<LookupItem[]>([]);
  const [loadingMsarat, setLoadingMsarat] = useState(false);

  // Load degrees and departments on mount
  useEffect(() => {
    if (isOpen) {
      loadDegrees();
      loadDepartments();
    }
  }, [isOpen]);

  const loadDegrees = async () => {
    setLoadingDegrees(true);
    try {
      const degreesData = await TracksService.getDegrees();
      setDegrees(degreesData);
    } catch (error) {
      console.error("❌ Error loading degrees:", error);
    } finally {
      setLoadingDegrees(false);
    }
  };

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { getDepartments } = await import('@/actions/trackActions');
      const result = await getDepartments(token || "");

      if (result.success && result.data) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("❌ Error loading departments:", error);
    } finally {
      setLoadingDepartments(false);
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
    watch,
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
  });

  // Watch degreeId to fetch msarat (track names)
  const selectedDegreeId = watch("degreeId");

  useEffect(() => {
    const fetchMsarat = async () => {
      if (!selectedDegreeId || selectedDegreeId <= 0) {
        setMsarat([]);
        return;
      }
      setLoadingMsarat(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const { getMsaratByDegreeId } = await import('@/actions/trackActions');
        const res = await getMsaratByDegreeId(selectedDegreeId, token || "");
        if (res.success && res.data) {
          setMsarat(res.data);
        } else {
          setMsarat([]);
        }
      } catch (e) {
        console.error("❌ Error loading msarat:", e);
        setMsarat([]);
      } finally {
        setLoadingMsarat(false);
      }
    };

    fetchMsarat();
  }, [selectedDegreeId]);

  const handleFormSubmit = async (data: TrackFormData) => {
    try {
      await onSubmit({
        name: data.name,
        degreeId: data.degreeId,
        departmentId: data.departmentId,
      });
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
          <h2 className="text-xl font-bold text-gray-900">إضافة مسار جديد</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        

          
            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم *
              </label>
              <select
                {...register("departmentId", { valueAsNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${
                  errors.departmentId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingDepartments}
              >
                <option value="">
                  {loadingDepartments ? "جاري تحميل الأقسام..." : "اختر القسم"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.value}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
              )}
            </div>
              
          </div>

            {/* Degree Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدرجة العلمية *
              </label>
              <select
                {...register("degreeId", { valueAsNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${
                  errors.degreeId ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingDegrees}
              >
                <option value="">
                  {loadingDegrees ? "جاري تحميل الدرجات العلمية..." : "اختر الدرجة العلمية"}
                </option>
                {degrees.map((degree) => (
                  <option key={degree.id} value={degree.id}>
                    {degree.value}
                  </option>
                ))}
              </select>
              {errors.degreeId && (
                <p className="mt-1 text-sm text-red-600">{errors.degreeId.message}</p>
              )}
            </div>

            {/* Track Name (from Lookup by Degree) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المسار *
              </label>
              <select
                {...register("name")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                disabled={!selectedDegreeId || loadingMsarat}
              >
                <option value="">
                  {loadingMsarat ? "جاري تحميل أسماء المسارات..." : !selectedDegreeId ? "اختر الدرجة أولاً" : "اختر اسم المسار"}
                </option>
                {msarat.map((m) => (
                  <option key={m.id} value={m.value}>
                    {m.value}
                  </option>
                ))}
              </select>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || loadingDegrees || loadingDepartments}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ المسار"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
