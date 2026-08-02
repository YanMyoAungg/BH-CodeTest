import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const DEBOUNCE_MS = 400;

function useDebouncedParam(
  key: string,
  initialValue: string,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
) {
  const [value, setValue] = useState(initialValue);
  const mounted = useRef(false);
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setSearchParamsRef.current((prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.set("page", "1");
        return next;
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, key]);

  return [value, setValue] as const;
}

export function useEmployeeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sortBy = searchParams.get("sortBy") || "employeeCode";
  const sortOrder = (searchParams.get("sortOrder") || "asc") as "asc" | "desc";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const search = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useDebouncedParam(
    "search",
    search,
    setSearchParams,
  );
  const [fromDate, setFromDate] = useDebouncedParam(
    "dateFrom",
    dateFrom,
    setSearchParams,
  );
  const [toDate, setToDate] = useDebouncedParam(
    "dateTo",
    dateTo,
    setSearchParams,
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        next.set(key, value);
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSort = useCallback(
    (col: string) => {
      setSearchParams((prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        next.set("sortBy", col);
        next.set(
          "sortOrder",
          prev.get("sortBy") === col && prev.get("sortOrder") !== "desc"
            ? "desc"
            : "asc",
        );
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setSearchTerm("");
    setFromDate("");
    setToDate("");
  }, [setSearchParams, setSearchTerm, setFromDate, setToDate]);

  const hasActiveFilters = !!(dateFrom || dateTo || search);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    search,
    searchTerm,
    setSearchTerm,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    setParam,
    handleSort,
    clearAllFilters,
    hasActiveFilters,
  };
}
