"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function AccountingPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // فلترة
  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  const [selectedProgram, setSelectedProgram] = useState<number | "">("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // مودال عرض الـ PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const router = useRouter();

  // 🟢 Helper: headers مع التوكن
  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const handleGoBack = () => {
    router.back();
  };

  // تحميل البرامج والحالات عند بداية التشغيل
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [programRes, statusRes] = await Promise.all([
          fetch(`${apiUrl}/Lookups/Programs`, { headers: getHeaders() }),
          fetch(`${apiUrl}/Lookups/statuses`, { headers: getHeaders() }),
        ]);
        setPrograms(await programRes.json());
        setStatuses(await statusRes.json());
      } catch (err) {
        setError("فشل تحميل بيانات الفلاتر");
      }
    };
    fetchLookups();
  }, []);

  // تحميل الأقسام عند تغيير البرنامج
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedProgram) {
        setDepartments([]);
        setSelectedDepartment("");
        return;
      }
      try {
        const res = await fetch(
          `${apiUrl}/Departments/byProgram/${selectedProgram}`,
          { headers: getHeaders() }
        );
        const result = await res.json();
        setDepartments(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError("فشل تحميل الأقسام");
      }
    };
    fetchDepartments();
  }, [selectedProgram]);

  // تحميل الطلاب عند تغيير أي فلتر
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let url = `${apiUrl}/RegisterationCard?`;
        if (selectedProgram) url += `programId=${selectedProgram}&`;
        if (selectedDepartment)
          url += `department=${
            departments.find((d) => d.id === selectedDepartment)?.name
          }&`;
        if (selectedStatus)
          url += `status=${
            statuses.find((s) => s.id === selectedStatus)?.value
          }&`;

        const res = await fetch(url, { headers: getHeaders() });
        const result = await res.json();
        setStudents(Array.isArray(result.data) ? result.data : []);
        setError(null);
      } catch (err) {
        setError("فشل تحميل الطلبة");
        setStudents([]);
      }
      setLoading(false);
    };
    fetchStudents();
  }, [selectedProgram, selectedDepartment, selectedStatus]);

  // موافقة طالب
  const handleAccept = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/RegisterationCard/${id}/accept`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: "مقبول", statusId: 2 } : s
          )
        );
      }
    } catch {
      alert("حدث خطأ أثناء الموافقة");
    }
  };

  // رفض طالب
  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`${apiUrl}/RegisterationCard/${id}/reject`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: "مرفوض", statusId: 3 } : s
          )
        );
      }
    } catch {
      alert("حدث خطأ أثناء الرفض");
    }
  };

  // طباعة كل الطلبات حسب الفلاتر
  const handlePrintAll = async () => {
    try {
      let url = `${apiUrl}/RegisterationCard/AllCardsPdf`;

      const queryParams: string[] = [];
      if (selectedProgram) queryParams.push(`programId=${selectedProgram}`);
      if (selectedDepartment) queryParams.push(`deptId=${selectedDepartment}`);

      if (queryParams.length > 0) {
        url += "?" + queryParams.join("&");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size === 0) {
          alert("⚠️ لم يتم العثور على ملف للطباعة");
          return;
        }
        const urlBlob = URL.createObjectURL(blob);
        setPdfUrl(urlBlob);
        setShowPdfModal(true);
      } else {
        alert("فشل في إنشاء ملف PDF");
      }
    } catch {
      alert("حدث خطأ أثناء الطباعة");
    }
  };

  // طباعة طلب معين
  const handlePrintStudent = async (student: any) => {
    try {
      const res = await fetch(
        `${apiUrl}/RegisterationCard/StudentCardPdf?NationalId=${student.nationalId}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size === 0) {
          alert("⚠️ لم يتم العثور على ملف للطباعة");
          return;
        }
        const urlBlob = URL.createObjectURL(blob);
        setPdfUrl(urlBlob);
        setShowPdfModal(true);
      } else {
        alert("فشل في إنشاء ملف PDF");
      }
    } catch {
      alert("حدث خطأ أثناء طباعة الطلب");
    }
  };

  return (
    <div className="min-h-screen bg-custom-beige flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-65 bg-custom-teal text-white p-6 flex flex-col justify-between md:min-h-screen">
        <div>
          <div className="text-center mb-8">
            <div className="text-lg font-semibold tracking-wide">
              نظام إدارة الدراسات العليا
            </div>
          </div>
          {/* الفلترة */}
          <div className="space-y-4 bg-custom-beige text-black p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">تصفية النتائج:</h3>
            <select
              className="w-full px-3 py-2 rounded border border-gray-300 text-black focus:ring-2 focus:ring-custom-teal"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(Number(e.target.value) || "")}
            >
              <option value="">البرنامج</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.value}
                </option>
              ))}
            </select>
            <select
              className="w-full px-3 py-2 rounded border border-gray-300 text-black focus:ring-2 focus:ring-custom-teal"
              value={selectedDepartment}
              onChange={(e) =>
                setSelectedDepartment(Number(e.target.value) || "")
              }
              disabled={!departments.length}
            >
              <option value="">القسم</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              className="w-full px-3 py-2 rounded border border-gray-300 text-black focus:ring-2 focus:ring-custom-teal"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value) || "")}
            >
              <option value="">حالة الطلب</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.value}
                </option>
              ))}
            </select>
            <button
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition mt-2"
              onClick={() => {
                setSelectedProgram("");
                setSelectedDepartment("");
                setSelectedStatus("");
              }}
            >
              🔄 عرض جميع الطلبات
            </button>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black cursor-pointer transition">
            <span>⚙️</span>
            <span>الإعدادات</span>
          </div>
          <div className="space-y-4 mt-8">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-custom-teal px-4 py-3 rounded-lg font-bold transition shadow-md"
              title="العودة للصفحة السابقة"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right-to-line transform rotate-180"
              >
                <path d="M17 12H3" />
                <path d="m6 15-3-3 3-3" />
                <path d="M21 12h-2" />
              </svg>
              العودة للخلف
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black cursor-pointer transition">
            <span>🚪</span>
            <span>تسجيل خروج</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full">
        <div className="bg-custom-beige text-white p-4 flex justify-end">
          <button
            className="bg-custom-teal cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-semibold shadow transition"
            onClick={handlePrintAll}
          >
            🖨 طباعة كل الطلبات
          </button>
        </div>

        {/* جدول الطلاب */}
        <div className="flex-1 p-2 md:p-8 overflow-x-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-auto">
            {/* Header */}
            <div className="bg-custom-teal text-white p-3 hidden md:block">
              <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm">
                <div>كود الطالب</div>
                <div>اسم الطالب</div>
                <div>الحالة</div>
                <div>رقم التليفون</div>
                <div>القسم</div>
                <div>الدرجة العلمية</div>
                <div>الإجراءات</div>
              </div>
            </div>
            {/* Data */}
            <div className="divide-y divide-gray-200 text-center">
              {error ? (
                <p className="p-4 text-center text-red-600">{error}</p>
              ) : loading ? (
                <p className="p-4 text-center">جارٍ تحميل البيانات...</p>
              ) : students.length > 0 ? (
                students.map((student: any, index: number) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 p-3 hover:bg-gray-50 items-center cursor-pointer transition"
                    onClick={() => setSelectedStudent(student)}
                  >
                    {/* Mobile Card */}
                    <div className="md:hidden flex flex-col gap-1">
                      <span className="font-bold text-custom-teal">
                        {student.firstName} {student.secondName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {student.nationalId}
                      </span>
                      <span className="text-xs">
                        {student.departmentName || "-"}
                      </span>
                      <span className="text-xs">{student.status || "-"}</span>
                      <span className="text-xs">{student.phone || "-"}</span>
                      <span className="text-xs">
                        {student.degreeName || "-"}
                      </span>
                    </div>
                    {/* Desktop Table */}
                    <div className="hidden md:block break-words">
                      {student.nationalId}
                    </div>
                    <div className="hidden md:block break-words">
                      {student.firstName} {student.secondName}
                    </div>
                    <div className="hidden md:block break-words">
                      {student.status || "-"}
                    </div>
                    <div className="hidden md:block break-words">
                      {student.phone || "-"}
                    </div>
                    <div className="hidden md:block break-words">
                      {student.departmentName || "-"}
                    </div>
                    <div className="hidden md:block break-words">
                      {student.degreeName || "-"}
                    </div>
                    {/* الأزرار */}
                    <div
                      className="flex gap-2 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs transition"
                        onClick={() => handleAccept(student.id)}
                      >
                        موافقة
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs transition"
                        onClick={() => handleReject(student.id)}
                      >
                        رفض
                      </button>
                      <button
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-xs transition"
                        onClick={() => handlePrintStudent(student)}
                      >
                        طباعة
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">لا يوجد طلاب</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Popup تفاصيل الطالب */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl relative overflow-hidden">
            <div className="bg-custom-teal text-white px-6 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">تفاصيل الطلب</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-xl hover:text-gray-200"
              >
                ✖
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-right text-sm">
              <div>
                <b>الرقم القومي:</b> {selectedStudent.nationalId}
              </div>
              <div>
                <b>الاسم:</b> {selectedStudent.firstName}{" "}
                {selectedStudent.secondName} {selectedStudent.thirdName}
              </div>
              <div>
                <b>الجامعة:</b> {selectedStudent.universityName}
              </div>
              <div>
                <b>الكلية:</b> {selectedStudent.collegeName}
              </div>
              <div>
                <b>القسم:</b> {selectedStudent.departmentName}
              </div>
              <div>
                <b>التخصص:</b> {selectedStudent.major}
              </div>
              <div>
                <b>الدرجة العلمية:</b> {selectedStudent.degreeName}
              </div>
              <div>
                <b>التقدير:</b> {selectedStudent.grade}
              </div>
              <div>
                <b>الفصل الدراسي:</b> {selectedStudent.semester}
              </div>
              <div>
                <b>اللغة:</b> {selectedStudent.language}
              </div>
              <div>
                <b>الهاتف:</b> {selectedStudent.phone}
              </div>
              <div>
                <b>الحالة:</b> {selectedStudent.status}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                onClick={() => setSelectedStudent(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup عرض PDF */}
      {showPdfModal && pdfUrl && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white w-11/12 h-5/6 rounded-xl shadow-xl relative">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => setShowPdfModal(false)}
            >
              إغلاق
            </button>
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-b-xl"
              style={{ border: "none" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
