"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Degree, DegreesService, CreateDegreeData, UpdateDegreeData, DegreesApiResponse } from "@/lib/degrees";
import DegreesTable from "./DegreesTable";
import AddDegreeModal from "./AddDegreeModal";
import EditDegreeModal from "./EditDegreeModal";
import ViewDegreeModal from "./ViewDegreeModal";
import DeleteDegreeConfirmModal from "./DeleteDegreeConfirmModal";

type ModalType = "add" | "edit" | "view" | "delete" | null;

export default function DegreesManagement() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departmentsMap, setDepartmentsMap] = useState<Record<number, string>>({});

  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDegree, setSelectedDegree] = useState<Degree | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load degrees on component mount
  useEffect(() => {
    loadDegrees();
    loadDepartmentsLookup();
  }, []);

  const loadDegrees = async () => {
    setLoading(true);
    try {
      const response: DegreesApiResponse = await DegreesService.getDegrees();
      if (response.succeeded) {
        setDegrees(response.data);
      } else {
        toast.error(response.message || "حدث خطأ في تحميل الدرجات العلمية");
      }
    } catch (error) {
      console.error("❌ Error loading degrees:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في تحميل الدرجات العلمية";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentsLookup = async () => {
    try {
      const { getDepartmentsLookup } = await import("@/actions/departmentActions");
      const res = await getDepartmentsLookup();
      if (res.success && Array.isArray(res.data)) {
        const map: Record<number, string> = {};
        for (const item of res.data) {
          if (item && typeof item.id === 'number') {
            map[item.id] = (item.name || item.value || `قسم رقم ${item.id}`);
          }
        }
        setDepartmentsMap(map);
      }
    } catch (e) {
      // silent fail; keep IDs if lookup fails
    }
  };

  const handleAddDegree = async (degreeData: CreateDegreeData) => {
    setSaving(true);
    try {
      const response = await DegreesService.createDegree(degreeData);
      if (response.succeeded) {
        await loadDegrees();
        toast.success(response.message || "تمت إضافة الدرجة العلمية بنجاح 🎉");
        closeModal();
      } else {
        toast.error(response.message || "حدث خطأ أثناء إضافة الدرجة العلمية");
      }
    } catch (error) {
      console.error("❌ Error adding degree:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إضافة الدرجة العلمية";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDegree = async (degreeData: UpdateDegreeData) => {
    setSaving(true);
    try {
      const response = await DegreesService.updateDegree(degreeData);
      if (response.succeeded) {
        await loadDegrees();
        toast.success(response.message || "تم تحديث الدرجة العلمية بنجاح 🎉");
        closeModal();
      } else {
        toast.error(response.message || "حدث خطأ أثناء تحديث الدرجة العلمية");
      }
    } catch (error) {
      console.error("❌ Error updating degree:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الدرجة العلمية";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDegree = async (id: number): Promise<{ success: boolean; message?: string }> => {
    try {
      setSaving(true);
      const response = await DegreesService.deleteDegree(id);
      return { 
        success: response.succeeded, 
        message: response.message
      };
    } catch (error) {
      console.error("❌ Error deleting degree:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الدرجة العلمية" 
      };
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type: ModalType, degree?: Degree) => {
    setActiveModal(type);
    setSelectedDegree(degree || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedDegree(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(degrees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDegrees = degrees.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when degrees change
  useEffect(() => {
    setCurrentPage(1);
  }, [degrees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الدرجات العلمية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الدرجات العلمية</h2>
        <p className="text-gray-600">إدارة وتنظيم جميع الدرجات العلمية في النظام الأكاديمي</p>
      </div>

      {/* Message Alert */}
      {/* Data Table */}
      {/* Statistics cards removed as requested - direct table view for better space utilization */}
      <DegreesTable
        degrees={currentDegrees}
        departmentsMap={departmentsMap}
        onEdit={(degree) => openModal("edit", degree)}
        onDelete={(degree) => openModal("delete", degree)}
        onView={(degree) => openModal("view", degree)}
        onAdd={() => openModal("add")}
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
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    className={`px-3 py-1.5 text-sm rounded-md min-w-[32px] transition-all duration-200 ${
                      isCurrentPage
                        ? 'bg-teal-600 text-white font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
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
      <AddDegreeModal
        isOpen={activeModal === "add"}
        onClose={closeModal}
        onSubmit={handleAddDegree}
        loading={saving}
      />

      <EditDegreeModal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        onSubmit={handleEditDegree}
        degree={selectedDegree}
        loading={saving}
      />

      <ViewDegreeModal
        isOpen={activeModal === "view"}
        onClose={closeModal}
        degree={selectedDegree}
      />

      <DeleteDegreeConfirmModal
        isOpen={activeModal === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteDegree}
        onSuccess={async () => {
          await loadDegrees();
          closeModal();
        }}
        degree={selectedDegree}
        loading={saving}
      />
    </div>
  );
}
