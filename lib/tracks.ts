// lib/tracks.ts
// =========================
// TracksService.ts - Fixed version with correct department mapping and debug logging

export interface Track {
  id: number;
  name: string;
  code: string;
  degreeId: number;
  degree: {
    id: number;
    name: string;
    description: string;
    standardDurationYears: number | null;
    departmentId: number;
    generalDegree: string;
  };
  departmentId?: number;
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackData {
  name: string;
  code: string;
  degreeId: number;
  departmentId: number;
}

export interface UpdateTrackData extends Partial<Omit<CreateTrackData, 'id'>> {
  id: number;
  code?: string;
}

export interface TracksApiResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Track[];
}

export interface TrackApiResponse {
  succeeded: boolean;
  data: Track | null;
  message?: string;
  errors?: string[];
}

export interface LookupItem {
  id: number;
  value: string;
}

export interface LookupApiResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: LookupItem[];
}

export class TracksService {
  private static departmentsCache: LookupItem[] | null = null;

  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ✅ FIXED VERSION
  static async getTracks(): Promise<TracksApiResponse> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const { getTracks } = await import('@/actions/trackActions');
      const result = await getTracks(token || "");

      if (result.success && result.data) {
        // First, get all departments
        const departments = await this.getDepartmentsFromAPI();
        
        // Create a map of department IDs to names for faster lookup
        const departmentMap = new Map<number, string>();
        departments.forEach(dept => {
          departmentMap.set(dept.id, dept.value);
        });

        // 🧩 Debug log: show department data
        console.log("📊 Departments fetched:", departments);
        console.log("📋 Department Map:", Object.fromEntries(departmentMap));

        const tracksWithDepartments = result.data.map((track: any) => {
          // Get department ID from track or its nested degree object
          const departmentId = track.departmentId || track.degree?.departmentId || 0;
          
          // Get department name from the map, or use a default value if not found
          const departmentName = departmentMap.get(departmentId) || "غير محدد";

          // 🧩 Debug log for each track
          console.log(
            `🎯 Track: ${track.name} | departmentId: ${departmentId} | departmentName: ${departmentName}`
          );

          return {
            ...track,
            departmentId, // Make sure departmentId is set on the track
            departmentName,
          };
        });

        return {
          succeeded: true,
          message: result.message || "تم جلب المسارات بنجاح",
          errors: [],
          data: tracksWithDepartments,
        };
      } else {
        return {
          succeeded: false,
          message: result.message || "حدث خطأ في جلب المسارات",
          errors: ["فشل في الاتصال بالخادم"],
          data: [],
        };
      }
    } catch (error) {
      console.error("❌ Error in getTracks:", error);
      return {
        succeeded: false,
        message: "حدث خطأ في جلب البيانات",
        errors: ["Database connection failed"],
        data: [],
      };
    }
  }

  static async getTracksByDegree(degreeId: number): Promise<{ 
    succeeded: boolean; 
    data: LookupItem[]; 
    message?: string; 
    errors?: string[] 
  }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          succeeded: false,
          data: [],
          message: 'يجب تسجيل الدخول أولاً',
          errors: ['Not authenticated']
        };
      }

      const { getMsaratByDegreeId } = await import('@/actions/trackActions');
      const result = await getMsaratByDegreeId(degreeId, token);

      if (result.success && result.data) {
        return {
          succeeded: true,
          data: result.data,
          message: 'تم جلب المسارات بنجاح',
          errors: []
        };
      }

      return {
        succeeded: false,
        data: [],
        message: result.message || 'حدث خطأ في جلب المسارات',
        errors: [result.message || 'Unknown error']
      };
    } catch (error) {
      console.error('Error in getTracksByDegree:', error);
      return {
        succeeded: false,
        data: [],
        message: 'حدث خطأ في جلب قائمة المسارات',
        errors: ['Error fetching tracks by degree']
      };
    }
  }

  static async getTrack(id: number): Promise<TrackApiResponse> {
    await this.delay();
    try {
      const response = await this.getTracks();
      const track = response.data.find(t => t.id === id);

      if (!track) {
        return {
          succeeded: false,
          data: null,
          message: "المسار غير موجود",
          errors: ["Track not found"],
        };
      }

      return {
        succeeded: true,
        data: track,
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

  static async createTrack(trackData: CreateTrackData): Promise<TrackApiResponse> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          succeeded: false,
          data: null,
          message: "الرجاء تسجيل الدخول أولاً",
          errors: ["Authentication required"],
        };
      }

      console.log("🔹 Creating track with data:", JSON.stringify(trackData, null, 2));
      
      // Ensure departmentId is a valid number
      const departmentId = Number(trackData.departmentId);
      if (isNaN(departmentId) || departmentId <= 0) {
        throw new Error("معرف القسم غير صالح");
      }

      const { createTrack } = await import('@/actions/trackActions');
      const result = await createTrack({
        name: trackData.name.trim(),
        code: trackData.code.trim(),
        degreeId: Number(trackData.degreeId),
        departmentId: departmentId, // Ensure it's a number
      }, token);

      if (result.success && result.data) {
        return {
          succeeded: true,
          data: result.data,
          message: result.message || "تم إضافة المسار بنجاح",
        };
      } else {
        const errorMessage = result.message || "حدث خطأ في إضافة المسار";
        const errors = result.errors || [errorMessage];
        return {
          succeeded: false,
          data: null,
          message: errorMessage,
          errors: errors,
        };
      }
    } catch (error) {
      console.error("❌ Error creating track:", error);
      return {
        succeeded: false,
        data: null,
        message: "حدث خطأ في إضافة المسار",
        errors: ["Validation failed"],
      };
    }
  }

  static async updateTrack(trackData: UpdateTrackData): Promise<TrackApiResponse> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          succeeded: false,
          data: null,
          message: "الرجاء تسجيل الدخول أولاً",
          errors: ["Authentication required"],
        };
      }

      const { updateTrack } = await import('@/actions/trackActions');
      const result = await updateTrack(trackData.id, {
        name: trackData.name!,
        degreeId: trackData.degreeId!,
        departmentId: trackData.departmentId!,
      }, token);

      if (result.success && result.data) {
        return {
          succeeded: true,
          data: result.data,
          message: result.message || "تم تحديث المسار بنجاح",
        };
      } else {
        return {
          succeeded: false,
          data: null,
          message: result.message || "حدث خطأ في تحديث المسار",
          errors: ["Update failed"],
        };
      }
    } catch (error) {
      console.error("❌ Error updating track:", error);
      return {
        succeeded: false,
        data: null,
        message: "حدث خطأ في تحديث المسار",
        errors: ["Update failed"],
      };
    }
  }

  static async deleteTrack(id: number): Promise<{ succeeded: boolean; message?: string; errors?: string[] }> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        return {
          succeeded: false,
          message: "الرجاء تسجيل الدخول أولاً",
          errors: ["Authentication required"],
        };
      }

      const { deleteTrack } = await import('@/actions/trackActions');
      const result = await deleteTrack(id, token);

      if (result.success) {
        return {
          succeeded: true,
          message: result.message || "تم حذف المسار بنجاح",
        };
      } else {
        return {
          succeeded: false,
          message: result.message || "حدث خطأ في حذف المسار",
          errors: ["Delete failed"],
        };
      }
    } catch (error) {
      console.error("❌ Error deleting track:", error);
      return {
        succeeded: false,
        message: "حدث خطأ في حذف المسار",
        errors: ["Delete failed"],
      };
    }
  }

  static async getDegrees(): Promise<LookupItem[]> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const { getDegrees } = await import('@/actions/trackActions');
    const result = await getDegrees(token || "");

    if (result.success && result.data) {
      return result.data.map((degree: any) => ({
        id: degree.id,
        value: degree.value,
      }));
    } else {
      return [];
    }
  }

  private static async getDepartmentsFromAPI(): Promise<LookupItem[]> {
    if (this.departmentsCache) return this.departmentsCache;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        console.warn("⚠️ No authentication token available");
        return [];
      }

      const { getDepartments } = await import('@/actions/trackActions');
      const result = await getDepartments(token);

      if (result.success && result.data) {
        this.departmentsCache = result.data.map((dept: any) => ({
          id: dept.id,
          value: dept.value || dept.name || `Department ${dept.id}`,
        }));
        return this.departmentsCache;
      }
      return [];
    } catch (error) {
      console.error("❌ Error fetching departments:", error);
      return [];
    }
  }
}
