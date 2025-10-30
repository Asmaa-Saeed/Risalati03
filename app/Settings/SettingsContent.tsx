"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserSettings,
  updateProfile,
  changePassword as apiChangePassword,
  updateNotifications,
  updatePrivacy,
  deleteAccount as apiDeleteAccount,
} from "@/actions/settings";
import {
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Save,
  AlertTriangle,
  CheckCircle,
  X,
  Settings as SettingsIcon,
  UserCheck,
  Mail,
  MessageSquare,
  Calendar,
  Lock,
  Users,
  BookOpen,
  Building,
  Building2,
  FolderOpen,
  GraduationCap,
  Route,
  School,
  Plus,
  Smartphone,
} from "lucide-react";
// import FacultyCoursesManagement from "./Instructors/FacultyCoursesManagement";
import InstructorsManagement from "./Instructors/InstructorsManagement";
import CoursesManagement from "./Courses/CoursesManagement";
import CollegesManagement from "./Faculty/CollegesManagement";
import DegreesManagement from "./Degrees/DegreesManagement";
import UniversitiesManagement from "./University/UniversitiesManagement";
import DepartmentsManagement from "./Departments/DepartmentsManagement";
import TracksManagement from "./Tracks/TracksManagement";

// Settings sections
type SettingsSection =
  | "profile"
  | "account"
  | "notifications"
  | "instructors"
  | "courses"
  | "universities"
  | "colleges"
  | "departments"
  | "degrees"
  | "tracks";

// Mock user data type
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  avatar?: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  requestUpdates: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
}

