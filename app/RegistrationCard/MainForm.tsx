"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export type FormType =
  | "application"
  | "registration"
  | "suspension"

  | "withdrawal"
  | "other"
  | null;

interface MainFormProps {
  setActivate: (value: FormType) => void;
}

type Option = { id: number; value: string };

const MainForm = ({ setActivate }: MainFormProps) => {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    nationalId: "",
    phoneNumber: "",
    grade: "",
    universityId: "",
    collegeId: "",
    departmentId: "",
    degreeId: "",
    masarId: "",
    semesterId: "",
    languageId: "",
    programId: "",
    universityName: "",
    collegeName: "",
    requestTypeId: "",
    requestTypeName: "",
    year: "",
    BachelorDegree: null as File | null,
    MasterDegree: null as File | null,
    EquivalencyDegree: null as File | null,
  });

  const [kindOfRequests, setKindOfRequests] = useState<Option[]>([]);
  const [universities, setUniversities] = useState<Option[]>([]);
  const [colleges, setColleges] = useState<Option[]>([]);
  const [degrees, setDegrees] = useState<Option[]>([]);
  const [masars, setMasars] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [majors, setMajors] = useState<Option[]>([]);
  const [grades, setGrades] = useState<Option[]>([]);
  const [programs, setPrograms] = useState<
    { id: number; value: string; type: string }[]
  >([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [years, setYears] = useState<Option[]>([]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "requestTypeId") {
      const selectedOption = kindOfRequests.find(
        (req) => req.id.toString() === value
      );
      if (selectedOption) {
        setForm((prev) => ({
          ...prev,
          requestTypeId: selectedOption.id.toString(),
          requestTypeName: selectedOption.value,
        }));

        const formTypeMap: Record<number, FormType> = {
          1: "application",
          2: "registration",
          3: "suspension",
          4: "withdrawal",
          5: "other",
        };
        const formType = formTypeMap[selectedOption.id] || null;
        if (formType) setActivate(formType);
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["png", "jpg", "jpeg"].includes(ext!)) {
        setForm((prev) => ({ ...prev, [name]: file }));
      } else {
        alert("مسموح فقط بصور بصيغ PNG، JPG، JPEG");
        e.target.value = "";
      }
    }
  };

  const fetchData = async (
    endpoint: string,
    setter: (data: Option[]) => void
  ) => {
    try {
      const res = await fetch(`${APIURL}/Lookups/${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setter(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setter([]);
    }
  };

  useEffect(() => {
    fetchData("kind-of-requests", setKindOfRequests);
    fetchData("universities", setUniversities);
    fetchData("colleges", setColleges);
    fetchData("departments", setDepartments);
    fetchData("degrees", setDegrees);
    fetchData("majors", setMajors);
    fetchData("grades", setGrades);
    fetchData("masars", setMasars);
    fetchData("semesters", setSemesters);
    fetchData("languages", setLanguages);

    // Programs
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${APIURL}/Lookups/Programs`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Error fetching programs");
        const data = await res.json();
        setPrograms(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrograms();

    const fetchYears = async () => {
      try {
        const res = await fetch(`${APIURL}/Lookups/Intakes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Error fetching Intakes");
        const data = await res.json();
        setYears(data.map((y: any) => ({ id: y.id, value: y.value })));
      } catch (err) {
        console.error("Error fetching years:", err);
        setYears([]);
      }
    };

    fetchYears();
  }, []);

  const handleProgramChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
     const { name, value } = e.target;
    // ✅ لما المستخدم يختار الدرجة العلمية
  if (name === "degreeId") {
    setForm((prev) => ({ ...prev, degreeId: value, masarId: "" })); // reset المسار

    try {
      const res = await fetch(
        `${APIURL}/Lookups/GetMsaratByDegreeId?degreeId=${value}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Error fetching masars");

      const data = await res.json();

      // لو الـ API بيرجع Array زي [{ id, value }]
      setMasars(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching masars:", err);
      setMasars([]);
    }

    return;
  }
    const programId = e.target.value;
    
    setForm((prev) => ({ ...prev, programId }));

    try {
      const res = await fetch(`${APIURL}/Departments?id=${programId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Error fetching departments");
      const result = await res.json();
      setDepartments(
        Array.isArray(result.data)
          ? result.data.map((d: any) => ({ id: d.id, value: d.name }))
          : []
      );
    } catch (err) {
      console.error(err);
      setDepartments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        let apiKey = key;
        if (key === "phoneNumber") apiKey = "Phone";
        else if (key === "firstName") apiKey = "FirstName";
        else if (key === "secondName") apiKey = "SecondName";
        else if (key === "thirdName") apiKey = "ThirdName";
        else if (key === "requestTypeId") apiKey = "KindOfRequest";
        else if (key === "semesterId") apiKey = "Semester";
        else if (key === "languageId") apiKey = "Language";
        if (key === "year" && value) {
          formData.append("Year", value.toString());
        } else if (value instanceof File) formData.append(apiKey, value);
        else if (value) formData.append(apiKey, value as string);
      });

      // قبل إرسال الطلب
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const res = await fetch(
        `${APIURL}/RegisterationCard/AddRegistrationCard`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        }
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      JSON.parse(text);

      alert("تم إرسال الطلب بنجاح ✅");
      router.push(
        `/StudentDashboard?nationalId=${encodeURIComponent(form.nationalId)}`
      );
    } catch (err) {
      console.error("Error generating registration card:", err);
    }
  };

  // ====== Fetch Student Data by National ID ======
  useEffect(() => {
    const storedNationalId = localStorage.getItem("nationalId");
    const token = localStorage.getItem("token");

    if (storedNationalId && token) {
      const fetchStudentData = async () => {
        try {
          const res = await fetch(
            `${APIURL}/Student/getByNationalNum/${storedNationalId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            }
          );

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const response = await res.json();
          const student = response.data;

          setForm((prev) => ({
            ...prev,
            firstName: student.firstName || "",
            secondName: student.secondName || "",
            thirdName: student.thirdName || "",
            nationalId: student.nationalId || storedNationalId,
            universityName: student.universityName || "",
            collegeName: student.collegeName || "",
            phoneNumber: student.phone || "",
            grade: student.grade || "",
            nationality: student.nationality || "",
            email: student.email || "",
            address: student.address || "",
            profession: student.profession || "",
            dateOfBirth:
              student.dateOfBirth &&
              student.dateOfBirth !== "0001-01-01T00:00:00"
                ? student.dateOfBirth.split("T")[0]
                : "",
            placeOfBirth: student.placeOfBirth || "",
            degreeId: student.degreeId?.toString() || "",
          }));

          console.log("✅ Student data loaded:", student);
        } catch (err) {
          console.error("❌ Error fetching student data:", err);
        }
      };

      fetchStudentData();
    }
  }, []);

  return (
    <div className="min-h-screen bg-custom-beige p-4">
      {" "}
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Header */}{" "}
        <div className="text-center flex flex-col md:flex-row items-center justify-between gap-4 md:gap-16 mb-4 md:mb-8">
          {" "}
          <div className="hidden md:block w-40 md:w-48">
            {" "}
            <Image
              src="/University-Logo.png"
              alt="شعار الجامعة"
              width={200}
              height={100}
              className="w-full h-auto object-contain"
              priority
            />{" "}
          </div>{" "}
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {" "}
            نموذج تقديم طلب{" "}
          </h1>{" "}
          <div className="hidden md:block w-40 md:w-48">
            {" "}
            <Image
              src="/Faculty-Logo.png"
              alt="شعار الكلية"
              width={200}
              height={100}
              className="w-full h-auto object-contain"
              priority
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
          {" "}
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 lg:p-10">
            {" "}
            <form onSubmit={handleSubmit} dir="rtl" className="space-y-9">
              {" "}
              {/* نوع الطلب */}{" "}
              <div className="flex items-center justify-center mb-6 bg-gray-50 p-4 rounded-lg">
                {" "}
                <label className="ml-4 text-gray-700">نوع الطلب:</label>{" "}
                <select
                  name="requestTypeId"
                  value={form.requestTypeId}
                  onChange={handleFormChange}
                  className="w-full md:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  {" "}
                  <option value="">اختر نوع الطلب</option>{" "}
                  {kindOfRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {" "}
                      {request.value}{" "}
                    </option>
                  ))}{" "}
                </select>{" "}
              </div>{" "}
              {/* Personal Information Section */}{" "}
              <div className="space-y-6">
                {" "}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {" "}
                  {/* First Name */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الاسم الأول{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* Second Name */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الاسم الثاني{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="secondName"
                      value={form.secondName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* Third Name */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الاسم الثالث{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="thirdName"
                      value={form.thirdName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* National ID */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الرقم القومي{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="nationalId"
                      value={form.nationalId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* Phone Number */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      رقم الهاتف{" "}
                    </label>{" "}
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Academic Information Section */}{" "}
              <div className="space-y-6 mt-8">
                {" "}
                <div className="border-b border-gray-200 pb-2">
                  {" "}
                  <h3 className="text-lg font-bold text-gray-800">
                    {" "}
                    <span className="bg-teal-100 text-teal-800 px-4 py-1 rounded-full text-sm">
                      {" "}
                      البيانات الأكاديمية الخاصة بشهادة البكالوريوس{" "}
                    </span>{" "}
                  </h3>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {" "}
                  {/* University */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الجامعة{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="universityName"
                      value={form.universityName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* College */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الكلية{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="collegeId"
                      value={form.collegeName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />{" "}
                  </div>{" "}
                  {/* Grade */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      التقدير{" "}
                    </label>{" "}
                    <input
                      type="text"
                      name="grade"
                      value={form.grade}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-not-allowed bg-gray-100"
                      required
                      readOnly
                    />
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Academic Information Section */}{" "}
              <div className="space-y-6 mt-8">
                {" "}
                <div className="border-b border-gray-200 pb-2">
                  {" "}
                  <h3 className="text-lg font-bold text-gray-800">
                    {" "}
                    <span className="bg-teal-100 text-teal-800 px-4 py-1 rounded-full text-sm">
                      {" "}
                      بيانات الطلب{" "}
                    </span>{" "}
                  </h3>{" "}
                </div>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {" "}
                  {/* Program */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      البرنامج
                    </label>{" "}
                    <select
                      name="programId"
                      value={form.programId}
                      onChange={handleProgramChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر البرنامج</option>{" "}
                      {programs.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {" "}
                          {prog.value} (
                          {prog.type === "academic" ? "أكاديمي" : "مهني"}){" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* Department */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      القسم  
                    </label>{" "}
                    <select
                      name="departmentId"
                      value={form.departmentId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر القسم</option>{" "}
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {" "}
                          {dept.value}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                 
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الدرجة العلمية{" "}
                    </label>{" "}
                    <select
                      name="degreeId"
                      value={form.degreeId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر الدرجة العلمية</option>{" "}
                      {degrees.map((masar) => (
                        <option key={masar.id} value={masar.id}>
                          {" "}
                          {masar.value}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* المسار */}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                    المسار{" "}
                    </label>{" "}
                    <select
                      name="masarId"
                      value={form.masarId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر المسار</option>{" "}
                      {masars.map((masar) => (
                        <option key={masar.id} value={masar.id}>
                          {" "}
                          {masar.value}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* Year */}{" "}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      العام الدراسي
                    </label>
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">اختر العام الدراسي</option>
                      {years.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Semester */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      الفصل الدراسي{" "}
                    </label>{" "}
                    <select
                      name="semesterId"
                      value={form.semesterId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر الفصل الدراسي</option>{" "}
                      {semesters.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                          {" "}
                          {sem.value}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* Language */}{" "}
                  <div className="space-y-1">
                    {" "}
                    <label className="block text-sm font-medium text-gray-700">
                      {" "}
                      لغة الدراسة{" "}
                    </label>{" "}
                    <select
                      name="languageId"
                      value={form.languageId}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {" "}
                      <option value="">اختر لغة الدراسة</option>{" "}
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {" "}
                          {lang.value}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </div>{" "}
                  {/* File Uploads */}{" "}
                  <div className="col-span-full w-full">
                    {" "}
                    <div className="space-y-4 w-full">
                      {" "}
                      <div className="space-y-1 w-full">
                        {" "}
                        <label className="block text-sm font-medium text-gray-700">
                          {" "}
                          شهادة البكالوريوس{" "}
                        </label>{" "}
                        <input
                          type="file"
                          name="BachelorDegree"
                          onChange={handleFileChange}
                          accept=".png, .jpg, .jpeg"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          required
                          title="اختر ملف"
                          dir="rtl"
                        />{" "}
                      </div>{" "}
                      <div className="space-y-1 w-full">
                        {" "}
                        <label className="block text-sm font-medium text-gray-700">
                          {" "}
                          شهادة الماجستير (في حالة التقديم على الدكتوراه){" "}
                        </label>{" "}
                        <input
                          type="file"
                          name="MasterDegree"
                          onChange={handleFileChange}
                          accept=".png, .jpg, .jpeg"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          title="اختر ملف"
                          dir="rtl"
                        />{" "}
                      </div>{" "}
                      <div className="space-y-1 w-full">
                        {" "}
                        <label className="block text-sm font-medium text-gray-700">
                          {" "}
                          شهادة المعادلة (في حالة حصول الطالب على معادلة لكلية
                          التجارة){" "}
                        </label>{" "}
                        <input
                          type="file"
                          name="EquivalencyDegree"
                          onChange={handleFileChange}
                          accept=".png, .jpg, .jpeg"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                          title="اختر ملف"
                          dir="rtl"
                        />{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Buttons */}{" "}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                {" "}
                <button
                  type="button"
                  onClick={() => setActivate(null as FormType)}
                  className="border-teal-600 border font-bold cursor-pointer text-teal-600 px-6 py-2 rounded-full hover:bg-teal-600 hover:text-white transition-colors w-full sm:w-auto text-center"
                >
                  {" "}
                  رجوع{" "}
                </button>{" "}
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 cursor-pointer font-bold hover:text-white transition-colors w-full sm:w-auto text-center"
                >
                  {" "}
                  حفظ{" "}
                </button>{" "}
              </div>{" "}
            </form>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default MainForm;
