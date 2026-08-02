import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/AuthContext";
import { useTheme } from "@/shared/ThemeContext";
import { useEmployees } from "@/features/employees/hooks/useEmployees";
import { useEmployeeFilters } from "@/features/employees/hooks/useEmployeeFilters";
import { useEmployeeForm } from "@/features/employees/hooks/useEmployeeForm";
import {
  downloadSampleExcel,
  exportEmployeeExcel,
} from "@/features/employees/excel";
import type { EmployeeExcelRow } from "@/features/employees/types";

import { EmployeesHeader } from "./components/EmployeesHeader";
import { EmployeeToolbar } from "./components/EmployeeToolbar";
import { EmployeeTable } from "./components/EmployeeTable";
import { EmployeeFormDialog } from "./components/EmployeeFormDialog";
import { EmployeeDetailDialog } from "./components/EmployeeDetailDialog";
import { DeleteEmployeeDialog } from "./components/DeleteEmployeeDialog";
import type { Employee } from "./types";

import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function EmployeesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // --- Filters & URL state ---
  const filters = useEmployeeFilters();

  // --- Data ---
  const {
    employees,
    total,
    totalPages,
    isLoading,
    isImporting,
    isExporting,
    refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    exportEmployees,
  } = useEmployees({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  // --- Form ---
  const {
    isOpen: formOpen,
    setIsOpen: setFormOpen,
    editingEmployee,
    form,
    setForm,
    errors: formErrors,
    isSubmitting: submitting,
    openCreateForm,
    openEditForm,
    handleSubmit: handleFormSubmit,
  } = useEmployeeForm({ createEmployee, updateEmployee });

  // --- Delete & view state ---
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [viewTarget, setViewTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Delete ---
  async function handleDelete() {
    if (!deleteTarget) return;
    const name = `${deleteTarget.firstName} ${deleteTarget.lastName}`;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(`Deleted ${name}.`);
    } catch {
      toast.error("Failed to delete employee.");
    } finally {
      setIsDeleting(false);
    }
  }

  // --- Import ---
  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    importEmployees(file);
    e.target.value = "";
  }

  // --- Export ---
  async function handleExport() {
    if (total === 0) {
      toast.warning("No data to export.");
      return;
    }
    try {
      const allEmployees = await exportEmployees();
      const rows: EmployeeExcelRow[] = allEmployees.map((emp) => ({
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone ?? undefined,
        address: emp.address ?? undefined,
        salary: emp.salary,
        joinDate: emp.joinDate,
      }));
      exportEmployeeExcel(rows);
    } catch {
      toast.error("Failed to export data.");
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-muted/40">
      <EmployeesHeader
        username={user?.username}
        employeeCount={total}
        isLoading={isLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      />

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <EmployeeToolbar
          searchTerm={filters.searchTerm}
          onSearchChange={filters.setSearchTerm}
          fromDate={filters.fromDate}
          onFromDateChange={filters.setFromDate}
          toDate={filters.toDate}
          onToDateChange={filters.setToDate}
          hasActiveFilters={filters.hasActiveFilters}
          onClearFilters={filters.clearAllFilters}
          onDownloadSample={downloadSampleExcel}
          onImport={handleImport}
          isImporting={isImporting}
          onExport={handleExport}
          isExporting={isExporting}
          onAddClick={openCreateForm}
        />

        <EmployeeTable
          isLoading={isLoading}
          employees={employees}
          page={filters.page}
          limit={filters.limit}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          hasActiveFilters={
            !!(filters.search || filters.dateFrom || filters.dateTo)
          }
          onSort={filters.handleSort}
          onView={setViewTarget}
          onEdit={openEditForm}
          onDelete={setDeleteTarget}
          onCreateFirst={openCreateForm}
          onClearFilters={filters.clearAllFilters}
        />

        <EmployeeFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editingEmployee={editingEmployee}
          form={form}
          onFormChange={setForm}
          errors={formErrors}
          submitting={submitting}
          onSubmit={handleFormSubmit}
        />

        <Pagination
          page={filters.page}
          totalPages={totalPages}
          total={total}
          limit={filters.limit}
          setParam={filters.setParam}
        />
      </main>

      <DeleteEmployeeDialog
        employee={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
      />

      <EmployeeDetailDialog
        employee={viewTarget}
        open={!!viewTarget}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
      />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  limit,
  setParam,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  setParam: (key: string, value: string) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>
          {total === 0
            ? "No results"
            : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}`}
        </span>
        <select
          value={limit}
          onChange={(e) => setParam("limit", e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value={10}>10</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setParam("page", String(Math.max(1, page - 1)))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() =>
            setParam("page", String(Math.min(totalPages, page + 1)))
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
