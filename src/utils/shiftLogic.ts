// import { ShiftRecord, ShiftCalculated } from "../types";

// const zeroStatuses = ["Yıllık İzin", "Raporlu", "Resmi Tatil", "Hafta Tatili"];

// const isWeekend = (dateStr: string): boolean => {
//   const [day, month, year] = dateStr.split(".");
//   const date = new Date(Number(year), Number(month) - 1, Number(day));
//   const dayOfWeek = date.getDay();
//   return dayOfWeek === 0 || dayOfWeek === 6;
// };

// const getRowColor = (dateStr: string, status: string): string => {
//   if (status === "Gelmedi") return "bg-blue-400";
//   const [day, month, year] = dateStr.split(".");
//   const date = new Date(Number(year), Number(month) - 1, Number(day));
//   if (date.getDay() === 6) return "bg-yellow-300";
//   if (date.getDay() === 0) return "bg-red-500";
//   return "bg-transparent";
// };

// const formatMinutesToString = (totalMins: number): string => {
//   if (totalMins === 0) return "0:00";
//   const sign = totalMins < 0 ? "-" : "";
//   const absMins = Math.abs(totalMins);
//   const h = Math.floor(absMins / 60);
//   const m = absMins % 60;
//   return `${sign}${h}:${m.toString().padStart(2, "0")}`;
// };

// export const processShift = (shift: ShiftRecord): ShiftCalculated => {
//   const isWeekendDay = isWeekend(shift.date);

//   let netMins = 0;
//   let overtimeMinutes = 0;

//   if (shift.status === "Gelmedi") {
//     netMins = 0;
//     overtimeMinutes = -600;
//   } else if (zeroStatuses.includes(shift.status)) {
//     netMins = 0;
//     overtimeMinutes = 0;
//   } else if (!shift.checkIn || !shift.checkOut) {
//     netMins = 0;
//     overtimeMinutes = 0;
//   } else {
//     // Toplam Çalışma Süresi Hesaplama
//     const [inH, inM] = shift.checkIn.split(":").map(Number);
//     const [outH, outM] = shift.checkOut.split(":").map(Number);
//     let inMins = inH * 60 + inM;
//     let outMins = outH * 60 + outM;
//     if (outMins < inMins) outMins += 24 * 60;

//     const rawTotalWorkedMins = outMins - inMins;

//     if (isWeekendDay) {
//       // Hafta Sonu: Net 0, Tamamı Mesai
//       netMins = 0;
//       overtimeMinutes = rawTotalWorkedMins;
//     } else {
//       // Hafta İçi: Max 10 saat Net, üstü (veya altı) Mesai (Geç kalmalar dahil otomatik hesaplar)
//       netMins = Math.min(rawTotalWorkedMins, 600);
//       overtimeMinutes = rawTotalWorkedMins - 600;
//     }
//   }

//   return {
//     ...shift,
//     netWork: formatMinutesToString(netMins),
//     overtime: formatMinutesToString(overtimeMinutes),
//     rowColor: getRowColor(shift.date, shift.status),
//   };
// };

// export const calculateMonthlyTotals = (shifts: ShiftCalculated[]) => {
//   let totalNet = 0;
//   let totalOvertime = 0;

//   shifts.forEach((s) => {
//     const parseTime = (timeStr: string) => {
//       if (!timeStr || timeStr === "0:00") return 0;
//       const isNeg = timeStr.startsWith("-");
//       const cleanStr = isNeg ? timeStr.substring(1) : timeStr;
//       const [h, m] = cleanStr.split(":").map(Number);
//       const mins = h * 60 + m;
//       return isNeg ? -mins : mins;
//     };
//     totalNet += parseTime(s.netWork);
//     totalOvertime += parseTime(s.overtime);
//   });

//   return {
//     netWorkTotal: formatMinutesToString(totalNet),
//     overtimeTotal: formatMinutesToString(totalOvertime),
//     isOvertimeNegative: totalOvertime < 0,
//   };
// };
import { ShiftRecord, ShiftCalculated } from "../types";

// Artık sadece saat girilse bile KESİNLİKLE dikkate alınmayacak (0 yazılacak) durumlar var
const zeroStatuses = ["Yıllık İzin", "Raporlu"];

const isWeekend = (dateStr: string): boolean => {
  const [day, month, year] = dateStr.split(".");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
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
    // Raporlu veya Yıllık İzin seçildiyse (saat girilse bile) her ikisi de 0 kalır
    netMins = 0;
    overtimeMinutes = 0;
  } else if (!shift.checkIn || !shift.checkOut) {
    // Giriş veya Çıkış eksikse (Örn: çalışılmayan resmi tatiller) 0 kalır
    netMins = 0;
    overtimeMinutes = 0;
  } else {
    // 2. ÇALIŞMA SÜRESİ HESABI (Saat girilen durumlar: Çalıştı veya Resmi Tatil)
    const [inH, inM] = shift.checkIn.split(":").map(Number);
    const [outH, outM] = shift.checkOut.split(":").map(Number);
    let inMins = inH * 60 + inM;
    let outMins = outH * 60 + outM;

    // Gece yarısını geçen vardiya varsa
    if (outMins < inMins) outMins += 24 * 60;

    const rawTotalWorkedMins = outMins - inMins;

    // 3. NET VE FAZLA MESAİ DAĞILIMI
    if (isWeekendDay || shift.status === "Resmi Tatil") {
      // Hafta Sonu veya Resmi Tatil İse: Çalıştığı süre HEM Nete HEM Fazla Mesaiye
      netMins = rawTotalWorkedMins;
      overtimeMinutes = rawTotalWorkedMins;
    } else {
      // Hafta İçi Normal Çalışma İse: Max 10 saat Net, kalanı (veya eksiği) Mesai
      netMins = Math.min(rawTotalWorkedMins, 600); // Max 600 dk (10 saat)
      overtimeMinutes = rawTotalWorkedMins - 600; // 10 saatin üstü artı, altı eksi çıkar
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
