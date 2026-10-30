// Geliştirme/test ortamında (npm run dev) yerel MSSQL VardiyaDb kullanılıp kullanılmayacağını belirler.
export const isLocalMssqlMode = process.env.NODE_ENV === "development";

export interface RawMssqlRow {
  DocId: string;
  DataJson: string;
}

async function callLocalDb<T>(payload: {
  table: "employees" | "shifts" | "vehicles";
  action: "list" | "add" | "set" | "update" | "delete";
  id?: string;
  data?: Record<string, unknown>;
}): Promise<T> {
  const res = await fetch("/api/local-db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.error || "Yerel MSSQL VardiyaDb işlem hatası");
  }
  return json.result as T;
}

export async function mssqlList<T extends { id: string }>(
  table: "employees" | "shifts" | "vehicles",
): Promise<T[]> {
  const rows = await callLocalDb<RawMssqlRow[] | RawMssqlRow>({
    table,
    action: "list",
  });
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list.map((r) => {
    const parsed = JSON.parse(r.DataJson) as Record<string, unknown>;
    return { ...(parsed as unknown as T), id: r.DocId };
  });
}

export async function mssqlAdd(
  table: "employees" | "shifts" | "vehicles",
  data: Record<string, unknown>,
): Promise<string> {
  const id = `vdb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await callLocalDb({ table, action: "add", id, data });
  return id;
}

export async function mssqlSet(
  table: "employees" | "shifts" | "vehicles",
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await callLocalDb({ table, action: "set", id, data });
}

export async function mssqlUpdate(
  table: "employees" | "shifts" | "vehicles",
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await callLocalDb({ table, action: "update", id, data });
}

export async function mssqlDelete(
  table: "employees" | "shifts" | "vehicles",
  id: string,
): Promise<void> {
  await callLocalDb({ table, action: "delete", id });
}
