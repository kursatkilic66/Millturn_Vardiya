import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { ShiftRecord } from "@/src/types";

const SHIFTS_COLLECTION = "shifts";

function mapShift(id: string, data: DocumentData): ShiftRecord {
  return {
    id,
    employeeName: data.employeeName,
    monthId: data.monthId,
    date: data.date,
    status: data.status,
    checkIn: data.checkIn ?? null,
    checkOut: data.checkOut ?? null,
    lunchBreakMinutes: data.lunchBreakMinutes,
    reason: data.reason || "",
    note: data.note || "",
  };
}

/** "gg.aa.yyyy" tarihini "yyyy-aa" ay kimliğine çevirir. */
export function deriveMonthId(date: string): string {
  const [, month, year] = date.split(".");
  return `${year}-${month}`;
}

function sortByDay(shifts: ShiftRecord[]): ShiftRecord[] {
  return shifts.sort(
    (a, b) => parseInt(a.date.split(".")[0]) - parseInt(b.date.split(".")[0]),
  );
}

/** Seçili personel ve aya ait vardiyaları gün sırasına göre getirir. */
export async function getShiftsByEmployeeAndMonth(
  employeeName: string,
  monthId: string,
): Promise<ShiftRecord[]> {
  const q = query(
    collection(db, SHIFTS_COLLECTION),
    where("employeeName", "==", employeeName),
    where("monthId", "==", monthId),
  );
  const snapshot = await getDocs(q);
  const shifts: ShiftRecord[] = [];
  snapshot.forEach((d) => shifts.push(mapShift(d.id, d.data())));
  return sortByDay(shifts);
}

/** Tüm personelin ilgili aydaki vardiyalarını getirir (raporlar için). */
export async function getShiftsByMonth(monthId: string): Promise<ShiftRecord[]> {
  const q = query(collection(db, SHIFTS_COLLECTION), where("monthId", "==", monthId));
  const snapshot = await getDocs(q);
  const shifts: ShiftRecord[] = [];
  snapshot.forEach((d) => shifts.push(mapShift(d.id, d.data())));
  return shifts;
}

/**
 * Vardiyayı kaydeder (editingId varsa günceller, yoksa ekler).
 * @returns Kaydın ait olduğu ay kimliği.
 */
export async function saveShift(
  employeeName: string,
  shift: ShiftRecord,
  editingId?: string | null,
): Promise<string> {
  const monthId = deriveMonthId(shift.date);
  const payload = {
    employeeName,
    monthId,
    date: shift.date,
    status: shift.status,
    checkIn: shift.checkIn,
    checkOut: shift.checkOut,
    lunchBreakMinutes: shift.lunchBreakMinutes,
    reason: shift.reason || "",
    note: shift.note || "",
  };

  if (editingId) {
    await updateDoc(doc(db, SHIFTS_COLLECTION, editingId), payload);
  } else {
    await addDoc(collection(db, SHIFTS_COLLECTION), payload);
  }
  return monthId;
}

export async function deleteShift(id: string): Promise<void> {
  await deleteDoc(doc(db, SHIFTS_COLLECTION, id));
}
