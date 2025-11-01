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
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      {/* Pagination Controls - Centered */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-2 bg-white shadow-sm border border-gray-200 rounded-xl p-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 hover:shadow-md"
            >
              <span>← السابق</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show first page, last page, current page, and pages around current
                let pageToShow;
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  // Near start
                  pageToShow = i + 1;
                  if (i === 4) pageToShow = totalPages;
                } else if (currentPage >= totalPages - 2) {
                  // Near end
                  pageToShow = i === 0 ? 1 : totalPages - 4 + i;
                } else {
                  // Middle
                  pageToShow = currentPage - 2 + i;
                  if (i === 0) pageToShow = 1;
                  if (i === 4) pageToShow = totalPages;
                }

                const isCurrentPage = pageToShow === currentPage;
                const isEllipsis = (i === 1 && pageToShow > 2 && currentPage > 3) || 
                                (i === 3 && pageToShow < totalPages - 1 && currentPage < totalPages - 2);

                if (isEllipsis) {
                  return (
                    <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-500">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isCurrentPage
                        ? "bg-teal-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 hover:shadow-md"
            >
              <span>التالي →</span>
            </button>
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
