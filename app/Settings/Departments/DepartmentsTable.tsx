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
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, Building2 } from "lucide-react";
import { Department } from "@/lib/departments";

interface DepartmentsTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onView?: (department: Department) => void;
  onAdd: () => void;
}

export default function DepartmentsTable({
  departments,
  onEdit,
  onDelete,
  onView,
  onAdd,
}: DepartmentsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<Department>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: ({ row }: CellContext<Department, unknown>) => (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {row.index + 1}
            </span>
          </div>
        ),
      }),
      {
        accessorKey: "name",
        header: ({ column }: HeaderContext<Department, unknown>) => (
          <button
            className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            اسم القسم
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={16} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={16} />
            ) : null}
          </button>
        ),
        cell: ({ row }: CellContext<Department, unknown>) => (
          <div className="text-right">
            <div className="font-medium text-gray-900">{row.getValue("name")}</div>
            {/* Remove college name display */}
            {/* <div className="text-sm text-gray-500">{row.original.collegeName}</div> */}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }: HeaderContext<Department, unknown>) => (
          <button
            className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            الوصف
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={16} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={16} />
            ) : null}
          </button>
        ),
        cell: ({ row }: CellContext<Department, unknown>) => (
          <div className="text-right">
            <span className="text-gray-700 text-sm line-clamp-2">{row.getValue("description")}</span>
          </div>
        ),
      },
      {
        accessorKey: "programName",
        header: ({ column }: HeaderContext<Department, unknown>) => (
          <button
            className="flex items-center gap-2 text-right font-semibold text-gray-900 hover:text-teal-600 transition-colors"
            onClick={() => column.toggleSorting()}
          >
            البرنامج
            {column.getIsSorted() === "asc" ? (
              <ChevronUp size={16} />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown size={16} />
            ) : null}
          </button>
        ),
        cell: ({ row }: CellContext<Department, unknown>) => (
          <div className="text-right">
            <span className="font-medium text-gray-900">{row.getValue("programName")}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }: CellContext<Department, unknown>) => (
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => onEdit(row.original)}
              className="flex items-center gap-1 sm:gap-2 bg-teal-50 hover:bg-teal-100 active:bg-teal-200 focus:bg-teal-100 focus:ring-2 focus:ring-teal-500 focus:outline-none border border-teal-200 hover:border-teal-300 active:border-teal-400 focus:border-teal-400 text-teal-700 hover:text-teal-800 active:text-teal-900 focus:text-teal-800 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:shadow-md text-xs sm:text-sm"
              title="تعديل"
            >
              <Edit size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تعديل</span>
            </button>
            <button
              onClick={() => onDelete(row.original)}
              className="flex items-center gap-1 sm:gap-2 bg-red-50 hover:bg-red-100 active:bg-red-200 focus:bg-red-100 focus:ring-2 focus:ring-red-500 focus:outline-none border border-red-200 hover:border-red-300 active:border-red-400 focus:border-red-400 text-red-700 hover:text-red-800 active:text-red-900 focus:text-red-800 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md focus:shadow-md text-xs sm:text-sm"
              title="حذف"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">حذف</span>
            </button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: departments,
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
              placeholder="البحث في الأقسام..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus size={20} />
          إضافة قسم جديد
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider overflow-hidden ${
                        header.id === 'actions' ? 'w-48' : header.id === 'name' ? 'w-64' : header.id === 'description' ? 'w-80' : header.id === 'programName' ? 'w-48' : 'w-32'
                      }`}
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
                      className={`px-6 py-4 text-sm text-gray-900 overflow-hidden ${
                        cell.column.id === 'actions' ? 'text-center w-48' :
                        cell.column.id === 'name' ? 'w-64 text-ellipsis whitespace-nowrap' :
                        cell.column.id === 'description' ? 'w-80 text-ellipsis whitespace-nowrap' :
                        cell.column.id === 'programName' ? 'w-48 text-ellipsis whitespace-nowrap' : 'w-32'
                      }`}
                      title={cell.column.id === 'description' || cell.column.id === 'name' || cell.column.id === 'programName' ? String(cell.getValue()) : undefined}
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
        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أقسام</h3>
              <p className="text-gray-500 mb-6">لم يتم العثور على أي أقسام</p>
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={20} />
                إضافة القسم الأول
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results info moved to parent component with pagination */}
    </div>
  );
}
