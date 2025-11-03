"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Loader2, Users, GraduationCap, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Instructor, InstructorsService, CreateInstructorData, UpdateInstructorData } from "@/lib/instructors";
import InstructorsTable from "./InstructorsTable";
import AddInstructorModal from "./modals/AddInstructorModal";
import EditInstructorModal from "./modals/EditInstructorModal";
import DeleteInstructorConfirmModal from "./modals/DeleteInstructorConfirmModal";

// Mirrors CollegesManagement, adapted for instructors

type ModalType = "add" | "edit" | "delete" | null;

export default function InstructorsManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    setLoading(true);
    try {
      const response = await InstructorsService.getInstructors();
      if (response.success) {
        setInstructors(response.data);
      } else {
        toast.error(response.message || "حدث خطأ في تحميل البيانات");
      }
    } catch (error) {
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstructor = async (data: CreateInstructorData) => {
    // Client-side guard: prevent duplicate NationalId before hitting the API
    const exists = instructors.some((i) => i.nationalId === data.nationalId);
    if (exists) {
      toast.error("الرقم القومي مستخدم بالفعل. لا يمكن إضافة عضو بنفس الرقم القومي.");
      return;
    }

    setSaving(true);
    try {
      const response = await InstructorsService.createInstructor(data);
      if (response.success) {
        await loadInstructors();
        toast.success(response.message || "تمت الإضافة بنجاح 🎉");
        closeModal();
      } else {
        toast.error(response.message || "حدث خطأ في الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ في الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const handleEditInstructor = async (data: UpdateInstructorData) => {
    setSaving(true);
    try {
      const response = await InstructorsService.updateInstructor(data);
      if (response.success) {
        await loadInstructors();
        toast.success(response.message || "تم التحديث بنجاح 🎉");
      } else {
        toast.error(response.message || "حدث خطأ في التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ في التحديث");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;
    setSaving(true);
    try {
      const response = await InstructorsService.deleteInstructor(selectedInstructor.id);
      if (response.success) {
        await loadInstructors();
        toast.success(response.message || "تم الحذف بنجاح");
      } else {
        toast.error(response.message || "حدث خطأ في الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ في الحذف");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type: ModalType, instructor?: Instructor) => {
    setActiveModal(type);
    setSelectedInstructor(instructor || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedInstructor(null);
  };

  const filtered = searchQuery
    ? instructors.filter((i) =>
        [i.name, i.nationalId, i.title, i.department, String(i.id)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : instructors;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (q: string) => setSearchQuery(q);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل أعضاء هيئة التدريس...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة أعضاء هيئة التدريس</h2>
        <p className="text-gray-600">إدارة وتنظيم أعضاء هيئة التدريس في النظام الأكاديمي</p>
      </div>

      {/* Toast messages are now handled by react-hot-toast */}

      {/* Simple Stats (mirroring style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأعضاء</p>
              <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">أعضاء نشطون</p>
              <p className="text-2xl font-bold text-green-600">{instructors.length}</p>
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
              <Building2 className="text-purple-600" size={24} />
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
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <InstructorsTable
        items={currentItems}
        onAdd={() => openModal("add")}
        onEdit={(i: Instructor) => openModal("edit", i)}
        onDelete={(i: Instructor) => openModal("delete", i)}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        startIndex={startIndex}
      />

      {/* Results Info */}
      <div className="text-sm text-gray-600 text-right mb-4">عرض {instructors.length} عضو</div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6">
          <div className="flex items-center gap-2 bg-white shadow-sm border border-gray-200 rounded-xl p-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 hover:shadow-md"
            >
              <span>← السابق</span>
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageToShow;
                if (totalPages <= 5) {
                  pageToShow = i + 1;
                } else if (currentPage <= 3) {
                  pageToShow = i + 1;
                  if (i === 4) pageToShow = totalPages;
                } else if (currentPage >= totalPages - 2) {
                  pageToShow = i === 0 ? 1 : totalPages - 4 + i;
                } else {
                  pageToShow = currentPage - 2 + i;
                  if (i === 0) pageToShow = 1;
                  if (i === 4) pageToShow = totalPages;
                }

                const isCurrentPage = pageToShow === currentPage;
                const isEllipsis =
                  (i === 1 && pageToShow > 2 && currentPage > 3) ||
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
                      isCurrentPage ? "bg-teal-500 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
            </div>
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
      <AddInstructorModal isOpen={activeModal === "add"} onClose={closeModal} onSubmit={handleAddInstructor} loading={saving} />
      <EditInstructorModal isOpen={activeModal === "edit"} onClose={closeModal} onSubmit={handleEditInstructor} instructor={selectedInstructor} loading={saving} />
      <DeleteInstructorConfirmModal isOpen={activeModal === "delete"} onClose={closeModal} onConfirm={handleDeleteInstructor} instructor={selectedInstructor} loading={saving} />
    </div>
  );
}
