const APIURL = process.env.NEXT_PUBLIC_API_URL;

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  requestUpdates?: boolean;
  systemUpdates?: boolean;
  marketingEmails?: boolean;
}

export interface UpdatePrivacyRequest {
  profileVisibility?: "public" | "private" | "friends";
  showEmail?: boolean;
  showPhone?: boolean;
  allowDataSharing?: boolean;
  allowAnalytics?: boolean;
}

export interface UpdateAppearanceRequest {
  theme?: "light" | "dark" | "system";
  language?: string;
  fontSize?: "small" | "medium" | "large";
  compactMode?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Get current user settings
export async function getUserSettings(): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API response - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const userData = localStorage.getItem("user");
    const settings = {
      profile: userData ? JSON.parse(userData) : {},
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        requestUpdates: true,
        systemUpdates: true,
        marketingEmails: false,
      },
      privacy: {
        profileVisibility: "private" as const,
        showEmail: false,
        showPhone: false,
        allowDataSharing: false,
        allowAnalytics: true,
      },
      appearance: {
        theme: "system" as const,
        language: "ar",
        fontSize: "medium" as const,
        compactMode: false,
      },
      security: {
        twoFactorEnabled: false,
        lastLogin: new Date().toISOString(),
        loginHistory: [
          {
            id: 1,
            device: "Chrome on Windows",
            location: "Egypt",
            timestamp: new Date().toISOString(),
            ip: "192.168.1.1"
          },
          {
            id: 2,
            device: "Safari on iPhone",
            location: "Egypt",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            ip: "192.168.1.2"
          }
        ],
        activeSessions: [
          {
            id: 1,
            device: "Chrome on Windows",
            location: "Egypt",
            lastActivity: new Date().toISOString(),
            current: true
          }
        ]
      },
      integrations: {
        apiKeys: [],
        connectedServices: [
          {
            id: "google-drive",
            name: "Google Drive",
            description: "مزامنة الملفات والوثائق",
            connected: true,
            lastSync: new Date().toISOString()
          },
          {
            id: "microsoft-onedrive",
            name: "Microsoft OneDrive",
            description: "تخزين الملفات السحابي",
            connected: false,
            lastSync: null
          },
          {
            id: "gmail",
            name: "Gmail",
            description: "إدارة البريد الإلكتروني",
            connected: false,
            lastSync: null
          }
        ],
        webhooks: []
      }
    };

    return {
      success: true,
      message: "تم جلب الإعدادات بنجاح",
      data: settings
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return {
      success: false,
      message: "حدث خطأ في جلب الإعدادات"
    };
  }
}

// Update profile information
export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update localStorage
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const updatedUser = { ...userData, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
      data: data
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "حدث خطأ في تحديث الملف الشخصي"
    };
  }
}

// Change password
export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, you would verify the current password
    // and update it on the server

    return {
      success: true,
      message: "تم تغيير كلمة المرور بنجاح"
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message: "حدث خطأ في تغيير كلمة المرور"
    };
  }
}

// Update notification settings
export async function updateNotifications(data: UpdateNotificationsRequest): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Save to localStorage for persistence
    localStorage.setItem("notifications", JSON.stringify(data));

    return {
      success: true,
      message: "تم تحديث إعدادات الإشعارات بنجاح",
      data: data
    };
  } catch (error) {
    console.error("Error updating notifications:", error);
    return {
      success: false,
      message: "حدث خطأ في تحديث إعدادات الإشعارات"
    };
  }
}

// Update privacy settings
export async function updatePrivacy(data: UpdatePrivacyRequest): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Save to localStorage for persistence
    localStorage.setItem("privacy", JSON.stringify(data));

    return {
      success: true,
      message: "تم تحديث إعدادات الخصوصية بنجاح",
      data: data
    };
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return {
      success: false,
      message: "حدث خطأ في تحديث إعدادات الخصوصية"
    };
  }
}

