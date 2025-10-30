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
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery);
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const [semMap, setSemMap] = useState<Record<number, string>>({});

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
          مسلسل
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
    // {
    //   accessorKey: "department",
    //   header: ({ column }) => (
    //     <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    //       القسم
    //       {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
    //     </button>
    //   ),
    //   cell: ({ row }) => <div className="text-right text-gray-900">{row.original.department}</div>,
    // },
    // {
    //   accessorKey: "degree",
    //   header: ({ column }) => (
    //     <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    //       الدرجة العلمية
    //       {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
    //     </button>
    //   ),
    //   cell: ({ row }) => <div className="text-right text-gray-900">{row.original.degree}</div>,
    // },
    {
      accessorKey: "msar",
      header: ({ column }) => (
        <button className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          المسار
          {column.getIsSorted() === "asc" ? <ChevronUp size={16} /> : column.getIsSorted() === "desc" ? <ChevronDown size={16} /> : null}
        </button>
      ),
      cell: ({ row }) => <div className="text-right text-gray-900">{row.original.msar}</div>,
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
        if (!items.length) return <div className="text-right text-gray-400 italic">None</div>;
        return (
          <div className="flex flex-wrap gap-1 justify-end">
            {items.map((txt, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {txt}
              </span>
            ))}
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
        if (!items.length) return <div className="text-right text-gray-400 italic">None</div>;
        return (
          <div className="flex flex-wrap gap-1 justify-end">
            {items.map((txt, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {txt}
              </span>
            ))}
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
    </div>
  );
}
