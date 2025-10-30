"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  Department,
  DepartmentsService,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/lib/departments";
import DepartmentsTable from "./DepartmentsTable";
import AddDepartmentModal from "./AddDepartmentModal";
import EditDepartmentModal from "./EditDepartmentModal";
import DeleteDepartmentConfirmModal from "./DeleteDepartmentConfirmModal";
import toast from "react-hot-toast";

type ModalType = "add" | "edit" | "delete" | null;

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<any[]>([]); // ✅ نخزن البرامج هنا
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      // 🟢 نجيب الأقسام والبرامج مع بعض
      const [departmentsRes, programsRes] = await Promise.all([
        DepartmentsService.getDepartments(),
        DepartmentsService.getPrograms(),
      ]);

      if (departmentsRes.success && programsRes.success) {
        // 🗺️ نعمل map للبرامج
        const programsMap = new Map<string, string>();
        for (const program of programsRes.data) {
          programsMap.set(String(program.id), program.value);
        }

        // ✅ نخزن البرامج في state علشان نستخدمها بعد كده
        setPrograms(programsRes.data);

        // 🧩 نضيف programName لكل قسم
        const departmentsWithProgramNames = departmentsRes.data.map(
          (dep: any) => ({
            ...dep,
            programName: programsMap.get(String(dep.programId)) || "غير محدد",
          })
        );

        setDepartments(departmentsWithProgramNames);
      } else {
        setMessage({
          type: "error",
          text: departmentsRes.message || "حدث خطأ في تحميل البيانات",
        });
      }
    } catch (error) {
      console.error("❌ Error loading departments:", error);
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  // ✅ دالة بتجيب اسم البرنامج من الـ programId
  const getProgramNameById = (programId: number) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.value : "غير محدد";
  };

  const handleAddDepartment = async (departmentData: CreateDepartmentData) => {
    setSaving(true);
    try {
      const response = await DepartmentsService.createDepartment(departmentData);
      if (response.success && response.data) {
        await loadDepartments();
        setCurrentPage(1);
        setMessage({ type: "success", text: response.message! });
      } else {
        setMessage({
          type: "error",
          text: response.message || "حدث خطأ في إضافة القسم",
        });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في إضافة القسم" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

const handleEditDepartment = async (data: UpdateDepartmentData) => {
  if (!data?.id) return;

  setSaving(true);
  try {
    const response = await DepartmentsService.updateDepartment(data);

    if (response.success) {
      // ✅ نفس فكرة الـ delete بالضبط
      await loadDepartments(); // نعيد تحميل الجدول من السيرفر
      setCurrentPage(1);

      toast.success("✅ تم تحديث القسم بنجاح");
      closeModal(); // نقفل المودال بعد النجاح
    } else {
      toast.error(response.message || "❌ فشل في تحديث القسم");
    }
  } catch (error) {
    console.error("❌ Error updating department:", error);
    toast.error("حدث خطأ أثناء تحديث القسم");
  } finally {
    setSaving(false);
  }
};

const handleDeleteDepartment = async () => {
  if (!selectedDepartment) return;

  setSaving(true);
  try {
    const token = localStorage.getItem("token"); // أو حسب مكان تخزينك للتوكن
    const response = await DepartmentsService.deleteDepartment(selectedDepartment.id, token!);

    if (response.success) {
      await loadDepartments();
      setCurrentPage(1);
      setMessage({ type: "success", text: response.message || "تم حذف القسم بنجاح" });
    } else {
      setMessage({
        type: "error",
        text: response.message || "حدث خطأ في حذف القسم",
      });
    }

    setTimeout(() => setMessage(null), 3000);
  } catch (error) {
    setMessage({ type: "error", text: "حدث خطأ في حذف القسم" });
    setTimeout(() => setMessage(null), 3000);
  } finally {
    setSaving(false);
  }
};


  const openModal = (type: ModalType, department?: Department) => {
    setActiveModal(type);
    setSelectedDepartment(department || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedDepartment(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = departments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الأقسام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الأقسام</h2>
        <p className="text-gray-600">
          إدارة وتنظيم جميع الأقسام في النظام الأكاديمي
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Data Table */}
      <DepartmentsTable
        departments={currentDepartments}
        onEdit={(department: Department) => openModal("edit", department)}
        onDelete={(department: Department) => openModal("delete", department)}
        onAdd={() => openModal("add")}
      />

      {/* Pagination */}
      <div className="space-y-4">
        {/* Pagination - show only when there are multiple pages */}
        {totalPages > 1 && (
          <>
            {/* Pagination Info */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-sm text-blue-800">
                <span className="font-medium">💡 نصيحة:</span> يمكنك التنقل بين الصفحات باستخدام الأزرار أو النقر مباشرة على رقم الصفحة المطلوبة
              </div>
            </div> */}

            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
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
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
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
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
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
          </>
        )}
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={activeModal === "add"}
        onClose={closeModal}
        onSubmit={handleAddDepartment}
        loading={saving}
      />

      <EditDepartmentModal
        isOpen={activeModal === "edit"}
        onClose={closeModal}
        onSubmit={handleEditDepartment}
        department={selectedDepartment}
        loading={saving}
      />

      <DeleteDepartmentConfirmModal
        isOpen={activeModal === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteDepartment}
        department={selectedDepartment}
        loading={saving}
      />
    </div>
  );
}
