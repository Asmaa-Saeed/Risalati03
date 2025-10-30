"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { Instructor, UpdateInstructorData } from "@/lib/instructors";
import { DepartmentsService, type Department } from "@/lib/departments";
import { AcademicTitlesService, type AcademicTitle } from "@/lib/academic-titles";

// Align schema with backend update payload: Id, Name, AcademicTitle (number), DepartmentId (number), Phone, Email
const schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "الاسم مطلوب"),
  academicTitle: z.number().int().min(1, "اللقب الأكاديمي مطلوب"),
  departmentId: z.number().int().min(1, "القسم مطلوب"),
  phone: z.string().min(5, "رقم الهاتف غير صالح"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateInstructorData) => Promise<void>;
  instructor: Instructor | null;
  loading?: boolean;
}

export default function EditInstructorModal({ isOpen, onClose, onSubmit, instructor, loading = false }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateInstructorData>({
    resolver: zodResolver(schema),
    defaultValues: { id: "", name: "", academicTitle: 0, departmentId: 0, phone: "", email: "" },
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicTitles, setAcademicTitles] = useState<AcademicTitle[]>([]);

  // Load lookups and preselect based on current instructor's displayed values
  useEffect(() => {
    const load = async () => {
      const [deptRes, titlesRes] = await Promise.all([
        DepartmentsService.getDepartments(),
        AcademicTitlesService.getAcademicTitles(),
      ]);
      if (deptRes.success) setDepartments(deptRes.data);
      if (titlesRes.success) setAcademicTitles(titlesRes.data);

      if (instructor) {
        // Try to map current title and department names to IDs
        const titleMatch = titlesRes.success ? titlesRes.data.find(t => t.value === instructor.title) : undefined;
        const deptMatch = deptRes.success ? deptRes.data.find(d => d.name === instructor.department) : undefined;
        reset({
          id: instructor.id,
          name: instructor.name,
          academicTitle: titleMatch ? titleMatch.id : 0,
          departmentId: deptMatch ? parseInt(deptMatch.id) : 0,
          phone: instructor.phone ,
          email: instructor.email ,
        });
      }
    };
    if (isOpen) load();
  }, [isOpen, instructor, reset]);

  const handleFormSubmit = async (data: UpdateInstructorData) => {
    await onSubmit(data);
    onClose();
  };

  const handleClose = () => onClose();

  if (!isOpen || !instructor) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">تعديل عضو هيئة التدريس</h2>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keep ID hidden: do not show member number to user */}
            <input type="hidden" {...register("id")} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم *</label>
              <input {...register("name")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.name ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الرقم القومي</label>
              <input value={instructor.nationalId} readOnly disabled type="text" className="w-full px-5 py-3 border-2 rounded-xl bg-gray-50 text-gray-700 border-gray-200" />
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
              {errors.departmentId && <p className="mt-2 text-sm text-red-600">{errors.departmentId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف *</label>
              <input {...register("phone")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.phone ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني *</label>
              <input {...register("email")} type="email" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.email ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
            <button type="button" onClick={handleClose} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={loading}>إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
