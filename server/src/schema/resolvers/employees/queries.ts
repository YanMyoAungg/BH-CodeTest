import { GraphQLError } from "graphql";
import db from "../../../db/connection.js";
import type { Context } from "../../../auth/context.js";
import {
  type EmployeeRow,
  employeeMapper,
  requireAuth,
  sortableColumns,
} from "./helper.js";

export async function employees(
  _: unknown,
  args: {
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    sortOrder: string;
    dateFrom?: string;
    dateTo?: string;
  },
  context: Context,
) {
  requireAuth(context.user);

  const page = Math.max(1, args.page);
  const limit = Math.min(Math.max(1, args.limit), 100);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: string[] = [];

  if (args.search) {
    const term = `%${args.search}%`;
    conditions.push(
      "(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR employee_code LIKE ?)",
    );
    params.push(term, term, term, term);
  }

  if (args.dateFrom) {
    conditions.push("join_date >= ?");
    params.push(args.dateFrom);
  }

  if (args.dateTo) {
    conditions.push("join_date <= ?");
    params.push(args.dateTo);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const dbSortCol = sortableColumns[args.sortBy] || "id";
  const sortDir = args.sortOrder === "desc" ? "desc" : "asc";

  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM employees ${where}`)
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT * FROM employees ${where} ORDER BY ${dbSortCol} ${sortDir} LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset) as EmployeeRow[];

  return {
    items: rows.map(employeeMapper),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function employee(
  _: unknown,
  args: { id: string },
  context: Context,
) {
  requireAuth(context.user);

  const row = db
    .prepare("SELECT * FROM employees WHERE id = ?")
    .get(Number(args.id)) as EmployeeRow | undefined;

  if (!row) {
    throw new GraphQLError(`Employee with id ${args.id} not found.`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return employeeMapper(row);
}
