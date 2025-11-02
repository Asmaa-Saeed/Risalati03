"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpenText, Layers3, Building2, Plus, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Course, CoursesService, CreateCourseData, UpdateCourseData } from "@/lib/courses";
import { getAllCourses } from "@/actions/courseActions";
import CoursesTable from "./CoursesTable";
import DeleteCourseConfirmModal from "./modals/DeleteCourseConfirmModal";
// Removed unused imports

// Mirrors InstructorsManagement, adapted for courses

type ModalType = "edit" | "delete" | null;

export default function CoursesManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await CoursesService.getCourses();
      if (response.success) {
        setCourses(response.data);
      } else {
        throw new Error(response.message || "حدث خطأ في تحميل البيانات");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل البيانات';
      toast.error(`❌ ${errorMessage}`, {
        duration: 4000,
        position: 'top-center',
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#991b1b',
          fontFamily: 'Tajawal, sans-serif',
          textAlign: 'right',
          direction: 'rtl'
        },
        icon: '❌',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (data: CreateCourseData) => {
    setSaving(true);
    try {
      const response = await CoursesService.createCourse(data);
      if (response.success) {
        await loadCourses();
        toast.success(response.message || "✅ تمت إضافة المقرر بنجاح", {
          duration: 3000,
          position: 'top-center',
          style: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            padding: '16px',
            color: '#065f46',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl'
          },
          icon: '✅',
        });
        closeModal();
      } else {
        toast.error(response.message || "❌ حدث خطأ في إضافة المقرر", {
          duration: 4000,
          position: 'top-center',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#991b1b',
            fontFamily: 'Tajawal, sans-serif',
            textAlign: 'right',
            direction: 'rtl'
          },
          icon: '❌',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast.error(`❌ ${errorMessage}`, {
        duration: 4000,
        position: 'top-center',
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          padding: '16px',
          color: '#991b1b',
          fontFamily: 'Tajawal, sans-serif',
          textAlign: 'right',
          direction: 'rtl'
        },
        icon: '❌',
      });
    } finally {
      setSaving(false);
    }
  };

  // Edits are now handled in a dedicated page: /Settings/Courses/Edit/[id]

  const handleDeleteCourse = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setSaving(true);
      // Resolve backend expected id (some backends require numeric CourseId). Try to map via actions if needed.
      let deleteId = id;
      try {
        const alt = await getAllCourses();
        if (alt.success && Array.isArray(alt.data)) {
          const match = alt.data.find((d: any) => {
            const cand = [d?.id, d?.Id, d?.courseId, d?.CourseId, d?.code, d?.Code].map((v: any) => (v != null ? String(v) : ""));
            return cand.includes(String(id)) || (selectedCourse && cand.includes(String(selectedCourse.code)));
          });
          if (match) deleteId = String((match as any).id ?? (match as any).courseId ?? deleteId);
        }
      } catch {}

      const response = await CoursesService.deleteCourse(deleteId);
      if (response.success) {
        await loadCourses();
        return { 
          success: true, 
          message: response.message || "✅ تم حذف المقرر بنجاح" 
        };
      } else {
        return { 
          success: false, 
          message: response.message || "❌ حدث خطأ في حذف المقرر" 
        };
      }
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type: ModalType, course?: Course) => {
    setActiveModal(type);
    setSelectedCourse(course || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedCourse(null);
  };

  const filtered = searchQuery
    ? courses.filter((c) =>
        [c.id, c.code, c.name, c.department, c.degree, c.msar, c.semester]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : courses;

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
          <p className="text-gray-600">جاري تحميل المقررات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      {/* Simple Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المقررات</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpenText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مواد اختيارية</p>
              <p className="text-2xl font-bold text-green-600">{courses.filter(c => c.isOptional).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Layers3 className="text-green-600" size={24} />
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
              <BookOpenText className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <CoursesTable
        items={currentItems}
        onAdd={() => router.push("/Settings/Courses/Add")}
        onEdit={(c: Course) => router.push(`/Settings/Courses/Edit/${encodeURIComponent(c.id)}`)}
        onDelete={(c: Course) => openModal("delete", c)}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        startIndex={startIndex}
      />

      {/* Results Info */}
      <div className="text-sm text-gray-600 text-right mb-4">عرض {courses.length} مقرر</div>

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
      <DeleteCourseConfirmModal
        isOpen={activeModal === "delete"}
        onClose={closeModal}
        onConfirm={handleDeleteCourse}
        course={selectedCourse}
        loading={saving}
        onSuccess={() => {
          closeModal();
        }}
      />
    </div>
  );
}
