import * as XLSX from "xlsx";
import type { EmployeeExcelRow } from "./types";

const COLUMN_MAP: Record<string, keyof EmployeeExcelRow> = {
  ID: "id",
  Code: "employeeCode",
  "First Name": "firstName",
  "Last Name": "lastName",
  Email: "email",
  Phone: "phone",
  Address: "address",
  Salary: "salary",
  "Join Date": "joinDate",
};

export function parseEmployeeExcel(file: File): Promise<EmployeeExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("The Excel file has no sheets."));
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        if (rows.length < 2) {
          reject(
            new Error(
              "The Excel file must have a header row and at least one data row.",
            ),
          );
          return;
        }

        const headerRow = rows[0] as string[];
        const dataRows = rows.slice(1) as (
          string | number | null | undefined
        )[][];
        const columnIndices: (keyof EmployeeExcelRow | null)[] = headerRow.map(
          (header) => COLUMN_MAP[header.trim()] ?? null,
        );

        const parsed: EmployeeExcelRow[] = dataRows
          .filter((row) => row.some((cell) => cell != null && cell !== ""))
          .map((row) => {
            const obj: Record<string, string | number | undefined> = {
              firstName: "",
              lastName: "",
              email: "",
              salary: 0,
              joinDate: new Date().toISOString().slice(0, 10),
            };

            columnIndices.forEach((field, index) => {
              if (!field) return;
              const value = row[index];
              if (field === "salary") {
                obj.salary = value != null ? Number(value) : 0;
              } else if (field === "id") {
                obj.id = value != null ? String(value) : undefined;
              } else {
                obj[field] = value != null ? String(value).trim() : "";
              }
            });

            return obj as unknown as EmployeeExcelRow;
          });

        resolve(parsed);
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Failed to parse Excel file."),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

function defaultFilename(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "-");
  return `employees_${date}_${time}.xlsx`;
}

export function exportEmployeeExcel(
  employees: EmployeeExcelRow[],
  filename?: string,
): void {
  const name = filename ?? defaultFilename();
  const header = [
    "No",
    "Code",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Address",
    "Salary",
    "Join Date",
  ];
  const rows = employees.map((emp, index) => [
    index + 1,
    emp.employeeCode ?? "",
    emp.firstName,
    emp.lastName,
    emp.email,
    emp.phone ?? "",
    emp.address ?? "",
    emp.salary,
    emp.joinDate ?? "",
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 18 },
    { wch: 30 },
    { wch: 12 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, name);
}

export function downloadSampleExcel(): void {
  const link = document.createElement("a");
  link.href = "/sample-employees.xlsx";
  link.download = "sample-employees.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
