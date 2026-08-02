import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { publicRoutes, protectedRoutes } from "@/routes/index";

export function App() {
  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route element={<ProtectedRoute />}>
        {protectedRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}
