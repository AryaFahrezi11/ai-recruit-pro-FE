'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, Loader2 } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display with smart window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        start = 1;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages;
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalItems <= 0) return null;

  return (
    <div
      className={`px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <div className="font-medium">
        Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{startItem}</span> -{' '}
        <span className="font-bold text-slate-700 dark:text-slate-200">{endItem}</span> dari{' '}
        <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> data
      </div>

      <div className="flex items-center gap-1.5">
        {/* First Page */}
        {totalPages > 5 && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Pertama"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[28px] h-7 px-2 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Halaman Selanjutnya"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        {totalPages > 5 && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Terakhir"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
  tableClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  isLoading = false,
  emptyMessage = 'Tidak ada data yang ditemukan',
  emptyTitle,
  emptyDescription,
  emptyIcon,
  currentPage: controlledPage,
  onPageChange: controlledOnPageChange,
  showPagination = true,
  onRowClick,
  className = '',
  tableClassName = ''
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);

  const isControlled = controlledPage !== undefined && controlledOnPageChange !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const onPageChange = isControlled ? controlledOnPageChange : setInternalPage;

  // Paginated items
  const paginatedData = useMemo(() => {
    if (!showPagination || pageSize <= 0) return data;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize, showPagination]);

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className={`w-full text-xs text-left ${tableClassName}`}>
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium">Memuat data tabel...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto px-4">
                    {emptyIcon || <Inbox size={32} className="text-slate-300 dark:text-slate-600 mb-1" />}
                    {emptyTitle ? (
                      <>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {emptyTitle}
                        </h4>
                        {emptyDescription && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {emptyDescription}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-medium">{emptyMessage}</span>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx;
                const rowKey = keyExtractor ? keyExtractor(item, globalIndex) : idx;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item, globalIndex)}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-3.5 ${getAlignClass(col.align)} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(item, globalIndex)
                          : (item as any)[col.key] !== undefined && (item as any)[col.key] !== null
                          ? String((item as any)[col.key])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !isLoading && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={data.length}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

export default DataTable;
