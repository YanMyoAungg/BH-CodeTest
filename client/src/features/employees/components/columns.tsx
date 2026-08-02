import { createColumnHelper, type Column } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import type { Employee, TableCallbacks } from "../types";

const columnHelper = createColumnHelper<Employee>();

function SortHeader({
  column,
  label,
}: {
  column: Column<Employee, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[active=true]:bg-accent"
      data-active={sorted !== false}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/40" />
      )}
    </Button>
  );
}

const COL_DIMS = {
  index: 40,
  code: 80,
  name: 140,
  email: 190,
  phone: 110,
  address: 170,
  salary: 110,
  joined: 110,
  actions: 120,
};

export const columns = [
  columnHelper.display({
    id: "index",
    header: "No",
    cell: (info) => (
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {info.row.index + 1}
      </span>
    ),
    size: COL_DIMS.index,
    enableSorting: false,
  }),
  columnHelper.accessor("employeeCode", {
    id: "employeeCode",
    header: ({ column }) => <SortHeader column={column} label="Code" />,
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    size: COL_DIMS.code,
  }),
  columnHelper.accessor("firstName", {
    id: "firstName",
    header: ({ column }) => <SortHeader column={column} label="First Name" />,
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    size: COL_DIMS.name,
  }),
  columnHelper.accessor("lastName", {
    id: "lastName",
    header: ({ column }) => <SortHeader column={column} label="Last Name" />,
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    size: COL_DIMS.name,
  }),
  columnHelper.accessor("email", {
    id: "email",
    header: ({ column }) => <SortHeader column={column} label="Email" />,
    cell: (info) => <span>{info.getValue()}</span>,
    size: COL_DIMS.email,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => <span>{info.getValue() || "—"}</span>,
    size: COL_DIMS.phone,
    enableSorting: false,
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: (info) => <span>{info.getValue() || "—"}</span>,
    size: COL_DIMS.address,
    enableSorting: false,
  }),
  columnHelper.accessor("salary", {
    id: "salary",
    header: ({ column }) => <SortHeader column={column} label="Salary" />,
    cell: (info) => (
      <span className="tabular-nums">
        {info.getValue().toLocaleString()} MMK
      </span>
    ),
    size: COL_DIMS.salary,
  }),
  columnHelper.accessor("joinDate", {
    id: "joinDate",
    header: ({ column }) => <SortHeader column={column} label="Join Date" />,
    cell: (info) => <span>{formatDate(info.getValue())}</span>,
    sortDescFirst: true,
    size: COL_DIMS.joined,
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const callbacks = (info.table.options.meta ?? {}) as TableCallbacks;
      return (
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => callbacks.onView?.(info.row.original)}
          >
            <Info className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => callbacks.onEdit?.(info.row.original)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => callbacks.onDelete?.(info.row.original)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      );
    },
    size: COL_DIMS.actions,
    enableSorting: false,
  }),
];
