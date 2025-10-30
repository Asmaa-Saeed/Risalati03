// 📁 /lib/courses.ts
// ✅ Course service layer - works directly with backend API (no actions dependency)

export interface Course {
    id: string;
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string;
    department: string;
    degree?: string;
    msar: string; // Track
    prerequisites?: string[];
    description?: string;
    instructors?: { id: string; name: string }[];
  }
  
  export interface CreateCourseData {
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string;
    departmentId: number;
    degreeId?: number;
    msarId: number;
    prerequisites: string[];
    description?: string;
    instructors: string[]; // instructor nationalIds
  }
  
  export interface UpdateCourseData {
    id: string;
    code: string;
    name: string;
    creditHours: number;
    isOptional: boolean;
    semester: string; // can be numeric id string
    // Optional in update (not sent per current backend requirement)
    departmentId?: number;
    degreeId?: number;
    msarId?: number;
    prerequisites: string[];
    description?: string;
    instructors: string[]; // instructor nationalIds
  }
  
  const API_BASE = "https://professor.runasp.net/api/Course";
  
  export class CoursesService {
    // 🔹 Helper to get token
    private static getToken(): string | undefined {
      if (typeof window !== "undefined") {
        return localStorage.getItem("token") || undefined;
      }
      return undefined;
    }
  
    // 🔹 GET all courses
    static async getCourses(): Promise<{ success: boolean; data: Course[]; message?: string }> {
      try {
        const token = this.getToken();
        // Correct endpoint is /api/Course/GetAll
        const res = await fetch(`${API_BASE}/GetAll`, {
          headers: {
            "accept": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("[CoursesService.getCourses] Non-OK response", { status: res.status, statusText: res.statusText, body: text });
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        return { success: true, data: data.data || data || [], message: "تم جلب المقررات بنجاح" };
      } catch (error) {
        console.error("❌ Error fetching courses:", error);
        return { success: false, data: [], message: "حدث خطأ أثناء تحميل المقررات" };
      }
    }
  
    // 🔹 POST create new course (JSON version)
static async createCourse(data: CreateCourseData): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const token = this.getToken();
  
      // تجهيز الـ payload بشكل صارم
      const payload = {
        Code: String(data.code ?? "").trim(),
        Name: String(data.name ?? "").trim(),
        CreditHours: Number(data.creditHours ?? 0),
        IsOptional: Boolean(data.isOptional),
        Semester: Number(data.semester ?? 0),
        DepartmentId: data.departmentId || null,
        MsarId: Number(data.msarId ?? 0),
        DegreeId: data.degreeId || null,
        Description: String(data.description ?? ""),
        PrerequisiteCourseIds: Array.isArray(data.prerequisites) ? data.prerequisites.filter(Boolean) : [],
        InstructorNationalIds: Array.isArray(data.instructors) ? data.instructors.filter(Boolean) : [],
      };
  
      if (typeof window !== "undefined") {
        console.debug("[AddCourse] Submitting payload", payload);
      }
  
      const res = await fetch(`${API_BASE}/AddCourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
  
      const body = await res.json();
  
      if (!res.ok || body.succeeded === false) {
        console.error("❌ createCourse failed", body);
        return { success: false, data: null, message: body.message || "فشل في إضافة المقرر" };
      }
  
      return { success: true, data: body.data, message: body.message || "تمت إضافة المقرر بنجاح" };
    } catch (error) {
      console.error("❌ Error creating course:", error);
      return { success: false, data: null, message: "حدث خطأ أثناء إضافة المقرر" };
    }
  }
    // 🔹 PUT update existing course
    static async updateCourse(data: UpdateCourseData): Promise<{ success: boolean; data: any; message?: string }> {
      try {
        const token = this.getToken();
        const formData = new FormData();
  
        formData.append("Id", data.id);
        formData.append("Code", data.code);
        formData.append("Name", data.name);
        formData.append("CreditHours", String(data.creditHours));
        // Backend expects boolean and integer for Semester; coerce safely
        formData.append("IsOptional", data.isOptional ? "true" : "false");
        formData.append("Semester", String(Number(data.semester)));
        // Per current API contract for UpdateCourse, do NOT send DepartmentId/DegreeId/MsarId
        // formData.append("DepartmentId", String(data.departmentId));
        // formData.append("MsarId", String(data.msarId));
        // formData.append("DegreeId", String(data.degreeId || 0));
        if (data.description) formData.append("Description", data.description);
  
        data.prerequisites.forEach((p) => formData.append("PrerequisiteCourseIds", p));
        data.instructors.forEach((i) => formData.append("InstructorNationalIds", i));
  
        const res = await fetch(`${API_BASE}/UpdateCourse`, {
          method: "PUT",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
  
        const body = await res.json();
  
        if (!res.ok) {
          console.error("❌ updateCourse failed", body);
          return { success: false, data: null, message: body.message || "فشل في تحديث المقرر" };
        }
  
        return { success: true, data: body.data, message: body.message || "تم تحديث المقرر بنجاح" };
      } catch (error) {
        console.error("❌ Error updating course:", error);
        return { success: false, data: null, message: "حدث خطأ أثناء تحديث المقرر" };
      }
    }
  
    // 🔹 DELETE course by id (robust against various backend routes)
    static async deleteCourse(id: string): Promise<{ success: boolean; message?: string }> {
      try {
        const token = this.getToken();
        const headers: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Preferred: DELETE /api/Course/DeleteCourse/{id}
        let res = await fetch(`${API_BASE}/DeleteCourse/${encodeURIComponent(id)}`, { method: "DELETE", headers });
        let text = await res.text();
        let json: any; try { json = JSON.parse(text); } catch { json = text; }

        // Fallbacks: query param or POST form if DELETE not allowed
        if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 400)) {
          // Try query param: /api/Course/DeleteCourse?id=...
          res = await fetch(`${API_BASE}/DeleteCourse?id=${encodeURIComponent(id)}`, { method: "DELETE", headers });
          text = await res.text();
          try { json = JSON.parse(text); } catch { json = text; }

          if (!res.ok && res.status === 405) {
            // Some backends expose POST /DeleteCourse with form body
            const form = new FormData();
            form.append("Id", id);
            res = await fetch(`${API_BASE}/DeleteCourse`, { method: "POST", headers, body: form as any });
            text = await res.text();
            try { json = JSON.parse(text); } catch { json = text; }
          }
        }

        if (!res.ok) {
          const msg = (typeof json === 'object' && json?.message) || `❌ Failed: ${res.status} ${res.statusText}`;
          console.error("❌ deleteCourse failed", json);
          return { success: false, message: msg };
        }

        if (json?.succeeded === true || json === true || text === "true" || text === "") {
          return { success: true, message: (typeof json === 'object' && json?.message) || "تم حذف المقرر بنجاح" };
        }
        return { success: false, message: (typeof json === 'object' && json?.message) || "فشل في حذف المقرر" };
      } catch (error) {
        console.error("❌ Error deleting course:", error);
        return { success: false, message: "حدث خطأ أثناء حذف المقرر" };
      }
    }
  }
  