"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Loader2 } from "lucide-react";
import { CreateDegreeData, DegreesService } from "@/lib/degrees";
import axios from "axios";

const degreeSchema = z.object({
  name: z.string().min(1, "اسم الدرجة العلمية مطلوب"),
  description: z.string().optional(),
  standardDurationYears: z.number().nullable().optional(),
  departmentId: z.number().min(1, "القسم مطلوب"),
  generalDegree: z.string().min(1, "نوع الدرجة مطلوب"),
});

interface AddDegreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }) => Promise<void>;
  loading?: boolean;
}

interface GeneralDegree {
  id: number;
  value: string;
}

const AddDegreeModal: React.FC<AddDegreeModalProps> = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [loadingDegrees, setLoadingDegrees] = useState(false);
  const [generalDegrees, setGeneralDegrees] = useState<GeneralDegree[]>([]);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<{
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }>({
    resolver: zodResolver(degreeSchema),
    defaultValues: {
      standardDurationYears: null,
      generalDegree: '',
    },
  });

  const departments = DegreesService.getDepartments();


  // Fetch general degrees from the external API
  useEffect(() => {
    const fetchGeneralDegrees = async () => {
      try {
        setLoadingDegrees(true);
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Found' : 'Not found');
        
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        try {
          console.log('Fetching general degrees from API...');
          console.log('Using token:', token ? 'Token exists' : 'No token');
          
          let response;
          
          // First, try with credentials
          try {
            response = await axios.get<GeneralDegree[]>('https://professor.runasp.net/api/Lookups/GeneralDegree', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              timeout: 10000,
              withCredentials: true
            });
          } catch (error) {
            console.log('Request with credentials failed, trying without credentials...');
            // If that fails, try without credentials
            try {
              response = await axios.get<GeneralDegree[]>('https://professor.runasp.net/api/Lookups/GeneralDegree', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                timeout: 10000,
                withCredentials: false
              });
            } catch (secondError) {
              console.error('Both API attempts failed:', secondError);
              throw secondError; // Re-throw to be caught by the outer catch
            }
          }
          
          // Process successful response
          if (response) {
            console.log('API Response:', {
              status: response.status,
              statusText: response.statusText,
              data: response.data
            });
            
            if (response.data && Array.isArray(response.data)) {
              setGeneralDegrees(response.data);
            } else {
              console.error('Unexpected response format:', response.data);
              throw new Error('Unexpected response format from server');
            }
          }
          return;
        } catch (apiError: any) {
          console.error('API request failed with details:', {
            message: apiError.message,
            response: apiError.response ? {
              status: apiError.response.status,
              statusText: apiError.response.statusText,
              data: apiError.response.data
            } : 'No response',
            request: apiError.request ? 'Request made but no response' : 'No request was made',
            config: {
              url: apiError.config?.url,
              method: apiError.config?.method,
              headers: apiError.config?.headers
            }
          });
          
          // Show error to user (you might want to use a toast or alert)
          // toast.error('فشل في تحميل الدرجات العلمية. يرجى المحاولة مرة أخرى.');
        }
      } catch (error) {
        console.error('All attempts to fetch general degrees failed:', error);
      } finally {
    
        setLoadingDegrees(false);
      }
    };

    if (isOpen) {
      fetchGeneralDegrees();
    }
  }, [isOpen]);

  const handleFormSubmit = async (data: {
    name: string;
    description?: string;
    standardDurationYears?: number | null;
    departmentId: number;
    generalDegree: string;
  }) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}></div>

      {/* Modal Content */}
      <div className={`bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">إضافة درجة علمية جديدة</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Degree Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الدرجة العلمية *
              </label>
              <input
                {...register("name")}
                type="text"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="مثال: ماجستير العلوم في المحاسبة (عربي)"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="وصف الدرجة العلمية..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم *
              </label>
              <select
                {...register("departmentId", { valueAsNumber: true })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                  errors.departmentId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">اختر القسم</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مدة الدراسة (سنوات)
              </label>
              <input
                {...register("standardDurationYears", {
                  valueAsNumber: true,
                  setValueAs: (value) => value === "" ? null : Number(value)
                })}
                type="number"
                min="1"
                max="10"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                  errors.standardDurationYears ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="مثال: 2"
              />
              {errors.standardDurationYears && (
                <p className="mt-1 text-sm text-red-600">{errors.standardDurationYears.message}</p>
              )}
            </div>

            {/* General Degree Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدرجة العامة *
              </label>
              <select
                {...register("generalDegree")}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.generalDegree ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loadingDegrees}
              >
                <option value="">
                  {loadingDegrees ? "جاري التحميل..." : "اختر الدرجة العامة"}
                </option>
                {generalDegrees.map((degree) => (
                  <option key={degree.id} value={degree.value}>
                    {degree.value}
                  </option>
                ))}
              </select>
              {errors.generalDegree && (
                <p className="mt-1 text-sm text-red-600">{errors.generalDegree.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "جاري الحفظ..." : "حفظ الدرجة العلمية"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDegreeModal;
