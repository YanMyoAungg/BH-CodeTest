import { GraphQLError } from "graphql";
import { z } from "zod";
import type { Context } from "../../../auth/context.js";

export interface EmployeeRow {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  salary: number;
  join_date: string;
  created_at: string;
  updated_at: string;
}

const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email format."),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  salary: z.number().min(0, "Salary cannot be negative."),
  joinDate: z
    .string()
    .min(1, "Join date is required.")
    .refine((val) => val <= todayISO(), {
      message: "Join date cannot be in the future.",
    }),
});

export function validateOrThrow(input: unknown) {
  const result = employeeSchema.safeParse(input);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errors[field]) errors[field] = issue.message;
    }
    throw new GraphQLError("Validation failed.", {
      extensions: { code: "BAD_USER_INPUT", errors },
    });
  }
  return result.data;
}

export function employeeMapper(row: EmployeeRow) {
  return {
    id: String(row.id),
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    salary: row.salary,
    joinDate: row.join_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function requireAuth(user: Context["user"]) {
  if (!user) {
    throw new GraphQLError("You must be logged in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return user;
}

export const sortableColumns: Record<string, string> = {
  id: "id",
  employeeCode: "employee_code",
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  salary: "salary",
  joinDate: "join_date",
};
