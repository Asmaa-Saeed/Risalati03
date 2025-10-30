"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUniversity,
  FaPhone,
  FaIdCard,
  FaBook,
  FaLayerGroup,
  FaGraduationCap,
  FaFileAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
} from "react-icons/fa";
import Image from "next/image";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface Attachment {
  displayName: string;
  fileName: number | string;
  contentType: string;
}

interface StudentData {
  id: number;
  nationalId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  phone: string;
  grade: string;
  major: string;
  degreeName: string;
  departmentName: string;
  collegeName: string;
  universityName: string;
  intakeName?: string;
  kindOfRequest: string;
  semester: string;
  language: string;
  status: "قيد_الانتظار" | "مقبول" | "مرفوض" | string;
  degreeImage?: string;
  masterImage?: string;
  transferImage?: string;
  attachments?: Attachment[];
}

type StatusKey = "قيد_الانتظار" | "مقبول" | "مرفوض";

const statusMap: Record<StatusKey, { text: string; color: string }> = {
  قيد_الانتظار: { text: "جاري معالجة الطلب", color: "bg-yellow-400" },
  مقبول: { text: "تمت الموافقة على الطلب", color: "bg-green-500" },
  مرفوض: { text: "تم رفض الطلب", color: "bg-red-500" },
};

interface StudentHeaderProps {
  nationalId: string;
}

function InfoCard({
  icon,
  label,
  value,
  imageSrc,
  onViewImage = () => {},
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  imageSrc?: string;
  onViewImage?: () => void;
}) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        {icon && (
          <div className="shrink-0 grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 ml-2">
            <span className="text-lg sm:text-xl">{icon}</span>
          </div>
        )}
        <div className="text-right flex-1">
          <p className="text-sm sm:text-base font-bold text-teal-700 mb-1">{label}</p>
          {value ? (
            <p className="text-xs sm:text-sm font-medium text-gray-500 break-words">
              {value}
            </p>
          ) : (
            <p className="text-gray-400 text-xs sm:text-sm">غير متوفر</p>
          )}
        </div>
      </div>
      {["شهادة المؤهل", "شهادة الماجستير", "شهادة التحويل"].includes(label) && (
        <button
          onClick={onViewImage}
          className={`${
            imageSrc
              ? "bg-teal-600 hover:bg-teal-700 text-white"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          } text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md w-full transition-colors duration-200`}
          disabled={!imageSrc}
        >
          {imageSrc ? "عرض الصورة" : "لا يوجد مرفق"}
        </button>
      )}
    </div>
  );
}

function ImageModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleImageError = () => setImageError(true);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white p-2 sm:p-4 rounded-lg shadow-xl max-w-full max-h-[90vh] w-full sm:max-w-4xl relative flex flex-col transform transition-transform duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors duration-200"
        >
          &times;
        </button>
        <div className="flex justify-center items-center gap-2 mb-2">
          <button
            onClick={zoomIn}
            className="bg-teal-600 text-white p-2 rounded"
          >
            <FaSearchPlus />
          </button>
          <button
            onClick={zoomOut}
            className="bg-teal-600 text-white p-2 rounded"
          >
            <FaSearchMinus />
          </button>
          <button
            onClick={resetZoom}
            className="bg-teal-600 text-white p-2 rounded"
          >
            <FaUndo />
          </button>
        </div>
        <div className="overflow-auto flex justify-center items-center">
          {!imageError ? (
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] object-contain"
              style={{ transform: `scale(${scale})` }}
              onError={handleImageError}
            />
          ) : (
            <p className="text-red-500 text-center">تعذر تحميل الصورة</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentHeader({ nationalId }: StudentHeaderProps) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const getAttachmentUrl = (
    attachments: Attachment[] = [],
    name: string
  ): string | undefined => {
    const att = attachments.find((a) => a.displayName.includes(name));
    return att
      ? `${APIURL}/Files/GetFile/${att.fileName}.${
          att.contentType.split("/")[1]
        }`
      : undefined;
  };

  useEffect(() => {
    if (!nationalId) return;

    const loadStudent = async () => {
      setLoading(true);
      setServerMessage("");
      let studentData: StudentData | null = null;

      try {
        const registrationRes = await fetch(
          `${APIURL}/RegisterationCard/getByNationalNumber/${nationalId}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        const registrationJson = await registrationRes.json();

        if (
          registrationRes.ok &&
          registrationJson.succeeded &&
          registrationJson.data
        ) {
          studentData = registrationJson.data;
          setServerMessage(
            registrationJson.message || "تم جلب بيانات بطاقة التسجيل بنجاح."
          );
        }
      } catch (err) {
        console.error("Error fetching registration card:", err);
      }

      if (!studentData) {
        try {
          const studentRes = await fetch(
            `${APIURL}/Student/getByNationalNum/${nationalId}`,
            {
              method: "GET",
              headers: getHeaders(),
            }
          );

          const studentJson = await studentRes.json();

          if (studentRes.ok && studentJson.succeeded && studentJson.data) {
            studentData = {
              ...studentJson.data,
              intakeName: "",
              kindOfRequest: "",
              degreeName: "",
              departmentName: "",
              semester: "",
              language: "",
              status: "",
            };
            setServerMessage(
              studentJson.message || "تم جلب بيانات الطالب الأساسية بنجاح."
            );
          } else {
            if (studentRes.status === 404) {
              setServerMessage("لم يتم العثور على طالب بهذا الرقم القومي.");
            } else {
              setServerMessage(
                studentJson.message || "حدث خطأ أثناء جلب البيانات"
              );
            }
            setStudent(null);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error fetching basic student data:", err);
          setServerMessage("حدث خطأ غير متوقع");
          setStudent(null);
          setLoading(false);
          return;
        }
      }

      if (studentData) {
        const attachments: Attachment[] = studentData.attachments || [];
        setStudent({
          ...studentData,
          attachments,
          degreeImage: getAttachmentUrl(attachments, "البكالوريوس"),
          masterImage: getAttachmentUrl(attachments, "الماجستير"),
          transferImage: getAttachmentUrl(attachments, "المعادلة"),
        });
      }

      setLoading(false);
    };

    loadStudent();
  }, [nationalId]);

  if (loading)
    return <p className="text-center mt-10">جارٍ تحميل بيانات الطالب...</p>;

  if (!student)
    return <p className="text-center mt-10 text-red-500">{serverMessage}</p>;

  const currentStatus = statusMap[student.status as StatusKey] || {
    text: "حالة غير معروفة",
    color: "bg-gray-400",
  };

  const hasRequest = !!student.kindOfRequest;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-gray-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header logos */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-12 mb-4 sm:mb-0">
            <div className="hidden sm:block w-24 xs:w-28 sm:w-48">
              <Image
                src="/University-Logo.png"
                alt="شعار الجامعة"
                width={200}
                height={100}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block w-24 xs:w-28 sm:w-48">
              <Image
                src="/Faculty-Logo.png"
                alt="شعار الكلية"
                width={200}
                height={100}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Student Info */}
          <div className="max-w-[960px] mt-4 sm:mt-0 mx-auto">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-100 p-4 sm:p-6 md:p-10 w-full">
              <div className="mb-6 sm:mb-8 text-center">
                <div className="bg-gray-100 p-3 sm:p-4 rounded-full inline-block mb-3 sm:mb-4 shadow">
                  <FaGraduationCap className="text-teal-600 text-2xl sm:text-3xl" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 tracking-wide">
                  {student.firstName} {student.secondName} {student.thirdName}
                </h2>
                <button
                  onClick={() => router.push("/StudentProfile")}
                  className="mt-3 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-md text-sm transition w-full sm:w-auto"
                >
                  عرض الملف الشخصي
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <InfoCard
                  icon={<FaIdCard />}
                  label="الرقم القومي"
                  value={student.nationalId}
                />
                <InfoCard
                  icon={<FaPhone />}
                  label="رقم الهاتف"
                  value={student.phone}
                />
                <InfoCard
                  icon={<FaLayerGroup />}
                  label="التخصص"
                  value={student.major}
                />
                <InfoCard
                  icon={<FaBook />}
                  label="الجامعة"
                  value={student.universityName}
                />
                <InfoCard
                  icon={<FaUniversity />}
                  label="الكلية"
                  value={student.collegeName}
                />
                <InfoCard
                  icon={<FaBook />}
                  label="التقدير"
                  value={student.grade}
                />
                <InfoCard
                  icon={<FaFileAlt />}
                  label="شهادة المؤهل"
                  imageSrc={student.degreeImage}
                  onViewImage={() =>
                    student.degreeImage && setSelectedImage(student.degreeImage)
                  }
                />
                <InfoCard
                  icon={<FaFileAlt />}
                  label="شهادة الماجستير"
                  imageSrc={student.masterImage}
                  onViewImage={() =>
                    student.masterImage && setSelectedImage(student.masterImage)
                  }
                />
                <InfoCard
                  icon={<FaFileAlt />}
                  label="شهادة التحويل"
                  imageSrc={student.transferImage}
                  onViewImage={() =>
                    student.transferImage &&
                    setSelectedImage(student.transferImage)
                  }
                />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-10 mt-6 sm:mt-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center sm:text-right">
                  بطاقة التسجيل الخاصة بالطالب
                </h3>
                {hasRequest ? (
                  <div className="flex flex-col sm:flex-row items-stretch justify-between border rounded-lg bg-gray-50 shadow-md p-4 sm:p-6 gap-4 sm:gap-6">
                  <div className="flex-1 space-y-2 bg-white rounded-lg p-4 sm:p-6 shadow-md">
                      <p className="text-sm sm:text-base text-gray-800 font-bold">
                        نوع الطلب: {student.kindOfRequest}
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-bold">
                        الدرجة العلمية: {student.degreeName}
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-bold">
                        البرنامج والقسم: {student.departmentName}
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-bold">
                        الفصل الدراسي: {student.semester}
                      </p>
                      <p className="text-sm sm:text-base text-gray-800 font-bold">
                        لغة الدراسة: {student.language}
                      </p>
                    </div>
                    <div className="w-full sm:w-1/3 flex flex-col items-center justify-center space-y-4 p-4 sm:p-6 bg-white rounded-lg shadow-md">
                      <h2 className="text-gray-700 font-bold text-lg">
                        {" "}
                        حالة الطلب : {student.status}
                      </h2>
                      <div
                        className={`text-white font-bold text-center px-6 py-2 sm:px-10 sm:py-3 rounded-lg shadow-lg text-base sm:text-lg w-full ${currentStatus.color}`}
                      >
                        {currentStatus.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-teal-400 bg-teal-50 rounded-lg p-6 text-center shadow-md space-y-4">
                    <p className="text-lg text-gray-700 mb-4 font-medium">
                      لم يتم العثور على طلب التحاق مسجل لهذا الطالب.
                    </p>

                    {/* زر تقديم طلب التحاق جديد */}
                    <a
                      href="/RegistrationCard"
                      className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition-colors duration-300 w-full sm:w-auto"
                    >
                      <FaFileAlt className="w-5 h-5" />
                      اضغط هنا لتقديم طلب التحاق جديد
                    </a>
                  </div>
                )}

                {student.status === "مقبول" && (
                  <div className="border border-dashed border-teal-400 bg-teal-50 mt-6 rounded-lg p-6 text-center shadow-md space-y-4">
                    <p className="text-lg text-gray-700 mb-4 font-medium">
                      يمكنك الآن إنشاء استمارة القيد
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const nationalId = localStorage.getItem("nationalId"); // جلب الـ nationalId من LocalStorage
                          if (!nationalId) {
                            alert("رقمك القومي غير موجود في المتصفح!");
                            return;
                          }

                          const res = await fetch(
                            `${APIURL}/RegistrationForms`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: token ? `Bearer ${token}` : "",
                              },
                              body: JSON.stringify({
                                nationalId,
                                generalDegree: 1, // يمكن تعديل القيمة حسب الحاجة
                                notes: "تم الإنشاء من خلال واجهة المستخدم",
                              }),
                            }
                          );

                          if (res.ok) {
                            alert("تم إنشاء استمارة القيد بنجاح!");
                            // إعادة التوجيه للـ Dashboard
                            window.location.href = "/StudentDashboard";
                          } else {
                            const err = await res.json();
                            alert(
                              "فشل إنشاء الاستمارة: " +
                                (err.message || "خطأ غير معروف")
                            );
                          }
                        } catch (error) {
                          console.error(error);
                          alert("حدث خطأ أثناء إنشاء الاستمارة");
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition-colors duration-300 w-full sm:w-auto"
                    >
                      <FaFileAlt className="w-5 h-5" />
                      إنشاء استمارة القيد الخاصة بك وإرسالها لإدارة الدراسات
                      العليا
                    </button>
                  </div>
                )}

                {/* زر تسجيل استمارة القيد يظهر فقط إذا الحالة Accepted
                 {student.status === "مقبول" && (
                    <a
                    href="/RegistrationForm"
                    className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-lg shadow-xl transition-colors duration-300"
                  >
                    <FaFileAlt className="w-5 h-5" />
                    اضغط هنا لتسجيل استمارة القيد
                  </a>
                  )} */}
              </div>
              {/* نهاية قسم الطلبات */}
            </div>
          </div>
        </div>
      </div>
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="وثيقة الطالب"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
