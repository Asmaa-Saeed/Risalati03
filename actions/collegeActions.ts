const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🟢 Get All Colleges - Matches API specification
// GET /api/College
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, data: College[], message: string }
export const getColleges = async (
  token?: string
): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    console.log("🔹 Sending get colleges request to:", `${API_URL}/College`);
    const response = await fetch(`${API_URL}/College`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Colleges Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Colleges Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to fetch colleges: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في تحميل الكليات" };
  } catch (error) {
    console.error("❌ Error fetching colleges:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟢 Create College - Matches API specification
// POST /api/College?name={name}
// Query Parameter: name (string)
// Response: { succeeded: boolean, data: College, message: string }
export const createCollege = async (
  collegeData: { name: string },
  token: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    // Send name as query parameter as per API specification
    const apiUrl = `${API_URL}/College?name=${encodeURIComponent(collegeData.name)}`;
    console.log("🔹 Sending create college request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // No body needed since we're sending as query parameter
    });

    console.log("🔹 Create College Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Create College Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to create college: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في إضافة الكلية" };
  } catch (error) {
    console.error("❌ Error creating college:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟡 Update College - Matches API specification
// PUT /api/College/{id}
// Body: { id: number, name: string }
// Response: { succeeded: boolean, data: College, message: string }
export const updateCollege = async (
  id: number,
  collegeData: { name: string },
  token: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const bodyData = {
      id: id,
      name: collegeData.name,
    };

    console.log("🔹 Sending update college request to:", `${API_URL}/College/${id}`);
    console.log("🔹 Request body:", JSON.stringify(bodyData, null, 2));

    const response = await fetch(`${API_URL}/College/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });

    console.log("🔹 Update College Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Update College Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to update college: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في تحديث الكلية" };
  } catch (error) {
    console.error("❌ Error updating college:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🗑️ Delete College - Matches API specification
// DELETE /api/College/{id}
// Headers: Authorization: Bearer {token}
// Response: { succeeded: boolean, message: string }
export const deleteCollege = async (
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

    console.log("🔹 Sending delete college request to:", `${API_URL}/College/${id}`);
    const response = await fetch(`${API_URL}/College/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Delete College Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Delete College Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to delete college: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في حذف الكلية" };
  } catch (error) {
    console.error("❌ Error deleting college:", error);
    return { success: false, message: (error as Error).message };
  }
};
