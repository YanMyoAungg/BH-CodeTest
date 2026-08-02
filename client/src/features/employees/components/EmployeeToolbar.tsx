import { Download, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import type { EmployeeToolbarProps } from "../types";

export function EmployeeToolbar({
  searchTerm,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  hasActiveFilters,
  onClearFilters,
  onDownloadSample,
  isImporting,
  onImport,
  isExporting,
  onExport,
  onAddClick,
}: EmployeeToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-56"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Join Date</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="flex-1 sm:w-[140px] sm:flex-none"
          />
          <span className="text-sm text-muted-foreground">-</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="flex-1 sm:w-[140px] sm:flex-none"
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDownloadSample}>
          <Download className="mr-1 h-4 w-4" /> Sample
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={isImporting}
          render={<label className="cursor-pointer" />}
        >
          {isImporting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1 h-4 w-4" />
          )}
          Import
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onImport}
            disabled={isImporting}
            className="hidden"
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1 h-4 w-4" />
          )}
          Export
        </Button>

        <Button size="sm" onClick={onAddClick}>
          <Plus className="mr-1 h-4 w-4" /> Add Employee
        </Button>
      </div>
    </div>
  );
}
