// /lib/semesters.ts
export interface SemesterItem {
  id: number;
  value: string;
}

export class SemestersService {
  static async getSemesters(): Promise<{ success: boolean; data: SemesterItem[]; message?: string }> {
    try {
      let base = process.env.NEXT_PUBLIC_API_URL || "";
      // Normalize base to avoid double / and duplicate /api
      base = base.replace(/\/$/, "");
      // If base already ends with /api, don't append /api again in endpoints
      const baseHasApi = /\/api$/i.test(base);

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Candidate endpoints in case sensitivity / naming differs across environments
      const pathCandidates = [
        `${baseHasApi ? base : base + "/api"}/Lookups/semesters`,
        `${baseHasApi ? base : base + "/api"}/Lookups/Semesters`,
        `${baseHasApi ? base : base + "/api"}/Lookups/semester`,
        `${baseHasApi ? base : base + "/api"}/Lookups/Semester`,
      ];

      const tried: { url: string; status?: number; ok?: boolean }[] = [];
      let lastErrorMessage = "";
      for (const url of pathCandidates) {
        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          });
          tried.push({ url, status: res.status, ok: res.ok });
          if (!res.ok) {
            lastErrorMessage = `HTTP ${res.status}`;
            continue; // try next candidate
          }
          const json = await res.json();
          const data: SemesterItem[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
          console.log("[SemestersService] Success", { url, count: data?.length ?? 0 });
          return { success: true, data, message: json?.message || "" };
        } catch (err) {
          tried.push({ url });
          lastErrorMessage = "Network error";
          continue;
        }
      }

      // Log attempts for debugging
      console.warn("[SemestersService] All candidates failed", tried);
      return { success: false, data: [], message: lastErrorMessage || "لم يتم العثور على نقطة النهاية" };
    } catch (e) {
      return { success: false, data: [], message: "حدث خطأ أثناء تحميل الفصول الدراسية" };
    }
  }
}
