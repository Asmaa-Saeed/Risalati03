// Types and interfaces for universities management matching backend API
export interface University {
  id: number;
  name: string;
  // Additional fields for complete CRUD system
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUniversityData {
  name: string;
  nationalId: string; // Temporary National ID for now
}

export interface UpdateUniversityData {
  id: number;
  name: string;
}

// API Response structure
export interface UniversitiesApiResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: University[];
}

export interface UniversityApiResponse {
  succeeded: boolean;
  data: University | null;
  message?: string;
  errors?: string[];
}

// Mock data service matching API structure
export class UniversitiesService {
  private static universities: University[] = [
    {
      id: 1,
      name: "جامعة القاهرة",
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-10T10:00:00Z",
    },
    {
      id: 2,
      name: "جامعة الإسكندرية",
      createdAt: "2024-01-15T14:30:00Z",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: 3,
      name: "جامعة أسيوط",
      createdAt: "2024-02-01T09:15:00Z",
      updatedAt: "2024-02-01T09:15:00Z",
    },
    {
      id: 4,
      name: "جامعة المنصورة",
      createdAt: "2024-02-10T11:45:00Z",
      updatedAt: "2024-02-10T11:45:00Z",
    },
    {
      id: 5,
      name: "جامعة طنطا",
      createdAt: "2024-02-15T16:20:00Z",
      updatedAt: "2024-02-15T16:20:00Z",
    },
    {
      id: 6,
      name: "جامعة بنها",
      createdAt: "2024-03-01T08:30:00Z",
      updatedAt: "2024-03-01T08:30:00Z",
    },
    {
      id: 7,
      name: "جامعة الزقازيق",
      createdAt: "2024-03-10T14:00:00Z",
      updatedAt: "2024-03-10T14:00:00Z",
    },
    {
      id: 8,
      name: "جامعة بني سويف",
      createdAt: "2024-03-15T10:00:00Z",
      updatedAt: "2024-03-15T10:00:00Z",
    },
    {
      id: 9,
      name: "جامعة الفيوم",
      createdAt: "2024-03-20T15:30:00Z",
      updatedAt: "2024-03-20T15:30:00Z",
    },
    {
      id: 10,
      name: "جامعة السويس",
      createdAt: "2024-04-01T09:00:00Z",
      updatedAt: "2024-04-01T09:00:00Z",
    },
    {
      id: 11,
      name: "جامعة جنوب الوادي",
      createdAt: "2024-04-05T11:00:00Z",
      updatedAt: "2024-04-05T11:00:00Z",
    },
    {
      id: 12,
      name: "جامعة الأقصر",
      createdAt: "2024-04-10T13:00:00Z",
      updatedAt: "2024-04-10T13:00:00Z",
    },
    {
      id: 13,
      name: "جامعة مطروح",
      createdAt: "2024-04-15T16:00:00Z",
      updatedAt: "2024-04-15T16:00:00Z",
    },
    {
      id: 14,
      name: "جامعة الوادي الجديد",
      createdAt: "2024-04-20T10:00:00Z",
      updatedAt: "2024-04-20T10:00:00Z",
    },
    {
      id: 15,
      name: "جامعة حلوان",
      createdAt: "2024-05-01T08:00:00Z",
      updatedAt: "2024-05-01T08:00:00Z",
    },
    {
      id: 16,
      name: "جامعة المنوفية",
      createdAt: "2024-05-05T12:00:00Z",
      updatedAt: "2024-05-05T12:00:00Z",
    },
    {
      id: 17,
      name: "جامعة كفر الشيخ",
      createdAt: "2024-05-10T14:00:00Z",
      updatedAt: "2024-05-10T14:00:00Z",
    },
    {
      id: 18,
      name: "جامعة دمياط",
      createdAt: "2024-05-15T16:00:00Z",
      updatedAt: "2024-05-15T16:00:00Z",
    },
    {
      id: 19,
      name: "جامعة بورسعيد",
      createdAt: "2024-05-20T10:00:00Z",
      updatedAt: "2024-05-20T10:00:00Z",
    },
    {
      id: 20,
      name: "جامعة سوهاج",
      createdAt: "2024-05-25T11:00:00Z",
      updatedAt: "2024-05-25T11:00:00Z",
    },
  ];

  // Simulate API delay
  private static delay(ms: number = 800): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET /api/University/names - Get all universities
  static async getUniversities(): Promise<UniversitiesApiResponse> {
    await this.delay();
    try {
      return {
        succeeded: true,
        message: "تم جلب الجامعات بنجاح",
        errors: [],
        data: this.universities,
      };
    } catch (error) {
      return {
        succeeded: false,
        message: "حدث خطأ في جلب بيانات الجامعات",
        errors: ["فشل في الاتصال بالخادم"],
        data: [],
      };
    }
  }

  // POST /api/University/add - Create new university
  static async createUniversity(universityData: CreateUniversityData): Promise<UniversityApiResponse> {
    await this.delay();
    try {
      const newUniversity: University = {
        id: Math.max(...this.universities.map(u => u.id)) + 1,
        name: universityData.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.universities.push(newUniversity);

      return {
        succeeded: true,
        data: newUniversity,
        message: "تم إضافة الجامعة بنجاح",
      };
    } catch (error) {
      return {
        succeeded: false,
        data: null,
        message: "حدث خطأ في إضافة الجامعة",
        errors: ["فشل في حفظ البيانات"],
      };
    }
  }

  // PUT /api/University/update - Update university
  static async updateUniversity(universityData: UpdateUniversityData): Promise<UniversityApiResponse> {
    await this.delay();
    try {
      const index = this.universities.findIndex(u => u.id === universityData.id);
      if (index === -1) {
        return {
          succeeded: false,
          data: null,
          message: "الجامعة غير موجودة",
          errors: ["الجامعة المطلوبة غير موجودة"],
        };
      }

      const updatedUniversity: University = {
        ...this.universities[index],
        name: universityData.name,
        updatedAt: new Date().toISOString(),
      };

      this.universities[index] = updatedUniversity;

      return {
        succeeded: true,
        data: updatedUniversity,
        message: "تم تحديث الجامعة بنجاح",
      };
    } catch (error) {
      return {
        succeeded: false,
        data: null,
        message: "حدث خطأ في تحديث الجامعة",
        errors: ["فشل في تحديث البيانات"],
      };
    }
  }

  // DELETE /api/University/delete/{id} - Delete university
  static async deleteUniversity(id: number): Promise<{ succeeded: boolean; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      const index = this.universities.findIndex(u => u.id === id);
      if (index === -1) {
        return {
          succeeded: false,
          message: "الجامعة غير موجودة",
          errors: ["الجامعة المطلوبة غير موجودة"],
        };
      }

      this.universities.splice(index, 1);

      return {
        succeeded: true,
        message: "تم حذف الجامعة بنجاح",
      };
    } catch (error) {
      return {
        succeeded: false,
        message: "حدث خطأ في حذف الجامعة",
        errors: ["فشل في حذف البيانات"],
      };
    }
  }

  // Helper method to get university by ID
  static getUniversityById(id: number): University | undefined {
    return this.universities.find(u => u.id === id);
  }
}
