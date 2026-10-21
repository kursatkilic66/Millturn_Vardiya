"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ShiftRecord } from "@/src/types";
import { getShiftsByEmployeeAndMonth } from "@/src/lib/shiftService";

/**
 * Seçili personel ve aya ait vardiyaları yükler.
 * Hızlı personel/ay değişiminde eski isteğin sonucu yeni sonucu ezmez.
 */
export function useShifts(employeeName: string, monthId: string) {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getShiftsByEmployeeAndMonth(employeeName, monthId);
      if (current === requestId.current) setShifts(result);
    } catch (err) {
      console.error("Vardiya çekme hatası:", err);
      if (current === requestId.current) {
        setShifts([]);
        setError("Vardiya kayıtları yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.");
      }
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [employeeName, monthId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { shifts, loading, error, reload };
}
