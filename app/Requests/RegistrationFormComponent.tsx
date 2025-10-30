"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TrashIcon, PrinterIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

interface RegistrationForm {
  id: number;
  studentName: string;
  generalDegree: number;
  degreeName: string;
  fileName: number;
  fileNameText: string;
  nationalId: string;
  dataFillDate: string;
  departmentCouncilApprovalDate: string | null;
  collegeCouncilApprovalDate: string | null;
  universityVicePresidentApprovalDate: string | null;
  notes: string | null;
  uploadedFile: any | null;
}

interface Filters {
  degreeId: number | null;
  msarId: number | null;
}

export default function RegistrationFormsComponent() {
  const params = useSearchParams();
  const deptParam = params.get("departmentId");
  const departmentId = deptParam ? Number(deptParam) : null;

  const filters: Filters = {
    degreeId: params.get("degreeId") ? Number(params.get("degreeId")) : null,
    msarId: params.get("msarId") ? Number(params.get("msarId")) : null,
  };

  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(
    null
  );
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

  // 🔹 تحميل استمارات القيد
  const fetchForms = useCallback(async () => {
    if (typeof window === "undefined") return; // SSR protection
    setLoading(true);
    try {
      const queryParams: string[] = [];

      if (departmentId) queryParams.push(`deptId=${departmentId}`);
      if (filters.degreeId) queryParams.push(`degreeId=${filters.degreeId}`);
      if (filters.msarId) queryParams.push(`msarId=${filters.msarId}`);
      if (searchTerm)
        queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      let url = `${apiUrl}/RegistrationForms`;
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      const res = await fetch(url, { headers: getHeaders() });
      const text = await res.text();
      let result: any = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid JSON response from API");
      }

      if (!res.ok || !result?.succeeded) {
        throw new Error(result?.message || `Request failed (${res.status})`);
      }

      const fetchedForms: RegistrationForm[] = Array.isArray(result.data)
        ? result.data
        : [];

      setForms(fetchedForms);
      setError(null);
    } catch (err: any) {
      console.error("fetchForms error:", err);
      setError(err?.message || "فشل تحميل استمارات القيد");
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId, filters.degreeId, filters.msarId, searchTerm]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // 🔹 فلترة محلية للبحث فقط
  const filteredForms = useMemo(() => {
    if (!searchTerm) return forms;
    const lower = searchTerm.toLowerCase();
    return forms.filter(
      (f) =>
        f.nationalId?.toLowerCase().includes(lower) ||
        f.studentName?.toLowerCase().includes(lower) ||
        f.degreeName?.toLowerCase().includes(lower)
    );
  }, [forms, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!confirm(`هل أنت متأكد من حذف الاستمارة رقم ${id}؟`)) return;
    try {
      const res = await fetch(`${apiUrl}/RegistrationForms/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        alert("✅ تم الحذف بنجاح");
        setForms((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert("❌ فشل الحذف");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handlePrintForm = async (form: RegistrationForm) => {
    try {
      const res = await fetch(
        `${apiUrl}/RegistrationForms/generate-pdf/${form.id}`,
        { method: "POST", headers: getHeaders() }
      );

      if (res.ok) {
        const blob = await res.blob();
        if (blob.size === 0) return alert("⚠️ لا يوجد ملف للطباعة");
        const urlBlob = URL.createObjectURL(blob);
        setPdfUrl(urlBlob);
        setShowPdfModal(true);
      } else {
        alert("فشل إنشاء ملف PDF");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الطباعة");
    }
  };

  return (
    <div className="w-full bg-custom-beige p-4 md:p-8">
      <div className="mb-4 flex gap-3 items-center">
        <input
          type="text"
          placeholder="ابحث بالرقم القومي / اسم الطالب / الدرجة..."
          className="border rounded px-3 py-2 w-full text-black focus:ring-2 focus:ring-custom-teal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={fetchForms}
          className="bg-custom-teal text-white px-4 py-2 rounded-lg"
        >
          بحث
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <div className="bg-custom-teal text-white p-3 hidden md:grid grid-cols-6 text-center font-semibold text-sm">
          <div>الرقم القومي</div>
          <div>اسم الطالب</div>
          <div>تاريخ التقديم</div>
          <div>الدرجة العلمية</div>
          <div>ملاحظات</div>
          <div>إجراءات</div>
        </div>

        <div className="divide-y divide-gray-200 text-center">
          {error ? (
            <p className="p-4 text-red-600">{error}</p>
          ) : loading ? (
            <p className="p-4">⏳ جاري التحميل...</p>
          ) : filteredForms.length > 0 ? (
            filteredForms.map((form) => (
              <div
                key={form.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => setSelectedForm(form)}
              >
                <div>{form.nationalId}</div>
                <div>{form.studentName}</div>
                <div>{new Date(form.dataFillDate).toLocaleDateString()}</div>
                <div>{form.degreeName}</div>
                <div>{form.notes || "-"}</div>
                <div className="flex justify-center md:justify-end gap-2">
                  <button
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(form.id);
                    }}
                  >
                    <TrashIcon className="w-4 h-4" /> حذف
                  </button>

                  <button
                    className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintForm(form);
                    }}
                  >
                    <PrinterIcon className="w-4 h-4" /> طباعة
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-4 text-gray-500">لا توجد استمارات مطابقة للبحث.</p>
          )}
        </div>
      </div>

      {/* ✅ مودال التفاصيل */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl relative overflow-hidden">
            <div className="bg-custom-teal text-white px-6 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">تفاصيل استمارة القيد</h2>
              <button
                onClick={() => setSelectedForm(null)}
                className="text-xl hover:text-gray-200"
              >
                ✖
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-right text-sm">
              <div>
                <b>الاسم:</b> {selectedForm.studentName}
              </div>
              <div>
                <b>الرقم القومي:</b> {selectedForm.nationalId}
              </div>
              <div>
                <b>الدرجة العلمية:</b> {selectedForm.degreeName}
              </div>
              <div>
                <b>اسم الملف:</b> {selectedForm.fileNameText}
              </div>
              <div>
                <b>ملاحظات:</b> {selectedForm.notes || "لا يوجد ملاحظات"}
              </div>
              <div>
                <b>تاريخ التقديم:</b>{" "}
                {new Date(selectedForm.dataFillDate).toLocaleDateString()}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                onClick={() => setSelectedForm(null)}
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
