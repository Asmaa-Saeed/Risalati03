// Types and interfaces for departments management
export interface Department {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  programId: string;
  programName: string;
  collegeId: string;
  collegeName: string;
  headOfDepartment: string;
  headOfDepartmentId: string;
  totalStudents: number;
  totalCourses: number;
  status: 'active' | 'inactive' | 'under_construction';
  establishedYear: number;
  phone: string;
  email: string;
  room: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  departmentId: string;
  name: string;
  description: string;
  programId: string;
  programName: string;
  collegeId: string;
  collegeName: string;
  headOfDepartment: string;
  headOfDepartmentId: string;
  totalStudents: number;
  totalCourses: number;
  status: 'active' | 'inactive' | 'under_construction';
  establishedYear: number;
  phone: string;
  email: string;
  room: string;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Program {
  id: number;
  value: string;
  type: string;
}

// API service class for departments
export class DepartmentsService {
  // Get token from localStorage
  private static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Simulate API delay
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getDepartments(): Promise<{ success: boolean; data: Department[]; message?: string }> {
    await this.delay();

    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          data: [],
          message: 'الرجاء تسجيل الدخول أولاً',
        };
      }

      // Import the API function dynamically to avoid SSR issues
      const { getDepartments } = await import('@/actions/departmentActions');
      const response = await getDepartments(token);

