// 📁 /lib/instructors.ts
// Types & service layer for instructors management

export interface Instructor {
  id: string;
  name: string;
  nationalId: string;
  title: string;
  department: string;
  phone?: string;
  email?: string;
}

export interface CreateInstructorData {
  name: string;            // Name
  academicTitle: number;   // AcademicTitle (ID)
  departmentId: number;    // DepartmentId
  nationalId: string;      // NationalId
  phone: string;           // Phone
  email: string;           // Email
}

export interface UpdateInstructorData {
  id: string;
  name: string;
  academicTitle: number;
  departmentId: number;
  phone: string;
  email: string;
}

export class InstructorsService {
  // 🔹 Get all instructors from API
  static async getInstructors(): Promise<{ success: boolean; data: Instructor[]; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { getAllInstructors } = await import("@/actions/instructorActions");
      const result = await getAllInstructors(token || undefined);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: "تم جلب أعضاء هيئة التدريس بنجاح",
        };
      }

      return { success: false, data: [], message: result.message || "فشل في تحميل البيانات" };
    } catch (error) {
      console.error("❌ Error fetching instructors:", error);
      return { success: false, data: [], message: "حدث خطأ أثناء تحميل أعضاء هيئة التدريس" };
    }
  }

  // 🔹 Create instructor via API
  static async createInstructor(data: CreateInstructorData): Promise<{ success: boolean; data: Instructor | null; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { createInstructor } = await import("@/actions/instructorActions");
      const result = await createInstructor(data, token || undefined);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message || "تمت إضافة عضو هيئة التدريس بنجاح",
        };
      }

      return {
        success: false,
        data: null,
        message: result.message || "فشل في إضافة عضو هيئة التدريس",
      };
    } catch (error) {
      console.error("❌ Error creating instructor:", error);
      return { success: false, data: null, message: "حدث خطأ في إضافة عضو هيئة التدريس" };
    }
  }

  // 🔹 Update instructor via API
  static async updateInstructor(data: UpdateInstructorData): Promise<{ success: boolean; data: Instructor | null; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { updateInstructor } = await import("@/actions/instructorActions");
      const payload = {
        id: data.id,
        name: data.name,
        academicTitle: data.academicTitle,
        departmentId: data.departmentId,
        phone: data.phone,
        email: data.email,
      };
      const result = await updateInstructor(payload, token || undefined);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message || "تم تحديث عضو هيئة التدريس بنجاح",
        };
      }

      return {
        success: false,
        data: null,
        message: result.message || "فشل في تحديث عضو هيئة التدريس",
      };
    } catch (error) {
      console.error("❌ Error updating instructor:", error);
      return { success: false, data: null, message: "حدث خطأ في تحديث عضو هيئة التدريس" };
    }
  }

  static async deleteInstructor(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { deleteInstructor } = await import("@/actions/instructorActions");
      const result = await deleteInstructor(id, token || undefined);
      return result;
    } catch (error) {
      console.error("❌ Error deleting instructor:", error);
      return { success: false, message: "حدث خطأ في حذف عضو هيئة التدريس" };
    }
  }
}
