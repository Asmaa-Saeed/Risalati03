// /actions/lookupActions.ts
"use server";

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export interface LookupItem {
  id: number;
  value: string;
}

export interface LookupResponse<T = LookupItem[]> {
  success: boolean;
  message: string;
  data: T | null;
}

async function apiGet(path: string, token?: string): Promise<LookupResponse> {
  try {
    const res = await fetch(`${APIURL}${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, message: `HTTP ${res.status}`, data: null };
    }

    const json = await res.json();

    // Normalize various possible backend shapes
    if (Array.isArray(json?.data)) {
      return { success: true, message: json.message || "", data: json.data };
    }
    if (Array.isArray(json)) {
      return { success: true, message: "", data: json };
    }

    return { success: false, message: json?.message || "استجابة غير متوقعة", data: null };
  } catch (e) {
    return { success: false, message: "فشل في الاتصال بالخادم", data: null };
  }
}

export async function getSemesters(token?: string): Promise<LookupResponse> {
  // GET /api/Lookups/semesters
  return apiGet("/api/Lookups/semesters", token);
}
