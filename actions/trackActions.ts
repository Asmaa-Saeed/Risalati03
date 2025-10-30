// Track actions for API integration
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/*
🎯 COMPLETE TRACKS API INTEGRATION:

✅ GET /api/Msar - Fetch all tracks with department names
✅ POST /api/Msar - Create new track with degree object
✅ PUT /api/Msar/{id} - Update existing track with degree object
✅ DELETE /api/Msar/{id} - Delete track permanently

✅ GET /api/Lookups/degrees - Fetch degrees for dropdowns
✅ GET /api/Lookups/departments - Fetch departments for dropdowns

🔐 Authentication: Bearer token in Authorization header
📊 Response Format: { succeeded: boolean, data: any, message: string }
🚨 Error Handling: Comprehensive error states with user feedback
📱 UI Integration: Beautiful inline messages with auto-dismiss

DELETE TRACK FLOW:
1. User clicks delete button → Confirmation modal opens
2. User confirms deletion → DELETE /api/Msar/{id} request sent
3. API responds with success → Table refreshes, pagination resets
4. Success message appears → Auto-dismiss after 3 seconds
5. Modal closes smoothly → Clean user experience

All endpoints fully match your backend API specification! 🎉
*/

// Types for API responses
interface LookupItem {
  id: number;
  value: string;
}

