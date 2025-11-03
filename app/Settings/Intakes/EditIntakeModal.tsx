import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';
import { Intake } from '@/actions/intakes';
import toast from 'react-hot-toast';

interface EditIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  intake: Intake;
  onSave: (data: { id: number; name: string; startDate: string; endDate: string }) => Promise<void>;
  isLoading: boolean; // حالة تحميل خارجية
}

export default function EditIntakeModal({ isOpen, onClose, intake, onSave, isLoading }: EditIntakeModalProps) {
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث formData عند فتح المودال
  useEffect(() => {
    if (isOpen && intake) {
      setFormData({
        id: intake.id,
        name: intake.name,
        startDate: intake.startDate.split('T')[0],
        endDate: intake.endDate.split('T')[0],
      });
      setErrors({});
    }
  }, [isOpen, intake]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'اسم العام الدراسي مطلوب';
    if (!formData.startDate) newErrors.startDate = 'تاريخ البداية مطلوب';
    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'يجب أن يكون تاريخ النهاية بعد تاريخ البداية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success('تم تحديث العام الدراسي بنجاح ✅');
      onClose();
    } catch (error) {
      console.error('Error updating intake:', error);
      toast.error('حدث خطأ أثناء تحديث العام الدراسي ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!intake) return null;

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-right align-middle shadow-xl transition-all"
                aria-busy={isSubmitting}
              >
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    تعديل العام الدراسي
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                    disabled={isLoading || isSubmitting}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* الاسم */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      اسم العام الدراسي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      autoFocus
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2`}
                      placeholder="مثال: 2024-2025"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* تاريخ البداية */}
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ البداية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.startDate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2`}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  {/* تاريخ النهاية */}
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ النهاية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.endDate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:border-teal-500 focus:ring-teal-500 p-2`}
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>

                  {/* الأزرار */}
                  <div className="mt-6 flex items-center justify-between space-x-3 space-x-reverse">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading || isSubmitting}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'حفظ التغييرات'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
