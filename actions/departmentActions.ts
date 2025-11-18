const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🟢 Get All Departments
export const getDepartments = async (
  token?: string
): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Departments`, {
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
        `❌ Failed to fetch departments: ${response.status} ${response.statusText} | ${text}`
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

    return { success: false, message: data?.message || "فشل في تحميل الأقسام" };
  } catch (error) {
    console.error("❌ Error fetching departments:", error);
    return { success: false, message: (error as Error).message };
  }
};


// 🟢 Get Departments Lookup
export const getDepartmentsLookup = async (): Promise<{
  success: boolean;
  data?: Array<{ id: number; value?: string; name?: string }>;
  message?: string;
}> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return {
        success: false,
        message: "❌ Authentication token not found",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/Lookups/departments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `❌ Failed to fetch departments lookup: ${response.status} ${response.statusText}`,
        data: [],
      };
    }

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      return {
        success: false,
        message: "⚠️ Failed to parse JSON from response",
        data: [],
      };
    }

    const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    return {
      success: true,
      data: arr,
      message: data?.message || "OK",
    };
  } catch (error) {
    console.error("❌ Error fetching departments lookup:", error);
    return {
      success: false,
      data: [],
      message: (error as Error).message || "Unexpected error",
    };
  }
};

// 🟢 Get Programs Lookup
export const getPrograms = async (): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
}> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return {
        success: false,
        message: "❌ Authentication token not found",
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/Lookups/Programs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Programs Response status:", response.status);

    if (!response.ok) {
      return {
        success: false,
        message: `❌ Failed to fetch programs: ${response.status} ${response.statusText}`,
        data: [],
      };
    }

    // ✅ Parse JSON safely
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      console.error("⚠️ Failed to parse JSON:", e);
      return {
        success: false,
        message: "⚠️ Failed to parse JSON from response",
        data: [],
      };
    }

    console.log("🔹 Programs Response body:", data);

    // ✅ Handle both array or wrapped data
    const programsArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

    if (programsArray.length > 0) {
      return { success: true, data: programsArray };
    }

    return {
      success: false,
      data: [],
      message: "⚠️ No programs found",
    };
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    return {
      success: false,
      data: [],
      message: (error as Error).message || "Unexpected error",
    };
  }
};

// get the masar by department id 
// عاوزين هنا نخلي المسار ميظهرش الا لو الشخص اختار القسم
// هننده على ال endpoint دي GET
// /api/Degree/by-department/{departmentId}




// 🟢 Create Department
export const createDepartment = async (
  departmentData: {
    name: string;
    code: string;
    description: string;
    programId: number;
  },
  token: string
): Promise<{ success: boolean; data?: any; message?: string; errors?: any }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    const response = await fetch(`${API_URL}/Departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(departmentData),
    });

    const text = await response.text();
    console.log("🔹 Create Response status:", response.status);
    console.log("🔹 Create Response body:", text);

    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // 🔴 التقاط أخطاء الـ validation بشكل مفصل
    if (!response.ok) {
      let errorMessage = data?.message || "فشل في إضافة القسم";

      // لو الـ API رجع errors
      if (data?.errors) {
        // نجمع كل الأخطاء في رسالة واحدة مفصولة بفواصل
        errorMessage = Object.values(data.errors).flat().join("، ");
      }

      return {
        success: false,
        message: errorMessage,
        errors: data?.errors || null,
      };
    }

    if (data?.succeeded) {
      return { success: true, data: data.data, message: data.message };
    }

    return { success: false, message: data?.message || "فشل في إضافة القسم" };

  } catch (error) {
    console.error("❌ Error creating department:", error);
    return { success: false, message: (error as Error).message };
  }
};


// 🟡 Update Department
export const updateDepartment = async (
  id: number,
  departmentData: {
    name: string;
    code: string;
    description: string;
    programId: number;
  },
  token: string
): Promise<{ success: boolean; data?: any; message?: string; errors?: Record<string, string[]> }> => {
  try {
    if (!API_URL) {
      throw new Error("❌ Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    if (!token) {
      return { success: false, message: "الرجاء تسجيل الدخول أولاً" };
    }

    console.log("🔍 Raw department data received for update:", departmentData);

    // معالجة القيم
    const code = departmentData.code ? String(departmentData.code).trim() : '';
    const name = (departmentData.name || '').trim();
    const description = (departmentData.description || '').trim();
    const programId = departmentData.programId || '';

    
    // if (!code || code.length < 2) {
    //   throw new Error("كود القسم مطلوب ويجب أن يكون حرفين على الأقل");
    // }

    const requestBody = { id, code, name, description, programId };
    console.log("🔍 Sending update to API:", requestBody);

    const response = await fetch(`${API_URL}/Departments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("🔹 Update Response status:", response.status);

    const text = await response.text();
    console.log("🔹 Update Response body:", text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    // ❌ معالجة الأخطاء (400 / validation)
    if (!response.ok) {
      let errorMessage = "فشل في تحديث القسم";

      if (data?.errors && typeof data.errors === "object") {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey && Array.isArray(data.errors[firstKey])) {
          errorMessage = data.errors[firstKey][0]; // أول رسالة validation
        }
      } else if (data?.message) {
        errorMessage = data.message;
      }

      return { success: false, message: errorMessage };
    }

    // ✅ نجاح التحديث
    if (data?.succeeded) {
      return { success: true, data: data.data, message: data.message || "تم تحديث القسم بنجاح" };
    }

    return { success: false, message: data?.message || "فشل في تحديث القسم" };

  } catch (error: any) {
    console.error("❌ Error updating department:", error);
    return { success: false, message: error.message || "حدث خطأ أثناء تحديث القسم" };
  }
};


// 🗑️ Delete Department
export const deleteDepartment = async (
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

    const response = await fetch(`${API_URL}/Departments/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔹 Delete Response status:", response.status);
    const text = await response.text();
    console.log("🔹 Delete Response body:", text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      // ✅ نستخرج رسالة الخطأ من الـ API
      return { success: false, message: data?.message || "فشل في حذف القسم" };
    }

    if (data?.succeeded) {
      return { success: true, message: data.message };
    }

    return { success: false, message: data?.message || "فشل في حذف القسم" };
  } catch (error) {
    console.error("❌ Error deleting department:", error);
    return { success: false, message: (error as Error).message };
  }
};
