export interface ShiftRecord {
  id: string;
  employeeName: string; // Hangi personele ait?
  monthId: string; // Hangi ay? (Örn: "2026-07")
  date: string; // Örn: "01.07.2026"
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  lunchBreakMinutes: number;
}

export interface ShiftCalculated extends ShiftRecord {
  netWork: string;
  overtime: string;
  rowColor: string;
}
