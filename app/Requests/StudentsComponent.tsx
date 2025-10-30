"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SearchIcon, TrashIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

interface Qualification {
  id?: number;
  qualificationName?: string;
  institution?: string;
  gradeName?: string;
  grade?: number;
  dateObtained?: string;
  qualification?: number;
  studentNationalNumber?: string;
}

interface Student {
  nationalId: string;
  fullName: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  email?: string;
  nationality?: string | number;
  militaryService?: string | number;
  grade?: string;
  phone?: string;
  address?: string;
  major?: string | number;
  gpa?: number | null;
  dateOfAcceptance?: string | null;
  dateOfBirth?: string;
  placeOfBirth?: string | null;
  profession?: string | null;
  qualifications?: Qualification[];
  departmentName?: string;
  programName?: string;
  collegeName?: string;
  universityName?: string;
  degreeId?: number | null;
  msarName?: string;
  degreeName?: string;
  step?: number;
}

interface Filters {
  degreeId: number | null;
  msarId: number | null;
}

// In Next.js App Router, page components should not accept custom props.

const DetailItem: React.FC<{
  label: string;
  value: string | number | null;
}> = ({ label, value }) => (
  <div className="text-sm">
    <span className="font-medium text-gray-700">{label}: </span>
    <span className="text-gray-900 font-bold">{value ?? ""}</span>
  </div>
);

