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

interface Props {
  filters: {
    degreeId: number | null;
    msarId: number | null;
  };
}

export default function RegistrationFormComponent({ filters }: Props) {
  const params = useSearchParams();
  const deptParam = params.get("departmentId");
  const departmentId = deptParam ? Number(deptParam) : null;

  const [filtersState, setFilters] = useState<Filters>({
    degreeId: null,
    msarId: null,
  });

  useEffect(() => {
    setFilters({
      degreeId: params.get("degreeId") ? Number(params.get("degreeId")) : null,
      msarId: params.get("msarId") ? Number(params.get("msarId")) : null,
    });
  }, [params]);

  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(
    null
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [approvalDates, setApprovalDates] = useState({
    departmentCouncilApprovalDate: "",
    collegeCouncilApprovalDate: "",
    universityVicePresidentApprovalDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const getAuthHeaderOnly = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const getJsonHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: string[] = [];

      if (departmentId) queryParams.push(`deptId=${departmentId}`);
      if (filters?.degreeId) queryParams.push(`degreeId=${filters.degreeId}`);
      if (filters?.msarId) queryParams.push(`msarId=${filters.msarId}`);
      if (searchTerm)
        queryParams.push(`search=${encodeURIComponent(searchTerm)}`);

      let url = `${apiUrl}/RegistrationForms`;
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      console.log("Fetching URL:", url);

      const res = await fetch(url, { headers: getJsonHeaders() });
      const text = await res.text();
      console.log("API Response:", text);

      const result = text ? JSON.parse(text) : {};

      if (!res.ok || !result?.succeeded) {
        throw new Error(result?.message || "فشل تحميل البيانات");
      }

      setForms(Array.isArray(result.data) ? result.data : []);
      setError(null);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err?.message || "⚠️ فشل تحميل البيانات");
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId, searchTerm, filters]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

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
        headers: getJsonHeaders(),
      });
      if (!res.ok) return alert("❌ فشل الحذف");

      alert("✅ تم الحذف بنجاح");
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error(error);
      alert("⚠️ حدث خطأ أثناء الحذف");
    }
  };

  const handlePrintForm = async (form: RegistrationForm) => {
    try {
      const res = await fetch(
        `${apiUrl}/RegistrationForms/generate-pdf/${form.id}`,
        { method: "POST", headers: getJsonHeaders() }
      );

      if (!res.ok) return alert("فشل إنشاء ملف PDF");

      const blob = await res.blob();
      if (blob.size === 0) return alert("⚠️ لا يوجد ملف للطباعة");
      const urlBlob = URL.createObjectURL(blob);

      setPdfUrl(urlBlob);
      setShowPdfModal(true);
    } catch (err) {
      console.error(err);
      alert("⚠️ حدث خطأ أثناء الطباعة");
    }
  };

  const openDetail = (form: RegistrationForm) => {
    setSelectedForm(form);
    setIsEditing(false);
    setSelectedFile(null);
    setApprovalDates({
      departmentCouncilApprovalDate:
        form.departmentCouncilApprovalDate?.split("T")[0] ?? "",
      collegeCouncilApprovalDate:
        form.collegeCouncilApprovalDate?.split("T")[0] ?? "",
      universityVicePresidentApprovalDate:
        form.universityVicePresidentApprovalDate?.split("T")[0] ?? "",
    });
  };

  const handleUpdateForm = async () => {
    if (!selectedForm) return;
    setSaving(true);

    try {
      const updateData = {
        id: selectedForm.id,
        departmentCouncilApprovalDate:
          approvalDates.departmentCouncilApprovalDate || null,
        collegeCouncilApprovalDate:
          approvalDates.collegeCouncilApprovalDate || null,
        universityVicePresidentApprovalDate:
          approvalDates.universityVicePresidentApprovalDate || null,
        formImage: null,
        fileUploadDate: new Date().toISOString(),
      };

      console.log("Sending data:", updateData);

      const res = await fetch(
        `${apiUrl}/RegistrationForms/${selectedForm.id}`,
        {
          method: "PUT",
          headers: {
            ...getJsonHeaders(),
            Accept: "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server response:", errorText);
        throw new Error(errorText || "فشل تحديث البيانات");
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append("formImage", selectedFile);

        const uploadRes = await fetch(
          `${apiUrl}/RegistrationForms/upload/${selectedForm.id}`,
          {
            method: "POST",
            headers: getAuthHeaderOnly(),
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("فشل رفع الملف");
        }
      }

      alert("✅ تم التعديل بنجاح");
      setIsEditing(false);
      setSelectedFile(null);
      fetchForms();
      setSelectedForm(null);
    } catch (err: any) {
      console.error("❌ خطأ في التحديث:", err);
      alert(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
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
                onClick={() => openDetail(form)}
              >
                <div>{form.nationalId}</div>
                <div>{form.studentName}</div>
                <div>{new Date(form.dataFillDate).toLocaleDateString()}</div>
                <div>{form.degreeName}</div>
                <div>{form.notes || "-"}</div>

                <div className="flex justify-center md:justify-end gap-2">
                  <button
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(form.id);
                    }}
                  >
                    <TrashIcon className="w-4 h-4" /> حذف
                  </button>

                  <button
                    className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs"
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
            <p className="p-4 text-gray-500">لا توجد نتائج مطابقة للبحث.</p>
          )}
        </div>
      </div>

      {selectedForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl overflow-hidden">
            <div className="bg-custom-teal text-white px-6 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold">
                {isEditing
                  ? "تعديل موافقات استمارة القيد"
                  : "تفاصيل استمارة القيد"}
              </h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    setSelectedForm(null);
                    setIsEditing(false);
                    setSelectedFile(null);
                  }}
                  className="text-xl hover:text-gray-200"
                >
                  ✖
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-right text-sm">
              <div>
                <b>الاسم:</b> <span>{selectedForm.studentName}</span>
              </div>
              <div>
                <b>الرقم القومي:</b> <span>{selectedForm.nationalId}</span>
              </div>
              <div>
                <b>الدرجة العلمية:</b> <span>{selectedForm.degreeName}</span>
              </div>
              <div>
                <b>اسم الملف:</b> <span>{selectedForm.fileNameText}</span>
              </div>
              <div>
                <b>ملاحظات:</b>{" "}
                <span>{selectedForm.notes || "لا يوجد ملاحظات"}</span>
              </div>
              <div>
                <b>تاريخ التقديم:</b>{" "}
                <span>
                  {new Date(selectedForm.dataFillDate).toLocaleDateString()}
                </span>
              </div>

              <div>
                <b>موافقة مجلس القسم:</b>
                {isEditing ? (
                  <input
                    type="date"
                    className="border p-2 w-full rounded"
                    value={approvalDates.departmentCouncilApprovalDate}
                    onChange={(e) =>
                      setApprovalDates((s) => ({
                        ...s,
                        departmentCouncilApprovalDate: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <span>
                    {selectedForm.departmentCouncilApprovalDate
                      ? new Date(
                          selectedForm.departmentCouncilApprovalDate
                        ).toLocaleDateString()
                      : "غير موافق"}
                  </span>
                )}
              </div>

              <div>
                <b>موافقة مجلس الكلية:</b>
                {isEditing ? (
                  <input
                    type="date"
                    className="border p-2 w-full rounded"
                    value={approvalDates.collegeCouncilApprovalDate}
                    onChange={(e) =>
                      setApprovalDates((s) => ({
                        ...s,
                        collegeCouncilApprovalDate: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <span>
                    {selectedForm.collegeCouncilApprovalDate
                      ? new Date(
                          selectedForm.collegeCouncilApprovalDate
                        ).toLocaleDateString()
                      : "غير موافق"}
                  </span>
                )}
              </div>

              <div>
                <b>موافقة نائب رئيس الجامعة:</b>
                {isEditing ? (
                  <input
                    type="date"
                    className="border p-2 w-full rounded"
                    value={approvalDates.universityVicePresidentApprovalDate}
                    onChange={(e) =>
                      setApprovalDates((s) => ({
                        ...s,
                        universityVicePresidentApprovalDate: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <span>
                    {selectedForm.universityVicePresidentApprovalDate
                      ? new Date(
                          selectedForm.universityVicePresidentApprovalDate
                        ).toLocaleDateString()
                      : "غير موافق"}
                  </span>
                )}
              </div>

              <div>
                <b>الملف المرفوع:</b>{" "}
                {selectedForm.uploadedFile ? (
                  <a
                    href={selectedForm.uploadedFile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    عرض
                  </a>
                ) : (
                  <span>لا يوجد ملف</span>
                )}
              </div>

              {isEditing && (
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">
                    رفع ملف جديد (اختياري)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-100">
              {!isEditing && (
                <button
                  className="bg-blue-600 text-white px-3 py-1.5 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  تعديل
                </button>
              )}
              {!isEditing ? (
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    setSelectedForm(null);
                    setIsEditing(false);
                  }}
                >
                  إغلاق
                </button>
              ) : (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleUpdateForm}
                    disabled={saving}
                  >
                    {saving ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setApprovalDates({
                        departmentCouncilApprovalDate:
                          selectedForm.departmentCouncilApprovalDate?.split(
                            "T"
                          )[0] ?? "",
                        collegeCouncilApprovalDate:
                          selectedForm.collegeCouncilApprovalDate?.split(
                            "T"
                          )[0] ?? "",
                        universityVicePresidentApprovalDate:
                          selectedForm.universityVicePresidentApprovalDate?.split(
                            "T"
                          )[0] ?? "",
                      });
                    }}
                  >
                    إلغاء
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
            />
          </div>
        </div>
      )}
    </div>
  );
}
