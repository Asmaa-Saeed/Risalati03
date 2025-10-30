'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { SignUp } from '@/actions/SignUp';

export default function RegisterForm() {
  const [nationalId, setNationalId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerMessage('');
    setLoading(true);

    // Validation
    const fieldErrors: { [key: string]: string } = {};
    if (!nationalId) fieldErrors.nationalId = 'يجب ادخال الرقم القومي';
    else if (nationalId.length !== 14) fieldErrors.nationalId = 'الرقم القومي يجب ان يكون 14 رقم';
    if (!phoneNumber) fieldErrors.phoneNumber = 'يجب ادخال رقم الهاتف';
    else if (phoneNumber.length !== 11) fieldErrors.phoneNumber = 'رقم الهاتف يجب ان يكون 11 رقم';
    if (!password) fieldErrors.password = 'يجب ادخال كلمة المرور';
    else if (password.length < 8) fieldErrors.password = 'كلمة المرور يجب ان تكون اطول من 8 احرف';
    if (!confirmPassword) fieldErrors.confirmPassword = 'يجب تأكيد كلمة المرور';
    else if (password !== confirmPassword) fieldErrors.confirmPassword = 'كلمة المرور غير متطابقة';

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    try {
      const userData = {
        nationalId,
        phoneNumber,
        password,
        confirmPassword
      };

      
      const response = await SignUp(userData);

     

  if (response && (response.success || response.succeeded)) {
    sessionStorage.setItem('tempLogin', JSON.stringify({ nationalId, password }));
    window.location.href = '/Regestration/Login';
  } else {
    const errorMessage = response?.message || 'حدث خطأ أثناء إنشاء الحساب';
    setServerMessage(errorMessage);
  }
} catch (error: any) {
  // لو SignUp رمى خطأ فيه response من السيرفر
  let message = 'حدث خطأ أثناء إنشاء الحساب';

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  }

  setServerMessage(message);
} finally {
  setLoading(false);
}

    
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] shadow-xl overflow-hidden max-w-5xl w-full min-h-[500px]">
        <div className="flex flex-col md:flex-row">

          {/* Login Form Section */}
          <div className="bg-[#025e5f] md:w-1/2 flex max-w-full h-[800px] rounded-[30px] items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-[30px] p-10 shadow-lg min-h-[400px]">
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-[#025e5f]">
                  انشاء حساب جديد!
                </h2>
                <p className="text-center mt-2 text-gray-500 mb-2">
                  لديك حساب؟
                  <Link href="/Regestration/Login" className="text-[#025e5f] font-semibold hover:underline ml-1">
                    تسجيل الدخول
                  </Link>
                </p>

                {/* Form: use gap (works reliably with flex) */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-1 w-full">
                  
                  {/* National ID */}
                  <div className="flex flex-col py-1 ">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                      الرقم القومي
                    </label>
                    <input
                      type="text"
                      placeholder="ادخل الرقم القومي"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none ${
                        errors.nationalId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="h-6 mt-1">
                      {errors.nationalId && (
                        <p className="text-red-500 text-sm text-right">{errors.nationalId}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* phone number  */}
                  <div className="flex flex-col py-1 ">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      placeholder="ادخل رقم الهاتف"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <div className="h-6 mt-1">
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm text-right">{errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col mb-3">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                      كلمة المرور
                    </label>
                    <div className="relative flex space-between">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="•••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none pl-10 ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
                      </button>
                    </div>
                    <div className="h-6 mt-1">
                      {errors.password && (
                        <p className="text-red-500 text-sm text-right">{errors.password}</p>
                      )}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col">
                    <label className="block text-[#025e5f] font-semibold mb-1">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative flex space-between">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="•••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full rounded-full border px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#025e5f] focus:outline-none pl-10 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1 text-right">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  {serverMessage && (
                    <div className={`text-center text-sm mt-4 ${
                      serverMessage.includes('تم إنشاء الحساب بنجاح') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {serverMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full cursor-pointer bg-[#025e5f] text-white mt-6 py-4 rounded-full font-semibold hover:bg-[#014e4e] transition-colors ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <a href="#" className="text-[#025e5f] hover:underline text-sm">
                    نسيت كلمة المرور؟
                  </a>
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
  )
}
