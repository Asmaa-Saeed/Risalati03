// 📁 /lib/courses.ts
// ✅ Course service layer - works directly with backend API (FormData version)

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
  msarId: number;
  prerequisites: string[];
  description?: string;
  instructors: string[]; // instructor nationalIds
}

export interface UpdateCourseData extends CreateCourseData {
  id: string;
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
  static async getCourses(): Promise<{
    success: boolean;
    data: Course[];
    message?: string;
  }> {
    try {
      const token = this.getToken();
      const res = await fetch(`${API_BASE}/GetAll`, {
        headers: {
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("[CoursesService.getCourses] Non-OK response", {
          status: res.status,
          statusText: res.statusText,
          body: text,
        });
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      return {
        success: true,
        data: data.data || data || [],
        message: "تم جلب المقررات بنجاح",
      };
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      return {
        success: false,
        data: [],
        message: "حدث خطأ أثناء تحميل المقررات",
      };
    }
  }

  // 🔹 POST create new course (✅ FormData version)
  static async createCourse(
    data: CreateCourseData
  ): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const token = this.getToken();

      const formData = new FormData();
      formData.append("Code", data.code.trim());
      formData.append("Name", data.name.trim());
      formData.append("CreditHours", String(data.creditHours));
      formData.append("IsOptional", data.isOptional ? "true" : "false");
      formData.append("Semester", String(Number(data.semester)));
      formData.append("MsarId", String(Number(data.msarId)));
      formData.append("Description", data.description || "");

      if (Array.isArray(data.prerequisites)) {
        data.prerequisites.forEach((id) =>
          formData.append("PrerequisiteCourseIds", id)
        );
      }
      if (Array.isArray(data.instructors)) {
        data.instructors.forEach((id) =>
          formData.append("InstructorNationalIds", id)
        );
      }

      console.debug("[AddCourse] Submitting FormData", Object.fromEntries(formData));

      const res = await fetch(`${API_BASE}/AddCourse`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const body = await res.json();

      if (!res.ok || body.succeeded === false) {
        console.error("❌ createCourse failed", body);
        return {
          success: false,
          data: null,
          message: body.message || "فشل في إضافة المقرر",
        };
      }

      return {
        success: true,
        data: body.data,
        message: body.message || "تمت إضافة المقرر بنجاح",
      };
    } catch (error) {
      console.error("❌ Error creating course:", error);
      return {
        success: false,
        data: null,
        message: "حدث خطأ أثناء إضافة المقرر",
      };
    }
  }

  // 🔹 PUT update existing course
  static async updateCourse(
    data: UpdateCourseData
  ): Promise<{ success: boolean; data: any; message?: string }> {
    try {
      const token = this.getToken();
      const formData = new FormData();

      formData.append("Id", data.id);
      formData.append("Code", data.code);
      formData.append("Name", data.name);
      formData.append("CreditHours", String(data.creditHours));
      formData.append("IsOptional", data.isOptional ? "true" : "false");
      formData.append("Semester", String(Number(data.semester)));
      formData.append("MsarId", String(Number(data.msarId)));
      if (data.description) formData.append("Description", data.description);

      data.prerequisites.forEach((p) =>
        formData.append("PrerequisiteCourseIds", p)
      );
      data.instructors.forEach((i) =>
        formData.append("InstructorNationalIds", i)
      );

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
        return {
          success: false,
          data: null,
          message: body.message || "فشل في تحديث المقرر",
        };
      }

      return {
        success: true,
        data: body.data,
        message: body.message || "تم تحديث المقرر بنجاح",
      };
    } catch (error) {
      console.error("❌ Error updating course:", error);
      return {
        success: false,
        data: null,
        message: "حدث خطأ أثناء تحديث المقرر",
      };
    }
  }

  // 🔹 DELETE course by id
  static async deleteCourse(
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE}/DeleteCourse/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
      });

      const body = await res.json();

      if (!res.ok) {
        console.error("❌ deleteCourse failed", body);
        return {
          success: false,
          message: body.message || "فشل في حذف المقرر",
        };
      }

      return {
        success: true,
        message: body.message || "تم حذف المقرر بنجاح",
      };
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      return { success: false, message: "حدث خطأ أثناء حذف المقرر" };
    }
  }
}
