const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface RegistrationFormData {
  nationalId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  phoneNumber: string;
  grade?: string;
  departmentId?: string;
  degreeId?: string;
  collegeId?: string;
  universityId?: string;
  requestTypeId: string;
  semesterId: string;
  languageId: string;
  year?: string;
  BachelorDegree?: File | null;
  MasterDegree?: File | null;
  EquivalencyDegree?: File | null;
}

interface RegistrationResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export async function generateRegistrationCard(form: RegistrationFormData): Promise<RegistrationResponse> {
  try {
    const formData = new FormData();

    
    // 📝 التأكد من الحقول الأساسية قبل الإرسال
    if (!form.nationalId) throw new Error("الرقم القومي مطلوب");
    if (!form.firstName || !form.secondName || !form.thirdName) throw new Error("الاسم كامل مطلوب");
    if (!form.phoneNumber) throw new Error("رقم الهاتف مطلوب");
    if (!form.requestTypeId) throw new Error("نوع الطلب مطلوب");
    if (!form.semesterId) throw new Error("الفصل الدراسي مطلوب");
    if (!form.languageId) throw new Error("اللغة مطلوبة");

    // 📝 بيانات نصية
    formData.append("NationalId", form.nationalId);
    formData.append("FirstName", form.firstName);
    formData.append("SecondName", form.secondName);
    formData.append("ThirdName", form.thirdName);
    formData.append("PhoneNumber", form.phoneNumber); // ✅ تعديل الاسم هنا
    formData.append("Grade", form.grade || "");
    formData.append("Major", form.departmentId || "");
    formData.append("DegreeId", form.degreeId || "");
    formData.append("DepartmentId", form.departmentId || "");
    formData.append("CollegeId", form.collegeId || "");
    formData.append("UniversityId", form.universityId || "");
    formData.append("KindOfRequest", form.requestTypeId);
    formData.append("Semester", form.semesterId);
    formData.append("Language", form.languageId);
    formData.append("Year", form.year || "");

    // 📝 ملفات إذا موجودة
    if (form.BachelorDegree) formData.append("BachelorDegree", form.BachelorDegree);
    if (form.MasterDegree) formData.append("MasterDegree", form.MasterDegree);
    if (form.EquivalencyDegree) formData.append("EquivalencyDegree", form.EquivalencyDegree);

    // 📝 إرسال البيانات
    const res = await fetch(`${APIURL}/RegisterationCard/AddRegistrationCard`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData, // Multipart/FormData
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    return JSON.parse(text);
  } catch (error: unknown) {
    console.error("❌ Error generating registration card:", error instanceof Error ? error.message : error);
    throw error;
  }
}
