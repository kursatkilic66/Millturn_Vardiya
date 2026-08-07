import { ShiftRecord, ShiftCalculated } from "../types";

const noWorkStatuses = [
  "Yıllık İzin",
  "Raporlu",
  "Resmi Tatil",
  "Hafta Tatili",
  "Gelmedi",
];
const zeroMesaiStatuses = [
  "Yıllık İzin",
  "Raporlu",
  "Resmi Tatil",
  "Hafta Tatili",
];

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
  if (date.getDay() === 6) return "bg-yellow-300"; // Cumartesi
  if (date.getDay() === 0) return "bg-red-500"; // Pazar

  return "bg-transparent"; // Normal günler
};

const calculateTotalMinutes = (
  checkIn: string | null,
  checkOut: string | null,
  lunchBreak: number,
): number => {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);

  let inMins = inH * 60 + inM;
  let outMins = outH * 60 + outM;

  if (outMins < inMins) outMins += 24 * 60; // Gece yarısını geçen vardiya

  const total = outMins - inMins - lunchBreak;
  return total > 0 ? total : 0;
};

const formatMinutesToString = (totalMins: number): string => {
  if (totalMins === 0) return "0:00";
  const sign = totalMins < 0 ? "-" : "";
  const absMins = Math.abs(totalMins);
  const h = Math.floor(absMins / 60);
  const m = absMins % 60;
  return `${sign}${h}:${m.toString().padStart(2, "0")}`;
};

// export const processShift = (shift: ShiftRecord): ShiftCalculated => {
//   const weekend = isWeekend(shift.date);
//   const totalWorkedMins = calculateTotalMinutes(
//     shift.checkIn,
//     shift.checkOut,
//     shift.lunchBreakMinutes,
//   );

//   let netMins = 0;
//   let overtimeMinutes = 0;

//   // 1. NET ÇALIŞMA HESABI
//   if (
//     noWorkStatuses.includes(shift.status) ||
//     !shift.checkIn ||
//     !shift.checkOut
//   ) {
//     netMins = 0;
//   } else {
//     netMins = weekend ? 0 : Math.min(totalWorkedMins, 540); // Max 9 saat (540 dk)
//   }

//   // 2. TEMEL FAZLA MESAİ HESABI
//   if (zeroMesaiStatuses.includes(shift.status)) {
//     overtimeMinutes = 0;
//   } else if (shift.status === "Gelmedi") {
//     // Sadece "Gelmedi" işaretliyse -9 saat kes.
//     overtimeMinutes = weekend ? 0 : -540;
//   } else if (!shift.checkIn || !shift.checkOut) {
//     // "Belirsiz" gibi giriş veya çıkış saati olmayan günleri 0 kabul et, kesinti yapma.
//     overtimeMinutes = 0;
//   } else {
//     if (weekend) {
//       overtimeMinutes = totalWorkedMins;
//     } else {
//       const threshold = shift.status === "Diğer" ? 540 : 570;
//       overtimeMinutes = Math.max(0, totalWorkedMins - threshold);
//     }
//   }

//   // 3. 🟢 GEÇ KALMA KESİNTİSİ (Temel hesabın üzerine uygulanır) 🟢
//   if (shift.status === "Geç Kalma" && shift.checkIn) {
//     const [inH, inM] = shift.checkIn.split(":").map(Number);
//     const checkInMins = inH * 60 + inM;
//     const targetStartMins = 7 * 60 + 30; // 07:30 (450 dakika)

//     // Eğer 07:30'dan sonra geldiyse
//     if (checkInMins > targetStartMins) {
//       const lateMinutes = checkInMins - targetStartMins;
//       // Mevcut mesai süresinden (ister 0 olsun, ister pozitif) geç kalınan dakikayı çıkar
//       overtimeMinutes -= lateMinutes;
//     }
//   }

//   return {
//     ...shift,
//     netWork: formatMinutesToString(netMins),
//     overtime: formatMinutesToString(overtimeMinutes),
//     rowColor: getRowColor(shift.date, shift.status),
//   };
// };
export const processShift = (shift: ShiftRecord): ShiftCalculated => {
  const weekend = isWeekend(shift.date);

  // 17:30 sonrasına kalınan mesailerde eklenecek akşam molası
  let eveningBreak = 0;
  if (shift.checkOut) {
    const [outH, outM] = shift.checkOut.split(":").map(Number);
    let outMins = outH * 60 + outM;

    // Gece yarısını geçen çıkışlar
    if (outMins < 450) outMins += 24 * 60;

    // "Diğer" seçili DEĞİLSE 17:30 sonrası ekstra molayı ekle
    if (shift.status !== "Diğer" && outMins >= 1080) {
      eveningBreak = 30;
    } else if (shift.status !== "Diğer" && outMins > 1050) {
      eveningBreak = outMins - 1050;
    }
  }

  const baseBreak = shift.status === "Diğer" ? 60 : shift.lunchBreakMinutes;
  const effectiveBreak = baseBreak + eveningBreak;

  const totalWorkedMins = calculateTotalMinutes(
    shift.checkIn,
    shift.checkOut,
    effectiveBreak,
  );

  let netMins = 0;
  let overtimeMinutes = 0;

  // 1. KESİN DURUM KONTROLLERİ (Girilen saatleri ezer)
  if (shift.status === "Gelmedi") {
    // "Gelmedi" durumunda her zaman -9 saat (540 dakika) yazılır
    netMins = 0;
    overtimeMinutes = -540;
  } else if (
    ["Hafta Tatili", "Yıllık İzin", "Raporlu", "Resmi Tatil"].includes(
      shift.status,
    )
  ) {
    // İzin ve tatil durumlarında net mesai ve fazla mesai kesinlikle 0'dır
    netMins = 0;
    overtimeMinutes = 0;
  } else {
    // 2. ÇALIŞTIĞI DURUMLAR (Statü boş veya "Diğer" ise)
    if (!shift.checkIn || !shift.checkOut) {
      netMins = 0;
      overtimeMinutes = 0;
    } else {
      // Normal çalışılan günler
      netMins = weekend ? 0 : Math.min(totalWorkedMins, 540);

      if (weekend) {
        // Hafta sonu çalışılan sürenin tamamı fazla mesaidir
        overtimeMinutes = totalWorkedMins;
      } else {
        // Hafta içi 9 saati (540 dk) geçenler artı mesai, geçemeyenler eksi mesai olur
        overtimeMinutes = totalWorkedMins - 540;
      }
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
