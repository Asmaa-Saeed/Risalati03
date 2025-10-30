"use server";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

interface LoginRequest {
  nationalId: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  role?: string | null;
  hasCard?: boolean;
}

export default async function LoginAction(
  body: LoginRequest
): Promise<LoginResponse> {
  try {
    const backendRes = await fetch(`${APIURL}/Auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const backendJson = await backendRes.json();

    // 👀 هنا بنطبع الريسبونس كامل عشان نعرف التوكن فين
    console.log("🔍 Backend response:", backendJson);

    if (!backendRes.ok) {
      return {
        success: false,
        message: backendJson?.message || "فشل تسجيل الدخول",
      };
    }

    // جربنا نجيب التوكن من أكتر من مكان
    const token =
      backendJson?.token ||
      backendJson?.access_token ||
      backendJson?.data?.token ||
      backendJson?.result?.jwt || // مثال لو السيرفر راجعه باسم تاني
      null;

    return {
      success: true,
      message: backendJson?.message || "تم تسجيل الدخول بنجاح",
      token,
      user: backendJson?.user || backendJson?.data?.user || null,
      role: backendJson?.role || null,
      hasCard: backendJson?.data?.hasCard ?? backendJson?.hasCard ?? null,
    };
  } catch (error) {
    console.error("❌ LoginAction error:", error);
    return {
      success: false,
      message: "خطأ في السيرفر أثناء تسجيل الدخول",
    };
  }
}
