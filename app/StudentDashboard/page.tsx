"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentHeader from "./StudentDashboardContent";

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const [nationalId, setNationalId] = useState<string | null>(null);

  useEffect(() => {
    const queryId = searchParams.get("nationalId");

    if (queryId) {
      setNationalId(queryId);
      localStorage.setItem("nationalId", queryId); 
      console.log("Retrieved nationalId from URL:", queryId);
    } else {
      const storedId = localStorage.getItem("nationalId");
      if (storedId) {
        setNationalId(storedId);
        console.log("Retrieved nationalId from localStorage:", storedId);
      } else {
        console.error("No nationalId provided");
      }
    }
  }, [searchParams]);

  if (!nationalId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">الرجاء إدخال الرقم القومي</p>
      </div>
    );
  }

  return <StudentHeader nationalId={nationalId} />;
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>جاري التحميل...</p>
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
