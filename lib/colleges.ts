// Types and interfaces for colleges management
export interface College {
  id: number;
  name: string;
}

export interface CreateCollegeData {
  name: string;
}

export interface UpdateCollegeData {
  id: number;
  name: string;
}

// API integration service
export class CollegesService {
  // Simulate API delay for consistent UX
  private static delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getColleges(): Promise<{ success: boolean; data: College[]; message?: string }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          success: false,
          data: [],
          message: "الرجاء تسجيل الدخول أولاً",
        };
      }

      const { getColleges } = await import('@/actions/collegeActions');
      const result = await getColleges(token);

      if (result.success && result.data) {
        // Map API response to College interface
        const colleges: College[] = result.data.map((college: any) => ({
          id: college.id,
          name: college.name,
        }));

        return {
          success: true,
          data: colleges,
          message: result.message,
        };
      } else {
        return {
          success: false,
          data: [],
          message: result.message || "حدث خطأ في تحميل الكليات",
        };
      }
    } catch (error) {
      console.error("❌ Error fetching colleges:", error);
      return {
        success: false,
        data: [],
        message: "حدث خطأ في تحميل الكليات",
      };
    }
  }

  static async getCollege(id: number): Promise<{ success: boolean; data: College | null; message?: string }> {
    await this.delay();
    try {
      const response = await this.getColleges();
      if (response.success) {
        const college = response.data.find(c => c.id === id);
        if (!college) {
          return {
            success: false,
            data: null,
            message: 'الكلية غير موجودة',
          };
        }
        return {
          success: true,
          data: college,
        };
      } else {
        return {
          success: false,
          data: null,
          message: response.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في جلب بيانات الكلية',
      };
    }
  }

  static async createCollege(collegeData: CreateCollegeData): Promise<{ success: boolean; data: College | null; message?: string }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          success: false,
          data: null,
          message: "الرجاء تسجيل الدخول أولاً",
        };
      }

      console.log("🏛️ CollegesService.createCollege called with:", collegeData);
      const { createCollege } = await import('@/actions/collegeActions');
      const result = await createCollege(collegeData, token);

      if (result.success && result.data) {
        const college: College = {
          id: result.data.id,
          name: result.data.name,
        };

        return {
          success: true,
          data: college,
          message: result.message,
        };
      } else {
        return {
          success: false,
          data: null,
          message: result.message || "حدث خطأ في إضافة الكلية",
        };
      }
    } catch (error) {
      console.error("❌ Error creating college:", error);
      return {
        success: false,
        data: null,
        message: "حدث خطأ في إضافة الكلية",
      };
    }
  }

  static async updateCollege(collegeData: UpdateCollegeData): Promise<{ success: boolean; data: College | null; message?: string }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          success: false,
          data: null,
          message: "الرجاء تسجيل الدخول أولاً",
        };
      }

      console.log("🏛️ CollegesService.updateCollege called with:", collegeData);
      const { updateCollege } = await import('@/actions/collegeActions');
      const result = await updateCollege(collegeData.id, { name: collegeData.name }, token);

      if (result.success && result.data) {
        const college: College = {
          id: result.data.id,
          name: result.data.name,
        };

        return {
          success: true,
          data: college,
          message: result.message,
        };
      } else {
        return {
          success: false,
          data: null,
          message: result.message || "حدث خطأ في تحديث الكلية",
        };
      }
    } catch (error) {
      console.error("❌ Error updating college:", error);
      return {
        success: false,
        data: null,
        message: "حدث خطأ في تحديث الكلية",
      };
    }
  }

  static async deleteCollege(id: number): Promise<{ success: boolean; message?: string }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          success: false,
          message: "الرجاء تسجيل الدخول أولاً",
        };
      }

      console.log("🏛️ CollegesService.deleteCollege called with id:", id);
      const { deleteCollege } = await import('@/actions/collegeActions');
      const result = await deleteCollege(id, token);
      console.log("🏛️ CollegesService.deleteCollege result:", result);

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      console.error("❌ Error deleting college:", error);
      return {
        success: false,
        message: "حدث خطأ في حذف الكلية",
      };
    }
  }
}
