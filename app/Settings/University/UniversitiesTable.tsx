"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  HeaderContext,
  CellContext,
} from "@tanstack/react-table";
import { Search, Plus, Edit, Trash2, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { University } from "@/lib/universities";

interface UniversitiesTableProps {
  universities: University[];
  onEdit: (university: University) => void;
  onDelete: (university: University) => void;
  onView?: (university: University) => void;
  onAdd: () => void;
}

export default function UniversitiesTable({
  universities,
  onEdit,
  onDelete,
  onView,
  onAdd,
}: UniversitiesTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<University>();

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "#",
        cell: ({ row }: CellContext<University, unknown>) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {row.original.id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }: HeaderContext<University, unknown>) => (
          <button
            className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            اسم الجامعة
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={16} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={16} />
            ) : null}
          </button>
        ),
        cell: ({ row }: CellContext<University, unknown>) => (
          <div className="text-right">
            <span className="font-medium text-gray-900">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: ({ column }: HeaderContext<University, unknown>) => (
          <div className="text-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </span>
          </div>
        ),
        cell: ({ row }: CellContext<University, unknown>) => (
          <div className="flex items-center justify-center gap-2">
            {onView && (
              <button
                onClick={() => onView(row.original)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                title="عرض التفاصيل"
              >
                <Eye size={16} />
                عرض
              </button>
            )}
            <button
              onClick={() => onEdit(row.original)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              title="تعديل"
            >
              <Edit size={16} />
              تعديل
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              title="حذف"
            >
              <Trash2 size={16} />
              حذف
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onView]
  );

  const table = useReactTable({
    data: universities,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
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
              placeholder="البحث في الجامعات..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 hover:shadow-lg transition-all duration-200 font-medium shadow-md hover:scale-105 transform"
        >
          <Plus size={20} />
          إضافة جامعة جديدة
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
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
        {universities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد جامعات</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي جامعات</p>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 hover:shadow-lg transition-all duration-200 font-medium shadow-md hover:scale-105 transform"
              >
                <Plus size={20} />
                إضافة الجامعة الأولى
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-500 text-right">
        عرض {table.getFilteredRowModel().rows.length} من {universities.length} جامعة
      </div>
    </div>
  );
}
