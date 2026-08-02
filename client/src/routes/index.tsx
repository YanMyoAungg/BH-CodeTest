import { LoginPage } from "@/features/auth/LoginPage";
import { EmployeesPage } from "@/features/employees/EmployeesPage";

export const publicRoutes = [
  { path: "/login", element: <LoginPage /> },
];

export const protectedRoutes = [
  { path: "employees", element: <EmployeesPage /> },
];
