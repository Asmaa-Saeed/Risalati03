"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

interface Filters {
  degreeId: number | null;
  msarId: number | null;
}

interface Degree {
  id: number;
  name: string;
}

interface Msar {
  id: number;
  name: string;
  degreeId: number;
}

export default function AdmissionRequestsComponent() {
  const params = useSearchParams();
  const departmentId = params.get("departmentId");

  const [filters, setFilters] = useState<Filters>({
    degreeId: null,
    msarId: null,
  });

  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [msars, setMsars] = useState<Msar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const getHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  useEffect(() => {
    setFilters({
      degreeId: params.get("degreeId") ? Number(params.get("degreeId")) : null,
      msarId: params.get("msarId") ? Number(params.get("msarId")) : null,
    });
  }, [params]);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [degreeRes, msarRes] = await Promise.all([
          fetch(`${apiUrl}/Degree/`, { headers: getHeaders() }),
          fetch(`${apiUrl}/Msar/`, { headers: getHeaders() }),
        ]);

        const degreeData = await degreeRes.json().catch(() => null);
        const msarData = await msarRes.json().catch(() => null);

        if (degreeData?.succeeded && Array.isArray(degreeData.data))
          setDegrees(degreeData.data);
        if (msarData?.succeeded && Array.isArray(msarData.data))
          setMsars(msarData.data);
      } catch (err) {
        console.error("فشل تحميل بيانات الفلاتر", err);
      }
    };
    fetchLookups();
  }, []);

  // ✅ تحميل الطلبات
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let url = `${apiUrl}/RegisterationCard`;
        if (departmentId) url += `?deptId=${departmentId}`;

        const res = await fetch(url, { headers: getHeaders() });
        const result = await res.json().catch(() => null);

        if (result?.succeeded && Array.isArray(result.data)) {
          setStudents(result.data);
          setError(null);
        } else {
          setStudents([]);
          setError("فشل تحميل البيانات");
        }
      } catch (err) {
        console.error(err);
        setError("فشل تحميل الطلبات");
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") fetchStudents();
  }, [departmentId]);

  // ✅ فلترة البيانات
  useEffect(() => {
    let filtered = [...students];

    if (filters.degreeId) {
      const selectedDegree = degrees.find((d) => d.id === filters.degreeId);
      if (selectedDegree) {
        filtered = filtered.filter((s) =>
          s.degreeName?.includes(selectedDegree.name)
        );
      }
    }

    if (filters.msarId) {
      const selectedMsar = msars.find((m) => m.id === filters.msarId);
      if (selectedMsar) {
        filtered = filtered.filter((s) =>
          s.degreeName?.includes(selectedMsar.name)
        );
      }
    }

    setFilteredStudents(filtered);
  }, [filters, students, degrees, msars]);

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

  const handlePrintAll = async () => {
    try {
      let url = `${apiUrl}/RegisterationCard/AllCardsPdf`;
      const queryParams: string[] = [];
      if (departmentId) queryParams.push(`deptId=${departmentId}`);
      if (queryParams.length > 0) url += "?" + queryParams.join("&");

      const res = await fetch(url, { method: "POST", headers: getHeaders() });
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size === 0) return alert("⚠️ لا يوجد ملف للطباعة");
        const urlBlob = URL.createObjectURL(blob);
        setPdfUrl(urlBlob);
        setShowPdfModal(true);
      } else alert("فشل إنشاء PDF");
    } catch {
      alert("حدث خطأ أثناء الطباعة");
    }
  };

  const handlePrintStudent = async (student: any) => {
    try {
      const res = await fetch(
        `${apiUrl}/RegisterationCard/StudentCardPdf?NationalId=${student.nationalId}`,
        { method: "POST", headers: getHeaders() }
      );
      if (res.ok) {
        const blob = await res.blob();
        if (blob.size === 0) return alert("⚠️ لا يوجد ملف للطباعة");
        const urlBlob = URL.createObjectURL(blob);
        setPdfUrl(urlBlob);
        setShowPdfModal(true);
      } else alert("فشل إنشاء PDF");
    } catch {
      alert("حدث خطأ أثناء الطباعة");
    }
  };

  const displayData = useMemo(() => filteredStudents, [filteredStudents]);

  return (
    <div className="w-full bg-custom-beige p-4 md:p-8">
      <div className="flex justify-end mb-4">
        <button
          className="bg-custom-teal text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-teal-700"
          onClick={handlePrintAll}
        >
          🖨 طباعة كل الطلبات
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-auto">
        <div className="bg-custom-teal text-white p-3 hidden md:grid md:grid-cols-7 gap-2 text-center font-semibold">
          <div>كود الطالب</div>
          <div>اسم الطالب</div>
          <div>الحالة</div>
          <div>رقم الهاتف</div>
          <div>القسم</div>
          <div>الدرجة العلمية</div>
          <div>إجراءات</div>
        </div>

        <div className="divide-y divide-gray-200 text-center">
          {error ? (
            <p className="p-4 text-red-600">{error}</p>
          ) : loading ? (
            <p className="p-4">⏳ جاري التحميل...</p>
          ) : displayData.length > 0 ? (
            displayData.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-1 md:grid-cols-7 gap-2 p-3 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => setSelectedStudent(student)}
              >
                <div>{student.nationalId}</div>
                <div>
                  {student.firstName} {student.secondName}
                </div>
                <div>{student.status}</div>
                <div>{student.phone}</div>
                <div>{student.departmentName}</div>
                <div>{student.degreeName}</div>
                <div
                  className="flex justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                    onClick={() => handleAccept(student.id)}
                  >
                    موافقة
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                    onClick={() => handleReject(student.id)}
                  >
                    رفض
                  </button>
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                    onClick={() => handlePrintStudent(student)}
                  >
                    طباعة
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">لا توجد طلبات</p>
          )}
        </div>
      </div>

      {/* ✅ مودال التفاصيل */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2">
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
                <b>الدرجة العلمية:</b> {selectedStudent.degreeName}
              </div>
              <div>
                <b>الحالة:</b> {selectedStudent.status}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedStudent(null)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ مودال PDF */}
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
