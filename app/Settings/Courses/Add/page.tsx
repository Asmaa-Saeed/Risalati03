"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// ✅ نضبط مسارات الخدمات حسب مكانها في مشروعك
import { DepartmentsService, type Department } from "@/lib/departments";
import { DegreesService, type Degree } from "@/lib/degrees";
import { TracksService, type LookupItem } from "@/lib/tracks";
import { SemestersService, type SemesterItem } from "@/lib/semesters";
import { CoursesService, type Course as CourseItem } from "@/lib/courses";
import { InstructorsService, type Instructor } from "@/lib/instructors";

// ✅ مخطط البيانات باستخدام Zod
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
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      creditHours: 3,
      isOptional: false,
      semester: "",
      departmentId: 0,
      degreeId: undefined,
      msarId: 0,
      prerequisites: [],
      description: "",
      instructors: [],
    },
  });

  const [loadingLookups, setLoadingLookups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [filteredDegrees, setFilteredDegrees] = useState<Degree[]>([]);
  const [tracks, setTracks] = useState<LookupItem[]>([]);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [allOptions, setAllOptions] = useState<CourseItem[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<Instructor[]>([]);
  const [prereqRows, setPrereqRows] = useState<string[]>([]);
  const [instructorRows, setInstructorRows] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Fetch initial data
  useEffect(() => {
    (async () => {
      try {
        const [deptRes, semestersRes, coursesRes, instructorsRes] = await Promise.all([
          DepartmentsService.getDepartments(),
          SemestersService.getSemesters(),
          CoursesService.getCourses(),
          InstructorsService.getInstructors(),
        ]);

        if (deptRes.success) setDepartments(deptRes.data);
        if (semestersRes.success) setSemesters(semestersRes.data);
        if (coursesRes.success) setAllOptions(coursesRes.data);
        if (instructorsRes.success) setInstructorOptions(instructorsRes.data as any);
      } catch (e) {
        setMessage({ type: "error", text: "حدث خطأ أثناء تحميل البيانات" });
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, []);

  // Fetch degrees when department changes
  const handleDepartmentChange = async (departmentId: number) => {
    setSelectedDepartment(departmentId);
    setSelectedDegree(null);
    setFilteredDegrees([]);
    setTracks([]);
    setValue('degreeId', 0);
    setValue('msarId', 0);

    if (!departmentId) return;
    
    setLoadingDegrees(true);
    try {
      // First, get all degrees
      const degreesRes = await DegreesService.getDegrees();
      if (degreesRes.succeeded) {
        // Filter degrees by the selected department on the client side
        const filtered = degreesRes.data.filter(degree => degree.departmentId === departmentId);
        setFilteredDegrees(filtered);
      }
    } catch (error) {
      console.error('Error loading degrees:', error);
      toast.error('حدث خطأ أثناء تحميل الدرجات العلمية');
    } finally {
      setLoadingDegrees(false);
    }
  };

  // Handle degree selection change
const handleDegreeChange = async (degreeId: number) => {
  setSelectedDegree(degreeId);
  setTracks([]);
  setValue('msarId', 0);

  if (!degreeId) return;
  
  setLoadingTracks(true);
  try {
    const tracksRes = await TracksService.getTracksByDegree(degreeId);
    if (tracksRes.succeeded) {
      setTracks(tracksRes.data.map((t: any) => ({ id: t.id, value: t.value })));
    }
  } catch (error) {
    toast.error('حدث خطأ أثناء تحميل المسارات');
  } finally {
    setLoadingTracks(false);
  }
};


  const filteredTracks = useMemo(() => {
    return tracks; // حالياً ما بنفلترش، لكن ده بيسمح لنا نفلتر لاحقاً حسب الدرجة أو القسم
  }, [tracks]);

  const onValid: SubmitHandler<FormData> = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        code: String(data.code ?? "").trim(),
        creditHours: Number(data.creditHours),
        isOptional: Boolean(data.isOptional),
        semester: String(data.semester).trim(),
        msarId: Number(data.msarId),
        prerequisites: Array.isArray(data.prerequisites)
          ? data.prerequisites.filter(Boolean)
          : [],
      };

      const res = await CoursesService.createCourse(payload as any);
      if (!res.success) throw new Error(res.message || "فشل حفظ المقرر");

      toast.success("تم حفظ المقرر بنجاح");
      setTimeout(() => router.back(), 600);
    } catch (e: any) {
      console.error("[AddCourse] Submit failed", e);
      toast.error(e?.message || "حدث خطأ في حفظ المقرر");
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
      errors.msarId?.message ||
      errors.instructors?.message;
    setMessage({ type: "error", text: firstError || "تحقق من الحقول المطلوبة" });
    setShowToast(true);
  };

  const goBack = () => router.back();

  return (
    <div className="min-h-screen w-full bg-custom-beige py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster 
        toastOptions={{
          duration: 1000,
          style: {
            direction: 'rtl',
            fontFamily: 'inherit',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            minWidth: '300px',
            maxWidth: '90vw',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">إضافة مقرر جديد</h1>
          <p className="text-gray-600 mt-1">قم بتعبئة الحقول التالية لإضافة مقرر</p>
        </div>
        <button
          onClick={goBack}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 w-full md:w-auto"
        >
          <span>العودة إلى الصفحة السابقة</span>
          <ArrowRight size={18} className="rtl:rotate-180" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loadingLookups ? (
          <div className="p-8 flex items-center justify-center text-gray-600">
            <Loader2 className="animate-spin mr-2" /> جاري تحميل البيانات...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onValid, handleInvalid)} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كود المقرر *</label>
                <input 
                  {...register("code")} 
                  type="text" 
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${errors.code ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} 
                  placeholder="مثال: CS101" 
                />
                {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم المقرر *</label>
                <input 
                  {...register("name")} 
                  type="text" 
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${errors.name ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} 
                  placeholder="مثال: مقدمة في علوم الحاسب" 
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">عدد الساعات *</label>
                <input 
                  {...register("creditHours", { valueAsNumber: true })} 
                  type="number" 
                  min={0} 
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${errors.creditHours ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`} 
                  placeholder="مثال: 3" 
                />
                {errors.creditHours && <p className="mt-2 text-sm text-red-600">{errors.creditHours.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الفصل الدراسي *</label>
                <select
                  {...register("semester")}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${errors.semester ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <option value="">اختر الفصل الدراسي</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.value}</option>
                  ))}
                </select>
                {errors.semester && <p className="mt-2 text-sm text-red-600">{errors.semester.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">حالة المادة (اختياري/إجباري)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف (اختياري)</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="اكتب وصفاً مختصراً للمقرر (اختياري)"
                  className="w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 border-gray-200 hover:border-gray-300"
                />
              </div>
              {/* -------------------- Degree and Department -------------------- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">القسم</label>
                <select 
                  {...register("departmentId", { 
                    valueAsNumber: true,
                    onChange: (e) => handleDepartmentChange(Number(e.target.value))
                  })} 
                  className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${errors.departmentId ? "border-red-500" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <option value={0}>اختر القسم</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.departmentId && <p className="mt-2 text-sm text-red-600">{errors.departmentId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الدرجة العلمية
                  {selectedDepartment && loadingDegrees && (
                    <span className="text-xs text-gray-500 mr-2">جاري التحميل...</span>
                  )}
                </label>
                <select 
                  {...register("degreeId", { 
                    valueAsNumber: true,
                    disabled: !selectedDepartment || loadingDegrees || filteredDegrees.length === 0,
                    onChange: (e) => handleDegreeChange(Number(e.target.value))
                  })} 
                  className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.degreeId ? "border-red-500" : 
                    !selectedDepartment || filteredDegrees.length === 0 ? "bg-gray-50 cursor-not-allowed" : 
                    "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value={0}>
                    {filteredDegrees.length === 0 && selectedDepartment 
                      ? "لا توجد درجات علمية متاحة لهذا القسم" 
                      : "اختر الدرجة العلمية"}
                  </option>
                  {filteredDegrees.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                      {degree.name}
                    </option>
                  ))}
                </select>
                {selectedDepartment && !loadingDegrees && filteredDegrees.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    ⓘ هذا القسم لا يحتوي على درجات علمية. الرجاء اختيار قسم آخر.
                  </p>
                )}
                {errors.degreeId && <p className="mt-2 text-sm text-red-600">{errors.degreeId.message}</p>}
              </div>
              {/* -------------------- Track -------------------- */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المسار *
                  {selectedDegree && loadingTracks && (
                    <span className="text-xs text-gray-500 mr-2">جاري التحميل...</span>
                  )}
                </label>
                <select 
                  {...register("msarId", { 
                    valueAsNumber: true,
                    disabled: !selectedDegree || loadingTracks || tracks.length === 0
                  })} 
                  className={`w-full px-5 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 ${
                    errors.msarId ? "border-red-500" : 
                    !selectedDegree || tracks.length === 0 ? "bg-gray-50 cursor-not-allowed" : 
                    "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option value={0}>
                    {tracks.length === 0 && selectedDegree
                      ? "لا توجد مسارات متاحة لهذه الدرجة العلمية"
                      : "اختر المسار"}
                  </option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.value}
                    </option>
                  ))}
                </select>
                {selectedDegree && !loadingTracks && tracks.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    ⓘ لا توجد مسارات متاحة للدرجة العلمية المحددة. الرجاء اختيار درجة علمية أخرى.
                  </p>
                )}
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 bg-gray-50/80 p-6">
              <button 
                type="button" 
                onClick={goBack} 
                className="flex-1 sm:flex-none px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed" 
                disabled={saving}
              >
                العودة
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-teal-700 hover:to-blue-700 shadow-sm hover:shadow-md transition-all disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>حفظ المقرر</span>
                  </>
                )}
              </button>
            </div>
          </form>
      )} 
      </div>
    </div>
    </div>
  );
}
