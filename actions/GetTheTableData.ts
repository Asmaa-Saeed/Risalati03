'use server';

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export async function GetTheTableData() {
  try {
    const res = await fetch(`${APIURL}/Student`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("token")}` },
      cache: 'no-store', // عشان البيانات تكون محدثة دائمًا
    });

    if (!res.ok) {
      throw new Error(`فشل في جلب البيانات: ${res.status}`);
    }

    const result = await res.json();
    // console.log('📌 بيانات الطلاب:', result);
    return result;
  } catch (err: any) {
    console.error('❌ خطأ أثناء جلب البيانات:', err);
    return {
      success: false,
      message: err.message || 'حدث خطأ أثناء جلب البيانات',
    };
  }
}