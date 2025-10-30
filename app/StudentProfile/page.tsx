"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaGraduationCap,
  FaLayerGroup,
  FaUniversity,
  FaIdCard,
  FaCalendarAlt,
  FaBriefcase,
  FaCheckCircle,
  FaSpinner,
  FaBook,
  FaFileAlt,
} from "react-icons/fa";

interface Qualification {
  id: number;
  qualificationName: string;
  gradeName: string;
  institution: string;
  enQualification: number;
  enGrade: number;
  dateObtained: string;
  studentNationalNumber: string;
}

interface StudentProfileData {
  nationalId: string;
  fullName: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  email: string;
  nationality: string;
  militaryService: string;
  grade: string;
  phone: string;
  address: string;
  major: string;
  collegeName: string;
  universityName: string;
  gpa: number;
  degreeId: number;
  dateOfAcceptance: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  profession: string | null;
  step: number;
  qualifications: Qualification[];
}

const APIURL = process.env.NEXT_PUBLIC_API_URL;

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "غير متوفر" : value;
  const valueColor =
    displayValue === "غير متوفر" ? "text-gray-400" : "text-gray-800";

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 border-b last:border-b-0">
      <div className="shrink-0 grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <div className="flex-1 text-right">
        {(() => {
          const isMissing = displayValue === "غير متوفر";
          const labelClass = "text-sm sm:text-lg font-bold text-gray-800";
          const valueClass = isMissing
            ? "text-xs sm:text-sm font-medium text-gray-400"
            : "text-xs sm:text-sm font-medium text-gray-500";
          return (
            <>
              <p className={labelClass}>{label}</p>
              <p className={valueClass}>{displayValue}</p>
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState("");
  const [nationalId, setNationalId] = useState<string | null>(null);
  const router = useRouter();

  // ✅ تحميل الرقم القومي من localStorage بعد تحميل الصفحة
  useEffect(() => {
    const storedId = localStorage.getItem("nationalId");
    setNationalId(storedId);
  }, []);

  const handleGoBack = () => router.back();

  const getHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString.startsWith("0001-01-01")) return "غير محدد";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (!nationalId) return;

    const loadStudent = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${APIURL}/Student/getByNationalNum/${nationalId}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        const json = await res.json();

        if (!res.ok || !json.succeeded) {
          setServerMessage(json.message || "حدث خطأ أثناء جلب البيانات");
          setStudent(null);
          return;
        }

        setStudent(json.data);
      } catch (err) {
        console.error(err);
        setServerMessage("حدث خطأ غير متوقع أثناء الاتصال بالخادم.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [nationalId]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaSpinner className="animate-spin text-teal-600 text-4xl mb-3" />
        <p className="text-gray-600">جارٍ تحميل بيانات البروفايل...</p>
      </div>
    );

  if (!student)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-red-500 text-lg">{serverMessage}</p>
        <button
          onClick={handleGoBack}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
        >
          العودة للخلف
        </button>
      </div>
    );

  const s = student;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden ring-1 ring-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-500 p-6 sm:p-8 text-white text-center">
          <FaUser className="mx-auto text-5xl mb-3 border-2 border-white/70 rounded-full p-2 shadow" />
          <h1 className="text-xl sm:text-3xl font-bold tracking-wide">{s.fullName}</h1>
          <p className="text-sm sm:text-base/6 opacity-90 mt-1">
            {s.major} • {s.collegeName}
          </p>
        </div>

        <div className="p-4 sm:p-8">
          {/* 1. البيانات الشخصية */}
          <SectionCard title="البيانات الشخصية" icon={<FaUser />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <InfoItem icon={<FaIdCard />} label="الرقم القومي"  value={s.nationalId} />
              <InfoItem icon={<FaEnvelope />} label="البريد الإلكتروني" value={s.email} />
              <InfoItem icon={<FaPhone />} label="رقم الهاتف" value={s.phone} />
              <InfoItem icon={<FaMapMarkerAlt />} label="العنوان" value={s.address} />
              <InfoItem icon={<FaGlobe />} label="الجنسية" value={s.nationality} />
              <InfoItem icon={<FaCheckCircle />} label="الخدمة العسكرية" value={s.militaryService} />
              <InfoItem icon={<FaCalendarAlt />} label="تاريخ الميلاد" value={formatDate(s.dateOfBirth)} />
              <InfoItem icon={<FaMapMarkerAlt />} label="مكان الميلاد" value={s.placeOfBirth} />
              <InfoItem icon={<FaBriefcase />} label="المهنة" value={s.profession} />
              <InfoItem icon={<FaCalendarAlt />} label="تاريخ القبول" value={formatDate(s.dateOfAcceptance)} />
            </div>
          </SectionCard>

          {/* 2. البيانات الأكاديمية */}
          <SectionCard title="البيانات الأكاديمية" icon={<FaGraduationCap />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <InfoItem icon={<FaUniversity />} label="الجامعة" value={s.universityName} />
              <InfoItem icon={<FaUniversity />} label="الكلية" value={s.collegeName} />
              <InfoItem icon={<FaLayerGroup />} label="التخصص" value={s.major} />
              <InfoItem icon={<FaGraduationCap />} label="التقدير العام" value={s.grade} />
              <InfoItem icon={<FaBook />} label="المعدل التراكمي (GPA)" value={s.gpa} />
              <InfoItem icon={<FaCheckCircle />} label="الخطوة الحالية" value={`الخطوة ${s.step}`} />
            </div>
          </SectionCard>


          {/* 3. المؤهلات السابقة */}
          <SectionCard title="المؤهلات السابقة" icon={<FaFileAlt />}>
            {s.qualifications && s.qualifications.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {s.qualifications.map((qual) => (
                  <div
                    key={qual.id}
                    className="bg-gray-50 p-4 rounded-lg border border-teal-100 shadow-inner"
                  >
                    <h4 className="text-lg font-bold text-teal-700 mb-2">
                      {qual.qualificationName} ({qual.institution})
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">التقدير:</span> {qual.gradeName}
                      </p>
                      <p>
                        <span className="font-semibold">تاريخ الحصول:</span> {formatDate(qual.dateObtained)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد مؤهلات سابقة مسجلة.</p>
            )}
          </SectionCard>
        </div>

        {/* زر العودة */}
        <button
          onClick={handleGoBack}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer text-custom-teal px-4 py-3 rounded-lg font-bold transition shadow-md"
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
          لعودة للصفحة السابقة  
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow mb-5 sm:mb-6">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-teal-600 ml-1">{icon}</div>
          <h3 className="text-lg sm:text-xl font-bold text-teal-700">{title}</h3>
        </div>
        <div className="hidden sm:block h-1 w-24 rounded bg-teal-200" />
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
