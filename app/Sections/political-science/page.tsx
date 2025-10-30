import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'لوحة التحكم - نظام إدارة الدراسات العليا',
  description: 'لوحة تحكم شاملة لإدارة الطلاب والطلبات',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-custom-beige flex">
      {/* Sidebar - Right Side */}
      <div className="w-80 bg-custom-teal text-white p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🦷</div>
          <div className="text-lg font-semibold">نظام إدارة الدراسات العليا</div>
        </div>

        {/* Requests Center */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-lg font-semibold">
            <span>👥</span>
            <span>مركز الطلبات</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>🔍</span>
            <span>إدارة خطة البحث</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg  hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>📅</span>
            <span>متابعة الرسالة</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg  hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>📅</span>
            <span>المناقشات</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>🔒</span>
            <span>الصلاحيات</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>📊</span>
            <span>التقارير والإحصائيات</span>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-6 w-68 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>⚙️</span>
            <span>الإعدادات</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-custom-beige hover:text-black transition-colors cursor-pointer">
            <span>🚪</span>
            <span>تسجيل خروج</span>
          </div>
        </div>
      </div>

   
      Main Content Area - Left Side 
      <div className="flex-1 p-6">
        {/* Add Button*/} 
        <div className="mb-6">
          <button className="bg-custom-teal text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold">
            إضافة
          </button>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-custom-teal text-white p-4">
            <div className="grid grid-cols-7 gap-4 text-right font-semibold">
              <div>الإجراءات</div>
              <div>الحالة</div>
              <div>رقم التليفون</div>
              <div>القسم</div>
              <div>اسم الطالب</div>
              <div>تاريخ التسجيل</div>
              <div>كود الطالب</div>
            </div>
          </div>
          
          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 9 }, (_, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50">
                <div className="flex gap-2">
                  <button className="bg-custom-teal text-white px-3 py-1 rounded text-sm hover:bg-teal-700 transition-colors">
                    عرض التفاصيل
                  </button>
                  <button className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition-colors">
                    إضافة ملاحظات
                  </button>
                  <button className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 transition-colors">
                    تحميل ملف
                  </button>
                </div>
                <div className="text-gray-500">-</div>
                <div className="text-gray-500">-</div>
                <div className="text-gray-500">-</div>
                <div className="text-gray-500">-</div>
                <div className="text-gray-500">-</div>
                <div className="text-gray-500">-</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Header - Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-custom-teal text-white p-4 z-10">
        <div className="flex items-center justify-between">
          {/* Left Side - Empty for balance */}
          <div className="w-32"></div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <input
                type="text"
                placeholder="أبحث عن طالب"
                className="bg-white text-black placeholder-gray-400 px-4 py-2 rounded-full pl-10 w-96 text-center"
              />
              <span className="absolute left-3 top-2.5">🔍</span>
            </div>
          </div>
          
          {/* Right Side - Menu */}
          <div className="flex items-center gap-3 w-32 justify-end">
            <span>☰</span>
            <span>القائمة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
