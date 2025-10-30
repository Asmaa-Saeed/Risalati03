import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");

    // Fallback to cookie named 'token' if no Authorization header
    const cookieToken = req.cookies.get("token")?.value;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (auth) {
      headers["Authorization"] = auth;
    } else if (cookieToken) {
      headers["Authorization"] = `Bearer ${cookieToken}`;
    }

    const res = await fetch("https://professor.runasp.net/api/Lookups/AcademicTitle", {
      headers,
      // Server-to-server: CORS does not apply here
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { message: `فشل في جلب الألقاب الأكاديمية (${res.status})`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "حدث خطأ أثناء تحميل الألقاب الأكاديمية" }, { status: 500 });
  }
}
