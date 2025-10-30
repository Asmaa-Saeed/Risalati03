// 📁 /actions/instructors.ts
// API calls for instructors — ready to connect with backend

import type { Instructor } from "@/lib/instructors";

const API_URL = "https://professor.runasp.net/api"; // ✅ ثابت ومباشر — الباك عندك جاهز

// 🟢 Get All Instructors
export const getAllInstructors = async (
  token?: string
): Promise<{ success: boolean; data?: Instructor[]; message?: string }> => {
  try {
    const url = `${API_URL}/Instructor/GetAll`;
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log("🔹 Sending GET request to:", url);

    const response = await fetch(url, { method: "GET", headers });
    console.log("🔹 Status:", response.status);

    const text = await response.text();

    if (!response.ok) {
      return { success: false, message: `❌ Failed: ${response.statusText}` };
    }

    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }

    // ✅ إذا الباك بيرجع structure فيه succeeded و data
    if (json?.succeeded && Array.isArray(json.data)) {
      const mapped: Instructor[] = json.data.map((item: any) => ({
        id: item.id?.toString() ?? "",
        name: item.name ?? "",
        nationalId: item.nationalId ?? "",
        title: item.academicTitle ?? "",
        department: item.departmentName ?? "",
        phone: item.phone ?? item.Phone ?? undefined,
        email: item.email ?? item.Email ?? undefined,
      }));

      return { success: true, data: mapped };
    }

    // ✅ أو لو الباك بيرجع Array مباشرة
    if (Array.isArray(json)) {
      const mapped: Instructor[] = json.map((item: any) => ({
        id: item.id?.toString() ?? "",
        name: item.name ?? "",
        nationalId: item.nationalId ?? "",
        title: item.academicTitle ?? "",
        department: item.departmentName ?? "",
        phone: item.phone ?? item.Phone ?? undefined,
        email: item.email ?? item.Email ?? undefined,
      }));
      return { success: true, data: mapped };
    }

    return { success: false, message: json?.message || "فشل في تحميل أعضاء هيئة التدريس" };
  } catch (error) {
    console.error("❌ Error fetching instructors:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Create Instructor
// POST {API_URL}/Instructor/AddInstructor
// Body: { Name, AcademicTitle, DepartmentId, NationalId, Phone, Email }
export const createInstructor = async (
  data: {
    name: string;
    academicTitle: number;
    departmentId: number;
    nationalId: string;
    phone: string;
    email: string;
  },
  token?: string
): Promise<{ success: boolean; data?: Instructor | null; message?: string }> => {
  try {
    const url = `${API_URL}/Instructor/AddInstructor`;

    const headers: Record<string, string> = {
      // Do not set Content-Type when sending FormData; the browser will set the correct boundary.
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Use FormData to satisfy APIs that expect [FromForm] binding
    const form = new FormData();
    form.append("Name", data.name);
    form.append("AcademicTitle", String(data.academicTitle));
    form.append("DepartmentId", String(data.departmentId));
    form.append("NationalId", data.nationalId);
    form.append("Phone", data.phone);
    form.append("Email", data.email);

    console.log("🔹 Sending POST request to:", url, "as FormData");
    const res = await fetch(url, { method: "POST", headers, body: form });
    const text = await res.text();
    console.log("🔹 Create Instructor Status:", res.status, "Body:", text);

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) {
      // Prefer backend-provided message if available
      let backendMsg = typeof json === 'object' && json?.message ? String(json.message) : undefined;
      // Detect SQL duplicate key error and localize message
      const isDuplicate = backendMsg?.toLowerCase().includes('duplicate key') || backendMsg?.includes('PK_Instructors') || backendMsg?.includes('2627');
      if (isDuplicate) {
        backendMsg = 'الرقم القومي مستخدم بالفعل. لا يمكن إضافة عضو بنفس الرقم القومي.';
      }
      const detailed = backendMsg || `❌ Failed: ${res.status} ${res.statusText}`;
      return { success: false, data: null, message: detailed };
    }

    if (json?.succeeded) {
      let created: Instructor | null = null;
      if (json?.data) {
        const item = json.data;
        created = {
          id: (item.id ?? item.Id ?? "").toString(),
          name: item.name ?? item.Name ?? data.name,
          nationalId: item.nationalId ?? item.NationalId ?? "",
          title: item.academicTitle ?? item.AcademicTitle ?? data.academicTitle,
          department: item.departmentName ?? item.DepartmentName ?? "",
        };
      }
      return { success: true, data: created, message: json?.message };
    }

    return { success: false, data: null, message: json?.message || "فشل في إضافة عضو هيئة التدريس" };
  } catch (error) {
    console.error("❌ Error creating instructor:", error);
    return { success: false, data: null, message: (error as Error).message };
  }
};

// 🟡 Update Instructor
// PUT {API_URL}/Instructor/UpdateInstructor
// Body (multipart/form-data): { Id, Name, AcademicTitle, DepartmentId, Phone, Email }
export const updateInstructor = async (
  data: {
    id: string;
    name: string;
    academicTitle: number;
    departmentId: number;
    phone: string;
    email: string;
  },
  token?: string
): Promise<{ success: boolean; data?: Instructor | null; message?: string }> => {
  try {
    const url = `${API_URL}/Instructor/UpdateInstructor`;

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const form = new FormData();
    form.append("Id", data.id);
    form.append("Name", data.name);
    form.append("AcademicTitle", String(data.academicTitle));
    form.append("DepartmentId", String(data.departmentId));
    form.append("Phone", data.phone);
    form.append("Email", data.email);

    console.log("🔹 Sending PUT request to:", url, "as FormData");
    const res = await fetch(url, { method: "PUT", headers, body: form });
    const text = await res.text();
    console.log("🔹 Update Instructor Status:", res.status, "Body:", text);

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) {
      let backendMsg = typeof json === 'object' && json?.message ? String(json.message) : undefined;
      const detailed = backendMsg || `❌ Failed: ${res.status} ${res.statusText}`;
      return { success: false, data: null, message: detailed };
    }

    if (json?.succeeded) {
      let updated: Instructor | null = null;
      if (json?.data) {
        const item = json.data;
        updated = {
          id: (item.id ?? item.Id ?? data.id).toString(),
          name: item.name ?? item.Name ?? data.name,
          nationalId: item.nationalId ?? item.NationalId ?? "",
          title: item.academicTitle ?? item.AcademicTitle ?? "",
          department: item.departmentName ?? item.DepartmentName ?? "",
        };
      }
      return { success: true, data: updated, message: json?.message };
    }

    return { success: false, data: null, message: json?.message || "فشل في تحديث عضو هيئة التدريس" };
  } catch (error) {
    console.error("❌ Error updating instructor:", error);
    return { success: false, data: null, message: (error as Error).message };
  }
};

// 🔴 Delete Instructor
// DELETE {API_URL}/Instructor/DeleteInstructor/{id}
export const deleteInstructor = async (
  id: string,
  token?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Attempt 1: DELETE with path parameter
    const urlPath = `${API_URL}/Instructor/DeleteInstructor/${encodeURIComponent(id)}`;
    console.log("🔹 DELETE (path) =>", urlPath);
    let res = await fetch(urlPath, { method: "DELETE", headers });
    let text = await res.text();
    console.log("🔹 Result (path)", res.status, text);

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    // If failed with typical routing method errors, try query param fallback
    if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 400)) {
      const urlQuery = `${API_URL}/Instructor/DeleteInstructor?id=${encodeURIComponent(id)}`;
      console.log("🔹 DELETE (query) =>", urlQuery);
      res = await fetch(urlQuery, { method: "DELETE", headers });
      text = await res.text();
      console.log("🔹 Result (query)", res.status, text);
      try { json = JSON.parse(text); } catch { json = text; }

      // If still 405 (method not allowed), some backends use POST for delete
      if (!res.ok && res.status === 405) {
        const postUrl = `${API_URL}/Instructor/DeleteInstructor`;
        const form = new FormData();
        form.append("Id", id);
        console.log("🔹 POST (fallback) =>", postUrl, "FormData Id=", id);
        res = await fetch(postUrl, { method: "POST", headers, body: form });
        text = await res.text();
        console.log("🔹 Result (POST)", res.status, text);
        try { json = JSON.parse(text); } catch { json = text; }
      }
    }

    if (!res.ok) {
      const backendMsg = typeof json === 'object' && json?.message ? String(json.message) : undefined;
      return { success: false, message: backendMsg || `❌ Failed: ${res.status} ${res.statusText}` };
    }

    if (json?.succeeded === true) {
      return { success: true, message: json?.message || "تم حذف عضو هيئة التدريس بنجاح" };
    }

    // Some APIs return boolean or plain text
    if (json === true || text === "true" || text === "") {
      return { success: true, message: "تم حذف عضو هيئة التدريس بنجاح" };
    }

    return { success: false, message: (typeof json === 'object' && json?.message) || "فشل في حذف عضو هيئة التدريس" };
  } catch (error) {
    console.error("❌ Error deleting instructor:", error);
    return { success: false, message: (error as Error).message };
  }
};