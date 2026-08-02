import { memo, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { columns } from "./columns";
import type { Employee, TableCallbacks } from "../types";

interface Props {
  isLoading: boolean;
  employees: Employee[];
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  hasActiveFilters: boolean;
  onSort: (column: string) => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onCreateFirst: () => void;
  onClearFilters: () => void;
}

const SKELETON_WIDTHS = [60, 80, 120, 90, 70, 100, 85, 75, 110, 95];

function LoadingSkeleton() {
  return Array.from({ length: 5 }).map((_, rowIndex) => (
    <TableRow key={rowIndex}>
      {SKELETON_WIDTHS.map((width, colIndex) => (
        <TableCell key={colIndex}>
          <div
            className="h-4 animate-pulse rounded bg-muted"
            style={{ width: `${width}px` }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
  onCreateFirst,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateFirst: () => void;
}) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-12">
        {hasActiveFilters ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground">
              No employees match your filters.
            </p>
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground">No employees yet.</p>
            <Button size="sm" onClick={onCreateFirst}>
              <Plus className="mr-1 h-4 w-4" /> Add your first employee
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export const EmployeeTable = memo(function EmployeeTable({
  isLoading,
  employees,
  page,
  limit,
  sortBy,
  sortOrder,
  hasActiveFilters,
  onSort,
  onView,
  onEdit,
  onDelete,
  onCreateFirst,
  onClearFilters,
}: Props) {
  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === "desc" }],
    [sortBy, sortOrder],
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: { sorting, pagination: { pageIndex: page - 1, pageSize: limit } },
    manualSorting: true,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (next.length > 0) onSort(next[0].id);
    },
    getCoreRowModel: getCoreRowModel(),
    pageCount: -1,
    meta: { onView, onEdit, onDelete } satisfies TableCallbacks,
  });

  return (
    <div className="rounded-md border bg-background overflow-x-auto">
      <Table className="table-fixed min-w-[900px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : employees.length === 0 ? (
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={onClearFilters}
              onCreateFirst={onCreateFirst}
            />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
