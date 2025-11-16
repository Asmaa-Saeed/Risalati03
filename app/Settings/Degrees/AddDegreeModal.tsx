"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { DegreesService } from "@/lib/degrees";
import axios from "axios";
import toast from "react-hot-toast";

const degreeSchema = z.object({
  name: z.string().min(1, "اسم الدرجة العلمية مطلوب"),
  description: z.string().optional(),
  standardDurationYears: z.number().nullable().optional(),
  departmentId: z.number().min(1, "القسم مطلوب"),
  generalDegree: z.string().min(1, "نوع الدرجة مطلوب"),
});

interface AddDegreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

interface GeneralDegree {
  id: number;
  value: string;
}

const AddDegreeModal: React.FC<AddDegreeModalProps> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [generalDegrees, setGeneralDegrees] = useState<GeneralDegree[]>([]);
  const departments = DegreesService.getDepartments();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(degreeSchema),
    defaultValues: {
      standardDurationYears: null,
      generalDegree: '',
    },
  });

  // Fetch general degrees
  useEffect(() => {
    const fetchGeneralDegrees = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoadingDegrees(true);
        const res = await axios.get<GeneralDegree[]>(
          "https://professor.runasp.net/api/Lookups/GeneralDegree",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && Array.isArray(res.data)) setGeneralDegrees(res.data);
      } catch (error) {
        console.error("Failed to fetch general degrees:", error);
      } finally {
        setLoadingDegrees(false);
      }
    };
    if (isOpen) fetchGeneralDegrees();
  }, [isOpen]);

  const handleFormSubmit = async (data: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("لم يتم العثور على التوكن.");
      return;
    }

    const payload = {
      id: 0,
      name: data.name,
      description: data.description || "",
      standardDurationYears: data.standardDurationYears || 0,
      departmentId: data.departmentId,
      departmentName: departments.find(d => d.id === data.departmentId)?.name || "",
      generalDegree: data.generalDegree,
    };

    try {
      await axios.post("https://professor.runasp.net/api/Degree", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("تمت إضافة الدرجة العلمية بنجاح!");
      reset();
      onClose();
    } catch (err: any) {
      // إذا السيرفر رجع رسالة في الحقل message، نعرضه في Toast
      const msg = err?.response?.data?.message || "حدث خطأ أثناء حفظ الدرجة العلمية";
      toast.error(msg);
      console.error("API Error:", err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 p-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">إضافة درجة علمية جديدة</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الدرجة العلمية *</label>
            <input
              {...register("name")}
              type="text"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${errors.name ? "border-red-500" : "border-gray-300"}`}
              placeholder="مثال: ماجستير العلوم في المحاسبة"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
            <textarea
              {...register("description")}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${errors.description ? "border-red-500" : "border-gray-300"}`}
              placeholder="وصف الدرجة العلمية..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">القسم *</label>
            <select {...register("departmentId", { valueAsNumber: true })} className={`w-full px-4 py-3 border rounded-lg ${errors.departmentId ? "border-red-500" : "border-gray-300"}`}>
              <option value="">اختر القسم</option>
              {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مدة الدراسة (سنوات)</label>
            <input
              {...register("standardDurationYears", { valueAsNumber: true, setValueAs: (v) => v === "" ? 0 : Number(v) })}
              type="number" min="1" max="10"
              className={`w-full px-4 py-3 border rounded-lg ${errors.standardDurationYears ? "border-red-500" : "border-gray-300"}`}
              placeholder="مثال: 2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة العامة *</label>
            <select {...register("generalDegree")} className={`w-full px-4 py-3 border rounded-lg ${errors.generalDegree ? "border-red-500" : "border-gray-300"}`} disabled={loadingDegrees}>
              <option value="">{loadingDegrees ? "جاري التحميل..." : "اختر الدرجة العامة"}</option>
              {generalDegrees.map((degree) => <option key={degree.id} value={degree.value}>{degree.value}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={handleClose} className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={loading}>إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>}
              {loading ? "جاري الحفظ..." : "حفظ الدرجة العلمية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDegreeModal;
