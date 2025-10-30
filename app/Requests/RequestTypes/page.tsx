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

import AdmissionRequestsComponent from "../AdmissionRequestsComponent";
import RegistrationFormComponent from "../RegistrationFormComponent";
import StudentsComponent from "../StudentsComponent";

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

  const [activePage, setActivePage] = useState<
    "requests" | "forms" | "students" | "attendance" | "followup" | "exams"
  >("requests");

  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    degreeId: null,
    msarId: null,
  });

  const handleFilterChange = useCallback((filters: Filters) => {
    setSelectedFilters((prev) => {
      if (prev.degreeId === filters.degreeId && prev.msarId === filters.msarId)
        return prev;
      return filters;
    });
  }, []);

  const SettingPage = () => router.push(`/Settings`);
  const handleGoBack = () => router.back();

  const renderContent = () => {
    switch (activePage) {
      case "requests":
        return <AdmissionRequestsComponent />;
      case "forms":
        return <RegistrationFormComponent />;
      case "students":
        return <StudentsComponent />;
      case "attendance":
        return <div className="p-4">📋 كشف الغياب</div>;
      case "followup":
        return <div className="p-4">📖 كشف المتابعة</div>;
      case "exams":
        return <div className="p-4">🎓 لجان الامتحانات</div>;
      default:
        return <AdmissionRequestsComponent />;
    }
  };

  const showExtraTabs = Boolean(selectedFilters.msarId);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-custom-beige flex flex-col md:flex-row"
    >
      {/* ✅ Sidebar */}
      <aside className="w-full md:w-64 bg-custom-teal text-white p-6 flex flex-col justify-between md:min-h-screen">
        <div>
          <div className="text-center mb-8">
            <div className="text-lg font-semibold">
              نظام إدارة الدراسات العليا
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarButton
              active={activePage === "requests"}
              icon={<FileText className="w-5 h-5" />}
              label="طلبات الالتحاق"
              onClick={() => setActivePage("requests")}
            />
            <SidebarButton
              active={activePage === "forms"}
              icon={<ClipboardList className="w-5 h-5" />}
              label="استمارات القيد"
              onClick={() => setActivePage("forms")}
            />
            <SidebarButton
              active={activePage === "students"}
              icon={<Users className="w-5 h-5" />}
              label="الطلاب"
              onClick={() => setActivePage("students")}
            />

            {showExtraTabs && (
              <>
                <SidebarButton
                  active={activePage === "followup"}
                  icon={<BookOpenCheck className="w-5 h-5" />}
                  label="كشف المتابعة"
                  onClick={() => setActivePage("followup")}
                />
                <SidebarButton
                  active={activePage === "attendance"}
                  icon={<ClipboardCheck className="w-5 h-5" />}
                  label="كشف الغياب"
                  onClick={() => setActivePage("attendance")}
                />
                <SidebarButton
                  active={activePage === "exams"}
                  icon={<GraduationCap className="w-5 h-5" />}
                  label="لجان الامتحانات"
                  onClick={() => setActivePage("exams")}
                />
              </>
            )}
          </nav>
        </div>

        {/* ✅ Bottom buttons */}
        <div className="space-y-3 pt-6 border-t border-white/30">
          <button
            onClick={SettingPage}
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

      {/* ✅ Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 h-full">
          <DegreeMsarFilter
            departmentId={departmentId}
            onFilterChange={handleFilterChange}
          />
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/* ✅ Component صغير لإعادة استخدام الزر في الـ Sidebar */
function SidebarButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg transition font-semibold ${
        active
          ? "bg-white text-custom-teal shadow-md"
          : "hover:bg-white/10 text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
