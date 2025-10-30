"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import Toast from "@/app/Component/Toast";
import { DepartmentsService, type Department } from "@/lib/departments";
import { DegreesService, type Degree } from "@/lib/degrees";
import { TracksService, type LookupItem } from "@/lib/tracks";
import { SemestersService, type SemesterItem } from "@/lib/semesters";
import { CoursesService, type Course as CourseItem } from "@/lib/courses";
import { InstructorsService, type Instructor } from "@/lib/instructors";

// Schema matches create course requirements
const schema = z.object({
  code: z.string().min(1, "كود المقرر مطلوب"),
  name: z.string().min(1, "اسم المقرر مطلوب"),
  creditHours: z.number().int().min(0, "عدد الساعات غير صالح"),
  isOptional: z.boolean(),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  departmentId: z.number().int().optional(),
  degreeId: z.number().int().optional(),
  msarId: z.number().int().min(1, "المسار مطلوب"),
  prerequisites: z.array(z.string()),
  description: z.string().optional(),
  instructors: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddCoursePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    // departmentId/degreeId exist only in UI and are not sent to backend
    defaultValues: { code: "", name: "", creditHours: 3, isOptional: false, semester: "", departmentId: 0, degreeId: undefined, msarId: 0, prerequisites: [], description: "", instructors: [] },
  });

  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [tracks, setTracks] = useState<LookupItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [allOptions, setAllOptions] = useState<CourseItem[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<Instructor[]>([]);

  const [prereqRows, setPrereqRows] = useState<string[]>([]);
  const [instructorRows, setInstructorRows] = useState<string[]>([]);

  const degreeId = watch("degreeId"); // temporarily disabled

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, degreesRes, tracksRes, semestersRes, coursesRes, instructorsRes] = await Promise.all([
          DepartmentsService.getDepartments(),
          DegreesService.getDegrees(),
          TracksService.getTracks(),
          SemestersService.getSemesters(),
          CoursesService.getCourses(),
          InstructorsService.getInstructors(),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (degreesRes.succeeded) setDegrees(degreesRes.data);
        if (tracksRes.succeeded) setTracks(tracksRes.data.map((t: any) => ({ id: t.id, value: t.name })));
        if (semestersRes.success) setSemesters(semestersRes.data);
        if (coursesRes.success) setAllOptions(coursesRes.data);
        if (instructorsRes.success) setInstructorOptions(instructorsRes.data as any);
      } catch (e) {
        setMessage({ type: "error", text: "حدث خطأ أثناء تحميل البيانات" });
        setShowToast(true);
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, []);

  // Initialize rows if RHF default values changed externally
  useEffect(() => {
    const sub = watch((values) => {
      if (Array.isArray(values.prerequisites) && values.prerequisites.length && prereqRows.length === 0) {
        setPrereqRows(values.prerequisites as string[]);
      }
      if (Array.isArray(values.instructors) && values.instructors.length && instructorRows.length === 0) {
        setInstructorRows(values.instructors as string[]);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, prereqRows.length, instructorRows.length]);

  const filteredTracks = useMemo(() => {
    return tracks; // could filter by selected degree if available later
  }, [tracks]);

  const onValid: SubmitHandler<FormData> = async (data) => {
    setSaving(true);
    try {
      // Defensive coercions to match backend expectations
      const payload = {
        ...data,
        code: String(data.code ?? "").trim(),
        creditHours: Number(data.creditHours),
        isOptional: Boolean(data.isOptional),
        semester: String(data.semester).trim(),
        // departmentId: Number(data.departmentId),
        // degreeId: Number(data.degreeId),
        msarId: Number(data.msarId),
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites.filter(Boolean) : [],
      } as FormData;

      if (typeof window !== 'undefined') {
        console.debug('[AddCourse] Submitting payload', payload);
      }

      const res = await CoursesService.createCourse(payload as any);
      if (!res.success) {
        throw new Error(res.message || "فشل حفظ المقرر");
      }
      setMessage({ type: "success", text: res.message || "تم حفظ المقرر بنجاح" });
      setShowToast(true);
      setTimeout(() => {
        router.back();
      }, 600);
    } catch (e: any) {
      if (typeof window !== 'undefined') {
        console.error('[AddCourse] Submit failed', { error: e, message: e?.message });
      }
      setMessage({ type: "error", text: e?.message || "حدث خطأ في حفظ المقرر" });
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleInvalid = () => {
    const firstError =
      errors.code?.message ||
      errors.name?.message ||
      errors.creditHours?.message ||
      errors.semester?.message ||
     errors.departmentId?.message ||
      errors.degreeId?.message ||
      errors.msarId?.message ||
      errors.instructors?.message;
    setMessage({ type: "error", text: (firstError as string) || "تحقق من الحقول المطلوبة" });
    setShowToast(true);
  };

  const goBack = () => router.back();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Toast
        show={Boolean(message) && showToast}
        type={message?.type === "success" ? "success" : "error"}
        message={message?.text || ""}
        duration={3000}
        onClose={() => { setShowToast(false); setMessage(null); }}
        position="top-center"
      />

      <div className="flex items-center justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">إضافة مقرر جديد</h1>
          <p className="text-gray-600">قم بتعبئة الحقول التالية لإضافة مقرر</p>
        </div>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition"
        >
          العودة إلى الصفحة السابقة
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
        {loadingLookups ? (
          <div className="p-8 flex items-center justify-center text-gray-600">
            <Loader2 className="animate-spin mr-2" /> جاري تحميل البيانات...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onValid, handleInvalid)} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">كود المقرر *</label>
                <input {...register("code")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.code ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: CS101" />
                {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المقرر *</label>
                <input {...register("name")} type="text" className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.name ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: مقدمة في علوم الحاسب" />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">عدد الساعات *</label>
                <input {...register("creditHours", { valueAsNumber: true })} type="number" min={0} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.creditHours ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`} placeholder="مثال: 3" />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">حالة المادة (اختياري/إجباري)</label>
                <select
                  {...register("isOptional", { setValueAs: (v) => v === "true" })}
                  defaultValue={"false"}
                  className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                >
                  <option value="false">إجباري</option>
                  <option value="true">اختياري</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف (اختياري)</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="اكتب وصفاً مختصراً للمقرر (اختياري)"
                  className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">القسم</label>
                <select {...register("departmentId", { valueAsNumber: true })} className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.departmentId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}>
                  <option value={0}>اختر القسم</option>
                  {departments.map((d) => (
                    <option key={d.id} value={parseInt(d.id)}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentId && <p className="mt-2 text-sm text-red-600">{errors.departmentId.message}</p>}
                {/* <p className="mt-1 text-xs text-gray-500">لن يتم إرسال هذا الحقل إلى الخادم.</p> */}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">الدرجة العلمية</label>
                <select {...register("degreeId", { valueAsNumber: true })} className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300">
                  <option value="">بدون درجة</option>
                  {degrees.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">لن يتم إرسال هذا الحقل إلى الخادم.</p>
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

              {/* Prerequisites table */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">المتطلبات السابقة (اختياري)</label>
                </div>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">اسم الكورس</th>
                        <th className="px-4 py-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prereqRows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-400 italic" colSpan={2}>لا توجد متطلبات مضافة</td>
                        </tr>
                      ) : (
                        prereqRows.map((val, idx) => (
                          <tr key={idx} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <select
                                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                                value={val}
                                onChange={(e) => {
                                  const next = [...prereqRows];
                                  next[idx] = e.target.value;
                                  setPrereqRows(next);
                                  setValue("prerequisites", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                                }}
                              >
                                <option value="">اختر كورس</option>
                                {allOptions.map((c) => (
                                  <option key={c.id} value={c.id}>{c.name || c.code}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <button
                                type="button"
                                aria-label="حذف المتطلب"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                                onClick={() => {
                                  const next = prereqRows.filter((_, i) => i !== idx);
                                  setPrereqRows(next);
                                  setValue("prerequisites", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                                }}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="p-3 border-t bg-gray-50">
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      onClick={() => {
                        const next = [...prereqRows, ""];
                        setPrereqRows(next);
                        setValue("prerequisites", next.filter(Boolean), { shouldDirty: true });
                      }}
                    >
                      إضافة كورس جديد
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructors table */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">المحاضرون (Instructors)</label>
                  {errors.instructors && (
                    <span className="text-xs text-red-600">{errors.instructors.message as string}</span>
                  )}
                </div>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-700">اسم المحاضر</th>
                        <th className="px-4 py-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructorRows.length === 0 ? (
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-400 italic" colSpan={2}>لا يوجد محاضرون مضافون</td>
                        </tr>
                      ) : (
                        instructorRows.map((val, idx) => (
                          <tr key={idx} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <select
                                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                                value={val}
                                onChange={(e) => {
                                  const next = [...instructorRows];
                                  next[idx] = e.target.value; // store nationalId string
                                  setInstructorRows(next);
                                  setValue("instructors", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                                }}
                              >
                                <option value="">اختر محاضر</option>
                                {instructorOptions.map((ins) => (
                                  <option key={ins.id} value={(ins as any).nationalId}>{ins.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <button
                                type="button"
                                aria-label="حذف المحاضر"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                                onClick={() => {
                                  const next = instructorRows.filter((_, i) => i !== idx);
                                  setInstructorRows(next);
                                  setValue("instructors", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                                }}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="p-3 border-t bg-gray-50">
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      onClick={() => {
                        const next = [...instructorRows, ""];
                        setInstructorRows(next);
                        setValue("instructors", next.filter(Boolean), { shouldDirty: true });
                      }}
                    >
                      إضافة محاضر
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 bg-gray-50/50 rounded-b-2xl p-6">
              <button type="button" onClick={goBack} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={saving}>العودة إلى الصفحة السابقة</button>
              <button type="submit" disabled={saving} className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? "جاري الحفظ..." : "حفظ المقرر"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
