export interface ShiftRecord {
  id: string;
  employeeName: string; // Hangi personele ait?
  monthId: string; // Hangi ay? (Örn: "2026-07")
  date: string; // Örn: "01.07.2026"
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  lunchBreakMinutes: number;
  reason?: string; // Rapor veya izin nedeni (Örn: "Hastalık - İstirahat", "Yıllık İzin")
  note?: string; // Ek açıklama veya vardiya notu
}

export interface ShiftCalculated extends ShiftRecord {
  netWork: string;
  overtime: string;
  rowColor: string;
}

export interface Employee {
  id: string;
  name: string;
  title?: string; // Pozisyon/Görev (Örn: "CNC Torna Operatörü")
  phone?: string; // İletişim
  startDate?: string; // İşe Giriş Tarihi
  annualLeaveAllowance?: number; // Yıllık izin kotası (gün)
}