      if (response.success && response.data) {
        // Transform API data to match our interface
        const transformedData: Department[] = response.data.map((item: any) => ({
          id: item.id.toString(),
          departmentId: `DEPT_${item.id}`,
          name: item.name,
          description: item.description || '',
          programId: item.programId.toString(),
          programName: 'برنامج غير محدد', // Will be updated when we get programs
          collegeId: '1',
          collegeName: '', // Remove default college name
          headOfDepartment: 'لم يحدد',
          headOfDepartmentId: `HOD_${item.id}`,
          totalStudents: 0,
          totalCourses: 0,
          status: 'active' as const,
          establishedYear: new Date().getFullYear(),
          phone: 'لم يحدد',
          email: 'department@university.edu.eg',
          room: 'لم يحدد',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        return {
          success: true,
          data: transformedData,
          message: response.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || 'حدث خطأ في جلب البيانات',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'حدث خطأ في جلب البيانات',
      };
    }
  }

  static async getPrograms(): Promise<{ success: boolean; data: Program[]; message?: string }> {
    await this.delay();

    try {
      console.log("📡 Calling getPrograms API without token...");

      // Import the API function dynamically
      const { getPrograms } = await import('@/actions/departmentActions');
      const response = await getPrograms(); // No token needed for lookup
      console.log("📡 Programs API response:", response);

      if (response.success && response.data) {
        // Transform API data to match our interface
        const transformedData: Program[] = response.data.map((item: any) => ({
          id: item.id,
          value: item.value,
          type: item.type || 'academic',
        }));

        console.log("🔄 Transformed programs data:", transformedData);

        return {
          success: true,
          data: transformedData,
          message: response.message,
        };
      }

      return {
        success: false,
        data: [],
        message: response.message || 'حدث خطأ في جلب البرامج',
      };
    } catch (error) {
      console.error("❌ Error in DepartmentsService.getPrograms:", error);

      // Fallback: Return mock data for testing
      console.log("🔄 Using fallback programs data for testing...");
      const fallbackPrograms: Program[] = [
        { id: 1, value: 'برنامج علوم الحاسوب', type: 'academic' },
        { id: 2, value: 'برنامج تقنية المعلومات', type: 'academic' },
        { id: 3, value: 'برنامج الطب البشري', type: 'academic' },
        { id: 4, value: 'برنامج إدارة الأعمال', type: 'academic' },
        { id: 5, value: 'برنامج الكيمياء', type: 'academic' },
        { id: 6, value: 'برنامج الأدب العربي', type: 'academic' },
      ];

      return {
        success: true,
        data: fallbackPrograms,
        message: 'تم استخدام البيانات التجريبية',
      };
    }
  }

  static async getDepartment(id: string): Promise<{ success: boolean; data: Department | null; message?: string }> {
    await this.delay();

    try {
      const response = await this.getDepartments();
      if (response.success) {
        const department = response.data.find(d => d.id === id);
        if (department) {
          return {
            success: true,
            data: department,
          };
        }
      }

      return {
        success: false,
        data: null,
        message: 'القسم غير موجود',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في جلب البيانات',
      };
    }
  }

  static async createDepartment(departmentData: CreateDepartmentData): Promise<{ success: boolean; data: Department | null; message?: string }> {
    await this.delay();

    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          data: null,
          message: 'الرجاء تسجيل الدخول أولاً',
        };
      }

      // Import the API function dynamically
      const { createDepartment } = await import('@/actions/departmentActions');
      const apiData = {
        name: departmentData.name,
        description: departmentData.description,
        programId: parseInt(departmentData.programId),
      };

      const response = await createDepartment(apiData, token);

      if (response.success && response.data) {
        // Transform API response to match our interface
        const newDepartment: Department = {
          id: response.data.id.toString(),
          departmentId: departmentData.departmentId,
          name: response.data.name,
          description: response.data.description || '',
          programId: response.data.programId.toString(),
          programName: departmentData.programName,
          collegeId: departmentData.collegeId,
          collegeName: departmentData.collegeName,
          headOfDepartment: departmentData.headOfDepartment,
          headOfDepartmentId: departmentData.headOfDepartmentId,
          totalStudents: departmentData.totalStudents,
          totalCourses: departmentData.totalCourses,
          status: departmentData.status,
          establishedYear: departmentData.establishedYear,
          phone: departmentData.phone,
          email: departmentData.email,
          room: departmentData.room,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          data: newDepartment,
          message: response.message,
        };
      }

      return {
        success: false,
        data: null,
        message: response.message || 'حدث خطأ في إضافة القسم',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في إضافة القسم',
      };
    }
  }

  static async updateDepartment(departmentData: UpdateDepartmentData): Promise<{ success: boolean; data: Department | null; message?: string }> {
    await this.delay();

    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          data: null,
          message: 'الرجاء تسجيل الدخول أولاً',
        };
      }

      // Import the API function dynamically
      const { updateDepartment } = await import('@/actions/departmentActions');
      const apiData = {
        name: departmentData.name!,
        description: departmentData.description!,
        programId: parseInt(departmentData.programId!),
      };

      const response = await updateDepartment(parseInt(departmentData.id), apiData, token);

      if (response.success && response.data) {
        // Transform API response to match our interface
        const updatedDepartment: Department = {
          id: departmentData.id,
          departmentId: departmentData.departmentId || `DEPT_${departmentData.id}`,
          name: response.data.name,
          description: response.data.description || '',
          programId: response.data.programId.toString(),
          programName: departmentData.programName || 'برنامج غير محدد',
          collegeId: departmentData.collegeId || '1',
          collegeName: departmentData.collegeName || '', // Use empty string instead of default college name
          headOfDepartment: departmentData.headOfDepartment || 'لم يحدد',
          headOfDepartmentId: departmentData.headOfDepartmentId || `HOD_${departmentData.id}`,
          totalStudents: departmentData.totalStudents || 0,
          totalCourses: departmentData.totalCourses || 0,
          status: departmentData.status || 'active',
          establishedYear: departmentData.establishedYear || new Date().getFullYear(),
          phone: departmentData.phone || 'لم يحدد',
          email: departmentData.email || 'department@university.edu.eg',
          room: departmentData.room || 'لم يحدد',
          createdAt: departmentData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          data: updatedDepartment,
          message: response.message,
        };
      }

      return {
        success: false,
        data: null,
        message: response.message || 'حدث خطأ في تحديث القسم',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: 'حدث خطأ في تحديث القسم',
      };
    }
  }

  static async deleteDepartment(id: string): Promise<{ success: boolean; message?: string }> {
    await this.delay();

    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'الرجاء تسجيل الدخول أولاً',
        };
      }

      // Import the API function dynamically
      const { deleteDepartment } = await import('@/actions/departmentActions');
      const response = await deleteDepartment(parseInt(id), token);

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'حدث خطأ في حذف القسم',
      };
    }
  }
}
