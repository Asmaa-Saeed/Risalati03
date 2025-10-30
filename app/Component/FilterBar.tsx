"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Degree {
  id: number;
  name: string;
  description: string;
  standardDurationYears: number;
  departmentId: number;
  generalDegree: string;
}

interface Msar {
  id: number;
  name: string;
  degreeId: number;
  departmentName: string;
  degree: Degree;
}

interface DegreeMsarFilterProps {
  departmentId?: number;
  onFilterChange: (selected: {
    degreeId: number | null;
    msarId: number | null;
  }) => void;
}


const DegreeMsarFilter: React.FC<DegreeMsarFilterProps> = ({
  departmentId,
  onFilterChange,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const params = useSearchParams();

  const parseDept = (val: string | null) => {
    if (!val) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };
  const deptFromUrl = parseDept(params.get("departmentId"));
  const effectiveDeptId =
    typeof departmentId === "number" ? departmentId : deptFromUrl;

  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [msars, setMsars] = useState<Msar[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null);
  const [selectedMsar, setSelectedMsar] = useState<number | null>(null);

  const getHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // 1. جلب الدرجات العلمية
  useEffect(() => {
    if (effectiveDeptId == null) return;
    // ... (جلب البيانات)
    const url = apiUrl
      ? `${apiUrl}/Degree/by-department/${effectiveDeptId}`
      : `/Degree/by-department/${effectiveDeptId}`;
    fetch(url, { headers: getHeaders() })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch degrees failed (${res.status}): ${text}`);
        }
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error("Expected JSON but got: " + text.slice(0, 200));
        }
        return res.json();
      })
      .then((data) => {
        // 💡 تعديل: التحقق من أن البيانات هي مصفوفة قبل التعيين
        if (data?.succeeded && Array.isArray(data.data)) {
          setDegrees(data.data);
        } else {
          setDegrees([]);
        }
      })
      .catch((err) => console.error("Error fetching degrees:", err));
  }, [effectiveDeptId, apiUrl]);

  // 2. جلب المسارات
  useEffect(() => {
    if (!selectedDegree) {
      setMsars([]);
      setSelectedMsar(null);
      return;
    }

    const url = apiUrl
      ? `${apiUrl}/Msar/ByDegree/${selectedDegree}`
      : `/Msar/ByDegree/${selectedDegree}`;
    fetch(url, { headers: getHeaders() })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch msars failed (${res.status}): ${text}`);
        }
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text();
          throw new Error("Expected JSON but got: " + text.slice(0, 200));
        }
        return res.json();
      })
      .then((data) => {
        // 💡 تعديل: التحقق من أن البيانات هي مصفوفة قبل التعيين
        if (data?.succeeded && Array.isArray(data.data)) {
          setMsars(data.data);
        } else {
          setMsars([]);
        }
      })
      .catch((err) => console.error("Error fetching msars:", err));
  }, [selectedDegree, apiUrl]);

  useEffect(() => {
    onFilterChange({ degreeId: selectedDegree, msarId: selectedMsar });
  }, [selectedDegree, selectedMsar, onFilterChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex-1">
        <label className="block mb-1 text-sm font-semibold text-gray-700">
          الدرجة العلمية
        </label>
        <select
          value={selectedDegree ?? ""}
          onChange={(e) => setSelectedDegree(Number(e.target.value) || null)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-custom-teal"
        >
          <option value="">اختر الدرجة العلمية</option>
          {degrees.map((deg) => (
            <option key={deg.id} value={deg.id}>
              {deg.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block mb-1 text-sm font-semibold text-gray-700">
          المسار
        </label>
        <select
          value={selectedMsar ?? ""}
          onChange={(e) => setSelectedMsar(Number(e.target.value) || null)}
          disabled={!selectedDegree}
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-custom-teal disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">اختر المسار</option>
          {msars.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DegreeMsarFilter;