// Update appearance settings
export async function updateAppearance(data: UpdateAppearanceRequest): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Save to localStorage for persistence
    localStorage.setItem("appearance", JSON.stringify(data));

    // Apply theme changes immediately
    if (data.theme) {
      document.documentElement.setAttribute("data-theme", data.theme);
    }

    return {
      success: true,
      message: "تم تحديث إعدادات المظهر بنجاح",
      data: data
    };
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return {
      success: false,
      message: "حدث خطأ في تحديث إعدادات المظهر"
    };
  }
}

// Enable two-factor authentication
export async function enableTwoFactor(): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: "تم تفعيل المصادقة الثنائية بنجاح",
      data: {
        qrCode: "mock-qr-code-url",
        secret: "mock-secret-key",
        backupCodes: [
          "A1B2C3D4",
          "E5F6G7H8",
          "I9J0K1L2",
          "M3N4O5P6",
          "Q7R8S9T0"
        ]
      }
    };
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return {
      success: false,
      message: "حدث خطأ في تفعيل المصادقة الثنائية"
    };
  }
}

// Generate API key
export async function generateApiKey(name: string): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const apiKey = `rk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return {
      success: true,
      message: "تم إنشاء مفتاح API بنجاح",
      data: {
        id: Date.now(),
        name,
        key: apiKey,
        createdAt: new Date().toISOString(),
        lastUsed: null,
        permissions: ["read", "write"]
      }
    };
  } catch (error) {
    console.error("Error generating API key:", error);
    return {
      success: false,
      message: "حدث خطأ في إنشاء مفتاح API"
    };
  }
}

// Connect external service
export async function connectService(serviceId: string): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const services = {
      "google-drive": {
        name: "Google Drive",
        authUrl: "https://accounts.google.com/oauth/authorize"
      },
      "microsoft-onedrive": {
        name: "Microsoft OneDrive",
        authUrl: "https://login.microsoftonline.com/oauth/authorize"
      },
      "gmail": {
        name: "Gmail",
        authUrl: "https://accounts.google.com/oauth/authorize"
      }
    };

    const service = services[serviceId as keyof typeof services];
    if (!service) {
      return { success: false, message: "الخدمة غير مدعومة" };
    }

    return {
      success: true,
      message: `تم ربط ${service.name} بنجاح`,
      data: {
        serviceId,
        connected: true,
        connectedAt: new Date().toISOString(),
        authUrl: service.authUrl
      }
    };
  } catch (error) {
    console.error("Error connecting service:", error);
    return {
      success: false,
      message: "حدث خطأ في ربط الخدمة"
    };
  }
}

// Delete account
export async function deleteAccount(confirmationText: string): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    if (confirmationText !== "أؤكد حذف الحساب") {
      return { success: false, message: "نص التأكيد غير صحيح" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear all user data
    localStorage.clear();

    return {
      success: true,
      message: "تم حذف الحساب بنجاح"
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return {
      success: false,
      message: "حدث خطأ في حذف الحساب"
    };
  }
}

// Get login history
export async function getLoginHistory(): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));

    const history = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        device: "Chrome on Windows",
        location: "Egypt",
        ip: "192.168.1.1",
        status: "success"
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        device: "Chrome on Windows",
        location: "Egypt",
        ip: "192.168.1.1",
        status: "success"
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        device: "Safari on iPhone",
        location: "Egypt",
        ip: "192.168.1.2",
        status: "success"
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        device: "Chrome on Windows",
        location: "Egypt",
        ip: "192.168.1.1",
        status: "failed"
      }
    ];

    return {
      success: true,
      message: "تم جلب سجل تسجيل الدخول بنجاح",
      data: history
    };
  } catch (error) {
    console.error("Error fetching login history:", error);
    return {
      success: false,
      message: "حدث خطأ في جلب سجل تسجيل الدخول"
    };
  }
}

// Revoke session
export async function revokeSession(sessionId: number): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, message: "غير مصرح لك بالوصول" };
    }

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: "تم إنهاء الجلسة بنجاح"
    };
  } catch (error) {
    console.error("Error revoking session:", error);
    return {
      success: false,
      message: "حدث خطأ في إنهاء الجلسة"
    };
  }
}