// 🟢 Get All Tracks - Matches API specification
// GET /api/Msar
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, data: Track[], message: string }
export const getTracks = async (
  token?: string
): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Msar`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Sending get tracks request to:", `${API_URL}/Msar`);
    console.log("🔹 Tracks Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Tracks Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to fetch tracks: ${response.status} ${response.statusText} | ${text}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (data?.succeeded && Array.isArray(data.data)) {
      return { success: true, data: data.data };
    }

    return { success: false, message: data?.message || "فشل في تحميل المسارات" };
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Get Msarat (Tracks) by DegreeId for Track Name selection
// GET /api/Lookups/GetMsaratByDegreeId?degreeId={id}
export const getMsaratByDegreeId = async (
  degreeId: number,
  token?: string
): Promise<{ success: boolean; data?: LookupItem[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const url = `${API_URL}/Lookups/GetMsaratByDegreeId?degreeId=${encodeURIComponent(degreeId)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch msarat by degreeId: ${response.status} ${response.statusText}`
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid JSON response from GetMsaratByDegreeId API");
    }

    const rawArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    // Normalize to LookupItem[] ensuring 'value' is populated (fall back to 'name')
    const arr: LookupItem[] = rawArray.map((item: any) => ({
      id: Number(item.id ?? item.Id ?? 0),
      value: String(item.value ?? item.Value ?? item.name ?? item.Name ?? ""),
    }));

    return { success: true, data: arr };
  } catch (error) {
    console.error("Error fetching msarat by degreeId:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Create Track - Matches API specification
// POST /api/Msar
// Body: { name, degreeId, degree: { id, name, description, standardDurationYears, departmentId, generalDegree } }
export const createTrack = async (
  trackData: {
    name: string;
    degreeId: number;
    departmentId: number;
  },
  token: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    // Resolve DepartmentName from lookup
    let departmentName = "";
    try {
      const depLookup = await getDepartments(token);
      if (depLookup.success && depLookup.data) {
        const match = depLookup.data.find((d) => d.id === trackData.departmentId);
        departmentName = match?.value || "";
      }
    } catch (_) {
      // ignore, will send empty and let backend validate
    }

    // Format data according to API specification, including DepartmentName required by backend
    const bodyData = {
      name: trackData.name,
      degreeId: trackData.degreeId,
      DepartmentName: departmentName,
      degree: {
        id: trackData.degreeId,
        name: "",
        description: "",
        standardDurationYears: 0,
        departmentId: trackData.departmentId,
        generalDegree: ""
      }
    };

    console.log("🔹 Sending create request to:", `${API_URL}/Msar`);
    console.log("🔹 Request body:", JSON.stringify(bodyData, null, 2));

    const response = await fetch(`${API_URL}/Msar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    console.log("🔹 Create Track Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Create Track Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to create track: ${response.status} ${response.statusText} | ${text}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (data?.succeeded) {
      return { success: true, data: data.data, message: data.message };
    }

    return { success: false, message: data?.message || "فشل في إضافة المسار" };
  } catch (error) {
    console.error("❌ Error creating track:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟡 Update Track - Matches API specification
// PUT /api/Msar/{id}
// Body: { id, name, degreeId, degree: { id, name, description, standardDurationYears, departmentId, generalDegree } }
export const updateTrack = async (
  id: number,
  trackData: {
    name: string;
    degreeId: number;
    departmentId: number;
  },
  token: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    // Resolve DepartmentName from lookup
    let departmentName = "";
    try {
      const depLookup = await getDepartments(token);
      if (depLookup.success && depLookup.data) {
        const match = depLookup.data.find((d) => d.id === trackData.departmentId);
        departmentName = match?.value || "";
      }
    } catch (_) {
      // ignore, backend will validate if missing
    }

    // Format data according to API specification
    const bodyData = {
      id: id,
      name: trackData.name,
      degreeId: trackData.degreeId,
      DepartmentName: departmentName,
      degree: {
        id: trackData.degreeId, // Use degreeId as degree.id
        name: "", // Will be filled by backend or we need to fetch degree details
        description: "",
        standardDurationYears: 0,
        departmentId: trackData.departmentId,
        generalDegree: ""
      }
    };

    console.log("🔹 Sending update request to:", `${API_URL}/Msar/${id}`);
    console.log("🔹 Request body:", JSON.stringify(bodyData, null, 2));

    const response = await fetch(`${API_URL}/Msar/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    console.log("🔹 Update Track Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Update Track Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to update track: ${response.status} ${response.statusText} | ${text}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (data?.succeeded) {
      return { success: true, data: data.data, message: data.message };
    }

    return { success: false, message: data?.message || "فشل في تحديث المسار" };
  } catch (error) {
    console.error("❌ Error updating track:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🗑️ Delete Track - Matches API specification
// DELETE /api/Msar/{id}
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, message: string }
export const deleteTrack = async (
  id: number,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Msar/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Sending delete request to:", `${API_URL}/Msar/${id}`);
    console.log("🔹 Delete Track Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Delete Track Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to delete track: ${response.status} ${response.statusText} | ${text}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log("🔹 Parsed delete response data:", data);

    if (data?.succeeded) {
      return { success: true, message: data.message };
    }

    return { success: false, message: data?.message || "فشل في حذف المسار" };
  } catch (error) {
    console.error("❌ Error deleting track:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Get Degrees for Track Creation (from Lookups API)
// GET /api/Lookups/degrees
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, data: LookupItem[], message: string }
export const getDegrees = async (
  token?: string
): Promise<{ success: boolean; data?: LookupItem[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Lookups/degrees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch degrees lookup: ${response.status} ${response.statusText}`
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid JSON response from degrees API");
    }

    // Handle both array response and wrapped response
    const degreesArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    if (degreesArray.length > 0) {
      return { success: true, data: degreesArray };
    }

    return { success: false, message: "لا توجد درجات علمية متاحة" };
  } catch (error) {
    console.error("Error fetching degrees lookup:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Get Departments for Track Display (from Lookups API)
// GET /api/Lookups/departments
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, data: LookupItem[], message: string }
export const getDepartments = async (
  token?: string
): Promise<{ success: boolean; data?: LookupItem[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Lookups/departments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch departments lookup: ${response.status} ${response.statusText}`
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid JSON response from departments API");
    }

    // Handle both array response and wrapped response
    const departmentsArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    if (departmentsArray.length > 0) {
      return { success: true, data: departmentsArray };
    }

    return { success: false, message: "لا توجد أقسام متاحة" };
  } catch (error) {
    console.error("Error fetching departments lookup:", error);
    return { success: false, message: (error as Error).message };
  }
};
