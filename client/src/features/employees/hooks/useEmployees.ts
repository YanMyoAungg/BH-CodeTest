import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { apolloClient } from "@/shared/apollo/client";
import { today } from "@/shared/lib/utils";
import { parseEmployeeExcel } from "@/features/employees/excel";
import {
  GET_EMPLOYEES,
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "@/features/employees/graphql";
import type { Employee } from "@/features/employees/types";

interface EmployeesQueryVariables {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  salary: number;
  joinDate: string;
}

export function useEmployees(variables: EmployeesQueryVariables) {
  const {
    data,
    loading: isLoading,
    refetch,
  } = useQuery(GET_EMPLOYEES, { variables });

  const [createMutation] = useMutation(CREATE_EMPLOYEE);
  const [updateMutation] = useMutation(UPDATE_EMPLOYEE);
  const [deleteMutation] = useMutation(DELETE_EMPLOYEE);

  const employees: Employee[] = data?.employees?.items ?? [];
  const total = data?.employees?.total ?? 0;
  const totalPages = data?.employees?.totalPages ?? 1;

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const createEmployee = async (
    input: EmployeeInput,
    opts?: { skipRefetch?: boolean },
  ) => {
    const result = await createMutation({ variables: { input } });
    if (result.errors?.length) throw result.errors[0];
    if (!opts?.skipRefetch) await refetch();
  };

  const updateEmployee = async (id: string, input: EmployeeInput) => {
    const result = await updateMutation({ variables: { id, input } });
    if (result.errors?.length) throw result.errors[0];
    await refetch();
  };

  const deleteEmployee = async (id: string) => {
    const result = await deleteMutation({ variables: { id } });
    if (result.errors?.length) throw result.errors[0];
    await refetch();
  };

  const importEmployees = async (file: File) => {
    setIsImporting(true);
    try {
      const rows = await parseEmployeeExcel(file);
      let imported = 0;
      const duplicates: string[] = [];
      const failed: string[] = [];

      for (const row of rows) {
        try {
          await createEmployee(
            {
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone ?? null,
              address: row.address ?? null,
              salary: row.salary ?? 0,
              joinDate: row.joinDate ?? today(),
            },
            { skipRefetch: true },
          );
          imported++;
        } catch (err: unknown) {
          const gqlErr = (
            err as
              | { graphQLErrors?: Array<{ extensions?: { code?: string } }> }
              | undefined
          )?.graphQLErrors?.[0];
          if (gqlErr?.extensions?.code === "BAD_USER_INPUT") {
            duplicates.push(row.email);
          } else {
            failed.push(row.email);
          }
        }
      }

      if (imported > 0) {
        toast.success(
          `Imported ${imported} employee${imported !== 1 ? "s" : ""}.`,
        );
      }
      if (duplicates.length > 0) {
        toast.warning(
          `${duplicates.length} employee${duplicates.length !== 1 ? "s" : ""} already exist${duplicates.length === 1 ? "s" : ""}: ${duplicates.slice(0, 3).join(", ")}${duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : ""}`,
          { duration: 6000 },
        );
      }
      if (failed.length > 0) {
        toast.error(
          `Could not import ${failed.length} employee${failed.length !== 1 ? "s" : ""}. Check the file and try again.`,
          { duration: 5000 },
        );
      }
      if (imported > 0) await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  const exportEmployees = async (): Promise<Employee[]> => {
    setIsExporting(true);
    try {
      const perPage = 100;
      const pages = Math.ceil(total / perPage);
      const all: Employee[] = [];

      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const result = await apolloClient.query({
          query: GET_EMPLOYEES,
          variables: { ...variables, page: pageNum, limit: perPage },
          fetchPolicy: "network-only",
        });
        all.push(...((result.data?.employees?.items ?? []) as Employee[]));
      }

      return all;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    employees,
    total,
    totalPages,
    isLoading,
    isImporting,
    isExporting,
    refetch,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    exportEmployees,
  };
}
