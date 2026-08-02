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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">Better HR</h1>
            <p className="text-xs text-muted-foreground truncate">Welcome, {username}</p>
          </div>
          {!isLoading && (
            <span className="hidden sm:inline rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
              {employeeCount} employee{employeeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={onToggleTheme}>
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
});