const StudentDetailsModal: React.FC<{
  student: Student;
  onClose: () => void;
}> = ({ student, onClose }) => (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center bg-custom-teal text-white sticky top-0">
        <h2 className="text-lg font-bold">بيانات الطالب: {student.fullName}</h2>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
          <h3 className="md:col-span-2 text-custom-teal font-semibold border-b pb-2 mb-2">
            المعلومات الأساسية
          </h3>
          <DetailItem label="الرقم القومي" value={student.nationalId} />
          <DetailItem label="الاسم" value={student.fullName} />
          <DetailItem label="البريد الإلكتروني" value={student.email || ""} />
          <DetailItem label="رقم الهاتف" value={student.phone || ""} />
          <DetailItem label="الجنسية" value={student.nationality || ""} />
          <DetailItem
            label="الحالة العسكرية"
            value={student.militaryService || ""}
          />
          <DetailItem
            label="تاريخ الميلاد"
            value={student.dateOfBirth ? student.dateOfBirth.split("T")[0] : ""}
          />
          <DetailItem
            label="مكان الميلاد"
            value={student.placeOfBirth || "غير محدد"}
          />
          <DetailItem label="المهنة" value={student.profession || "غير محدد"} />
          <DetailItem label="العنوان" value={student.address || ""} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
          <h3 className="md:col-span-2 text-custom-teal font-semibold border-b pb-2 mb-2">
            المعلومات الأكاديمية
          </h3>
          <DetailItem
            label="الكلية"
            value={student.collegeName || "غير محدد"}
          />
          <DetailItem
            label="الجامعة"
            value={student.universityName || "غير محدد"}
          />
          <DetailItem
            label="القسم"
            value={student.departmentName || "غير محدد"}
          />
          <DetailItem
            label="البرنامج"
            value={student.programName || "غير محدد"}
          />
          <DetailItem label="التخصص" value={student.major || "غير محدد"} />
          <DetailItem label="الدرجة العلمية" value={student.degreeName || ""} />
          <DetailItem label="المسار" value={student.msarName || ""} />
          <DetailItem label="التقدير العام" value={student.grade || ""} />
          <DetailItem label="المعدل التراكمي" value={student.gpa ?? ""} />
          <DetailItem
            label="تاريخ القبول"
            value={
              student.dateOfAcceptance
                ? student.dateOfAcceptance.split("T")[0]
                : "غير محدد"
            }
          />
        </div>

        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="text-custom-teal font-semibold border-b pb-2 mb-2">
            المؤهلات السابقة
          </h3>
          {student.qualifications && student.qualifications.length > 0 ? (
            student.qualifications.map((q, idx) => (
              <div
                key={idx}
                className="mb-3 p-3 border-l-4 border-custom-teal bg-white shadow-sm"
              >
                <DetailItem
                  label="اسم المؤهل"
                  value={q.qualificationName || ""}
                />
                <DetailItem label="المؤسسة" value={q.institution || ""} />
                <DetailItem label="التقدير" value={q.gradeName ?? ""} />
                <DetailItem
                  label="تاريخ الحصول عليه"
                  value={q.dateObtained || ""}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600">لا توجد مؤهلات سابقة مسجلة.</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function StudentsComponent() {
  const params = useSearchParams();
  const deptParam = params.get("departmentId");
  const departmentId = deptParam ? Number(deptParam) : null;

  // Derive filters from URL params (if present)
  const filters: Filters = {
    degreeId: params.get("degreeId") ? Number(params.get("degreeId")) : null,
    msarId: params.get("msarId") ? Number(params.get("msarId")) : null,
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchNationalId, setSearchNationalId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

  // add-student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newStudent, setNewStudent] = useState<any>({
    nationalId: "",
    firstName: "",
    secondName: "",
    thirdName: "",
    email: "",
    nationality: null,
    dateOfBirth: "",
    placeOfBirth: "",
    profession: "",
    phone: "",
    address: "",
    militaryService: null,
    gpa: null,
    grade: null,
    major: null,
    notes: "",
    collegeId: null,
    universityId: null,
    qualifications: [],
  });

  const getHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [progRes, statusRes] = await Promise.all([
          fetch(`${apiUrl}/Lookups/Programs`, { headers: getHeaders() }),
          fetch(`${apiUrl}/Lookups/statuses`, { headers: getHeaders() }),
        ]);
        if (progRes.ok) {
          const progJson = await progRes.json();
          setPrograms(Array.isArray(progJson.data) ? progJson.data : []);
        }
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          setStatuses(Array.isArray(statusJson.data) ? statusJson.data : []);
        }
      } catch (e) {
        console.error("fetch lookups failed", e);
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (selectedProgram == null) {
        setDepartments([]);
        setSelectedDepartment(null);
        return;
      }
      try {
        const res = await fetch(
          `${apiUrl}/Departments/byProgram/${selectedProgram}`,
          { headers: getHeaders() }
        );
        if (!res.ok) return setDepartments([]);
        const result = await res.json();
        setDepartments(Array.isArray(result.data) ? result.data : []);
      } catch (e) {
        console.error("فشل تحميل الأقسام", e);
      }
    };
    fetchDepartments();
  }, [selectedProgram]);

  const router = useRouter();

  const handleRowClick = (student: any) => {
    router.push(`../../StudentDashboard?nationalId=${student.nationalId}`);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: string[] = [];

      if (departmentId != null)
        queryParams.push(`deptId=${encodeURIComponent(String(departmentId))}`);
      if (selectedProgram != null)
        queryParams.push(
          `programId=${encodeURIComponent(String(selectedProgram))}`
        );
      if (selectedDepartment != null) {
        const deptName = departments.find(
          (d) => d.id === selectedDepartment
        )?.name;
        if (deptName)
          queryParams.push(`department=${encodeURIComponent(deptName)}`);
      }
      if (selectedStatus != null) {
        const statusVal = statuses.find((s) => s.id === selectedStatus)?.value;
        if (statusVal)
          queryParams.push(`status=${encodeURIComponent(statusVal)}`);
      }
      if (searchNationalId)
        queryParams.push(`nationalId=${encodeURIComponent(searchNationalId)}`);

      if (filters?.degreeId != null)
        queryParams.push(
          `degreeId=${encodeURIComponent(String(filters.degreeId))}`
        );
      if (filters?.msarId != null)
        queryParams.push(
          `msarId=${encodeURIComponent(String(filters.msarId))}`
        );

      let url = `${apiUrl}/Student`;
      if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

      const res = await fetch(url, { headers: getHeaders() });
      const text = await res.text();
      let result: any = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error("Invalid JSON response: " + text.slice(0, 200));
      }

      if (!res.ok || !result?.succeeded) {
        throw new Error(result?.message || `Request failed (${res.status})`);
      }

      const data: Student[] = Array.isArray(result.data) ? result.data : [];
      setStudents(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "تعذر تحميل بيانات الطلاب");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [
    departmentId,
    searchNationalId,
    filters.degreeId,
    filters.msarId,
    selectedProgram,
    selectedDepartment,
    selectedStatus,
    departments,
    statuses,
  ]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (nationalId: string) => {
    if (!confirm(`هل أنت متأكد من حذف الطالب صاحب الرقم القومي ${nationalId}?`))
      return;
    try {
      const res = await fetch(`${apiUrl}/Student/${nationalId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.nationalId !== nationalId));
        alert("✅ تم حذف الطالب بنجاح");
      } else {
        alert("❌ فشل حذف الطالب");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Add student handlers
  const openAddModal = () => {
    setNewStudent({
      nationalId: "",
      firstName: "",
      secondName: "",
      thirdName: "",
      email: "",
      nationality: null,
      dateOfBirth: "",
      placeOfBirth: "",
      profession: "",
      phone: "",
      address: "",
      militaryService: null,
      gpa: null,
      grade: null,
      major: null,
      notes: "",
      collegeId: null,
      universityId: null,
      qualifications: [],
    });
    setShowAddModal(true);
  };

  const addQualification = () => {
    setNewStudent((prev: any) => ({
      ...prev,
      qualifications: [
        ...(prev.qualifications || []),
        { qualification: null, institution: "", grade: null, dateObtained: "" },
      ],
    }));
  };

  const removeQualification = (index: number) => {
    setNewStudent((prev: any) => {
      const q = [...(prev.qualifications || [])];
      q.splice(index, 1);
      return { ...prev, qualifications: q };
    });
  };

  const updateQualification = (index: number, key: string, value: any) => {
    setNewStudent((prev: any) => {
      const q = [...(prev.qualifications || [])];
      q[index] = { ...q[index], [key]: value };
      return { ...prev, qualifications: q };
    });
  };

  const handleAddStudent = async () => {
    // minimal validation
    if (!newStudent.nationalId || !newStudent.firstName) {
      return alert("الرجاء إدخال الرقم القومي والاسم الأول على الأقل");
    }
    setAdding(true);
    try {
      const body = {
        nationalId: String(newStudent.nationalId),
        firstName: newStudent.firstName,
        secondName: newStudent.secondName,
        thirdName: newStudent.thirdName,
        email: newStudent.email,
        nationality: newStudent.nationality,
        dateOfBirth: newStudent.dateOfBirth,
        placeOfBirth: newStudent.placeOfBirth,
        profession: newStudent.profession,
        phone: newStudent.phone,
        address: newStudent.address,
        militaryService: newStudent.militaryService,
        gpa: newStudent.gpa,
        grade: newStudent.grade,
        major: newStudent.major,
        notes: newStudent.notes,
        collegeId: newStudent.collegeId ?? 0,
        universityId: newStudent.universityId ?? 0,
        qualifications: (newStudent.qualifications || []).map((q: any) => ({
          qualification: q.qualification,
          institution: q.institution,
          grade: q.grade,
          dateObtained: q.dateObtained,
        })),
      };

      const res = await fetch(`${apiUrl}/Student/add`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!res.ok || (result && result.succeeded === false)) {
        const msg = result?.message || `فشل الإضافة (${res.status})`;
        throw new Error(msg);
      }

      alert("✅ تم إضافة الطالب بنجاح");
      setShowAddModal(false);
      // refresh table
      fetchStudents();
    } catch (e: any) {
      console.error("add student error:", e);
      alert(e?.message || "حدث خطأ أثناء إضافة الطالب");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-white p-4 rounded-lg shadow w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="col-span-1 flex items-center gap-2">
              <SearchIcon className="w-5 h-5 text-custom-teal" />
              <input
                type="text"
                placeholder="ابحث بالرقم القومي..."
                className="border rounded px-3 py-2 w-full text-black focus:ring-2 focus:ring-custom-teal"
                value={searchNationalId}
                onChange={(e) => setSearchNationalId(e.target.value)}
              />
            </div>

            {/* placeholder to keep layout spacing */}
            <div className="flex items-center gap-2"></div>

            <div className="flex justify-end md:justify-start gap-2">
              <button
                onClick={fetchStudents}
                className="bg-custom-teal text-white px-4 py-2 rounded-lg mr-2"
              >
                بحث
              </button>

              <button
                onClick={openAddModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
                title="إضافة طالب جديد"
              >
                ➕ إضافة طالب جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full text-sm text-right">
          <thead className="bg-custom-teal text-white">
            <tr>
              <th className="py-3 px-4">الرقم القومي</th>
              <th className="py-3 px-4">اسم الطالب</th>
              <th className="py-3 px-4">القسم</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-custom-teal">
                  جاري تحميل البيانات...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  لا توجد بيانات متاحة.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.nationalId}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td
                    className="py-3 px-4"
                    onClick={() => handleRowClick(student)}
                  >
                    {student.nationalId}
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={() => handleRowClick(student)}
                  >
                    {student.fullName}
                  </td>
                  <td
                    className="py-3 px-4"
                    onClick={() => handleRowClick(student)}
                  >
                    {student.departmentName || "غير محدد"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(student.nationalId);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="حذف الطالب"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Add student modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-custom-teal text-white sticky top-0">
              <h2 className="text-lg font-bold">إضافة طالب جديد</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  placeholder="الرقم القومي *"
                  value={newStudent.nationalId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, nationalId: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="الاسم الأول *"
                  value={newStudent.firstName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, firstName: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="الاسم الثاني"
                  value={newStudent.secondName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, secondName: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="الاسم الثالث"
                  value={newStudent.thirdName}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, thirdName: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="البريد الإلكتروني"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="رقم الهاتف"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, phone: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="تاريخ الميلاد (YYYY-MM-DD)"
                  value={newStudent.dateOfBirth}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="المهنة"
                  value={newStudent.profession}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, profession: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="العنوان"
                  value={newStudent.address}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, address: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                />
                <input
                  placeholder="المعدل التراكمي"
                  type="number"
                  step="0.01"
                  value={newStudent.gpa ?? ""}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      gpa: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">المؤهلات السابقة (اختياري)</h4>
                  <button
                    onClick={addQualification}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    إضافة مؤهل
                  </button>
                </div>

                {(newStudent.qualifications || []).length === 0 && (
                  <p className="text-sm text-gray-500">لا توجد مؤهلات مضافة.</p>
                )}

                {(newStudent.qualifications || []).map(
                  (q: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end mb-2"
                    >
                      <input
                        placeholder="كود المؤهل (رقم)"
                        type="number"
                        value={q.qualification ?? ""}
                        onChange={(e) =>
                          updateQualification(
                            idx,
                            "qualification",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="border rounded px-2 py-1"
                      />
                      <input
                        placeholder="المؤسسة"
                        value={q.institution || ""}
                        onChange={(e) =>
                          updateQualification(
                            idx,
                            "institution",
                            e.target.value
                          )
                        }
                        className="border rounded px-2 py-1"
                      />
                      <input
                        placeholder="التقدير (رقم)"
                        type="number"
                        value={q.grade ?? ""}
                        onChange={(e) =>
                          updateQualification(
                            idx,
                            "grade",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="border rounded px-2 py-1"
                      />
                      <div className="flex gap-2">
                        <input
                          placeholder="تاريخ الحصول (YYYY-MM-DD)"
                          value={q.dateObtained || ""}
                          onChange={(e) =>
                            updateQualification(
                              idx,
                              "dateObtained",
                              e.target.value
                            )
                          }
                          className="border rounded px-2 py-1"
                        />
                        <button
                          onClick={() => removeQualification(idx)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddStudent}
                  disabled={adding}
                  className="bg-custom-teal text-white px-4 py-2 rounded"
                >
                  {adding ? "جارٍ الإضافة..." : "إضافة وحفظ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
