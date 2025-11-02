'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertTriangle, Loader2, Calendar, CalendarDays } from 'lucide-react';
import { Intake, IntakesService } from '@/actions/intakes';
import { toast, Toaster } from 'react-hot-toast';
import IntakesTable from './IntakesTable';
import AddIntakeModal from './AddIntakeModal';
import EditIntakeModal from './EditIntakeModal';
import DeleteIntakeConfirmModal from './DeleteIntakeConfirmModal';

type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

export default function IntakesManagement() {
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    setLoading(true);
    try {
      const response = await IntakesService.getIntakes();
      if (response.succeeded) {
        setIntakes(response.data);
      } else {
        toast.error(response.message || 'حدث خطأ في تحميل البيانات');
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل البيانات';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntake = async (intakeData: any) => {
    setSaving(true);
    try {
      const response = await IntakesService.createIntake(intakeData);
      if (response.succeeded && response.data) {
        toast.success(response.message || 'تمت إضافة العام الدراسي بنجاح');
        closeModal();
        // Refresh the page after a short delay to show the success message
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        toast.error(response.message || 'حدث خطأ في إضافة العام الدراسي');
      }
    } catch (error) {
      console.error('Add intake error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إضافة العام الدراسي';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEditIntake = async (intakeData: any) => {
    setSaving(true);
    try {
      const response = await IntakesService.updateIntake(intakeData);
      if (response.succeeded && response.data) {
        // Update the specific intake in the intakes list
        toast.success(response.message || 'تم تحديث العام الدراسي بنجاح');
        closeModal();
        // Refresh the page after a short delay to show the success message
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        toast.error(response.message || 'حدث خطأ في تحديث العام الدراسي');
      }
    } catch (error) {
      console.error('Edit intake error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحديث العام الدراسي';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntake = async () => {
    if (!selectedIntake) return;

    setSaving(true);
    try {
      const response = await IntakesService.deleteIntake(selectedIntake.id);
      if (response.succeeded) {
        await loadIntakes();
        toast.success(response.message || 'تم حذف العام الدراسي بنجاح');
        closeModal();
      } else {
        // This will show the error message from the server
        toast.error(response.message || 'حدث خطأ في حذف العام الدراسي');
        // Don't close the modal if there was an error
        return;
      }
    } catch (error) {
      console.error('Delete intake error:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في حذف العام الدراسي';
      toast.error(errorMessage);
      return;
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

  if (loading) {
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

      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            direction: 'rtl',
            fontFamily: 'inherit',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            minWidth: '300px',
            maxWidth: '90vw',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />

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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="w-full">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  placeholder="ابحث عن عام دراسي..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>إضافة عام دراسي جديد</span>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

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

      <AddIntakeModal
        isOpen={activeModal === 'add'}
        onClose={closeModal}
        onSave={handleAddIntake}
        isLoading={saving}
      />

      {selectedIntake && (
        <>
          
          <EditIntakeModal
            isOpen={activeModal === 'edit'}
            onClose={closeModal}
            intake={selectedIntake}
            onSave={handleEditIntake}
            isLoading={saving}
          />

          <DeleteIntakeConfirmModal
            isOpen={activeModal === 'delete'}
            onClose={closeModal}
            onConfirm={handleDeleteIntake}
            isLoading={saving}
            intakeName={selectedIntake.name}
          />
        </>
      )}
    </div>
  );
}
