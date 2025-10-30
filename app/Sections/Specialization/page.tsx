"use client";

import Link from "next/link";
import SignOutButton from "../../Component/SignOutButton";
import { useState, useEffect } from "react";

interface ApiDepartment {
  id: number;
  name: string;
  description: string;
}

interface ApiResponse {
  succeeded: boolean;
  message: string;
  errors: any[];
  data: ApiDepartment[];
}

interface AuthUser {
  id: string;
  userName: string;
  nationalId: string;
  phoneNumber: string;
  role: string;
  departmentIds: number[];
  departmentNames: string[];
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("❌ Error parsing JWT:", e);
    return null;
  }
}

export default function HomePage() {
  const [apiData, setApiData] = useState<ApiDepartment[]>([]);
  const [filteredData, setFilteredData] = useState<ApiDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        if (!apiUrl) throw new Error("❌ متغير NEXT_PUBLIC_API_URL مفقود.");

        const token = localStorage.getItem("token");
        if (!token) throw new Error("يرجى تسجيل الدخول أولاً.");

        const payload = parseJwt(token);
        if (!payload)
          throw new Error("حدث خطأ أثناء فك تشفير بيانات المستخدم.");

        const nationalId =
          payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        if (!nationalId) throw new Error("تعذر تحديد هوية المستخدم.");

        // 🟦 جلب جميع المستخدمين من /api/Auth
        const authRes = await fetch(`${apiUrl}/Auth`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const authJson = await authRes.json();
        if (!authJson.succeeded) throw new Error("فشل جلب بيانات المستخدمين.");

        // 🟩 تحديد المستخدم الحالي بناءً على nationalId
        const currentUser: AuthUser | undefined = authJson.data.find(
          (u: AuthUser) => u.nationalId === nationalId
        );

        if (!currentUser)
          throw new Error("تعذر العثور على المستخدم الحالي في النظام.");

        console.log("👤 Current user:", currentUser);

        // 🟨 جلب جميع الأقسام
        const deptRes = await fetch(`${apiUrl}/Departments`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const deptJson: ApiResponse = await deptRes.json();
        if (!deptJson.succeeded)
          throw new Error("فشل جلب بيانات الأقسام من الخادم.");

        setApiData(deptJson.data);

        // 🟩 فلترة الأقسام المسموح بها فقط
        const allowedIds = currentUser.departmentIds || [];
        const filtered = deptJson.data.filter((d) => allowedIds.includes(d.id));

        if (filtered.length === 0) {
          setError("لا توجد أقسام متاحة لك.");
          setFilteredData([]);
        } else {
          console.log("✅ Allowed Departments:", filtered);
          setFilteredData(filtered);
          setError(null);
        }
      } catch (err: any) {
        console.error("fetchDepartments error:", err);
        setError(err.message || "حدث خطأ أثناء تحميل البيانات.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [apiUrl]);

  const buildLink = (deptId: number) =>
    `../Requests/RequestTypes?departmentId=${deptId}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-custom-beige flex flex-col justify-center items-center text-center p-6">
        <SignOutButton />
        <h1 className="text-3xl font-bold text-black mb-6">
          أقسام الدراسات العليا - كلية التجارة
        </h1>
        <p className="text-lg text-gray-600">جاري تحميل الأقسام... ⏳</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-custom-beige flex flex-col justify-center items-center text-center p-6">
        <SignOutButton />
        <h1 className="text-3xl font-bold text-black mb-6">
          أقسام الدراسات العليا - كلية التجارة
        </h1>
        <p className="text-lg text-red-600">{error}</p>
      </main>
    );
  }

  if (filteredData.length === 0) {
    return (
      <main className="min-h-screen bg-custom-beige flex flex-col justify-center items-center text-center p-6">
        <SignOutButton />
        <h1 className="text-3xl font-bold text-black mb-6">
          أقسام الدراسات العليا - كلية التجارة
        </h1>
        <p className="text-lg text-gray-600">لا توجد أقسام متاحة حالياً.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-custom-beige text-center px-4 py-10 relative">
      <SignOutButton />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-black mb-12">
          أقسام الدراسات العليا - كلية التجارة
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((dept) => (
            <Link key={dept.id} href={buildLink(dept.id)} className="block">
              <div className="bg-custom-teal text-white rounded-2xl shadow-lg p-8 h-56 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-200">
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  {dept.name}
                </h2>
                <p className="text-sm sm:text-md text-center opacity-90 leading-relaxed">
                  {dept.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}