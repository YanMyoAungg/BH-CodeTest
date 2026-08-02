import { z } from "zod";
import { today } from "@/shared/lib/utils";
import type { ChangeEvent } from "react";

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  salary: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableCallbacks {
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onDownloadSample: () => void;
  isImporting?: boolean;
  onImport: (e: ChangeEvent<HTMLInputElement>) => void;
  isExporting?: boolean;
  onExport: () => void;
  onAddClick: () => void;
}

export const employeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email format."),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required."),
  salary: z.string().min(1, "Salary is required."),
  joinDate: z
    .string()
    .min(1, "Join date is required.")
    .refine((val) => val <= today(), {
      message: "Join date cannot be in the future.",
    }),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export interface EmployeeExcelRow {
  id?: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  salary: number;
  joinDate: string;
}

export const EMPTY_FORM: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  salary: "",
  joinDate: today(),
};
