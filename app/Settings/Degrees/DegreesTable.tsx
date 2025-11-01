"use client";

import { useState } from "react";
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
import { Search, Plus, Edit, Trash2, Eye, ChevronUp, ChevronDown, GraduationCap, Clock, FolderOpen } from "lucide-react";
import { Degree } from "@/lib/degrees";

interface DegreesTableProps {
  degrees: Degree[];
  departmentsMap?: Record<number, string>;
  onEdit: (degree: Degree) => void;
  onDelete: (degree: Degree) => void;
  onView: (degree: Degree) => void;
  onAdd: () => void;
}

export default function DegreesTable({ degrees, departmentsMap, onEdit, onDelete, onView, onAdd }: DegreesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Degree>[] = [
    {
      id: "serial",
      header: () => (
        <div className="text-center">
          <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">الرقم</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {row.index + 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-center font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          اسم الدرجة العلمية
          {column.getIsSorted() === "asc" ? (
            <ChevronUp size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown size={16} />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">
            {row.getValue("name")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-center font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          الوصف
          {column.getIsSorted() === "asc" ? (
            <ChevronUp size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown size={16} />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-gray-700 truncate max-w-sm">
          {row.getValue("description") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "departmentId",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-center font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          القسم
          {column.getIsSorted() === "asc" ? (
            <ChevronUp size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown size={16} />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <div className="flex items-center gap-2">
            {/* <FolderOpen className="text-gray-400" size={16} /> */}
            <span className="font-medium text-gray-900">
              {departmentsMap && departmentsMap[row.original.departmentId]
                ? departmentsMap[row.original.departmentId]
                : `قسم رقم ${row.getValue("departmentId")}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "generalDegree",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-center font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          الدرجة العامة
          {column.getIsSorted() === "asc" ? (
            <ChevronUp size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown size={16} />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-medium text-gray-900">
            {row.getValue("generalDegree") || "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "standardDurationYears",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 text-center font-semibold text-gray-900 hover:text-teal-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          عدد سنوات الدراسة
          {column.getIsSorted() === "asc" ? (
            <ChevronUp size={16} />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown size={16} />
          ) : null}
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            {/* <Clock className="text-gray-400" size={16} /> */}
            <span className="font-medium text-gray-900">
              {row.getValue("standardDurationYears")
                ? `${row.getValue("standardDurationYears")} سنة`
                : "غير محدد"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center w-full">الإجراءات</div>,
      cell: ({ row }) => (
        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <div className="flex items-center gap-2">
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
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: degrees,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث في الدرجات العلمية..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus size={20} />
          إضافة درجة علمية جديدة
        </button>
      </div>

      {/* Table */}
      {/* Clean table design without scrolling - pagination handles data management */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {degrees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد درجات علمية</h3>
              <p className="text-gray-500 mb-6">لم يتم إضافة أي درجات علمية في النظام بعد</p>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Plus size={20} />
                إضافة الدرجة العلمية الأولى
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
