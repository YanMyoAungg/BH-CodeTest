import { memo } from "react";
import { LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface Props {
  username: string | undefined;
  employeeCount: number;
  isLoading: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const EmployeesHeader = memo(function EmployeesHeader({
  username,
  employeeCount,
  isLoading,
  theme,
  onToggleTheme,
  onLogout,
}: Props) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold">Better HR</h1>
            <p className="text-xs text-muted-foreground">Welcome, {username}</p>
          </div>
          {!isLoading && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {employeeCount} employee{employeeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleTheme}>
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
});
