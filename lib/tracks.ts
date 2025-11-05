// lib/tracks.ts
// =========================
// TracksService.ts - Fixed version with correct department mapping and create/update

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
    departmentName: string;
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

export interface UpdateTrackData extends CreateTrackData {
  id: number;
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

export class TracksService {
  private static departmentsCache: LookupItem[] | null = null;

  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ================= GET TRACKS
  static async getTracks(): Promise<TracksApiResponse> {
    await this.delay();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("https://professor.runasp.net/api/Msar", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok || !result.succeeded) {
        return { succeeded: false, message: result.message || "حدث خطأ في جلب المسارات", errors: result.errors || ["Server error"], data: [] };
      }

      const tracksWithDepartments = result.data.map((track: any) => {
        const departmentName =
          track.departmentName ||
          (track.degree?.departmentName && track.degree.departmentName !== "" ? track.degree.departmentName : "غير محدد");

        return {
          ...track,
          departmentId: track.departmentId || track.degree?.departmentId || 0,
          departmentName,
        };
      });

      return { succeeded: true, message: result.message || "تم جلب المسارات بنجاح", errors: [], data: tracksWithDepartments };
    } catch (error: any) {
      console.error("❌ Error in getTracks:", error);
      return { succeeded: false, message: "حدث خطأ في جلب البيانات", errors: [error.message || "Database connection failed"], data: [] };
    }
  }
// ================= CREATE TRACK
static async createTrack(data: CreateTrackData): Promise<TrackApiResponse> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return { succeeded: false, data: null, errors: ["يجب تسجيل الدخول أولاً"], message: "يجب تسجيل الدخول أولاً" };

    const res = await fetch(`https://professor.runasp.net/api/Msar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });

    // هنا نحاول parse الـ JSON حتى لو كان خطأ
    let result: any = {};
    try { result = await res.json(); } catch {}

    if (!res.ok || !result.succeeded) {
      const serverMessage = result?.message || (result?.errors ? Object.values(result.errors).flat().join("، ") : "حدث خطأ في الإضافة");
      return { succeeded: false, data: null, errors: result?.errors || [serverMessage], message: serverMessage };
    }

    return { succeeded: true, data: result.data, message: result.message || "تم إنشاء المسار بنجاح", errors: [] };
  } catch (error: any) {
    const msg = error?.message || "حدث خطأ غير متوقع";
    return { succeeded: false, data: null, errors: [msg], message: msg };
  }
}

// ================= UPDATE TRACK
static async updateTrack(data: UpdateTrackData): Promise<TrackApiResponse> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return { succeeded: false, data: null, errors: ["يجب تسجيل الدخول أولاً"], message: "يجب تسجيل الدخول أولاً" };

    const res = await fetch(`https://professor.runasp.net/api/Msar/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });

    let result: any = {};
    try { result = await res.json(); } catch {}

    if (!res.ok || !result.succeeded) {
      const serverMessage = result?.message || (result?.errors ? Object.values(result.errors).flat().join("، ") : "حدث خطأ في التعديل");
      return { succeeded: false, data: null, errors: result?.errors || [serverMessage], message: serverMessage };
    }

    return { succeeded: true, data: result.data, message: result.message || "تم تحديث المسار بنجاح", errors: [] };
  } catch (error: any) {
    const msg = error?.message || "حدث خطأ غير متوقع";
    return { succeeded: false, data: null, errors: [msg], message: msg };
  }
}

// ================= DELETE TRACK
static async deleteTrack(id: number): Promise<{ succeeded: boolean; message?: string; errors?: string[] }> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return { succeeded: false, message: "الرجاء تسجيل الدخول أولاً", errors: ["Authentication required"] };

    const res = await fetch(`https://professor.runasp.net/api/Msar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    let result: any = {};
    try { result = await res.json(); } catch {}

    const serverMessage = result?.message || (result?.errors ? Object.values(result.errors).flat().join("، ") : "حدث خطأ في الحذف");
    return result.succeeded
      ? { succeeded: true, message: serverMessage }
      : { succeeded: false, message: serverMessage, errors: result?.errors || [serverMessage] };
  } catch (error: any) {
    const msg = error?.message || "حدث خطأ في حذف المسار";
    return { succeeded: false, message: msg, errors: [msg] };
  }
}

}