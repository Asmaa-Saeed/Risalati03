// Types and service for academic titles lookup
export interface AcademicTitle {
  id: number;
  value: string;
}

export class AcademicTitlesService {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async getAcademicTitles(): Promise<{ success: boolean; data: AcademicTitle[]; message?: string }> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Call internal proxy route to avoid CORS issues
      const res = await fetch("/api/academic-titles", {
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        const baseMsg = `فشل في جلب الألقاب الأكاديمية (${res.status})`;
        const msg = res.status === 401 ? `${baseMsg} - الرجاء التأكد من تسجيل الدخول` : baseMsg;
        return { success: false, data: [], message: msg };
      }

      const raw = await res.json();
      // Try to normalize into { id, value }
      const data: AcademicTitle[] = (Array.isArray(raw) ? raw : []).map((item: any, idx: number) => ({
        id: typeof item.id === "number" ? item.id : idx + 1,
        value: typeof item.value === "string" ? item.value : (item.name || String(item) || ""),
      }));

      return { success: true, data };
    } catch (error) {
      console.error("❌ Error fetching academic titles:", error);
      return { success: false, data: [], message: "حدث خطأ أثناء تحميل الألقاب الأكاديمية" };
    }
  }
}
