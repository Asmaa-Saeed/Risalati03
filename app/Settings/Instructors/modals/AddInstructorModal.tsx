"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { CreateInstructorData } from "@/lib/instructors";
import { DepartmentsService, type Department } from "@/lib/departments";
import { AcademicTitlesService, type AcademicTitle } from "@/lib/academic-titles";

const schema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  // AcademicTitle should be selected as ID (number)
  academicTitle: z.number().int().min(1, "اللقب الأكاديمي مطلوب"),
  nationalId: z
    .string()
    .regex(/^[0-9]{14}$/, "الرقم القومي يجب أن يكون 14 رقمًا"),
  // Validate that a real department is selected (0 in the UI means "not selected")
  departmentId: z.number().int().min(1, "القسم مطلوب"),
  phone: z.string().min(5, "رقم الهاتف غير صالح"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInstructorData) => Promise<void>;
  loading?: boolean;
}

export default function AddInstructorModal({ isOpen, onClose, onSubmit, loading = false }: Props) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateInstructorData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", academicTitle: 0, nationalId: "", departmentId: 0, phone: "", email: "" },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicTitles, setAcademicTitles] = useState<AcademicTitle[]>([]);

  useEffect(() => {
    const load = async () => {
      const [deptRes, titlesRes] = await Promise.all([
        DepartmentsService.getDepartments(),
        AcademicTitlesService.getAcademicTitles(),
      ]);

      if (deptRes.success) setDepartments(deptRes.data);
      if (titlesRes.success) setAcademicTitles(titlesRes.data);
    };
    load();
  }, []);

  const handleFormSubmit = async (data: CreateInstructorData) => {
    await onSubmit(data);
    // Parent decides to close modal upon success; keep form open if there are errors
  };

  const handleInvalid = () => {
    const firstError =
      errors.name?.message ||
      errors.nationalId?.message ||
      errors.academicTitle?.message ||
      errors.departmentId?.message ||
      errors.phone?.message ||
      errors.email?.message;
    setFormError(typeof firstError === "string" ? firstError : "تحقق من الحقول المطلوبة");
    // Clear banner after a short time
    setTimeout(() => setFormError(null), 3000);
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">إضافة عضو هيئة تدريس</h2>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit, handleInvalid)} className="p-8 space-y-6">
          {formError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم *</label>
              <input {...register("name")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.name ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: د. أحمد علي" />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الرقم القومي *</label>
              <input {...register("nationalId")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.nationalId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: 29801012345678" />
              {errors.nationalId && <p className="mt-2 text-sm text-red-600">{errors.nationalId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اللقب الأكاديمي *</label>
              <select {...register("academicTitle", { valueAsNumber: true })} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.academicTitle ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
                <option value={0}>اختر اللقب</option>
                {academicTitles.map((t) => (
                  <option key={t.id} value={t.id}>{t.value}</option>
                ))}
              </select>
              {errors.academicTitle && <p className="mt-2 text-sm text-red-600">{errors.academicTitle.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">القسم *</label>
              <select {...register("departmentId", { valueAsNumber: true })} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.departmentId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
                <option value={0}>اختر القسم</option>
                {departments.map((d) => (
                  <option key={d.id} value={parseInt(d.id)}>{d.name}</option>
                ))}
              </select>
              {errors.departmentId && <p className="mt-2 text-sm text-red-600">القسم مطلوب</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف *</label>
              <input {...register("phone")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.phone ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: 01000000000" />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني *</label>
              <input {...register("email")} type="email" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.email ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="example@domain.com" />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
            <button type="button" onClick={handleClose} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={loading}>إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? "جاري الحفظ..." : "حفظ العضو"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
