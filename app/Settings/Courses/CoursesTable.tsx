"use client";

import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, X, Users, User, List } from "lucide-react";
import { type Course } from "@/lib/courses";
import { SemestersService, type SemesterItem } from "@/lib/semesters";

interface CoursesTableProps {
  items: Course[];
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onAdd: () => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  // Base index for pagination to display continuous serial numbers across pages
  startIndex?: number;
}

export default function CoursesTable({ items, onEdit, onDelete, onAdd, searchQuery = "", onSearch, startIndex = 0 }: CoursesTableProps) {
  const [showInstructorsPopup, setShowInstructorsPopup] = useState(false);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [showPrerequisitesPopup, setShowPrerequisitesPopup] = useState(false);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [semMap, setSemMap] = useState<Record<number, string>>({});
  const [showInstructors, setShowInstructors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setGlobalFilter(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await SemestersService.getSemesters();
      if (mounted && res.success) {
        setSemesters(res.data);
        const m: Record<number, string> = {};
        res.data.forEach(s => { m[s.id] = s.value; });
        setSemMap(m);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);
    onSearch?.(value);
  };

  const columns: ColumnDef<Course>[] = [
    {
      id: "serial",
      enableSorting: false,
      header: () => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => {}}>
          الرقم
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {startIndex + row.index + 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          كود الكورس
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <div className="text-right text-gray-900">{row.original.code}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          اسم الكورس
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <div className="text-right"><span className="font-medium text-gray-900">{row.original.name}</span></div>,
    },
    {
      accessorKey: "creditHours",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          الساعات المعتمدة
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <div className="text-right text-gray-900">{row.original.creditHours}</div>,
    },
    {
      accessorKey: "isOptional",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        حالة المادة (اختياري/إجباري)
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.isOptional ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">اختياري</span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">إجباري</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "semester",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          الفصل الدراسي
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const raw = row.original.semester;
        const rawStr = String(raw).trim();
        let label: string = rawStr;
        const isNumeric = /^\d+$/.test(rawStr);

        if (isNumeric) {
          const n = Number(rawStr);
          // 1) Direct ID map
          label = semMap[n] ?? "";
          // 2) Try find by value contains the number (e.g., "الفصل 1")
          if (!label && semesters.length) {
            const byValue = semesters.find(s => String(s.value).includes(rawStr));
            if (byValue) label = byValue.value;
          }
          // 3) Fallback by position (1-based index)
          if (!label && semesters.length >= n) {
            label = semesters[n - 1]?.value || "";
          }
          // 4) Final fallback to raw
          if (!label) {
            // Minimal debug to help diagnose mismatches
            if (typeof window !== 'undefined') {
              console.warn('[CoursesTable] Semester mapping fallback', { raw, semMap, semesters });
            }
            label = rawStr;
          }
        }

        return <div className="text-right text-gray-900">{label}</div>;
      },
    },
   
    {
      id: "instructors",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          المحاضرون
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const value: any = (row.original as any).instructors;
        const items: string[] = Array.isArray(value)
          ? value.map((it: any) => (typeof it === "string" ? it : (it?.name ?? it?.Name ?? it?.code ?? it?.Code ?? "")).toString()).filter(Boolean)
          : [];
        
        if (!items.length) {
          return (
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setSelectedInstructors([]);
                  setShowInstructorsPopup(true);
                }}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                عرض المحاضرون
              </button>
            </div>
          );
        }
        
        return (
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap gap-1 justify-end">
              {items.slice(0, 2).map((txt, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                  {txt}
                </span>
              ))}
              {items.length > 2 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                  +{items.length - 2}
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                setSelectedInstructors(items);
                setShowInstructorsPopup(true);
              }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              عرض الكل
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "prerequisites",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          المتطلبات السابقة
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => {
        const value: any = (row.original as any).prerequisites;
        const items: string[] = Array.isArray(value)
          ? value.map((it: any) => (typeof it === "string" ? it : (it?.name ?? it?.Name ?? it?.code ?? it?.Code ?? "")).toString()).filter(Boolean)
          : [];
        
        if (!items.length) return (
          <button 
            onClick={() => {
              setSelectedPrerequisites([]);
              setShowPrerequisitesPopup(true);
            }}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
          >
            عرض المقررات
          </button>
        );
        
        return (
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap gap-1 justify-end">
              {items.slice(0, 2).map((txt, idx) => (
                <span key={idx} className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                  {txt}
                </span>
              ))}
              {items.length > 2 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">
                  +{items.length - 2}
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                setSelectedPrerequisites(items);
                setShowPrerequisitesPopup(true);
              }}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors"
            >
              عرض الكل
            </button>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="flex items-center justify-center">
          <span className="font-semibold text-gray-900">الإجراءات</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(row.original)}
            className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            title="تعديل"
          >
            <Edit size={16} />
            تعديل
          </button>
          <button
            onClick={() => onDelete(row.original)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            title="حذف"
          >
            <Trash2 size={16} />
            حذف
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters, globalFilter },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث عن مقرر..."
              value={globalFilter ?? ""}
              onChange={(e) => handleSearchChange(String(e.target.value))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium">
          <Plus size={20} />
          إضافة مقرر جديد
        </button>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مقررات</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي سجلات</p>
              <button onClick={onAdd} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                <Plus size={20} />
                إضافة أول مقرر
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Prerequisites Popup */}
      {showPrerequisitesPopup && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-md w-full border border-amber-200/50 transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-amber-200">
                  <List className="text-amber-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-amber-900">المقررات السابقة</h2>
              </div>
              <button 
                onClick={() => setShowPrerequisitesPopup(false)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedPrerequisites.length > 0 ? (
                <ul className="space-y-3">
                  {selectedPrerequisites.map((prerequisite, index) => (
                    <li 
                      key={index}
                      className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{prerequisite}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <List className="text-amber-400" size={24} />
                  </div>
                  <h4 className="text-gray-700 font-medium mb-1">لا توجد مقررات سابقة</h4>
                  <p className="text-gray-500 text-sm">لم يتم إضافة أي مقررات سابقة</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-amber-200/50 bg-amber-50/50 rounded-b-2xl">
              <button
                onClick={() => setShowPrerequisitesPopup(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X size={18} />
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructors Popup */}
      {showInstructorsPopup && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div 
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-modal max-w-md w-full border border-blue-200/50 transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                  <Users className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-blue-900">قائمة المحاضرين</h2>
              </div>
              <button 
                onClick={() => setShowInstructorsPopup(false)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedInstructors.length > 0 ? (
                <ul className="space-y-3">
                  {selectedInstructors.map((instructor, index) => (
                    <li 
                      key={index}
                      className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-xl transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                          {instructor.charAt(0)}
                        </div>
                        <span className="text-gray-800 font-medium">{instructor}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="text-gray-400" size={24} />
                  </div>
                  <h4 className="text-gray-700 font-medium mb-1">لا يوجد محاضرون</h4>
                  <p className="text-gray-500 text-sm">لم يتم إضافة أي محاضرين لهذا المقرر بعد</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-blue-200/50 bg-blue-50/50 rounded-b-2xl">
              <button
                onClick={() => setShowInstructorsPopup(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <X size={18} />
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
