"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { type UpdateCourseData, type Course } from "@/lib/courses";
import { DepartmentsService, type Department } from "@/lib/departments";
import { DegreesService, type Degree } from "@/lib/degrees";
import { TracksService, type LookupItem } from "@/lib/tracks";
import { SemestersService, type SemesterItem } from "@/lib/semesters";

const schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1, "كود المقرر مطلوب"),
  name: z.string().min(1, "اسم المقرر مطلوب"),
  creditHours: z.number().int().min(0, "عدد الساعات غير صالح"),
  isOptional: z.boolean(),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  departmentId: z.number().int().optional(),
  degreeId: z.number().int().optional(),
  msarId: z.number().int().optional(),
  prerequisites: z.array(z.string()),
  description: z.string().optional(),
});

// Infer the form data type from the schema
type EditCourseFormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateCourseData) => Promise<void>;
  loading?: boolean;
  course: Course | null;
  allCourses: Course[];
}

export default function EditCourseModal({ isOpen, onClose, onSubmit, loading = false, course, allCourses }: Props) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<EditCourseFormData>({
    resolver: zodResolver(schema),
    defaultValues: { id: "", code: "", name: "", creditHours: 3, isOptional: false, semester: "", departmentId: 0, degreeId: 0, msarId: 0, prerequisites: [], description: "" },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [tracks, setTracks] = useState<LookupItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);

  const degreeId = watch("degreeId");

  useEffect(() => {
    const load = async () => {
      const errs: string[] = [];
      try {
        console.log("[EditCourseModal] Fetching lookups...");
        const [deptRes, degreesRes, tracksRes, semestersRes] = await Promise.all([
          DepartmentsService.getDepartments(),
          DegreesService.getDegrees(),
          TracksService.getTracks(),
          SemestersService.getSemesters(),
        ]);
        console.log("[EditCourseModal] Departments:", deptRes);
        console.log("[EditCourseModal] Degrees:", degreesRes);
        console.log("[EditCourseModal] Tracks:", tracksRes);
        console.log("[EditCourseModal] Semesters:", semestersRes);

        if (deptRes.success) setDepartments(deptRes.data); else errs.push(deptRes.message || "فشل تحميل الأقسام");
        if (degreesRes.succeeded) setDegrees(degreesRes.data); else errs.push(degreesRes.message || "فشل تحميل الدرجات");
        if (tracksRes.succeeded) {
          setTracks(tracksRes.data.map((t: any) => ({ id: t.id, value: t.name })));
        } else {
          errs.push(tracksRes.message || "فشل تحميل المسارات");
        }
        if (semestersRes.success) setSemesters(semestersRes.data); else errs.push(semestersRes.message || "فشل تحميل الفصول الدراسية");
      } catch (e) {
        console.error("[EditCourseModal] Lookup fetch error:", e);
        errs.push("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoadErrors(errs);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (course) {
      // We don't have raw ids for department/degree/msar from Course type; keep them 0 unless you have a mapping.
      // For Semester: try to coerce to numeric id. If course.semester is a label, map it to the matching SemesterItem.id
      const rawSem = String(course.semester ?? "").trim();
      let semesterValue = rawSem;
      const isNumeric = /^\d+$/.test(rawSem);
      if (!isNumeric && semesters.length) {
        const match = semesters.find((s) => s.value === rawSem);
        if (match) semesterValue = String(match.id);
      }
      // Map existing prerequisites (likely codes) to course IDs for the select
      const prereqCodes = Array.isArray(course.prerequisites) ? course.prerequisites.map(String) : [];
      const codeToIdMap: Record<string, string> = {};
      allCourses.forEach(c => { codeToIdMap[c.code] = c.id; });
      const mappedPrereqIds = prereqCodes.map(code => codeToIdMap[code]).filter(Boolean);

      reset({
        id: course.id,
        code: course.code,
        name: course.name,
        creditHours: course.creditHours,
        isOptional: course.isOptional,
        semester: semesterValue,
        departmentId: 0,
        degreeId: 0,
        msarId: 0,
        // Use mapped prerequisite IDs so the multi-select shows existing selections
        prerequisites: (mappedPrereqIds.length ? mappedPrereqIds : (course.prerequisites || [])) as unknown as string[],
        description: course.description || "",
      });
    }
  }, [course, reset, semesters, allCourses]);

  const filteredTracks = useMemo(() => {
    return tracks; // could filter by selected degree
  }, [tracks, degreeId]);

  const onValid: SubmitHandler<EditCourseFormData> = async (data) => {
    // Map form data to UpdateCourseData expected by API, injecting instructors from current course if available
    const payload: UpdateCourseData = {
      ...data,
      instructors: (course?.instructors?.map(i => i.id) ?? []),
    };
    await onSubmit(payload);
  };

  const handleInvalid = () => {
    const firstError =
      errors.code?.message ||
      errors.name?.message ||
      errors.creditHours?.message ||
      errors.semester?.message ||
      errors.departmentId?.message ||
      errors.degreeId?.message ||
      errors.msarId?.message;
    setFormError(typeof firstError === "string" ? firstError : "تحقق من الحقول المطلوبة");
    setTimeout(() => setFormError(null), 3000);
  };

  const handleClose = () => { reset(); onClose(); };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">تعديل مقرر</h2>
          <button onClick={handleClose} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid, handleInvalid)} className="p-8 space-y-6">
          {(formError || loadErrors.length > 0) && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
              {formError}
              {loadErrors.length > 0 && (
                <ul className="list-disc pr-5 space-y-1 mt-1">
                  {loadErrors.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (اختياري)</label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="اكتب وصفاً مختصراً للمقرر (اختياري)"
                className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
              />
            </div>
            <input type="hidden" {...register("id")} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كود المقرر *</label>
              <input {...register("code")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.code ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المقرر *</label>
              <input {...register("name")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.name ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الساعات *</label>
              <input {...register("creditHours", { valueAsNumber: true })} type="number" min={0} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.creditHours ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} />
              {errors.creditHours && <p className="mt-2 text-sm text-red-600">{errors.creditHours.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الفصل الدراسي *</label>
              <select
                {...register("semester")}
                className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.semester ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}
              >
                <option value="">اختر الفصل الدراسي</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.value}</option>
                ))}
              </select>
              {errors.semester && <p className="mt-2 text-sm text-red-600">{errors.semester.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">هل المادة اختيارية؟</label>
              <select
                {...register("isOptional", { setValueAs: (v) => v === "true" })}
                className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
              >
                <option value="false">لا (إجباري)</option>
                <option value="true">نعم (اختياري)</option>
              </select>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">الدرجة العلمية *</label>
              <select {...register("degreeId", { valueAsNumber: true })} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.degreeId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
                <option value={0}>اختر الدرجة</option>
                {degrees.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.degreeId && <p className="mt-2 text-sm text-red-600">{errors.degreeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المسار *</label>
              <select {...register("msarId", { valueAsNumber: true })} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.msarId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
                <option value={0}>اختر المسار</option>
                {filteredTracks.map((t) => (
                  <option key={t.id} value={t.id}>{t.value}</option>
                ))}
              </select>
              {errors.msarId && <p className="mt-2 text-sm text-red-600">{errors.msarId.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">المتطلبات السابقة (Prerequisites)</label>
              <select multiple {...register("prerequisites")} className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300 min-h-[120px]">
                {allCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">اضغط مع الاستمرار على Ctrl/Command لاختيار أكثر من مقرر</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
            <button type="button" onClick={handleClose} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={loading}>إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
