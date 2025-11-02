// 📁 /actions/courseActions.ts
// All Course API actions — FormData version compatible with ASP.NET backend

export interface RawCourse {
  id?: string | number;
  courseId?: string | number;
  code?: string;
  name?: string;
  creditHours?: number | string;
  isOptional?: boolean | string | number;
  semester?: string | number;
  departmentName?: string;
  degreeName?: string;
  msarName?: string; // Track
  prerequisites?: string[] | string;
  description?: string;
  Description?: string;
}

export interface CourseDTO {
  id: string;
  courseId: string;
  code: string;
  name: string;
  creditHours: number;
  isOptional: boolean;
  semester: string;
  department: string;
  degree: string;
  msar: string; // Track
  prerequisites: string[];
  description?: string;
}

const API_URL = "https://professor.runasp.net/api";

/* ---------------- Utility Helpers ---------------- */

const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return ["true", "1", "yes", "y"].includes(v.toLowerCase());
  return false;
};

const parsePrereqs = (v: any): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
  return [];
};

const mapRawToCourse = (item: any): CourseDTO => ({
  id: (item.id ?? item.Id ?? item.courseId ?? item.CourseId ?? "").toString(),
  courseId: (item.courseId ?? item.CourseId ?? item.id ?? item.Id ?? "").toString(),
  code: item.code ?? item.Code ?? "",
  name: item.name ?? item.Name ?? "",
  creditHours: Number(item.creditHours ?? item.CreditHours ?? 0),
  isOptional: toBool(item.isOptional ?? item.IsOptional ?? false),
  semester: (item.semester ?? item.Semester ?? "").toString(),
  department: item.departmentName ?? item.DepartmentName ?? "",
  degree: item.degreeName ?? item.DegreeName ?? "",
  msar: item.msarName ?? item.MsarName ?? item.trackName ?? item.TrackName ?? "",
  prerequisites: parsePrereqs(item.prerequisites ?? item.Prerequisites ?? []),
  description: item.description ?? item.Description ?? "",
});

/* ---------------- API Actions ---------------- */

// 🟢 Get All Courses
export const getAllCourses = async (
  params?: { departmentId?: number; degreeId?: number; msarId?: number },
  token?: string
): Promise<{ success: boolean; data?: CourseDTO[]; message?: string }> => {
  try {
    let url = `${API_URL}/Course/GetAll`;
    const qs: string[] = [];
    if (params?.departmentId) qs.push(`departmentId=${params.departmentId}`);
    if (params?.degreeId) qs.push(`degreeId=${params.degreeId}`);
    if (params?.msarId) qs.push(`msarId=${params.msarId}`);
    if (qs.length) url += `?${qs.join("&")}`;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();

    if (!res.ok) return { success: false, message: `❌ Failed: ${res.status} ${res.statusText}` };

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (json?.succeeded && Array.isArray(json.data))
      return { success: true, data: json.data.map(mapRawToCourse) };

    if (Array.isArray(json))
      return { success: true, data: json.map(mapRawToCourse) };

    return { success: false, message: json?.message || "فشل في تحميل المقررات" };
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Create Course — FormData (required by ASP.NET)
export const createCourse = async (
  data: {
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string | number;
    msarId: number;
    prerequisites: string[];
    description?: string;
    instructors?: string[];
  },
  token?: string
): Promise<{ success: boolean; data?: CourseDTO | null; message?: string }> => {
  try {
    const url = `${API_URL}/Course/AddCourse`;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const form = new FormData();
    form.append("Code", data.code);
    form.append("Name", data.name);
    form.append("CreditHours", String(data.creditHours));
    form.append("IsOptional", data.isOptional ? "true" : "false");
    form.append("Semester", String(data.semester));
    form.append("MsarId", String(data.msarId));
    form.append("Description", data.description ?? "");

    if (Array.isArray(data.prerequisites))
      data.prerequisites.forEach(id => form.append("PrerequisiteCourseIds", id));

    if (Array.isArray(data.instructors))
      data.instructors.forEach(nid => form.append("InstructorNationalIds", nid));

    console.log("[createCourse] FormData:");
    for (const [k, v] of form.entries()) console.log("→", k, v);

    const res = await fetch(url, { method: "POST", headers, body: form });
    const text = await res.text();
    let json: any; try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) {
      console.error("[createCourse] Non-OK", json);
      return { success: false, data: null, message: json?.message || "فشل في إضافة المقرر" };
    }

    if (json?.succeeded) {
      const item = json?.data ?? json;
      return { success: true, data: mapRawToCourse(item), message: json?.message };
    }

    return { success: false, data: null, message: json?.message || "فشل في إضافة المقرر" };
  } catch (error) {
    console.error("❌ Error creating course:", error);
    return { success: false, data: null, message: (error as Error).message };
  }
};

// 🟡 Update Course — FormData as well
export const updateCourse = async (
  data: {
    id: string;
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string | number;
    msarId: number;
    prerequisites: string[];
    description?: string;
  },
  token?: string
): Promise<{ success: boolean; data?: CourseDTO | null; message?: string }> => {
  try {
    const url = `${API_URL}/Course/UpdateCourse`;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const form = new FormData();
    form.append("Id", data.id);
    form.append("Code", data.code);
    form.append("Name", data.name);
    form.append("CreditHours", String(data.creditHours));
    form.append("IsOptional", data.isOptional ? "true" : "false");
    form.append("Semester", String(data.semester));
    form.append("MsarId", String(data.msarId));
    form.append("Description", data.description ?? "");

    if (Array.isArray(data.prerequisites))
      data.prerequisites.forEach(id => form.append("PrerequisiteCourseIds", id));

    const res = await fetch(url, { method: "PUT", headers, body: form });
    const text = await res.text();
    let json: any; try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok)
      return { success: false, data: null, message: json?.message || `❌ Failed: ${res.status}` };

    if (json?.succeeded) {
      const item = json?.data ?? json;
      return { success: true, data: mapRawToCourse(item), message: json?.message };
    }

    return { success: false, data: null, message: json?.message || "فشل في تحديث المقرر" };
  } catch (error) {
    console.error("❌ Error updating course:", error);
    return { success: false, data: null, message: (error as Error).message };
  }
};

// 🔴 Delete Course
export const deleteCourse = async (
  id: string,
  token?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const url = `${API_URL}/Course/DeleteCourse/${encodeURIComponent(id)}`;
    const res = await fetch(url, { method: "DELETE", headers });
    const text = await res.text();
    let json: any; try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok)
      return { success: false, message: json?.message || `❌ Failed: ${res.status}` };

    if (json?.succeeded === true || json === true)
      return { success: true, message: "تم حذف المقرر بنجاح" };

    return { success: false, message: json?.message || "فشل في حذف المقرر" };
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    return { success: false, message: (error as Error).message };
  }
};
