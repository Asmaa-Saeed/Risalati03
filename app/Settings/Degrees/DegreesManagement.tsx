"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
        setDegrees(response.data); // Always start from first page when loading
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في تحميل البيانات" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
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
        // Refresh the degrees list from the server
        await loadDegrees();
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في إضافة الدرجة العلمية" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في إضافة الدرجة العلمية" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditDegree = async (degreeData: UpdateDegreeData) => {
    setSaving(true);
    try {
      const response = await DegreesService.updateDegree(degreeData);
      if (response.succeeded) {
        // Refresh the degrees list from the server
        await loadDegrees();
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({ type: "error", text: response.message || "حدث خطأ في تحديث الدرجة العلمية" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحديث الدرجة العلمية" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDegree = async () => {
    if (!selectedDegree) return;

    setSaving(true);
    try {
      const response = await DegreesService.deleteDegree(selectedDegree.id);
      if (response.succeeded) {
        // Refresh the degrees list from the server
        await loadDegrees();
        setMessage({ type: "success", text: response.message! });
        setTimeout(() => setMessage(null), 3000);
      } else {
        // If there's a specific error message from the server, throw it
        throw new Error(response.message || "حدث خطأ في حذف الدرجة العلمية");
      }
    } catch (error: any) {
      // Re-throw the error to be caught by the modal
      throw error;
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
      {/* Statistics cards removed as requested - direct table view for better space utilization */}
      <DegreesTable
        degrees={currentDegrees}
        departmentsMap={departmentsMap}
        onEdit={(degree) => openModal("edit", degree)}
        onDelete={(degree) => openModal("delete", degree)}
        onView={(degree) => openModal("view", degree)}
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
              <div className="font-medium">عرض {startIndex + 1}-{Math.min(endIndex, degrees.length)} من {degrees.length} درجة علمية</div>
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  if (pageNumber < 1 || pageNumber > totalPages) return null;

                  return (
                    <button
                      key={pageNumber}
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
                })}

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
        degree={selectedDegree}
        loading={saving}
      />
    </div>
  );
}
