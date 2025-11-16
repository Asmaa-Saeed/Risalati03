"use client";

import { useState, useEffect } from "react";
import { addStudent } from "@/actions/student";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");

  // جديد: معرفة هل المستخدم أدمن
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // ====== Lookups ======
  const [nationalities, setNationalities] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [militaryServices, setMilitaryServices] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  type Qualification = {
    qualification: string;
    institution: string;
    grade: string;
    dateObtained: string;
  };

  const initialForm = {
    nationalId: "",
    firstName: "",
    secondName: "",
    thirdName: "",
    email: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    profession: "",
    phone: "",
    address: "",
    // intakeId: "",
    // degreeId: "",
    // dateOfAcceptance: "",
    militaryService: "",
    gpa: "",
    grade: "",
    majorId: "",
    notes: "",
    collegeId: "",
    universityId: "",
    qualifications: [
      {
        qualification: "",
        institution: "",
        grade: "",
        dateObtained: "",
      },
    ],
  };

  const [formData, setFormData] = useState(initialForm);

  // ====== Fetch Lookups ======
  const fetchLookupData = async (
    endpoint: string,
    setData: Function,
    token: string
  ) => {
    try {
      const response = await fetch(`${APIURL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const result = await response.json();
      setData(result.data || result);
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error);
    }
  };

  // نقرأ التوكن ونحدد هل المستخدم أدمن، ثم نجلب lookup data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // decode role quickly (الدالة موجودة أدناه)
    const role = getRoleFromToken(token);
    setIsAdmin(Boolean(role && String(role).toLowerCase().includes("admin")));

    fetchLookupData("/Lookups/nationalities", setNationalities, token);
    fetchLookupData("/Lookups/majors", setMajors, token);
    fetchLookupData("/Lookups/colleges", setColleges, token);
    fetchLookupData("/Lookups/grades", setGrades, token);
    fetchLookupData("/Lookups/Qualifications", setQualifications, token);
    fetchLookupData("/Lookups/militaryServices", setMilitaryServices, token);
    fetchLookupData("/Lookups/universities", setUniversities, token);
  }, [router]);

  // إذا المستخدم ليس أدمن ونوجد nationalId مخزن نملأ الحقل تلقائياً.
  // أما لو أدمن نترك الحقول فاضية ليضيف كل شيء بنفسه
  useEffect(() => {
    const storedNationalId = localStorage.getItem("nationalId");
    if (!storedNationalId) return;

    if (!isAdmin) {
      setFormData((prev) => ({ ...prev, nationalId: storedNationalId }));

      const fetchStudentData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${APIURL}/Student/getByNationalNum/${storedNationalId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          setFormData((prev) => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            secondName: data.secondName || prev.secondName,
            thirdName: data.thirdName || prev.thirdName,
            nationality: data.nationality || prev.nationality,
            dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
            placeOfBirth: data.placeOfBirth || prev.placeOfBirth,
            phone: data.phone || prev.phone,
            grade: data.grade || prev.grade,
            universityId: data.universityId?.toString() || prev.universityId,
            collegeId: data.collegeId?.toString() || prev.collegeId,
          }));
        } catch (err) {
          console.error("Error fetching student data:", err);
        }
      };

      fetchStudentData();
    } else {
      // admin: لا نملأ شيئاً — يجب أن يدخل كل الحقول بنفسه
      setFormData((prev) => ({ ...prev, nationalId: "" }));
    }
  }, [isAdmin]);

  // ====== Handle Input Change ======
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoBack = () => router.back();

  // ====== Handle Qualifications Change ======
  const handleQualificationChange = (
    index: number,
    field: keyof Qualification,
    value: string
  ) => {
    const updated = [...formData.qualifications];
    updated[index][field] = value;
    setFormData({ ...formData, qualifications: updated });
  };

  // ====== Add Qualification Row ======
  const addQualificationRow = () => {
    setFormData({
      ...formData,
      qualifications: [
        ...formData.qualifications,
        { qualification: "", institution: "", grade: "", dateObtained: "" },
      ],
    });
  };

  // ====== Remove Qualification Row ======
  const removeQualificationRow = (index: number) => {
    const updated = formData.qualifications.filter((_, i) => i !== index);
    setFormData({ ...formData, qualifications: updated });
  };

  function getRoleFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = JSON.parse(
        decodeURIComponent(
          atob(payload)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        )
      );
      // common claims
      if (typeof json.role === "string") return json.role;
      if (Array.isArray(json.role) && json.role.length) return json.role[0];
      if (typeof json.roles === "string") return json.roles;
      if (Array.isArray(json.roles) && json.roles.length) return json.roles[0];
      // MS schema
      const msRole =
        json["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      if (typeof msRole === "string") return msRole;
      if (Array.isArray(msRole) && msRole.length) return msRole[0];
    } catch (e) {
      // ignore decode errors
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // إذا أدمن: نتأكد أن كل الحقول المطلوبة موجودة (لا شيء static)
    if (isAdmin) {
      const requiredForAdmin = [
        "nationalId",
        "firstName",
        "secondName",
        "thirdName",
        "email",
        "nationality",
        "dateOfBirth",
        "placeOfBirth",
        "phone",
        "address",
        "grade",
        "universityId",
        "collegeId",
      ];

      const missing = requiredForAdmin.filter(
        (k) =>
          !(formData as any)[k] || String((formData as any)[k]).trim() === ""
      );

      // بالإضافة: تحقق أن هناك على الأقل مؤهل واحد مكتمل
      const incompleteQualification = formData.qualifications.some(
        (q) => !q.qualification || !q.institution || !q.grade || !q.dateObtained
      );

      if (
        missing.length ||
        formData.qualifications.length === 0 ||
        incompleteQualification
      ) {
        toast.error(
          `كمل الحقول المطلوبة للأدمن. الحقول الناقصة: ${
            missing.join(", ") || "مؤهلات"
          }`
        );
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("الرجاء تسجيل الدخول أولاً");
        setLoading(false);
        return;
      }

      if (!formData.qualifications.length) {
        toast.error("الرجاء إضافة مؤهل واحد على الأقل");
        setLoading(false);
        return;
      }

      const result = await addStudent(formData, token);
      console.log("📌 API Result:", result);

      if (result.success) {
        toast.success(result.message || "تم الحفظ بنجاح");
        const tokenRole = getRoleFromToken(token);
        const role = tokenRole;

        const isAdmin = role && String(role).toLowerCase().includes("admin");

        if (isAdmin) {
          router.back(); // صفحة الطلاب للمشرف/Admin
        } else {
          router.push("/StudentDashboard"); // صفحة الطالب العادية
        }
      } else {
        const errorMessage = result.message || "حدث خطأ أثناء الحفظ";
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("❌ خطأ أثناء الإرسال:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "حدث خطأ غير متوقع أثناء الإرسال";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-custom-beige">
      {/* Header */}
      <div className="py-4 md:py-6 px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center max-w-6xl mx-auto">
          {/* University Logo - Hidden on mobile */}
          <div className="hidden md:block w-32 lg:w-40">
            <Image
              src="/University-Logo.png"
              alt="شعار الجامعة"
              width={160}
              height={80}
              className="w-full h-auto object-contain"
              priority
            />
          </div>

          {/* Title - Always centered */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              البيانات الشخصية للطالب
            </h1>
          </div>

          {/* Faculty Logo - Hidden on mobile */}
          <div className="hidden md:block w-32 lg:w-40">
            <Image
              src="/Faculty-Logo.png"
              alt="شعار الكلية"
              width={160}
              height={80}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className=" rounded-xl bg-[#faf8f8] border border-gray-200 shadow-lg  overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* قسم البيانات الشخصية */}
            <div className="mb-8 pb-4 border-b border-gray-200">
              <div className="px-0 py-4 mb-4 border-b border-gray-200">
                <div className="border-b border-gray-200 pb-2">
                  {" "}
                  <h3 className="text-lg font-bold text-gray-800">
                    {" "}
                    <span className="bg-teal-100 text-teal-800 mt-4 px-4 py-1 rounded-full text-sm">
                      {" "}
                      البيانات الشخصية{" "}
                    </span>{" "}
                  </h3>{" "}
                </div>{" "}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الرقم القومي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرقم القومي
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
                      !isAdmin ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    placeholder="أدخل الرقم القومي"
                    minLength={10}
                    maxLength={20}
                    inputMode="numeric"
                    required={true}
                    readOnly={!isAdmin}
                  />
                </div>

                {/* الاسم الاول */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الاول
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="أدخل الاسم الأول"
                    required
                  />
                </div>

                {/* الاسم الثاني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الثاني
                  </label>
                  <input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="اسم الأب"
                    required
                  />
                </div>

                {/* الاسم الثالث */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الثالث
                  </label>
                  <input
                    type="text"
                    name="thirdName"
                    value={formData.thirdName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="اسم الجد"
                    required
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                {/* الجنسية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنسية
                  </label>
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر الجنسية</option>
                    {nationalities.map((n: any) => (
                      <option key={n.id} value={n.id}>
                        {n.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* تاريخ الميلاد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الميلاد
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                      required
                      min="1950-01-01"
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      اختر السنة أولاً لتسهيل الاختيار
                    </div> */}
                  </div>
                </div>

                {/* مكان الميلاد */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مكان الميلاد
                  </label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="المحافظة / الدولة"
                    required
                  />
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="0123456789"
                    required
                  />
                </div>

                {/* المهنة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المهنة
                  </label>
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر المهنة</option>
                    <option value="طالب">طالب</option>
                    <option value="موظف">موظف</option>
                    <option value="مهندس">مهندس</option>
                    <option value="طبيب">طبيب</option>
                    <option value="محامي">محامي</option>
                    <option value="محاسب">محاسب</option>
                    <option value="عاطل">عاطل</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* الجنس */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النوع
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    required
                  >
                    <option value="">اختر النوع</option>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                {/* الخدمة العسكرية - تظهر فقط للذكور */}
                {gender === "ذكر" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الخدمة العسكرية
                    </label>
                    <select
                      name="militaryService"
                      value={formData.militaryService}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                      required
                    >
                      <option value="">اختر حالة الخدمة العسكرية</option>
                      {militaryServices.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* العنوان */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    placeholder="المحافظة - المركز - القرية / الشارع"
                    required
                  />
                </div>
              </div>
            </div>

            {/* <hr className="my-8 border-gray-200 border-1 w-1/2 mx-auto " /> */}
            {/* قسم البيانات الأكاديمية (مضافة من الصفحة الثانية) */}
            <div className="mt-8">
              <div className="border-b border-gray-200 pb-2">
                {" "}
                <h3 className="text-lg font-bold text-gray-800">
                  {" "}
                  <span className="bg-teal-100 text-teal-800 mt-4 mb-6 px-4 py-1 rounded-full text-sm">
                    {" "}
                    البيانات الأكاديمية الخاصة بشهادة البكالوريوس{" "}
                  </span>{" "}
                </h3>{" "}
              </div>{" "}
              <div className="mt-4 space-y-6">
                {/* Grade */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التقدير التراكمي
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={(e) => handleChange(e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر التقدير</option>
                    {grades.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.value}
                      </option>
                    ))}
                  </select>
                </div>
                {/* الجامعة */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجامعة
                  </label>
                  <select
                    name="universityId"
                    value={formData.universityId}
                    onChange={(e) => handleChange(e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر الجامعة</option>
                    {universities.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.value}
                      </option>
                    ))}
                  </select>
                </div>
                {/* الكلية */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكلية
                  </label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={(e) => handleChange(e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر الكلية</option>
                    {colleges.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.value}
                      </option>
                    ))}
                  </select>
                </div>
                {/* GPA */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المعدل التراكمي (GPA) - للساعات المعتمدة
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={(e) => handleChange(e)}
                    placeholder="المعدل التراكمي"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                    step="0.01"
                    min="0"
                    max="4"
                  />
                </div>
                {/* Major */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التخصص
                  </label>
                  <select
                    value={formData.majorId}
                    onChange={(e) =>
                      setFormData({ ...formData, majorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  >
                    <option value="">اختر التخصص</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدرجات العلمية والمؤهلات الحاصل عليها الطالب
                  </label>

                  <div className="overflow-x-auto">
                    <table className="w-full border text-sm text-center border-gray-300 min-w-[600px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1 min-w-[120px]">
                            المؤهل
                          </th>
                          <th className="border px-2 py-1 min-w-[150px]">
                            جهة الحصول عليه
                          </th>
                          <th className="border px-2 py-1 min-w-[120px]">
                            التقدير العام
                          </th>
                          <th className="border px-2 py-1 min-w-[120px]">
                            تاريخ التخرج
                          </th>
                          <th className="border px-2 py-1 min-w-[60px]">حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.qualifications.map((q, index) => (
                          <tr key={index}>
                            {/* المؤهل من الـ API */}
                            <td className="border p-1">
                              <select
                                value={q.qualification}
                                onChange={(e) =>
                                  handleQualificationChange(
                                    index,
                                    "qualification",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                              >
                                <option value="">اختر المؤهل</option>
                                {qualifications.map((qual) => (
                                  <option key={qual.id} value={qual.id}>
                                    {qual.value}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* جهة الحصول عليه */}
                            <td className="border p-1">
                              <input
                                type="text"
                                value={q.institution}
                                onChange={(e) =>
                                  handleQualificationChange(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                                placeholder="اسم الجامعة / المعهد"
                              />
                            </td>

                            {/* التقدير العام */}
                            <td className="border p-1">
                              <select
                                value={q.grade}
                                onChange={(e) =>
                                  handleQualificationChange(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                              >
                                <option value="">اختر التقدير العام</option>
                                {grades.map((grade) => (
                                  <option key={grade.id} value={grade.id}>
                                    {grade.value}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* تاريخ التخرج */}
                            <td className="border p-1">
                              <input
                                type="date"
                                value={q.dateObtained}
                                onChange={(e) =>
                                  handleQualificationChange(
                                    index,
                                    "dateObtained",
                                    e.target.value
                                  )
                                }
                                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                                min="1950-01-01"
                                max={new Date().toISOString().split("T")[0]}
                              />
                            </td>

                            {/* حذف */}
                            <td className="border p-1">
                              <button
                                type="button"
                                onClick={() => removeQualificationRow(index)}
                                className="text-red-500 cursor-pointer hover:text-red-700"
                              >
                                ❌
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={() => addQualificationRow()}
                    className="mt-2 px-4 py-2 cursor-pointer bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center justify-center w-full"
                  >
                    ➕ إضافة مؤهل جديد
                  </button>
                </div>

                {/* Notes */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الملاحظات
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange(e)}
                    rows={4}
                    placeholder="الملاحظات"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-custom-teal focus:border-transparent"
                  />
                </div>
                {/* Message */}
                {message && (
                  <p className="w-full text-center mt-2 font-medium text-teal-600">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions - أزرار التحكم */}
            <div className="mt-10 flex justify-center space-between gap-4">
               <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-2.5 text-base cursor-pointer bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium border border-gray-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                العودة
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3 text-lg cursor-pointer bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium disabled:opacity-60 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الحفظ...
                  </span>
                ) : (
                  "حفظ البيانات وانتقال للصفحة التالية"
                )}
              </button>

             
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
