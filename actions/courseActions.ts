// 📁 /actions/courseActions.ts
// API calls for courses — mirrors instructorActions structure

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
  prerequisites?: string[] | string; // may arrive as comma-separated codes
  description?: string;
  Description?: string;
}

export interface CourseDTO {
  id: string;
  courseId: string; // numeric or string id presented
  code: string;
  name: string;
  creditHours: number;
  isOptional: boolean;
  semester: string;
  department: string;
  degree: string;
  msar: string; // Track
  prerequisites: string[]; // course codes
  description?: string;
}

const API_URL = "https://professor.runasp.net/api";

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

// 🟢 Get All Courses
export const getAllCourses = async (
  params?: { departmentId?: number; degreeId?: number; msarId?: number },
  token?: string
): Promise<{ success: boolean; data?: CourseDTO[]; message?: string }> => {
  try {
    let url = `${API_URL}/Course/GetAll`;
    const qs: string[] = [];
    if (params?.departmentId) qs.push(`departmentId=${encodeURIComponent(params.departmentId)}`);
    if (params?.degreeId) qs.push(`degreeId=${encodeURIComponent(params.degreeId)}`);
    if (params?.msarId) qs.push(`msarId=${encodeURIComponent(params.msarId)}`);
    if (qs.length) url += `?${qs.join("&")}`;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();

    if (!res.ok) return { success: false, message: `❌ Failed: ${res.status} ${res.statusText}` };

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (json?.succeeded && Array.isArray(json.data)) {
      return { success: true, data: json.data.map(mapRawToCourse) };
    }
    if (Array.isArray(json)) {
      return { success: true, data: json.map(mapRawToCourse) };
    }
    return { success: false, message: json?.message || "فشل في تحميل المقررات" };
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return { success: false, message: (error as Error).message };
  }
};
// 🟢 Create Course - Updated without Department/Degree
export const createCourse = async (
    data: {
      code: string;
      name: string;
      creditHours: number;
      isOptional: boolean;
      semester: string; // can be numeric id string
      msarId: number;
      prerequisites: string[];
      description?: string;
      instructors?: string[];
    },
    token?: string
  ): Promise<{ success: boolean; data?: CourseDTO | null; message?: string }> => {
    try {
      const url = `${API_URL}/Course/AddCourse`;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
  
      const form = new FormData();
      form.append("Code", String(data.code ?? "").trim());
      form.append("Name", String(data.name ?? "").trim());
      form.append("CreditHours", String(Number(data.creditHours)));
      form.append("IsOptional", data.isOptional ? "true" : "false");
      form.append("Semester", String(Number(String(data.semester ?? "").trim())));
      form.append("MsarId", String(Number(data.msarId)));
      form.append("Description", data.description ?? "");
  
      // Append prerequisites and instructors
      if (Array.isArray(data.prerequisites)) {
        data.prerequisites
          .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
          .forEach((id) => form.append("PrerequisiteCourseIds", String(id)));
      }
      if (Array.isArray(data.instructors)) {
        data.instructors.filter(Boolean).forEach((nid) => {
          form.append("InstructorNationalIds", String(nid));
        });
      }
  
      // Debug: log form fields
      if (typeof window !== 'undefined') {
        const entries: Record<string, any> = {};
        // @ts-ignore
        for (const [k, v] of (form as any).entries()) {
          if (!entries[k]) entries[k] = [];
          entries[k].push(v);
        }
        console.log("[createCourse] FormData fields:", entries);
        console.log("[createCourse] Payload object:", {
          code: data.code,
          name: data.name,
          creditHours: data.creditHours,
          isOptional: data.isOptional,
          semester: data.semester,
          msarId: data.msarId,
          prerequisites: data.prerequisites,
          instructors: data.instructors,
          description: data.description,
        });
      }
  
      const res = await fetch(url, { method: "POST", headers, body: form });
      const text = await res.text();
  
      let json: any; 
      try { json = JSON.parse(text); } catch { json = text; }
  
      if (!res.ok) {
        console.error('[createCourse] Non-OK response', { status: res.status, bodyText: text, bodyJson: json });
        return { success: false, data: null, message: (json?.message || text) };
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
  
// 🟡 Update Course
export const updateCourse = async (
  data: {
    id: string;
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string;
    departmentId: number;
    degreeId: number;
    msarId: number;
    prerequisites: string[];
    description?: string;
  },
  token?: string
): Promise<{ success: boolean; data?: CourseDTO | null; message?: string }> => {
  try {
    const url = `${API_URL}/Course/UpdateCourse`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const form = new FormData();
    form.append("Id", data.id);
    form.append("Code", data.code);
    form.append("Name", data.name);
    form.append("CreditHours", String(data.creditHours));
    form.append("IsOptional", data.isOptional ? "true" : "false");
    form.append("Semester", data.semester);
    // Do NOT send DepartmentId or DegreeId per current backend requirement
    // form.append("DepartmentId", String(data.departmentId));
    // form.append("DegreeId", String(data.degreeId));
    form.append("MsarId", String(data.msarId));
    form.append("Prerequisites", data.prerequisites.join(","));
    if (data.description) form.append("Description", data.description);

    const res = await fetch(url, { method: "PUT", headers, body: form });
    const text = await res.text();
    let json: any; try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok) return { success: false, data: null, message: (json && json.message) || `❌ Failed: ${res.status} ${res.statusText}` };

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

    const urlPath = `${API_URL}/Course/DeleteCourse/${encodeURIComponent(id)}`;
    let res = await fetch(urlPath, { method: "DELETE", headers });
    let text = await res.text();
    let json: any; try { json = JSON.parse(text); } catch { json = text; }

    if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 400)) {
      const urlQuery = `${API_URL}/Course/DeleteCourse?id=${encodeURIComponent(id)}`;
      res = await fetch(urlQuery, { method: "DELETE", headers });
      text = await res.text();
      try { json = JSON.parse(text); } catch { json = text; }

      if (!res.ok && res.status === 405) {
        const postUrl = `${API_URL}/Course/DeleteCourse`;
        const form = new FormData();
        form.append("Id", id);
        res = await fetch(postUrl, { method: "POST", headers, body: form });
        text = await res.text();
        try { json = JSON.parse(text); } catch { json = text; }
      }
    }

    if (!res.ok) return { success: false, message: (typeof json === 'object' && json?.message) || `❌ Failed: ${res.status} ${res.statusText}` };

    if (json?.succeeded === true || json === true || text === "true" || text === "") {
      return { success: true, message: (typeof json === 'object' && json?.message) || "تم حذف المقرر بنجاح" };
    }
    return { success: false, message: (typeof json === 'object' && json?.message) || "فشل في حذف المقرر" };
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    return { success: false, message: (error as Error).message };
  }
};
