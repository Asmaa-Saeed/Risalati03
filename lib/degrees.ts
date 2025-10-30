// Types and interfaces for degrees management matching backend API
export interface Degree {
  id: number;
  name: string;
  description?: string;
  standardDurationYears: number | null;
  departmentId: number;
  generalDegree: string;
}

export interface CreateDegreeData {
  name: string;
  description?: string;
  standardDurationYears?: number | null;
  departmentId: number;
  generalDegree: string;
}

export interface UpdateDegreeData extends Partial<CreateDegreeData> {
  id: number;
}

// API Response structure
export interface DegreesApiResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Degree[];
}

// Mock data service matching API structure
export class DegreesService {
  private static degrees: Degree[] = [
    {
      id: 1,
      name: "ماجستير العلوم في المحاسبة (عربي)",
      description: "",
      standardDurationYears: null,
      departmentId: 1,
      generalDegree: "0",
    },
    {
      id: 3,
      name: "ماجستير العلوم في المحاسبة (إنجليزي)",
      description: "",
      standardDurationYears: null,
      departmentId: 1,
      generalDegree: "0",
    },
    {
      id: 4,
      name: "دكتوراه الفلسفة في المحاسبة (عربي)",
      description: "",
      standardDurationYears: null,
      departmentId: 1,
      generalDegree: "0",
    },
    {
      id: 5,
      name: "دكتوراه الفلسفة في المحاسبة (إنجليزي)",
      description: "",
      standardDurationYears: null,
      departmentId: 1,
      generalDegree: "0",
    },
  ];

  // Simulate API delay
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getDegrees(): Promise<DegreesApiResponse> {
    await this.delay();
    try {
      // Dynamically import to avoid SSR/localStorage issues
      const { getDegrees } = await import('@/actions/degreeApi');
      const response = await getDegrees();

      if (response.succeeded && Array.isArray(response.data)) {
        return response;
      }

      return {
        succeeded: false,
        message: response.message || 'حدث خطأ في جلب البيانات',
        errors: response.errors || ['Unknown error'],
        data: [],
      };
    } catch (error) {
      // Fallback to mock data in case of API failure to keep UI functional
      return {
        succeeded: true,
        message: 'تم استخدام البيانات التجريبية',
        errors: [],
        data: this.degrees,
      };
    }
  }

