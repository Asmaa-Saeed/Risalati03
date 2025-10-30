'use server'

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export async function SignUp(data: any) {
  try {
    const res = await fetch(`${APIURL}/Auth/StudentSignUp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => null);

    if (!res.ok) {
      // لو في message من السيرفر نستخدمها، وإلا نعرض رسالة عامة
      const errorMessage = resData?.message || `حدث خطأ (${res.status})`;
      throw new Error(errorMessage);
    }

    return resData;

  } catch (err: any) {
    console.error("Error during signup:", err);
    throw err; // نرميه للـ frontend
  }
}
