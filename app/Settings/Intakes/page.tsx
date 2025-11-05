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
    
    try {
      const response = await IntakesService.getIntakes();
      if (response.succeeded) {
        setIntakes(response.data);
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
    } finally {
      setLoadingIntakes(false);
    }
  };

  // ----------------- Add -----------------
const handleAddIntake = async (intakeData: any) => {
  setAdding(true);

  try {
    const response = await IntakesService.createIntake(intakeData);
    if (response.succeeded && response.data) {
      console.log(response.message || '✅ تمت إضافة العام الدراسي بنجاح');
      closeModal();
      setTimeout(() => router.refresh(), 1000);
    } else {
      console.log(response.message || '❌ حدث خطأ في إضافة العام الدراسي');
    }
  } catch (error) {
    console.error('❌ خطأ أثناء إضافة العام الدراسي:', error);
  } finally {
    setAdding(false);
  }
};

// ----------------- Edit -----------------
const handleEditIntake = async (intakeData: any) => {
  if (!intakeData.id) {
    console.error('❌ لا يمكن تحديث العام الدراسي: معرف غير صالح');
    toast.error('خطأ: معرف العام الدراسي غير صالح');
    return;
  }

  setEditing(true);
  console.log('Sending update request with data:', intakeData);

  try {
    const response = await IntakesService.updateIntake({
      id: intakeData.id,
      name: intakeData.name,
      startDate: intakeData.startDate,
      endDate: intakeData.endDate
    });

    console.log('Update response:', response);
    
    if (response.succeeded) {
      const message = response.message || '✅ تم تحديث العام الدراسي بنجاح';
      console.log(message);
      toast.success('تم تحديث العام الدراسي بنجاح');
      await loadIntakes(); // Reload the intakes list
      closeModal();
    } else {
      const errorMessage = response.message || '❌ حدث خطأ في تحديث العام الدراسي';
      console.error(errorMessage);
      toast.error(errorMessage);
    }
  } catch (error: any) {
    const errorMessage = error.message || '❌ حدث خطأ غير متوقع أثناء تحديث العام الدراسي';
    console.error('❌ خطأ أثناء تحديث العام الدراسي:', error);
    toast.error(errorMessage);
  } finally {
    setEditing(false);
  }
};

// ----------------- Delete -----------------
const handleDeleteIntake = async () => {
  if (!selectedIntake) return;
  setDeleting(true);

  try {
    const response = await IntakesService.deleteIntake(selectedIntake.id);
    if (response.succeeded) {
      await loadIntakes();
      console.log(response.message || '✅ تم حذف العام الدراسي بنجاح');
      closeModal();
    } else {
      console.log(response.message || '❌ حدث خطأ في حذف العام الدراسي');
      if (response.message?.includes('مرتبط ببيانات أخرى')) {
        console.warn('⚠️ لا يمكن حذف العام الدراسي لأنه مرتبط ببيانات أخرى');
      }
    }
  } catch (error) {
    console.error('❌ خطأ أثناء حذف العام الدراسي:', error);
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
