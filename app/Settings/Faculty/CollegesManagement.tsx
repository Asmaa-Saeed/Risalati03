"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2, Users, Building2, GraduationCap } from "lucide-react";
import { College, CollegesService, CreateCollegeData, UpdateCollegeData } from "@/lib/colleges";
import CollegesTable from "./CollegesTable";
import AddCollegeModal from "./AddCollegeModal";
import EditCollegeModal from "./EditCollegeModal";
import ViewCollegeModal from "./ViewCollegeModal";
import DeleteCollegeConfirmModal from "./DeleteCollegeConfirmModal";

type ModalType = "add" | "edit" | "view" | "delete" | null;

export default function CollegesManagement() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // No pagination - show all colleges
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Load colleges on component mount
  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const response = await CollegesService.getColleges();
      if (response.success) {
        setColleges(response.data);
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في تحميل البيانات" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = async (collegeData: CreateCollegeData) => {
    console.log("🏫 CollegesManagement - handleAddCollege called with:", collegeData);
    setSaving(true);
    try {
      const response = await CollegesService.createCollege(collegeData);
      if (response.success && response.data) {
        await loadColleges();
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في إضافة الكلية" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في إضافة الكلية" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCollege = async (collegeData: UpdateCollegeData) => {
    console.log("🏫 CollegesManagement - handleEditCollege called with:", collegeData);
    setSaving(true);
    try {
      const response = await CollegesService.updateCollege(collegeData);
      if (response.success && response.data) {
        await loadColleges();
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في تحديث الكلية" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحديث الكلية" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollege = async () => {
    if (!selectedCollege) return;

    console.log("🏫 CollegesManagement - handleDeleteCollege called with college:", selectedCollege);
    setSaving(true);
    try {
      const response = await CollegesService.deleteCollege(selectedCollege.id);
      console.log("🏫 CollegesManagement - delete response:", response);
      if (response.success) {
        await loadColleges();
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في حذف الكلية" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في حذف الكلية" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type: ModalType, college?: College) => {
    setActiveModal(type);
    setSelectedCollege(college || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCollege(null);
  };

  // Filter colleges based on search query
  const filteredColleges = searchQuery
    ? colleges.filter(college =>
        college.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : colleges;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // ثابت - 10 عناصر في الصفحة الواحدة
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentColleges = filteredColleges.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الكليات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الكليات</h2>
        <p className="text-gray-600">إدارة وتنظيم جميع الكليات في النظام الأكاديمي</p>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الكليات</p>
              <p className="text-2xl font-bold text-gray-900">{colleges.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الكليات المسجلة</p>
              <p className="text-2xl font-bold text-green-600">{colleges.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">النظام الأكاديمي</p>
              <p className="text-sm font-medium text-purple-600">نشط</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">آخر تحديث</p>
              <p className="text-sm font-medium text-orange-600">الآن</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <CollegesTable
        colleges={currentColleges}
        onEdit={(college) => openModal("edit", college)}
        onDelete={(college) => openModal("delete", college)}
        onView={(college) => openModal("view", college)}
        onAdd={() => openModal("add")}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {/* Simple Results Info */}
      <div className="text-sm text-gray-600 text-right mb-4">
        عرض {colleges.length} كلية
      </div>

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
      <AddCollegeModal
        isOpen={activeModal === "add"}
        onClose={closeModal}
        onSubmit={handleAddCollege}
        loading={saving}
      />

      <EditCollegeModal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        onSubmit={handleEditCollege}
        college={selectedCollege}
        loading={saving}
      />

      <ViewCollegeModal
        isOpen={activeModal === "view"}
        onClose={closeModal}
        college={selectedCollege}
      />

      <DeleteCollegeConfirmModal
        isOpen={activeModal === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteCollege}
        college={selectedCollege}
        loading={saving}
      />
    </div>
  );
}
