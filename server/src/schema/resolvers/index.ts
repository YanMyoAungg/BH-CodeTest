import { login, refreshToken } from "./auth.js";
import { employees, employee } from "./employees/queries.js";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./employees/mutations.js";

export const resolvers = {
  Query: {
    employees,
    employee,
  },
  Mutation: {
    login,
    refreshToken,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  },
};
