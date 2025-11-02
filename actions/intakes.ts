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
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Invalid response from server');
  }
  
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    data
  });
  
  if (!response.ok) {
    const errorMessage = data?.message || response.statusText || 'Something went wrong';
    console.error('API Error:', {
      status: response.status,
      message: errorMessage,
      data
    });
    throw new Error(errorMessage);
  }
  
  // If the response already has the expected structure, return it as is
  if (data && typeof data === 'object' && 'succeeded' in data) {
    return data as T;
  }
  
  // Otherwise, wrap the response in the expected structure
  return {
    succeeded: true,
    message: '',
    errors: [],
    data
  } as unknown as T;
}

const getAuthHeaders = () => {
  // Get the token from localStorage if running in the browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }
  return { 'Content-Type': 'application/json' };
};

export const IntakesService = {
  getIntakes: async (): Promise<ApiResponse<Intake[]>> => {
    const response = await fetch(`${API_BASE_URL}/Intake`, {
      headers: getAuthHeaders()
    });
    return handleResponse<ApiResponse<Intake[]>>(response);
  },

  createIntake: async (data: CreateIntakeData): Promise<ApiResponse<Intake>> => {
    const response = await fetch(`${API_BASE_URL}/Intake`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ApiResponse<Intake>>(response);
  },

  updateIntake: async (data: UpdateIntakeData): Promise<ApiResponse<Intake>> => {
    const response = await fetch(`${API_BASE_URL}/Intake/${data.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ApiResponse<Intake>>(response);
  },

  deleteIntake: async (id: number): Promise<ApiResponse<{}>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Intake/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      // Handle 500 errors specifically
      if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'لا يمكن حذف هذا العام الدراسي لأنه مرتبط ببيانات أخرى في النظام';
        return {
          succeeded: false,
          message: errorMessage,
          errors: [errorMessage],
          data: {}
        };
      }
      
      return handleResponse<ApiResponse<{}>>(response);
    } catch (error) {
      console.error('Delete intake error:', error);
      return {
        succeeded: false,
        message: 'حدث خطأ أثناء محاولة حذف العام الدراسي',
        errors: ['حدث خطأ غير متوقع'],
        data: {}
      };
    }
  }  
};

export default IntakesService;
