import { useState, useCallback, type FormEvent } from "react";
import { toast } from "sonner";
import {
  employeeFormSchema,
  EMPTY_FORM,
  type Employee,
  type EmployeeFormData,
} from "@/features/employees/types";

interface UseEmployeeFormOptions {
  createEmployee: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    salary: number;
    joinDate: string;
  }) => Promise<void>;
  updateEmployee: (
    id: string,
    input: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
      address?: string | null;
      salary: number;
      joinDate: string;
    },
  ) => Promise<void>;
}

export function useEmployeeForm({
  createEmployee,
  updateEmployee,
}: UseEmployeeFormOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateForm = useCallback(() => {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsOpen(true);
  }, []);

  const openEditForm = useCallback((emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone ?? "",
      address: emp.address ?? "",
      salary: String(emp.salary),
      joinDate: emp.joinDate,
    });
    setErrors({});
    setIsOpen(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = employeeFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const input = {
      firstName: result.data.firstName.trim(),
      lastName: result.data.lastName.trim(),
      email: result.data.email.trim(),
      phone: result.data.phone?.trim() || null,
      address: result.data.address?.trim() || null,
      salary: Number(result.data.salary),
      joinDate: result.data.joinDate,
    };
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, input);
        toast.success("Employee updated successfully.");
      } else {
        await createEmployee(input);
        toast.success("Employee created successfully.");
      }
      setIsOpen(false);
    } catch {
      toast.error(
        editingEmployee
          ? "Failed to update employee."
          : "Failed to create employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    editingEmployee,
    form,
    setForm,
    errors,
    isSubmitting,
    openCreateForm,
    openEditForm,
    handleSubmit,
  };
}
