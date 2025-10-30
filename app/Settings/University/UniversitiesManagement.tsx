"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { addUniversity, getUniversities, updateUniversity, deleteUniversity } from "@/actions/universityActions";
import {
  University,
  UniversitiesService,
  CreateUniversityData,
  UpdateUniversityData,
  UniversitiesApiResponse
} from "@/lib/universities";
import UniversitiesTable from "./UniversitiesTable";
import AddUniversityModal from "./AddUniversityModal";
import EditUniversityModal from "./EditUniversityModal";
import DeleteUniversityConfirmModal from "./DeleteUniversityConfirmModal";

type ModalType = "add" | "edit" | "delete" | null;

export default function UniversitiesManagement() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load universities on component mount
  useEffect(() => {
    loadUniversities();
  }, []);

 
  const loadUniversities = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const result = await getUniversities(token || "");

      if (result.success && result.data) {
        // The API returns objects with id and name, not just names
        setUniversities(result.data);
      } else {
        setMessage({ type: "error", text: result.message || "حدث خطأ في تحميل البيانات" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

const handleAddUniversity = async (data: { name: string }) => {
  setSaving(true);
  try {
    // Get token from localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const result = await addUniversity(data.name, token || "");

    if (result.success) {
      await loadUniversities(); // عشان يجيب الجامعات من الباك
      setMessage({ type: "success", text: "تمت إضافة الجامعة بنجاح 🎉" });
    } else {
      setMessage({ type: "error", text: result.message || "حدث خطأ أثناء الإضافة" });
    }
  } catch (error) {
    setMessage({ type: "error", text: "حدث خطأ أثناء إضافة الجامعة" });
  } finally {
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }
};


 const handleUpdateUniversity = async (data: { id: number; name: string }) => {
  setSaving(true);
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const result = await updateUniversity(data.id, data.name, token || "");

    if (result.success) {
      await loadUniversities();
      setMessage({ type: "success", text: "✅ تم تحديث الجامعة بنجاح" });
    } else {
      setMessage({ type: "error", text: result.message || "حدث خطأ أثناء التحديث" });
    }
  } catch {
    setMessage({ type: "error", text: "حدث خطأ أثناء تحديث الجامعة" });
  } finally {
    setSaving(false);
    closeModal();
    setTimeout(() => setMessage(null), 3000);
  }
};


const handleDeleteUniversity = async (id: number) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return await deleteUniversity(id, token || "");
};
 

  const openModal = (type: ModalType, university?: University) => {
    setActiveModal(type);
    setSelectedUniversity(university || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedUniversity(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(universities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUniversities = universities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الجامعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-opacity duration-300">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الجامعات</h2>
        <p className="text-gray-600">إدارة وتنظيم جميع الجامعات في النظام الأكاديمي</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
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
        </div>
      )}

      {/* Data Table */}
      <UniversitiesTable
        universities={currentUniversities}
        onEdit={(university) => openModal("edit", university)}
        onDelete={(university) => openModal("delete", university)}
        onAdd={() => openModal("add")}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="space-y-4">
          {/* Pagination Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-sm text-blue-800">
              <span className="font-medium">💡 نصيحة:</span> يمكنك التنقل بين الصفحات باستخدام الأزرار أو النقر مباشرة على رقم الصفحة المطلوبة
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
            {/* Page Info */}
            <div className="text-sm text-gray-600 text-center sm:text-right">
              <div className="font-medium">عرض {startIndex + 1}-{Math.min(endIndex, universities.length)} من {universities.length} جامعة</div>
              <div className="text-xs text-gray-500 mt-1">الصفحة {currentPage} من {totalPages}</div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                ← السابق
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                  </>
                )}

                {/* Current page range */}
                {(() => {
                  // Calculate the range of pages to show (max 5 pages)
                  const maxPagesToShow = Math.min(5, totalPages);
                  let startPage = Math.max(1, currentPage - 2);

                  // Adjust start page if we're near the end
                  if (startPage + maxPagesToShow - 1 > totalPages) {
                    startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                  }

                  return Array.from({ length: maxPagesToShow }, (_, i) => {
                    const pageNumber = startPage + i;
                    if (pageNumber > totalPages) return null;

                    return (
                      <button
                        key={`page-${pageNumber}`}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pageNumber === currentPage
                            ? "text-white bg-teal-600 border border-teal-600 shadow-sm"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }).filter(Boolean);
                })()}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
              >
                التالي →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUniversityModal
        isOpen={activeModal === "add"}
        onClose={closeModal}
        onSubmit={handleAddUniversity}
        loading={saving}
      />

      {/* <AddUniversityModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleAddUniversity}
/> */}


      <EditUniversityModal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        onSubmit={handleUpdateUniversity}
        university={selectedUniversity}
        loading={saving}
      />

     <DeleteUniversityConfirmModal
  isOpen={activeModal === "delete"}
  onClose={closeModal}
  onConfirm={handleDeleteUniversity} // المودال هيمرر id تلقائياً
  university={selectedUniversity}   // صححت الاسم
  loading={saving}
  onSuccess={() => {
    // تحديث قائمة الجامعات بعد الحذف
    if (selectedUniversity) {
      setUniversities(prev => prev.filter(u => u.id !== selectedUniversity.id));
    }
  }}
/>

    </div>
  );
}
