'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CalendarDays } from 'lucide-react';
import { Intake, IntakesService } from '@/actions/intakes';
import { toast } from 'react-hot-toast';
import IntakesTable from './IntakesTable';
import AddIntakeModal from './AddIntakeModal';
import EditIntakeModal from './EditIntakeModal';
import DeleteIntakeConfirmModal from './DeleteIntakeConfirmModal';

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

export default function IntakesManagement() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loadingIntakes, setLoadingIntakes] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedIntake, setSelectedIntake] = useState<Intake | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    loadIntakes();
  }, []);

  const loadIntakes = async () => {
    setLoadingIntakes(true);
    const loadingToast = toast.loading('جاري تحميل البيانات...', {
      duration: 0, // Show until manually dismissed
    });
    
    try {
      const response = await IntakesService.getIntakes();
      if (response.succeeded) {
        setIntakes(response.data);
        toast.success('تم تحميل البيانات بنجاح', { id: loadingToast });
      } else {
        toast.error(response.message || 'حدث خطأ في تحميل البيانات', { id: loadingToast });
      }
    } catch (error) {
      toast.error('حدث خطأ في تحميل البيانات', { id: loadingToast });
    } finally {
      setLoadingIntakes(false);
    }
  };

  // ----------------- Add -----------------
  const handleAddIntake = async (intakeData: any) => {
    setAdding(true);
    const loadingToast = toast.loading('جاري إضافة العام الدراسي...', {
      duration: 0, // Show until manually dismissed
    });
    
    try {
      const response = await IntakesService.createIntake(intakeData);
      if (response.succeeded && response.data) {
        toast.success(response.message || 'تمت إضافة العام الدراسي بنجاح', { id: loadingToast });
        closeModal();
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast.error(response.message || 'حدث خطأ في إضافة العام الدراسي', { id: loadingToast });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في إضافة العام الدراسي', { id: loadingToast });
    } finally {
      setAdding(false);
    }
  };

  // ----------------- Edit -----------------
  const handleEditIntake = async (intakeData: any) => {
    setEditing(true);
    const loadingToast = toast.loading('جاري تحديث العام الدراسي...', {
      duration: 0, // Show until manually dismissed
    });
    
    try {
      const response = await IntakesService.updateIntake(intakeData);
      if (response.succeeded && response.data) {
        toast.success(response.message || 'تم تحديث العام الدراسي بنجاح', { id: loadingToast });
        closeModal();
        setTimeout(() => router.refresh(), 1000);
      } else {
        toast.error(response.message || 'حدث خطأ في تحديث العام الدراسي', { id: loadingToast });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في تحديث العام الدراسي', { id: loadingToast });
    } finally {
      setEditing(false);
    }
  };

  // ----------------- Delete -----------------
  const handleDeleteIntake = async () => {
    if (!selectedIntake) return;
    setDeleting(true);
    const loadingToast = toast.loading('جاري حذف العام الدراسي...', {
      duration: 0, // Show until manually dismissed
    });
    
    try {
      const response = await IntakesService.deleteIntake(selectedIntake.id);
      if (response.succeeded) {
        await loadIntakes();
        toast.success(response.message || 'تم حذف العام الدراسي بنجاح', { id: loadingToast });
        closeModal();
      } else {
        toast.error(response.message || 'حدث خطأ في حذف العام الدراسي', { id: loadingToast });
        if (response.message?.includes('مرتبط ببيانات أخرى')) {
          console.log('Cannot delete intake due to related data');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ في حذف العام الدراسي', { id: loadingToast });
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (type: ModalType, intake?: Intake) => {
    setActiveModal(type);
    setSelectedIntake(intake || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedIntake(null);
  };

  // ----------------- Pagination & Search -----------------
  const filteredIntakes = searchQuery
    ? intakes.filter(intake =>
        intake.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.startDate.includes(searchQuery) ||
        intake.endDate.includes(searchQuery)
      )
    : intakes;

  const totalPages = Math.ceil(filteredIntakes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIntakes = filteredIntakes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ----------------- Loading Page -----------------
  if (loadingIntakes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل الأعوام الدراسية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">إدارة الأعوام الدراسية</h2>
        <p className="text-gray-600">إدارة وتنظيم جميع الأعوام الدراسية في النظام الأكاديمي</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الأعوام الدراسية</p>
              <p className="text-2xl font-bold text-gray-900">{intakes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  placeholder="ابحث عن عام دراسي..."
                  className="w-full max-w-4xl pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50"
              disabled={adding}
            >
              {adding ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة عام دراسي جديد'
              )}
            </button>
          </div>

          {/* Table */}
          <IntakesTable
            intakes={currentIntakes}
            onEdit={(intake) => openModal('edit', intake)}
            onDelete={(intake) => openModal('delete', intake)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modals */}
      <AddIntakeModal
        isOpen={activeModal === 'add'}
        onClose={closeModal}
        onSave={handleAddIntake}
        isLoading={adding}
      />

      {selectedIntake && (
        <>
          <EditIntakeModal
            isOpen={activeModal === 'edit'}
            onClose={closeModal}
            intake={selectedIntake}
            onSave={handleEditIntake}
            isLoading={editing}
          />

          <DeleteIntakeConfirmModal
            isOpen={activeModal === 'delete'}
            onClose={closeModal}
            onConfirm={handleDeleteIntake}
            isLoading={deleting}
            intakeName={selectedIntake.name}
          />
        </>
      )}
    </div>
  );
}
