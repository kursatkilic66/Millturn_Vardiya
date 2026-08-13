import { ShiftRecord, ShiftCalculated } from "../types";

// "Hafta Tatili" buraya eklendi, saat girilse bile KESİNLİKLE 0 yazar!
const zeroStatuses = ["Yıllık İzin", "Raporlu", "Hafta Tatili"];

const isWeekend = (dateStr: string): boolean => {
  const [day, month, year] = dateStr.split(".");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0: Pazar, 6: Cumartesi
};

const getRowColor = (dateStr: string, status: string): string => {
  if (status === "Gelmedi") return "bg-blue-400";
  const [day, month, year] = dateStr.split(".");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getDay() === 6) return "bg-yellow-300";
  if (date.getDay() === 0) return "bg-red-500";
  return "bg-transparent";
};

const formatMinutesToString = (totalMins: number): string => {
  if (totalMins === 0) return "0:00";
  const sign = totalMins < 0 ? "-" : "";
  const absMins = Math.abs(totalMins);
  const h = Math.floor(absMins / 60);
  const m = absMins % 60;
  return `${sign}${h}:${m.toString().padStart(2, "0")}`;
};

export const processShift = (shift: ShiftRecord): ShiftCalculated => {
  const isWeekendDay = isWeekend(shift.date);

  let netMins = 0;
  let overtimeMinutes = 0;

  // 1. KESİN DURUM KONTROLLERİ
  if (shift.status === "Gelmedi") {
    // Gelmediğinde Net 0, Fazla Mesai -10 Saat (-600 dk)
    netMins = 0;
    overtimeMinutes = -600;
  } else if (zeroStatuses.includes(shift.status)) {
    // "Hafta Tatili", "Yıllık İzin" veya "Raporlu" seçildiyse (saat girilse bile) 0 kalır
    netMins = 0;
    overtimeMinutes = 0;
  } else if (!shift.checkIn || !shift.checkOut) {
    // Saat eksikse 0 kalır
    netMins = 0;
    overtimeMinutes = 0;
  } else {
    // 2. ÇALIŞMA SÜRESİ HESABI
    const [inH, inM] = shift.checkIn.split(":").map(Number);
    const [outH, outM] = shift.checkOut.split(":").map(Number);
    let inMins = inH * 60 + inM;
    let outMins = outH * 60 + outM;

    // Gece yarısını geçen vardiya
    if (outMins < inMins) outMins += 24 * 60;

    const rawTotalWorkedMins = outMins - inMins;

    // 3. NET VE FAZLA MESAİ DAĞILIMI
    if (isWeekendDay) {
      // KURAL 1: Hafta sonu baskındır! Ancak sadece durum "Çalıştı" ise hesaplanır.
      if (shift.status === "Çalıştı") {
        netMins = 0;
        overtimeMinutes = rawTotalWorkedMins;
      } else {
        netMins = 0;
        overtimeMinutes = 0;
      }
    } else if (shift.status === "Resmi Tatil") {
      // KURAL 2: Hafta içine denk gelen Resmi Tatil
      // Hem Net'e hem Fazla Mesai'ye çalıştığı sürenin tamamını yazar.
      netMins = rawTotalWorkedMins;
      overtimeMinutes = rawTotalWorkedMins;
    } else {
      // KURAL 3: Normal Hafta İçi Çalışması İse
      // Max 10 saat (600dk) Net, fazlası veya eksiği Mesai hanesine yazar.
      netMins = Math.min(rawTotalWorkedMins, 600);
      overtimeMinutes = rawTotalWorkedMins - 600;
    }
  }

  return {
    ...shift,
    netWork: formatMinutesToString(netMins),
    overtime: formatMinutesToString(overtimeMinutes),
    rowColor: getRowColor(shift.date, shift.status),
  };
};

export const calculateMonthlyTotals = (shifts: ShiftCalculated[]) => {
  let totalNet = 0;
  let totalOvertime = 0;

  shifts.forEach((s) => {
    const parseTime = (timeStr: string) => {
      if (!timeStr || timeStr === "0:00") return 0;
      const isNeg = timeStr.startsWith("-");
      const cleanStr = isNeg ? timeStr.substring(1) : timeStr;
      const [h, m] = cleanStr.split(":").map(Number);
      const mins = h * 60 + m;
      return isNeg ? -mins : mins;
    };
    totalNet += parseTime(s.netWork);
    totalOvertime += parseTime(s.overtime);
  });

  return {
    netWorkTotal: formatMinutesToString(totalNet),
    overtimeTotal: formatMinutesToString(totalOvertime),
    isOvertimeNegative: totalOvertime < 0,
  };
};
