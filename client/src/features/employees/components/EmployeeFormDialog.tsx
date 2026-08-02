import type { FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { Employee, EmployeeFormData } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: Employee | null;
  form: EmployeeFormData;
  onFormChange: (form: EmployeeFormData) => void;
  errors: Record<string, string>;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  editingEmployee,
  form,
  onFormChange,
  errors,
  submitting,
  onSubmit,
}: Props) {
  const isEditing = !!editingEmployee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" id="first-name" required error={errors.firstName}>
              <Input
                id="first-name"
                placeholder="Ada"
                value={form.firstName}
                onChange={(e) =>
                  onFormChange({ ...form, firstName: e.target.value })
                }
              />
            </Field>
            <Field label="Last Name" id="last-name" required error={errors.lastName}>
              <Input
                id="last-name"
                placeholder="Wong"
                value={form.lastName}
                onChange={(e) =>
                  onFormChange({ ...form, lastName: e.target.value })
                }
              />
            </Field>
            <Field label="Email" id="email" required error={errors.email}>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) =>
                  onFormChange({ ...form, email: e.target.value })
                }
              />
            </Field>
            <Field label="Phone" id="phone">
              <Input
                id="phone"
                placeholder="+95 123 456 789"
                value={form.phone}
                onChange={(e) =>
                  onFormChange({ ...form, phone: e.target.value })
                }
              />
            </Field>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, Yangon"
                value={form.address}
                onChange={(e) =>
                  onFormChange({ ...form, address: e.target.value })
                }
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>
            <Field label="Salary" id="salary" required error={errors.salary}>
              <Input
                id="salary"
                type="text"
                inputMode="numeric"
                placeholder="300,000"
                value={form.salary ? Number(form.salary).toLocaleString() : ""}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  onFormChange({ ...form, salary: digits });
                }}
              />
            </Field>
            <Field label="Join Date" id="join-date" required error={errors.joinDate}>
              <Input
                id="join-date"
                type="date"
                value={form.joinDate}
                onChange={(e) =>
                  onFormChange({ ...form, joinDate: e.target.value })
                }
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[80px]"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
