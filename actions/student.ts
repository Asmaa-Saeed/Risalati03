const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function addStudent(data: any, token: string): Promise<ApiResponse> {
  try {
    if (!token) return { success: false, message: "الرجاء تسجيل الدخول أولاً" };

    const cleanedQualifications = (data.qualifications || [])
      .filter((q: any) => q.qualification && q.institution)
      .map((q: any) => ({
        qualification: Number(q.qualification) || 0,
        institution: q.institution,
        grade: Number(q.grade) || 0,
        dateObtained: q.dateObtained || null,
      }));

    const payload = {
      nationalId: data.nationalId || "",
      firstName: data.firstName || "",
      secondName: data.secondName || "",
      thirdName: data.thirdName || "",
      email: data.email || "",
      nationality: Number(data.nationality) || 0,
      dateOfBirth: data.dateOfBirth || "",
      placeOfBirth: data.placeOfBirth || "",
      profession: data.profession || "",
      phone: data.phone || "",
      address: data.address || "",
      militaryService: Number(data.militaryService) || 0,
      gpa: Number(data.gpa) || 0,
      grade: Number(data.grade) || 0,
      major: Number(data.majorId) || 0,
      notes: data.notes || "",
      collegeId: Number(data.collegeId) || 0,
      universityId: Number(data.universityId) || 0,
      qualifications: cleanedQualifications,
    };

    const res = await fetch(`${APIURL}/Student/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "حدث خطأ أثناء إرسال البيانات";
      try {
        const errData = await res.json();
        msg = errData.message || msg;
        // Check for duplicate national ID error
        if (msg.includes('رقم الهوية الوطنية موجود بالفعل')) {
          return { success: false, message: 'رقم الهوية الوطنية مسجل مسبقاً' };
        }
      } catch {}
      return { success: false, message: msg };
    }

    const result = await res.json();
    return { success: true, message: result.message || "تم الحفظ بنجاح!", data: result.data };
  } catch (err: any) {
    console.error("❌ خطأ أثناء إضافة الطالب:", err);
    return { success: false, message: err?.message || "حدث خطأ غير متوقع أثناء التسجيل" };
  }
}
