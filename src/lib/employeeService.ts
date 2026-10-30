import {
  collection,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Employee } from "@/src/types";
import {
  isLocalMssqlMode,
  mssqlList,
  mssqlSet,
  mssqlDelete,
} from "@/src/lib/localDbClient";

const EMPLOYEES_COLLECTION = "employees";

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: "1", name: "Bahri", title: "CNC Torna Operatörü", annualLeaveAllowance: 14 },
  { id: "2", name: "Batın", title: "CNC Freze Operatörü", annualLeaveAllowance: 14 },
  { id: "3", name: "Kerim", title: "Talaşlı İmalat Ustası", annualLeaveAllowance: 14 },
  { id: "4", name: "Furkan", title: "Üretim Personeli", annualLeaveAllowance: 14 },
];

/**
 * Personelleri getirir. Koleksiyon boşsa (ilk kurulum) varsayılan personelleri
 * veritabanına yazar ve onları döndürür.
 */
export async function getEmployees(): Promise<Employee[]> {
  if (isLocalMssqlMode) {
    const rows = await mssqlList<Employee>("employees");
    if (rows.length === 0) {
      for (const emp of INITIAL_EMPLOYEES) {
        await mssqlSet("employees", emp.id, emp as unknown as Record<string, unknown>);
      }
      return INITIAL_EMPLOYEES;
    }
    return rows.map((data) => ({
      id: data.id,
      name: data.name,
      title: data.title || "Üretim Personeli",
      phone: data.phone || "",
      startDate: data.startDate || "",
      annualLeaveAllowance: data.annualLeaveAllowance ?? 14,
    }));
  }

  const snapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));

  if (snapshot.empty) {
    await Promise.all(
      INITIAL_EMPLOYEES.map((emp) =>
        setDoc(doc(db, EMPLOYEES_COLLECTION, emp.id), emp),
      ),
    );
    return INITIAL_EMPLOYEES;
  }

  const employees: Employee[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    employees.push({
      id: d.id,
      name: data.name,
      title: data.title || "Üretim Personeli",
      phone: data.phone || "",
      startDate: data.startDate || "",
      annualLeaveAllowance: data.annualLeaveAllowance ?? 14,
    });
  });
  return employees;
}

export async function saveEmployee(employee: Employee): Promise<void> {
  if (isLocalMssqlMode) {
    await mssqlSet(
      "employees",
      employee.id,
      employee as unknown as Record<string, unknown>,
    );
    return;
  }

  await setDoc(doc(db, EMPLOYEES_COLLECTION, employee.id), employee, {
    merge: true,
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  if (isLocalMssqlMode) {
    await mssqlDelete("employees", id);
    return;
  }

  await deleteDoc(doc(db, EMPLOYEES_COLLECTION, id));
}
