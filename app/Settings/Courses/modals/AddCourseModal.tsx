"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { type CreateCourseData, type Course } from "@/lib/courses";
import { DepartmentsService, type Department } from "@/lib/departments";
import { DegreesService, type Degree } from "@/lib/degrees";
import { TracksService, type LookupItem } from "@/lib/tracks";
import { SemestersService, type SemesterItem } from "@/lib/semesters";
import { CoursesService, type Course as CourseItem } from "@/lib/courses";
import { InstructorsService, type Instructor } from "@/lib/instructors";

const schema = z.object({
  code: z.string().min(1, "كود المقرر مطلوب"),
  name: z.string().min(1, "اسم المقرر مطلوب"),
  creditHours: z.number().int().min(0, "عدد الساعات غير صالح"),
  isOptional: z.boolean(),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  departmentId: z.number().int().min(1, "القسم مطلوب"),
  degreeId: z.number().int().min(1, "الدرجة العلمية مطلوبة"),
  msarId: z.number().int().min(1, "المسار مطلوب"),
  prerequisites: z.array(z.string()),
  description: z.string().optional(),
  instructors: z.array(z.string()).min(1, "يجب إضافة محاضر واحد على الأقل"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCourseData) => Promise<void>;
  loading?: boolean;
  allCourses: Course[]; // for prerequisites selection
}

export default function AddCourseModal({ isOpen, onClose, onSubmit, loading = false, allCourses }: Props) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateCourseData>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", creditHours: 3, isOptional: false, semester: "", departmentId: 0, degreeId: 0, msarId: 0, prerequisites: [], description: "", instructors: [] },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [tracks, setTracks] = useState<LookupItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [allOptions, setAllOptions] = useState<CourseItem[]>([]);
  const [prereqRows, setPrereqRows] = useState<string[]>([]); // store selected course codes
  const [instructorOptions, setInstructorOptions] = useState<Instructor[]>([]);
  const [instructorRows, setInstructorRows] = useState<string[]>([]); // store selected instructor ids

  const degreeId = watch("degreeId");

  useEffect(() => {
    const load = async () => {
      const errs: string[] = [];
      try {
        console.log("[AddCourseModal] Fetching lookups...");
        const [deptRes, degreesRes, tracksRes, semestersRes, coursesRes, instructorsRes] = await Promise.all([
          DepartmentsService.getDepartments(),
          DegreesService.getDegrees(),
          TracksService.getTracks(),
          SemestersService.getSemesters(),
          CoursesService.getCourses(),
          InstructorsService.getInstructors(),
        ]);
        console.log("[AddCourseModal] Departments:", deptRes);
        console.log("[AddCourseModal] Degrees:", degreesRes);
        console.log("[AddCourseModal] Tracks:", tracksRes);
        console.log("[AddCourseModal] Semesters:", semestersRes);
        console.log("[AddCourseModal] All Courses:", coursesRes);
        console.log("[AddCourseModal] Instructors:", instructorsRes);

        if (deptRes.success) setDepartments(deptRes.data); else errs.push(deptRes.message || "فشل تحميل الأقسام");
        if (degreesRes.succeeded) setDegrees(degreesRes.data); else errs.push(degreesRes.message || "فشل تحميل الدرجات");
        if (tracksRes.succeeded) {
          setTracks(tracksRes.data.map((t: any) => ({ id: t.id, value: t.name })));
        } else {
          errs.push(tracksRes.message || "فشل تحميل المسارات");
        }
        if (semestersRes.success) setSemesters(semestersRes.data); else errs.push(semestersRes.message || "فشل تحميل الفصول الدراسية");
        if (coursesRes.success) setAllOptions(coursesRes.data); else errs.push(coursesRes.message || "فشل تحميل قائمة المقررات");
        if (instructorsRes.success) setInstructorOptions(instructorsRes.data as any); else errs.push(instructorsRes.message || "فشل تحميل قائمة المحاضرين");
      } catch (e) {
        console.error("[AddCourseModal] Lookup fetch error:", e);
        errs.push("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoadErrors(errs);
      }
    };
    load();
  }, []);

  // Initialize prereqRows from form defaults if any
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
    // If backend associates tracks with degrees, filter when degreeId is set
    return tracks; // could be filtered by selected degree if available
  }, [tracks, degreeId]);

  const onValid: SubmitHandler<CreateCourseData> = async (data) => {
    await onSubmit(data);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-2xl font-bold text-gray-900">إضافة مقرر</h2>
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
                  <option key={s.id} value={s.value}>{s.value}</option>
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
                                // sync to form value
                                setValue("prerequisites", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                              }}
                            >
                              <option value="">اختر كورس</option>
                              {allOptions.map((c) => (
                                <option key={c.id} value={c.code}>{c.name || c.code}</option>
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
                </div>              </div>
            </div>

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
                                next[idx] = e.target.value;
                                setInstructorRows(next);
                                setValue("instructors", next.filter(Boolean), { shouldDirty: true, shouldValidate: true });
                              }}
                            >
                              <option value="">اختر محاضر</option>
                              {instructorOptions.map((ins) => (
                                <option key={ins.id} value={ins.id}>{ins.name}</option>
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
            <button type="button" onClick={handleClose} className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400" disabled={loading}>إلغاء</button>
            <button type="submit" disabled={loading} className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {loading ? "جاري الحفظ..." : "حفظ المقرر"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

                   