  static async getDegree(id: number): Promise<{ succeeded: boolean; data: Degree | null; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      const degree = this.degrees.find(d => d.id === id);
      if (!degree) {
        return {
          succeeded: false,
          data: null,
          message: "الدرجة العلمية غير موجودة",
          errors: ["Degree not found"],
        };
      }
      return {
        succeeded: true,
        data: degree,
        message: "Operation successful",
      };
    } catch (error) {
      return {
        succeeded: false,
        data: null,
        message: "حدث خطأ في جلب البيانات",
        errors: ["Database error"],
      };
    }
  }

  static async createDegree(degreeData: CreateDegreeData): Promise<{ succeeded: boolean; data: Degree | null; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      // Prefer calling real API if available
      const { createDegree } = await import('@/actions/degreeApi');
      const response = await createDegree({
        name: degreeData.name,
        description: degreeData.description,
        standardDurationYears: degreeData.standardDurationYears ?? null,
        departmentId: degreeData.departmentId,
        generalDegree: degreeData.generalDegree,
      });

      if (response.succeeded && response.data) {
        const created: Degree = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description ?? "",
          standardDurationYears: response.data.standardDurationYears,
          departmentId: response.data.departmentId,
          generalDegree: response.data.generalDegree,
        };
        return {
          succeeded: true,
          data: created,
          message: response.message || 'تم إضافة الدرجة العلمية بنجاح',
          errors: response.errors || [],
        };
      }

      return {
        succeeded: false,
        data: null,
        message: response.message || 'حدث خطأ في إضافة الدرجة العلمية',
        errors: response.errors || ['Create failed'],
      };
    } catch (error) {
      // Fallback to mock behavior to keep UI functional without API
      try {
        const newDegree: Degree = {
          ...degreeData,
          id: Math.max(0, ...this.degrees.map(d => d.id)) + 1,
          description: degreeData.description || "",
          standardDurationYears: degreeData.standardDurationYears ?? null,
          generalDegree: degreeData.generalDegree,
        };

        this.degrees.push(newDegree);

        return {
          succeeded: true,
          data: newDegree,
          message: "تم إضافة الدرجة العلمية (بيانات تجريبية)",
          errors: [],
        };
      } catch {
        return {
          succeeded: false,
          data: null,
          message: "حدث خطأ في إضافة الدرجة العلمية",
          errors: ["Validation failed"],
        };
      }
    }
  }

  static async updateDegree(degreeData: UpdateDegreeData): Promise<{ succeeded: boolean; data: Degree | null; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      // Call real API if available
      const { updateDegree } = await import('@/actions/degreeApi');
      const response = await updateDegree({
        id: degreeData.id,
        name: degreeData.name ?? '',
        description: degreeData.description ?? '',
        standardDurationYears: degreeData.standardDurationYears ?? 0,
        departmentId: degreeData.departmentId ?? this.degrees.find(d => d.id === degreeData.id)?.departmentId || 0,
        generalDegree: degreeData.generalDegree ?? this.degrees.find(d => d.id === degreeData.id)?.generalDegree || '',
      });

      if (response.succeeded && response.data) {
        const updated: Degree = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description ?? "",
          standardDurationYears: response.data.standardDurationYears,
          departmentId: response.data.departmentId,
          generalDegree: response.data.generalDegree,
        };
        return {
          succeeded: true,
          data: updated,
          message: response.message || 'تم تحديث الدرجة العلمية بنجاح',
          errors: response.errors || [],
        };
      }

      return {
        succeeded: false,
        data: null,
        message: response.message || 'حدث خطأ في تحديث الدرجة العلمية',
        errors: response.errors || ['Update failed'],
      };
    } catch (error) {
      // Fallback to mock update if API fails
      try {
        const index = this.degrees.findIndex(d => d.id === degreeData.id);
        if (index === -1) {
          return {
            succeeded: false,
            data: null,
            message: "الدرجة العلمية غير موجودة",
            errors: ["Degree not found"],
          };
        }

        const updatedDegree: Degree = {
          ...this.degrees[index],
          ...degreeData,
          description: degreeData.description !== undefined ? degreeData.description : this.degrees[index].description,
          standardDurationYears: degreeData.standardDurationYears !== undefined ? degreeData.standardDurationYears : this.degrees[index].standardDurationYears,
        };

        this.degrees[index] = updatedDegree;

        return {
          succeeded: true,
          data: updatedDegree,
          message: "تم تحديث الدرجة العلمية (بيانات تجريبية)",
          errors: [],
        };
      } catch {
        return {
          succeeded: false,
          data: null,
          message: "حدث خطأ في تحديث الدرجة العلمية",
          errors: ["Update failed"],
        };
      }
    }
  }

  static async deleteDegree(id: number): Promise<{ succeeded: boolean; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      // Try using actions layer if available
      try {
        const { deleteDegree } = await import('@/actions/degreeApi');
        const response = await deleteDegree(id);
        if (response.succeeded) {
          return {
            succeeded: true,
            message: response.message || 'تم حذف الدرجة العلمية بنجاح',
            errors: response.errors || [],
          };
        }
        return {
          succeeded: false,
          message: response.message || 'حدث خطأ في حذف الدرجة العلمية',
          errors: response.errors || ['Delete failed'],
        };
      } catch {
        // Direct fetch if actions import fails (e.g., SSR/import issues)
        const apiUrl = (process as any).env?.NEXT_PUBLIC_API_URL;
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!apiUrl || !token) {
          throw new Error('API URL or token missing');
        }

        const res = await fetch(`${apiUrl}/Degree/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'accept': '*/*',
          },
        });

        const text = await res.text();
        if (!res.ok) {
          throw new Error(`Failed: ${res.status} ${res.statusText} | ${text}`);
        }

        return {
          succeeded: true,
          message: 'تم حذف الدرجة العلمية بنجاح',
          errors: [],
        };
      }
    } catch (error) {
      // Fallback to in-memory deletion to keep UI responsive in dev/offline
      try {
        const index = this.degrees.findIndex(d => d.id === id);
        if (index === -1) {
          return {
            succeeded: false,
            message: "الدرجة العلمية غير موجودة",
            errors: ["Degree not found"],
          };
        }

        this.degrees.splice(index, 1);

        return {
          succeeded: true,
          message: "تم حذف الدرجة العلمية (بيانات تجريبية)",
          errors: [],
        };
      } catch {
        return {
          succeeded: false,
          message: "حدث خطأ في حذف الدرجة العلمية",
          errors: ["Delete failed"],
        };
      }
    }
  }

  // Get available departments for dropdown
  static getDepartments() {
    return [
      { id: 1, name: "قسم المحاسبة" },
      { id: 2, name: "قسم إدارة الأعمال" },
      { id: 3, name: "قسم الاقتصاد" },
      { id: 4, name: "قسم التسويق" },
      { id: 5, name: "قسم المالية والاستثمار" },
      { id: 6, name: "قسم إدارة الموارد البشرية" },
      { id: 7, name: "قسم نظم المعلومات الإدارية" },
      { id: 8, name: "قسم إدارة الجودة" },
    ];
  }
}
