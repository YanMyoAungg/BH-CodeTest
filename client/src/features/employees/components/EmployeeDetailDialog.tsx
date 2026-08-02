import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatDate } from "@/shared/lib/utils";
import type { Employee } from "../types";

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDetailDialog({ employee, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>
        {employee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Detail label="First Name" value={employee.firstName} />
              <Detail label="Last Name" value={employee.lastName} />
              <Detail
                label="Email"
                value={employee.email}
                className="break-all"
              />
              <Detail label="Phone" value={employee.phone || "\u2014"} />
              <Detail
                label="Employee Code"
                value={employee.employeeCode}
                className="font-mono"
              />
              <Detail label="Join Date" value={formatDate(employee.joinDate)} />
              <Detail
                label="Salary"
                value={`${employee.salary.toLocaleString()} MMK`}
              />
              <Detail
                label="Created At"
                value={formatDate(employee.createdAt)}
              />
            </div>
            {employee.address && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-sm">{employee.address}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm ${className}`}>{value}</p>
    </div>
  );
}
