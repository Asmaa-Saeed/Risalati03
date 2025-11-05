const API_BASE_URL = "https://professor.runasp.net/api";

export interface Intake {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}

export interface CreateIntakeData {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateIntakeData {
  id: number;
  name?: string;
  startDate?: string;
  endDate?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  let result: any;

  try {
    result = await response.json();
  } catch {
    throw new Error("خطأ غير متوقع من السيرفر");
  }

 
  if (!response.ok) {
    const message =
      result?.message ||
      result?.title ||
      result?.errors?.dto?.[0] ||
      "حدث خطأ أثناء تنفيذ العملية";

    throw new Error(message);
  }

  if (result?.succeeded === false) {
    throw new Error(result?.message || "حدث خطأ أثناء تنفيذ العملية");
  }

  return result as T;
}


const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
  return { "Content-Type": "application/json" };
};

export const IntakesService = {
  getIntakes: async (): Promise<ApiResponse<Intake[]>> => {
    const response = await fetch(`${API_BASE_URL}/Intake`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiResponse<Intake[]>>(response);
  },

  createIntake: async (data: CreateIntakeData): Promise<ApiResponse<Intake>> => {
    const response = await fetch(`${API_BASE_URL}/Intake`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ApiResponse<Intake>>(response);
  },




  updateIntake: async (data: UpdateIntakeData): Promise<ApiResponse<Intake>> => {
  try {
    const { id, ...updateData } = data;

    // Convert to DateOnly format
    const formatDateOnly = (date: string | undefined) =>
      date ? date.split("T")[0] : undefined;

    // The API expects the body WITHOUT dto wrapper
    const requestBody = {
      id,
      name: updateData.name,
      startDate: formatDateOnly(updateData.startDate),
      endDate: formatDateOnly(updateData.endDate),
      academicYear: updateData.startDate
        ? new Date(updateData.startDate).getFullYear().toString()
        : undefined,
    };

    console.log("Sending update request body:", requestBody);

    const response = await fetch(`${API_BASE_URL}/Intake/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return handleResponse<ApiResponse<Intake>>(response);
  } catch (error) {
    console.error("Error in updateIntake:", error);
    if (error instanceof Error) {
      throw new Error(`فشل تحديث العام الدراسي: ${error.message}`);
    }
    throw new Error("حدث خطأ غير متوقع أثناء تحديث العام الدراسي");
  }
},


  deleteIntake: async (id: number): Promise<ApiResponse<{}>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Intake/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          "لا يمكن حذف هذا العام الدراسي لأنه مرتبط ببيانات أخرى في النظام";
        return {
          succeeded: false,
          message: errorMessage,
          errors: [errorMessage],
          data: {},
        };
      }

      return handleResponse<ApiResponse<{}>>(response);
    } catch (error) {
      console.error("Delete intake error:", error);
      return {
        succeeded: false,
        message: "حدث خطأ أثناء محاولة حذف العام الدراسي",
        errors: ["حدث خطأ غير متوقع"],
        data: {},
      };
    }
  },
};

export default IntakesService;
