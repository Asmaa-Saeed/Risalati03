"use client";

import React, { useState, useCallback } from "react";
import {
  FileText,
  ClipboardList,
  Users,
  Settings,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import AdmissionRequests from "../RegistrationCard/page";
import RegistrationForms from "../RegistrationForm/page";
import StudentsPage from "../Student/page";
import SignOutButton from "@/app/Component/SignOutButton";
import DegreeMsarFilter from "@/app/Component/FilterBar";

interface Filters {
  degreeId: number | null;
  msarId: number | null;
}

export default function MainLayout() {
  const router = useRouter();
  const params = useSearchParams();
  const deptParam = params.get("departmentId");
  const departmentId = deptParam ? Number(deptParam) : undefined;

  const SettingPage = () => {
    router.push(`../../Settings`);
  };

  const [activePage, setActivePage] = useState<
    "requests" | "forms" | "students" | "attendance" | "followup" | "exams"
  >("requests");
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    degreeId: null,
    msarId: null,
  });

  const handleGoBack = () => {
    router.back();
  };

  // memoized handler: only update state when values actually change
  const handleFilterChange = useCallback((filters: Filters) => {
    setSelectedFilters((prev) => {
      if (prev.degreeId === filters.degreeId && prev.msarId === filters.msarId)
        return prev;
      return filters;
    });
  }, []);

  const renderContent = () => {
    switch (activePage) {
      case "requests":
        return <AdmissionRequests filters={selectedFilters} />;
      case "forms":
        return <RegistrationForms filters={selectedFilters} />;
      case "students":
        return <StudentsPage filters={selectedFilters} />;
      case "attendance":
        return <div>📋 كشف الغياب</div>;
      case "followup":
        return <div>📖 كشف المتابعة</div>;
      case "exams":
        return <div>🎓 لجان الامتحانات</div>;
      default:
        return <AdmissionRequests filters={selectedFilters} />;
    }
  };

  const showExtraTabs = !!selectedFilters.msarId; // تبعات تظهر بعد اختيار المسار

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-custom-beige flex flex-col md:flex-row"
    >
      {/* Sidebar */}
      <aside className="w-full md:w-65 bg-custom-teal text-white p-6 flex flex-col justify-between md:min-h-screen">
        <div>
          <div className="text-center mb-8">
            <div className="text-lg font-semibold">
              نظام إدارة الدراسات العليا
            </div>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActivePage("requests")}
              className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                activePage === "requests"
                  ? "bg-white text-custom-teal shadow-md"
                  : "hover:bg-white/10"
              }`}
            >
              <FileText className="w-5 h-5" />
              طلبات الالتحاق
            </button>

            <button
              onClick={() => setActivePage("forms")}
              className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                activePage === "forms"
                  ? "bg-white text-custom-teal shadow-md"
                  : "hover:bg-white/10"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              استمارات القيد
            </button>

            <button
              onClick={() => setActivePage("students")}
              className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                activePage === "students"
                  ? "bg-white text-custom-teal shadow-md"
                  : "hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5" />
              الطلاب
            </button>

            {showExtraTabs && (
              <>
                <button
                  onClick={() => setActivePage("followup")}
                  className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    activePage === "followup"
                      ? "bg-white text-custom-teal shadow-md"
                      : "hover:bg-white/10"
                  }`}
                >
                  <BookOpenCheck className="w-5 h-5" />
                  كشف المتابعة
                </button>

                <button
                  onClick={() => setActivePage("attendance")}
                  className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    activePage === "attendance"
                      ? "bg-white text-custom-teal shadow-md"
                      : "hover:bg-white/10"
                  }`}
                >
                  <ClipboardCheck className="w-5 h-5" />
                  كشف الغياب
                </button>

                <button
                  onClick={() => setActivePage("exams")}
                  className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    activePage === "exams"
                      ? "bg-white text-custom-teal shadow-md"
                      : "hover:bg-white/10"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  لجان الامتحانات
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="space-y-3 pt-6 border-t border-white/30">
          <button
            onClick={() => SettingPage()}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-custom-teal px-4 py-3 rounded-lg font-bold transition shadow-md w-full"
          >
            <Settings className="w-5 h-5" />
            الإعدادات
          </button>

          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-custom-teal px-4 py-3 rounded-lg font-bold transition shadow-md"
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
            العودة للخلف
          </button>

          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-full">
          {/* FilterBar: يقرأ departmentId من الـ URL أو يكون undefined */}
          <DegreeMsarFilter
            departmentId={departmentId}
            onFilterChange={handleFilterChange}
          />

          {/* المحتوى الأساسي */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
