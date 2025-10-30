const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function addStudent(data: any, token: string): Promise<ApiResponse> {
  try {
    // ✅ تحقق من التوكن قبل الإرسال
    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    // ✅ تنظيف بيانات المؤهلات (Qualifications)
    const cleanedQualifications = (data.qualifications || [])
      .filter((q: any) => q.qualification && q.institution)
      .map((q: any) => ({
        qualification: q.qualification ? Number(q.qualification) : 0,
        institution: q.institution,
        grade: q.grade ? Number(q.grade) : 0,
        dateObtained: q.dateObtained || null,
      }));

    // ✅ إعداد بيانات الطالب للإرسال
    const payload = {
      nationalId: data.nationalId || "",
      firstName: data.firstName || "",
      secondName: data.secondName || "",
      thirdName: data.thirdName || "",
      email: data.email || "",
      nationality: data.nationality ? Number(data.nationality) : 0,
      dateOfBirth: data.dateOfBirth || "",
      placeOfBirth: data.placeOfBirth || "",
      profession: data.profession || "",
      phone: data.phone || "",
      address: data.address || "",
      militaryService: data.militaryService ? Number(data.militaryService) : 0,
      gpa: data.gpa ? Number(data.gpa) : 0,
      grade: data.grade ? Number(data.grade) : 0,
      major: data.majorId ? Number(data.majorId) : 0, // بدل majorId
      notes: data.notes || "",
      collegeId: data.collegeId ? Number(data.collegeId) : 0,
      universityId: data.universityId ? Number(data.universityId) : 0,
      qualifications: cleanedQualifications,
    };

    console.log("📤 Payload being sent:", JSON.stringify(payload, null, 2));

    // ✅ إرسال الطلب إلى السيرفر
    const res = await fetch(`${APIURL}/Student/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // ⚠️ في حالة وجود خطأ في الاستجابة
    if (!res.ok) {
      // معالجة خاصة للحالة 404 (الطالب غير موجود)
      if (res.status === 404) {
        return { success: false, message: "الطالب غير موجود في النظام." };
      }

      // محاولة استخراج رسالة الخطأ من الرد
      let errorMessage = "حدث خطأ أثناء إرسال البيانات";
      try {
        const errorData = await res.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {}
      return { success: false, message: errorMessage };
    }

    // ✅ قراءة الرد النهائي
    const result = await res.json();
    return {
      success: result.success ?? true,
      message: result.message || "تم الحفظ بنجاح!",
      data: result.data || result,
    };

  } catch (err: any) {
    console.error("❌ خطأ أثناء إضافة الطالب:", err);
    return { success: false, message: err?.message || "حدث خطأ غير متوقع أثناء التسجيل" };
  }
}
