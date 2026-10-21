"use client";
import { useCallback, useEffect, useState } from "react";
import { Employee } from "@/src/types";
import {
  INITIAL_EMPLOYEES,
  getEmployees,
  saveEmployee as saveEmployeeRemote,
  deleteEmployee as deleteEmployeeRemote,
} from "@/src/lib/employeeService";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setEmployees(await getEmployees());
      setError(null);
    } catch (err) {
      console.error("Personel çekme hatası:", err);
      setError("Personel listesi yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const saveEmployee = useCallback(
    async (employee: Employee) => {
      await saveEmployeeRemote(employee);
      await reload();
    },
    [reload],
  );

  const removeEmployee = useCallback(async (id: string) => {
    await deleteEmployeeRemote(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { employees, error, reload, saveEmployee, removeEmployee };
}