const APIURL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    requestUpdates: true,
    systemUpdates: true,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    allowDataSharing: false,
    allowAnalytics: true,
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Load user data and settings
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        // Check if both token and user data exist
        if (!token || !userData) {
          // Show error message and provide option to go back
          setMessage({
            type: "error",
            text: "يرجى تسجيل الدخول أولاً للوصول إلى الإعدادات"
          });
          setLoading(false);
          return;
        }

        // Load user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setProfileForm({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
        });

        // Load settings from API
        const settingsResponse = await getUserSettings();
        if (settingsResponse.success && settingsResponse.data) {
          const settings = settingsResponse.data;

          if (settings.notifications) {
            setNotifications(settings.notifications);
          }
          if (settings.privacy) {
            setPrivacy(settings.privacy);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  // Save profile settings
  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await updateProfile(profileForm);

      if (response.success) {
        setUser(prev => prev ? { ...prev, ...profileForm } : null);
        localStorage.setItem("user", JSON.stringify({ ...user, ...profileForm }));
        setMessage({ type: "success", text: response.message });
      } else {
        setMessage({ type: "error", text: response.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في حفظ الإعدادات" });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "كلمات المرور غير متطابقة" });
      return;
    }

    setSaving(true);
    try {
      const response = await apiChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setMessage({ type: "success", text: response.message });
      } else {
        setMessage({ type: "error", text: response.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تغيير كلمة المرور" });
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (deleteConfirm !== "أؤكد حذف الحساب") {
      setMessage({ type: "error", text: "يرجى كتابة النص المطلوب للتأكيد" });
      return;
    }

    setSaving(true);
    try {
      const response = await apiDeleteAccount(deleteConfirm);

      if (response.success) {
        localStorage.clear();
        router.push("/");
      } else {
        setMessage({ type: "error", text: response.message });
        setSaving(false);
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في حذف الحساب" });
      setSaving(false);
    }
  };

  // Save notification settings
  const saveNotifications = async () => {
    setSaving(true);
    try {
      const response = await updateNotifications(notifications);

      if (response.success) {
        setMessage({ type: "success", text: response.message });
      } else {
        setMessage({ type: "error", text: response.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في حفظ إعدادات الإشعارات" });
    } finally {
      setSaving(false);
    }
  };

  // Save privacy settings
  const savePrivacy = async () => {
    setSaving(true);
    try {
      const response = await updatePrivacy(privacy);

      if (response.success) {
        setMessage({ type: "success", text: response.message });
      } else {
        setMessage({ type: "error", text: response.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في حفظ إعدادات الخصوصية" });
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: "profile", label: "الملف الشخصي", icon: <User size={20} /> },
    { id: "account", label: "إدارة الحساب", icon: <UserCheck size={20} /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell size={20} /> },
    { id: "instructors", label: "أعضاء هيئة التدريس", icon: <Users size={20} /> },
    { id: "courses", label: "المقررات (المواد)", icon: <BookOpen size={20} /> },
    { id: "universities", label: "الجامعات", icon: <Building size={20} /> },
    { id: "colleges", label: "الكليات", icon: <Building2 size={20} /> },
    { id: "departments", label: "الاقسام", icon: <FolderOpen size={20} /> },
    { id: "degrees", label: "الدرجات العلمية", icon: <GraduationCap size={20} /> },
    { id: "tracks", label: "المسارات", icon: <Route size={20} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <SettingsIcon className="text-teal-600" size={24} />
              <h1 className="text-xl font-bold text-gray-900">إعدادات الحساب</h1>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span>{message.text}</span>
            {message.type === "error" && message.text.includes("تسجيل الدخول") && (
              <button
                onClick={() => router.push("/")}
                className="mr-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                العودة للرئيسية
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as SettingsSection)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-right rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="space-y-8">
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">الملف الشخصي</h2>
                    <p className="text-gray-600">إدارة معلوماتك الشخصية وتفضيلاتك</p>
                  </div>

                  {/* Avatar Section - Simplified */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
                        <User size={32} className="text-teal-600" />
                      </div>
                      <button className="absolute -bottom-1 -left-1 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold text-gray-900">صورة الملف الشخصي</h3>
                      <p className="text-sm text-gray-600 mb-3">اختر صورة تعبر عنك</p>
                      <button className="text-teal-600 hover:text-teal-700 font-medium">
                        تغيير الصورة
                      </button>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الرقم القومي
                        </label>
                        <input
                          type="text"
                          value={user?.nationalId || ""}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                      >
                        <Save size={18} />
                        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Section */}
              {activeSection === "account" && (
                <div className="space-y-8">
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الحساب</h2>
                    <p className="text-gray-600">إدارة كلمة المرور وحذف الحساب</p>
                  </div>

                  {/* Change Password - Simplified */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">تغيير كلمة المرور</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          كلمة المرور الحالية
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تأكيد كلمة المرور الجديدة
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={changePassword}
                        disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "جاري التغيير..." : "تغيير كلمة المرور"}
                      </button>
                    </div>
                  </div>

                  {/* Delete Account - Simplified */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-900">حذف الحساب</h3>
                    <p className="text-red-700">
                      سيتم حذف جميع بياناتك نهائياً ولا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-700 mb-2">
                        اكتب "أؤكد حذف الحساب" للتأكيد
                      </label>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="أؤكد حذف الحساب"
                      />
                    </div>
                    <button
                      onClick={deleteAccount}
                      disabled={saving || deleteConfirm !== "أؤكد حذف الحساب"}
                      className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                      {saving ? "جاري الحذف..." : "حذف الحساب نهائياً"}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-8">
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">إعدادات الإشعارات</h2>
                    <p className="text-gray-600">اختر كيفية تلقي الإشعارات</p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications - Simplified */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">الإشعارات عبر البريد الإلكتروني</h3>
                          <p className="text-sm text-gray-600">تلقي الإشعارات المهمة عبر البريد الإلكتروني</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    {/* Push Notifications - Simplified */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">إشعارات الدفع</h3>
                          <p className="text-sm text-gray-600">تلقي إشعارات فورية على الجهاز</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">الرسائل النصية</h3>
                          <p className="text-sm text-gray-600">تلقي الإشعارات عبر الرسائل النصية</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.smsNotifications}
                          onChange={(e) => setNotifications(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    {/* Request Updates */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">تحديثات الطلبات</h3>
                          <p className="text-sm text-gray-600">إشعارات عن حالة طلباتك</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.requestUpdates}
                          onChange={(e) => setNotifications(prev => ({ ...prev, requestUpdates: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    {/* System Updates */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <SettingsIcon className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">تحديثات النظام</h3>
                          <p className="text-sm text-gray-600">إشعارات عن صيانة النظام والتحديثات</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.systemUpdates}
                          onChange={(e) => setNotifications(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    {/* Marketing Emails */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-600" size={20} />
                        <div>
                          <h3 className="font-medium text-gray-900">الرسائل التسويقية</h3>
                          <p className="text-sm text-gray-600">عروض خاصة ومحتوى ترويجي</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketingEmails}
                          onChange={(e) => setNotifications(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={saveNotifications}
                      disabled={saving}
                      className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                    </button>
                  </div>
                </div>
              )}

              {/* Instructors Section */}
              {activeSection === "instructors" && (
                <InstructorsManagement />
              )}

              {/* Courses Section */}
              {activeSection === "courses" && (
                <CoursesManagement />
              )}

              {/* Universities Section */}
              {activeSection === "universities" && (
                <UniversitiesManagement />
              )}

              {/* Colleges Section */}
              {activeSection === "colleges" && (
                <CollegesManagement />
              )}

              {/* Departments Section */}
              {activeSection === "departments" && (
                <DepartmentsManagement />
              )}

              {/* Degrees Section */}
              {activeSection === "degrees" && (
                <DegreesManagement />
              )}

              {/* Tracks Section */}
              {activeSection === "tracks" && (
                <TracksManagement />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}