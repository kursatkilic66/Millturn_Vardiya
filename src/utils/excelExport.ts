import * as XLSX from "xlsx";
import { ShiftCalculated } from "../types";

export const exportShiftsToExcel = (
  shifts: ShiftCalculated[],
  employeeName: string,
  monthId: string,
  totals: { netWorkTotal: string; overtimeTotal: string },
) => {
  const [year, month] = monthId.split("-");
  const monthDate = new Date(Number(year), Number(month) - 1, 1);
  const formattedMonth = monthDate.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const getDayName = (dateStr: string) => {
    const parts = dateStr.split(".");
    if (parts.length !== 3) return "";
    const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    return days[date.getDay()] || "";
  };

  // Excel Başlık ve Açıklama Satırları
  const rows: (string | number)[][] = [
    ["MİLLTURN VARDİYA VE PUANTAJ ÇİZELGESİ"],
    [`Personel: ${employeeName}`, `Dönem: ${formattedMonth}`],
    [],
    [
      "Tarih",
      "Gün",
      "Durum",
      "Giriş",
      "Çıkış",
      "Net Süre",
      "Fazla Mesai",
      "İzin / Rapor Gerekçesi",
      "Not / Açıklama",
    ],
  ];

  // Vardiya Satırları
  shifts.forEach((shift) => {
    rows.push([
      shift.date,
      getDayName(shift.date),
      shift.status,
      shift.checkIn || "-",
      shift.checkOut || "-",
      shift.netWork,
      shift.overtime,
      shift.reason || "-",
      shift.note || "-",
    ]);
  });

  // Alt Toplam Satırları
  rows.push([]);
  rows.push([
    "TOPLAM",
    "",
    `${shifts.length} Gün`,
    "",
    "",
    totals.netWorkTotal,
    totals.overtimeTotal,
    "",
    "",
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Sütun Genişlikleri
  worksheet["!cols"] = [
    { wch: 14 }, // Tarih
    { wch: 14 }, // Gün
    { wch: 16 }, // Durum
    { wch: 10 }, // Giriş
    { wch: 10 }, // Çıkış
    { wch: 12 }, // Net Süre
    { wch: 14 }, // Fazla Mesai
    { wch: 28 }, // Gerekçe
    { wch: 30 }, // Not
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Puantaj");

  const fileName = `Millturn_${employeeName}_${year}_${month}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
