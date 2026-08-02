import { GraphQLError } from "graphql";
import db from "../../../db/connection.js";
import type { Context } from "../../../auth/context.js";
import {
  type EmployeeRow,
  employeeMapper,
  requireAuth,
  validateOrThrow,
} from "./helper.js";

export async function createEmployee(
  _: unknown,
  args: { input: Record<string, unknown> },
  context: Context,
) {
  requireAuth(context.user);

  const input = validateOrThrow(args.input);
  const email = input.email.trim();

  const exists = db
    .prepare("SELECT id FROM employees WHERE email = ?")
    .get(email);
  if (exists) {
    throw new GraphQLError("An employee with this email already exists.", {
      extensions: {
        code: "BAD_USER_INPUT",
        errors: { email: "Email already in use." },
      },
    });
  }

  const result = db
    .prepare(
      `INSERT INTO employees (employee_code, first_name, last_name, email, phone, address, salary, join_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "TEMP",
      input.firstName.trim(),
      input.lastName.trim(),
      email,
      input.phone?.trim() || null,
      input.address?.trim() || null,
      input.salary,
      input.joinDate,
    );

  const code = `BH-${String(result.lastInsertRowid).padStart(4, "0")}`;
  db.prepare("UPDATE employees SET employee_code = ? WHERE id = ?").run(
    code,
    result.lastInsertRowid,
  );

  const row = db
    .prepare("SELECT * FROM employees WHERE id = ?")
    .get(result.lastInsertRowid) as EmployeeRow;

  return employeeMapper(row);
}

export async function updateEmployee(
  _: unknown,
  args: { id: string; input: Record<string, unknown> },
  context: Context,
) {
  requireAuth(context.user);

  const existing = db
    .prepare("SELECT * FROM employees WHERE id = ?")
    .get(Number(args.id)) as EmployeeRow | undefined;

  if (!existing) {
    throw new GraphQLError(`Employee with id ${args.id} not found.`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const input = validateOrThrow(args.input);
  const email = input.email.trim();

  const conflict = db
    .prepare("SELECT id FROM employees WHERE email = ? AND id != ?")
    .get(email, Number(args.id));
  if (conflict) {
    throw new GraphQLError("An employee with this email already exists.", {
      extensions: {
        code: "BAD_USER_INPUT",
        errors: { email: "Email already in use." },
      },
    });
  }

  db.prepare(
    `UPDATE employees
     SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, salary = ?,
         join_date = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    input.firstName.trim(),
    input.lastName.trim(),
    email,
    input.phone?.trim() || null,
    input.address?.trim() || null,
    input.salary,
    input.joinDate,
    Number(args.id),
  );

  const row = db
    .prepare("SELECT * FROM employees WHERE id = ?")
    .get(Number(args.id)) as EmployeeRow;

  return employeeMapper(row);
}

export async function deleteEmployee(
  _: unknown,
  args: { id: string },
  context: Context,
) {
  requireAuth(context.user);

  const exists = db
    .prepare("SELECT id FROM employees WHERE id = ?")
    .get(Number(args.id));
  if (!exists) {
    throw new GraphQLError(`Employee with id ${args.id} not found.`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  db.prepare("DELETE FROM employees WHERE id = ?").run(Number(args.id));
  return true;
}
