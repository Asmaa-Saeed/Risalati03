 "use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import Toast from "@/app/Component/Toast";
import { DepartmentsService, type Department } from "@/lib/departments";
import { DegreesService, type Degree } from "@/lib/degrees";
import { TracksService, type LookupItem } from "@/lib/tracks";
import { SemestersService, type SemesterItem } from "@/lib/semesters";
import { CoursesService, type Course } from "@/lib/courses";
import { getAllCourses } from "@/actions/courseActions";
import { InstructorsService, type Instructor } from "@/lib/instructors";

// Schema for update (matches UpdateCourseData requirements)
const schema = z.object({
  id: z.string().min(1),
  code: z.string().min(1, "كود المقرر مطلوب"),
  name: z.string().min(1, "اسم المقرر مطلوب"),
  creditHours: z.number().int().min(0, "عدد الساعات غير صالح"),
  isOptional: z.boolean(),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"), // will hold numeric id as string
  departmentId: z.number().int().optional(),
  degreeId: z.number().int().optional(),
  msarId: z.number().int().optional(),
  prerequisites: z.array(z.string()), // course IDs
  description: z.string().optional(),
  instructors: z.array(z.string()).optional(), // nationalIds
});

type FormData = z.infer<typeof schema>;

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { id: "", code: "", name: "", creditHours: 3, isOptional: false, semester: "", departmentId: undefined, degreeId: undefined, msarId: undefined, prerequisites: [], description: "", instructors: [] },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [tracks, setTracks] = useState<LookupItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<Instructor[]>([]);

  const [prereqRows, setPrereqRows] = useState<string[]>([]);
  const [instructorRows, setInstructorRows] = useState<string[]>([]);

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
        if (coursesRes.success) setAllCourses(coursesRes.data);
        if (instructorsRes.success) setInstructorOptions(instructorsRes.data as any);

        // Find the course by id from the fetched list (robust id matching)
        let list: any[] = (coursesRes.success ? (coursesRes.data as any[]) : []);
        const wanted = String(courseId ?? "");
        let current: any = list.find((c: any) => {
          const candidates = [c?.id, c?.Id, c?.courseId, c?.CourseId, c?.code, c?.Code]
            .map((v) => (v != null ? String(v) : ""));
          return candidates.includes(wanted);
        });
        // Fallback: try matching by code equality ignoring case
        if (!current) {
          current = list.find((c: any) => String(c?.code ?? c?.Code ?? "").toLowerCase() === wanted.toLowerCase());
        }
        // Fallback: fetch via actions getAllCourses if list is empty or not found
        if (!current) {
          const alt = await getAllCourses();
          if (alt.success && Array.isArray(alt.data)) {
            list = alt.data as any[];
            current = list.find((c: any) => {
              const candidates = [c?.id, c?.Id, c?.courseId, c?.CourseId, c?.code, c?.Code]
                .map((v) => (v != null ? String(v) : ""));
              return candidates.includes(wanted) || String(c?.code ?? c?.Code ?? "").toLowerCase() === wanted.toLowerCase();
            });
          }
        }
        if (!current) {
          if (typeof window !== 'undefined') {
            console.warn('[EditCourse] Course not found', {
              wanted,
              sampleItemKeys: list[0] ? Object.keys(list[0]) : [],
              listLength: list.length,
            });
          }
          throw new Error("لم يتم العثور على المقرر المطلوب");
        }

        // Map semester to numeric id string
        const rawSem = String(current.semester ?? "").trim();
        let semesterValue = rawSem;
        const isNumeric = /^\d+$/.test(rawSem);
        if (!isNumeric && semestersRes.success) {
          const match = semestersRes.data.find((s) => s.value === rawSem);
          if (match) semesterValue = String(match.id);
        }

        // Map prerequisites codes to IDs
        const codeToId: Record<string, string> = {};
        (coursesRes.success ? coursesRes.data : []).forEach((c: Course) => { codeToId[c.code] = c.id; });
        const prereqIds = Array.isArray(current.prerequisites) ? current.prerequisites.map((p: any) => codeToId[String(p)] || String(p)).filter(Boolean) : [];

        // Map instructors to nationalIds if available, else leave blank for user selection
        const instructorNationalIds = Array.isArray((current as any).instructors)
          ? (current as any).instructors.map((i: any) => i?.nationalId ?? i?.NationalId ?? i?.id).filter(Boolean).map(String)
          : [];

        reset({
          id: String(current.id ?? current.Id ?? current.courseId ?? current.CourseId ?? ""),
          code: current.code,
          name: current.name,
          creditHours: current.creditHours,
          isOptional: current.isOptional,
          semester: semesterValue,
          departmentId: undefined,
          degreeId: undefined,
          msarId: undefined,
          prerequisites: prereqIds,
          description: current.description || "",
          instructors: instructorNationalIds,
        });
        setPrereqRows(prereqIds);
        setInstructorRows(instructorNationalIds);
      } catch (e: any) {
        setMessage({ type: "error", text: e?.message || "حدث خطأ أثناء تحميل البيانات" });
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, reset]);

  // Sync rows to form values
  useEffect(() => {
    const sub = watch((values) => {
      if (Array.isArray(values.prerequisites)) setPrereqRows(values.prerequisites as string[]);
      if (Array.isArray(values.instructors)) setInstructorRows(values.instructors as string[]);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const filteredTracks = useMemo(() => tracks, [tracks]);

  const onValid: SubmitHandler<FormData> = async (data) => {
    setSaving(true);
    try {
      const payload = {
        id: data.id,
        code: String(data.code ?? "").trim(),
        name: String(data.name ?? "").trim(),
        creditHours: Number(data.creditHours),
        isOptional: Boolean(data.isOptional),
        semester: String(data.semester).trim(),
        prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites.filter(Boolean) : [],
        description: data.description || "",
        instructors: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [],
      };

      const res = await CoursesService.updateCourse(payload as any);
      if (!res.success) throw new Error(res.message || "فشل حفظ التعديلات");

      setMessage({ type: "success", text: res.message || "تم حفظ التعديلات بنجاح" });
      setShowToast(true);
      setTimeout(() => router.push("/Settings/Courses"), 600);
    } catch (e: any) {
      if (typeof window !== 'undefined') console.error('[EditCourse] Submit failed', { error: e, message: e?.message });
      setMessage({ type: "error", text: e?.message || "حدث خطأ في حفظ التعديلات" });
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
          <h1 className="text-2xl font-bold text-gray-900">تعديل مقرر</h1>
          <p className="text-gray-600">قم بتحديث بيانات المقرر ثم احفظ التعديلات</p>
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
        {loading ? (
          <div className="p-8 flex items-center justify-center text-gray-600">
            <Loader2 className="animate-spin mr-2" /> جاري تحميل البيانات...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onValid, handleInvalid)} className="p-8 space-y-6">
            <input type="hidden" {...register("id")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">حالة المادة (اختياري/إجباري)</label>
                <select
                  {...register("isOptional", { setValueAs: (v) => v === "true" })}
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
                  className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                />
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
                                  next[idx] = e.target.value; // store course id
                                  setPrereqRows(next);
                                  setValue("prerequisites", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                                }}
                              >
                                <option value="">اختر كورس</option>
                                {allCourses.map((c) => (
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
                                className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover;border-gray-300"
                                value={val}
                                onChange={(e) => {
                                  const next = [...instructorRows];
                                  next[idx] = e.target.value; // nationalId string
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
                {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
