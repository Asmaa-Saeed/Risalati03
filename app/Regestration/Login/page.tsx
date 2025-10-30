"use client";

import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import LoginAction from "@/actions/login";
import { decode } from "punycode";

interface JwtPayload {
  Role?: string;
  sub?: string; // ClaimTypes.NameIdentifier
  Name?: string; // ClaimTypes.Name
  exp?: number;
  iat?: number;
  NationalId?: string; // Custom claim for NationalId
  nationalId?: string;
  [key: string]: any;
}

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  Role?: string;
  hasCard?: boolean;
  [key: string]: unknown;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  access_token?: string;
  data?: {
    token?: string;
    user?: UserData;
    hasCard?: boolean;
  };
  user?: UserData;
  error?: string;
  hasCard?: boolean;
}

interface FormData {
  nationalId: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nationalId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    nationalId?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const validateForm = () => {
    const newErrors: { nationalId?: string; password?: string } = {};
    if (!formData.password.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerMessage("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);

      const response: LoginResponse = await LoginAction({
        nationalId: formData.nationalId,
        password: formData.password,
      });

      console.log("Login response:", response);

      if (response.success) {
        try {
          const token =
            response.token ||
            response.data?.token ||
            localStorage.getItem("token");

          if (!token) {
            setServerMessage("فشل في استلام التوكن");
            return;
          }

          localStorage.setItem("token", token);

          const userData = response.data?.user || response.user;
          if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
          }

          const hasCard =
            response.data?.hasCard ??
            userData?.hasCard ??
            response.hasCard ??
            false;
          localStorage.setItem("hasCard", JSON.stringify(hasCard));

          // استخراج Role من التوكن أو بيانات المستخدم
          let userRole = "user";
          try {
            const decodedToken = jwtDecode<JwtPayload>(token);

            const nationalIdFromToken =
              decodedToken.NationalId ||
              decodedToken.nationalId ||
              decodedToken[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
              ];
            // ||
            // decodedToken[
            //   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            // ];

            if (nationalIdFromToken) {
              localStorage.setItem("nationalId", nationalIdFromToken);
              console.log("NationalId from token:", nationalIdFromToken);
            }

            userRole =
              decodedToken.Role?.toLowerCase?.() ||
              userData?.Role?.toLowerCase?.() ||
              decodedToken[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ] ||
              "user";
            localStorage.setItem("Role", userRole);
          } catch (decodeError) {
            userRole = userData?.Role?.toLowerCase?.() || "user";
            localStorage.setItem("Role", userRole);
          }

          console.log("userRole:", userRole);

          if (userRole === "Admin") {
            setServerMessage("تم تسجيل الدخول بنجاح! يتم التوجيه...");
              router.push("/Sections/Specialization");
          
          } else if (userRole === "Student") {
            if (!hasCard) {
              setServerMessage("يرجي استكمال بياناتك أولاً...");
             router.push("/Sections/student-registration");
            } else {
              setServerMessage("تم تسجيل الدخول بنجاح! يتم التوجيه...");
             router.push("/StudentDashboard");
            }
          } else {
            setServerMessage("تم تسجيل الدخول بنجاح! يتم التوجيه...");
           router.push("/StudentDashboard");
          }
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          setServerMessage("حدث خطأ في معالجة بيانات المستخدم");
        }
      } else {
        setServerMessage(
          response.message ||
            "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى."
        );
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      setServerMessage(`حدث خطأ أثناء محاولة تسجيل الدخول: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] shadow-xl overflow-hidden max-w-5xl w-full min-h-[600px]">
        <div className="flex flex-col md:flex-row">
          {/* Login Form Section */}
          <div className="bg-[#025e5f] md:w-1/2 flex max-w-full h-[600px] rounded-[30px] items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-[30px] p-10 shadow-lg min-h-[500px]">
                <h2 className="text-2xl font-bold text-center text-[#025e5f] mb-2">
                  تسجيل الدخول!
                </h2>
                <p className="text-center mt-4 text-gray-500 mb-6">
                  ليس لديك حساب؟
                  <Link
                    href="/Regestration/SignUp"
                    className="text-[#025e5f] font-semibold hover:underline ml-1"
                  >
                    إنشاء حساب جديد
                  </Link>
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-1 w-full"
                >
                  {/* National ID */}
                  <div className="flex flex-col py-1 ">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                       الرقم القومي او اسم المستخدم
                    </label>
                    <input
                      type="text"
                      placeholder="ادخل الرقم القومي او اسم المستخدم"
                      value={formData.nationalId}
                      onChange={handleChange}
                      name="nationalId"
                      className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none ${
                        errors.nationalId ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <div className="h-6 mt-1">
                      {errors.nationalId && (
                        <p className="text-red-500 text-sm text-right">
                          {errors.nationalId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                      كلمة المرور
                    </label>
                    <div className="relative flex space-between">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="•••••••"
                        value={formData.password}
                        onChange={handleChange}
                        name="password"
                        className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none pl-10 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeIcon size={20} />
                        ) : (
                          <EyeOffIcon size={20} />
                        )}
                      </button>
                    </div>
                    <div className="h-6 mt-1">
                      {errors.password && (
                        <p className="text-red-500 text-sm text-right">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  {serverMessage && (
                    <div
                      className={`text-center text-sm mt-2 mb-2 ${
                        serverMessage.includes("نجاح")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {serverMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full cursor-pointer bg-[#025e5f] text-white mt-2 py-4 rounded-full font-semibold hover:bg-[#014e4e] transition-colors ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/Regestration/ForgotPassword"
                    className="text-[#025e5f] hover:underline text-sm"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="bg-white hidden md:flex items-center justify-center p-12 md:w-1/2">
            <Image
              src="/logo.png"
              alt="رسالتي Logo"
              width={520}
              height={520}
              className="mx-auto mb-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
