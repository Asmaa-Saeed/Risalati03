import { Intake } from '@/actions/intakes';
import { Calendar, Edit, Trash2 } from 'lucide-react';

interface IntakesTableProps {
  intakes: Intake[];
  onEdit: (intake: Intake) => void;
  onDelete: (intake: Intake) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function IntakesTable({
  intakes,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: IntakesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {/* Table Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
            </div>
            
            {/* Table Headers */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-gray-100 rounded"></div>
              ))}
            </div>
            
            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="grid grid-cols-4 gap-4 py-4 border-t border-gray-100">
                <div className="h-5 bg-gray-100 rounded"></div>
                <div className="h-5 bg-gray-100 rounded"></div>
                <div className="h-5 bg-gray-100 rounded"></div>
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-20 bg-gray-100 rounded"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
            
            {/* Pagination Skeleton */}
            <div className="flex justify-end mt-6">
              <div className="h-10 bg-gray-100 rounded-lg w-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };



  const handleEdit = (intake: Intake) => {
    onEdit(intake);
  };

  const handleDelete = (intake: Intake) => {
    onDelete(intake);
  };

  if (intakes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center mb-5">
          <Calendar className="h-10 w-10 text-teal-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد أعوام دراسية</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">لم يتم إضافة أي عام دراسي بعد. يمكنك إضافة عام دراسي جديد باستخدام الزر أعلاه.</p>
        <div className="w-16 h-1 bg-gradient-to-r from-teal-300 to-blue-300 mx-auto rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="align-middle inline-block min-w-full">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-teal-50 to-blue-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-teal-800 uppercase tracking-wider rounded-tr-xl"
                >
                  العام الدراسي
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-teal-800 uppercase tracking-wider"
                >
                  تاريخ البداية
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-right text-xs font-semibold text-teal-800 uppercase tracking-wider"
                >
                  تاريخ النهاية
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-4 text-right text-xs font-semibold text-teal-800 uppercase tracking-wider rounded-tl-xl"
                >
                  <span className="sr-only">الإجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {intakes.map((intake, index) => (
                <tr 
                  key={intake.id} 
                  className={`transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-teal-50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-teal-400 mr-3 ml-3"></div>
                      <div className="text-sm font-medium text-gray-800">{intake.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-700">{formatDate(intake.startDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-700">{formatDate(intake.endDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                   <div className="flex items-center justify-center gap-2 sm:gap-3">
                <button
                 onClick={() => onEdit(intake)}
                 className="flex items-center gap-1 sm:gap-2 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 focus:bg-teal-100 focus:ring-2 focus:ring-teal-500 focus:outline-none border border-teal-200 hover:border-teal-300 active:border-teal-400 focus:border-teal-400 text-teal-700 hover:text-teal-800 active:text-teal-900 focus:text-teal-800 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:shadow-md text-xs sm:text-sm"
                title="تعديل"
            >
                 <Edit size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تعديل</span>
            </button>
            <button
              onClick={() => onDelete(intake)}
              className="flex items-center gap-1 sm:gap-2 bg-red-50 hover:bg-red-100 active:bg-red-200 focus:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none border border-red-200 hover:border-red-300 active:border-red-400 focus:border-red-400 text-red-700 hover:text-red-800 active:text-red-900 focus:text-red-800 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:shadow-md text-xs sm:text-sm"
              title="حذف"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">حذف</span>
            </button>
          </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg transition-colors ${
                currentPage === 1
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-teal-600 hover:bg-teal-50 border-teal-200'
              }`}
            >
              السابق
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-teal-600 hover:bg-teal-50 border-teal-200'
              }`}
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="bg-blue-50 rounded-lg px-3 py-1.5">
              <p className="text-sm text-blue-700">
                <span className="font-medium">عرض {Math.min((currentPage - 1) * 10 + 1, intakes.length)}</span> -{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, intakes.length)}
                </span>{' '}
                من أصل <span className="font-semibold text-teal-600">{intakes.length}</span> نتيجة
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-teal-600 hover:bg-teal-50 hover:text-teal-700 border-teal-200'
                  }`}
                >
                  <span className="sr-only">السابق</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">التالي</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
