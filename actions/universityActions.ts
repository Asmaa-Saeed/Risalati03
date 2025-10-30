const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🟢 Add University
export const addUniversity = async (
  universityName: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(
      `${API_URL}/University/add?UniversityName=${encodeURIComponent(universityName)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("🔹 Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to add university: ${response.status} ${response.statusText} | ${text}`
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return { success: true, message: "✅ University added successfully", ...data };
  } catch (error) {
    console.error("❌ Error adding university:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟣 Get All Universities
export const getUniversities = async (
  token?: string
): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/University/names`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Response body:", text);

    if (!response.ok) {
      throw new Error(
        `❌ Failed to fetch universities: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في تحميل الجامعات" };
  } catch (error) {
    console.error("❌ Error fetching universities:", error);
    return { success: false, message: (error as Error).message };
  }
};

// 🟡 Update University
export async function updateUniversity(
  id: number,
  name: string,
  token: string
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/University/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, name }),
    });

    const text = await response.text();
    console.log("🔹 Update Response:", text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (response.ok && data.succeeded) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || "فشل في تحديث الجامعة" };
    }
  } catch (error) {
    console.error("❌ Error updating university:", error);
    return { success: false, message: (error as Error).message };
  }
}

// 🗑️ Delete University
// export const deleteUniversity = async (id: number, token: string): Promise<{ success: boolean; message?: string }> => {
//   try {
//     if (!API_URL) {
//       throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
//     }

//     if (!token) {
//       return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
//     }

//     console.log("🟣 Deleting university with ID:", id);

//     const response = await fetch(`${API_URL}/University/delete/${id}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`,
//       },
//     });

//     console.log("🔹 Response status:", response.status);
//     const text = await response.text();
//     console.log("🔹 Response body:", text);

//     if (!response.ok) {
//       throw new Error(`❌ Failed to delete university: ${response.status} ${response.statusText} | ${text}`);
//     }

//     let data: any;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }

//     return { success: true, message: "✅ University deleted successfully", ...data };
//   } catch (error) {
//     console.error("❌ Error deleting university:", error);
//     return { success: false, message: (error as Error).message };
//   }
// };

export const deleteUniversity = async (id: number, token: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/University/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { succeeded: false, message: text };
    }

    if (!response.ok || !data.succeeded) {
      return { success: false, message: data.message || "❌ حدث خطأ أثناء حذف الجامعة" };
    }

    return { success: true, message: data.message || "✅ تم حذف الجامعة بنجاح", data: data.data };
  } catch (error: any) {
    return { success: false, message: error?.message || "❌ حدث خطأ غير متوقع" };
  }
};
