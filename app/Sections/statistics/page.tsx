'use client';

import { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

// تعريف نوع البيانات
type Student = {
  id: string;
  name: string;
  registrationDate: string;
  phone: string;
  department: string;
  status: string;
};

// بيانات تجريبية
const mockData: Student[] = [
  {
    id: '2024001',
    name: 'أحمد محمد علي',
    registrationDate: '2024-01-15',
    phone: '01012345678',
    department: 'علوم حاسب',
    status: 'نشط',
  },
  {
    id: '2024002',
    name: 'فاطمة أحمد حسن',
    registrationDate: '2024-01-16',
    phone: '01123456789',
    department: 'هندسة',
    status: 'نشط',
  },
  {
    id: '2024003',
    name: 'محمد علي محمود',
    registrationDate: '2024-01-17',
    phone: '01234567890',
    department: 'طب',
    status: 'معلق',
  },
  {
    id: '2024004',
    name: 'عائشة محمد أحمد',
    registrationDate: '2024-01-18',
    phone: '01345678901',
    department: 'علوم',
    status: 'نشط',
  },
  {
    id: '2024005',
    name: 'علي حسن محمد',
    registrationDate: '2024-01-19',
    phone: '01456789012',
    department: 'آداب',
    status: 'نشط',
  },
  {
    id: '2024006',
    name: 'خديجة أحمد علي',
    registrationDate: '2024-01-20',
    phone: '01567890123',
    department: 'تجارة',
    status: 'معلق',
  },
  {
    id: '2024007',
    name: 'حسن محمد علي',
    registrationDate: '2024-01-21',
    phone: '01678901234',
    department: 'قانون',
    status: 'نشط',
  },
  {
    id: '2024008',
    name: 'مريم علي أحمد',
    registrationDate: '2024-01-22',
    phone: '01789012345',
    department: 'تربية',
    status: 'نشط',
  },
  {
    id: '2024009',
    name: 'يوسف محمد حسن',
    registrationDate: '2024-01-23',
    phone: '01890123456',
    department: 'صيدلة',
    status: 'نشط',
  },
];

const columnHelper = createColumnHelper<Student>();

export default function StatisticsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [data] = useState(() => mockData);

  const columns = [
    // 1- كود الطالب
    columnHelper.accessor('id', {
      header: 'كود الطالب',
      cell: (info) => (
        <div className="font-mono font-semibold text-gray-800">
          {info.getValue()}
        </div>
      ),
    }),
    // 2- اسم الطالب
    columnHelper.accessor('name', {
      header: 'اسم الطالب',
      cell: (info) => (
        <div className="font-medium text-gray-900">
          {info.getValue()}
        </div>
      ),
    }),
    // 3- تاريخ التسجيل
    columnHelper.accessor('registrationDate', {
      header: 'تاريخ التسجيل',
      cell: (info) => (
        <div className="text-gray-700">
          {new Date(info.getValue()).toLocaleDateString('ar-EG')}
        </div>
      ),
    }),
    // 4- رقم التليفون
    columnHelper.accessor('phone', {
      header: 'رقم التليفون',
      cell: (info) => (
        <div className="font-mono text-gray-700">
          {info.getValue()}
        </div>
      ),
    }),
    // 5- القسم
    columnHelper.accessor('department', {
      header: 'القسم',
      cell: (info) => (
        <div className="text-gray-700">
          {info.getValue()}
        </div>
      ),
    }),
    // 6- الحالة
    columnHelper.accessor('status', {
      header: 'الحالة',
      cell: (info) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          info.getValue() === 'نشط' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    // 7- الإجراءات
    columnHelper.accessor('id', {
      id: 'actions',
      header: 'الإجراءات',
      cell: (info) => (
        <div className="flex gap-2">
          <button className="bg-custom-teal text-white px-3 py-1.5 rounded-md text-sm hover:bg-teal-700 transition-colors duration-200 font-medium">
            عرض التفاصيل
          </button>
          <button className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200 font-medium">
            إضافة ملاحظات
          </button>
          <button className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-600 transition-colors duration-200 font-medium">
            تحميل ملف
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الإحصائيات</h1>
              <p className="mt-2 text-gray-600">إدارة بيانات الطلاب والإحصائيات</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button className="bg-custom-teal text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-semibold shadow-sm">
                إضافة طالب جديد
              </button>
            </div>
        </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
          </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
          </div>
          </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
          </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الطلاب النشطين</p>
                <p className="text-2xl font-bold text-gray-900">1,089</p>
          </div>
        </div>
      </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">145</p>
        </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">الأقسام</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
          </div>
        </div>
      </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">قائمة الطلاب</h3>
            <p className="text-sm text-gray-600 mt-1">عرض وإدارة بيانات جميع الطلاب المسجلين</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" dir="ltr">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center justify-end">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="mr-2">
                              {header.column.getIsSorted() === 'asc' ? (
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                عرض <span className="font-medium">1</span> إلى <span className="font-medium">9</span> من <span className="font-medium">9</span> نتيجة
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  السابق
                </button>
                <button className="px-3 py-1 text-sm text-white bg-custom-teal border border-custom-teal rounded-md hover:bg-teal-700">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  التالي
                </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
