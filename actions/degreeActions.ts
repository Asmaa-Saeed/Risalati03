const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DegreesApiResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Array<{
    id: number;
    name: string;
    description?: string;
    standardDurationYears: number | null;
    departmentId: number;
    generalDegree: string;
  }>;
}

export interface DegreeItem {
  id: number;
  name: string;
  description?: string;
  standardDurationYears: number | null;
  departmentId: number;
  generalDegree: string;
}

export interface DegreeMutationResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: DegreeItem | null;
}

// GET /Degree
export const getDegrees = async (): Promise<DegreesApiResponse> => {
  try {
    if (!API_URL) {
      throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        succeeded: false,
        message: 'الرجاء تسجيل الدخول أولاً',
        errors: ['Authentication token not found'],
        data: [],
      };
    }

    const response = await fetch(`${API_URL}/Degree`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to fetch degrees: ${response.status} ${response.statusText} | ${text}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'object' && data !== null && 'succeeded' in data && 'data' in data) {
      return data as DegreesApiResponse;
    }

    return {
      succeeded: true,
      message: 'Operation successful',
      errors: [],
      data: Array.isArray(data) ? data : [],
    };
  } catch (error: any) {
    return {
      succeeded: false,
      message: error?.message || 'Unexpected error',
      errors: [error?.message || 'Unexpected error'],
      data: [],
    };
  }
};

// PUT /Degree
export const updateDegree = async (payload: {
  id: number;
  name: string;
  description?: string;
  standardDurationYears?: number | null;
  departmentId: number;
  generalDegree: string;
}): Promise<DegreeMutationResponse> => {
  try {
    if (!API_URL) {
      throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        succeeded: false,
        message: 'الرجاء تسجيل الدخول أولاً',
        errors: ['Authentication token not found'],
        data: null,
      };
    }

    const requestBody = {
      id: payload.id,
      name: payload.name,
      description: payload.description ?? '',
      standardDurationYears: payload.standardDurationYears ?? 0,
      departmentId: payload.departmentId,
      generalDegree: payload.generalDegree,
    };

    const response = await fetch(`${API_URL}/Degree`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to update degree: ${response.status} ${response.statusText} | ${text}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'object' && data !== null && 'succeeded' in data) {
      return {
        succeeded: Boolean(data.succeeded),
        message: data.message ?? 'تم تحديث الدرجة بنجاح',
        errors: Array.isArray(data.errors) ? data.errors : [],
        data: (data.data || null) as DegreeItem | null,
      };
    }

    return {
      succeeded: true,
      message: 'تم تحديث الدرجة بنجاح',
      errors: [],
      data: data as DegreeItem,
    };
  } catch (error: any) {
    return {
      succeeded: false,
      message: error?.message || 'Unexpected error',
      errors: [error?.message || 'Unexpected error'],
      data: null,
    };
  }
};

// DELETE /Degree/{id}
export const deleteDegree = async (
  id: number
): Promise<{ succeeded: boolean; message: string; errors: string[] }> => {
  try {
    if (!API_URL) {
      throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        succeeded: false,
        message: 'الرجاء تسجيل الدخول أولاً',
        errors: ['Authentication token not found'],
      };
    }

    const response = await fetch(`${API_URL}/Degree/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to delete degree: ${response.status} ${response.statusText} | ${text}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'object' && data !== null && 'succeeded' in data) {
      return {
        succeeded: Boolean(data.succeeded),
        message: data.message ?? 'تم حذف الدرجة بنجاح',
        errors: Array.isArray(data.errors) ? data.errors : [],
      };
    }

    return {
      succeeded: true,
      message: 'تم حذف الدرجة بنجاح',
      errors: [],
    };
  } catch (error: any) {
    return {
      succeeded: false,
      message: error?.message || 'Unexpected error',
      errors: [error?.message || 'Unexpected error'],
    };
  }
};

// POST /Degree
export const createDegree = async (payload: {
  id?: number;
  name: string;
  description?: string;
  standardDurationYears?: number | null;
  departmentId: number;
  generalDegree: string;
}): Promise<DegreeMutationResponse> => {
  try {
    if (!API_URL) {
      throw new Error("Environment variable NEXT_PUBLIC_API_URL is not set");
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return {
        succeeded: false,
        message: 'الرجاء تسجيل الدخول أولاً',
        errors: ['Authentication token not found'],
        data: null,
      };
    }

    const requestBody = {
      id: payload.id ?? 0,
      name: payload.name,
      description: payload.description ?? '',
      standardDurationYears: payload.standardDurationYears ?? 0,
      departmentId: payload.departmentId,
      generalDegree: payload.generalDegree,
    };

    const response = await fetch(`${API_URL}/Degree`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
      },
      body: JSON.stringify(requestBody),
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to create degree: ${response.status} ${response.statusText} | ${text}`);
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'object' && data !== null && 'succeeded' in data) {
      if ('data' in data && data.data) {
        return {
          succeeded: Boolean(data.succeeded),
          message: data.message ?? 'تمت إضافة الدرجة بنجاح',
          errors: Array.isArray(data.errors) ? data.errors : [],
          data: data.data as DegreeItem,
        };
      }
      return {
        succeeded: Boolean(data.succeeded),
        message: data.message ?? 'تمت إضافة الدرجة بنجاح',
        errors: Array.isArray(data.errors) ? data.errors : [],
        data: null,
      };
    }

    return {
      succeeded: true,
      message: 'تمت إضافة الدرجة بنجاح',
      errors: [],
      data: data as DegreeItem,
    };
  } catch (error: any) {
    return {
      succeeded: false,
      message: error?.message || 'Unexpected error',
      errors: [error?.message || 'Unexpected error'],
      data: null,
    };
  }
};

