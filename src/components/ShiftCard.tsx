"use client";
import { ShiftCalculated } from "../types";
import { Edit2, Trash2, FileText } from "lucide-react";

interface ShiftCardProps {
  shift: ShiftCalculated;
  onEdit: (shift: ShiftCalculated) => void;
  onDelete: (id: string) => void;
}

const getDayInfo = (dateStr: string) => {
  if (!dateStr) return { dayName: "", isWeekend: false, dayNum: "" };
  const parts = dateStr.split(".");
  if (parts.length !== 3) return { dayName: "", isWeekend: false, dayNum: "" };
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const dayIndex = date.getDay();
  return {
    dayName: days[dayIndex] || "",
    isWeekend: dayIndex === 0 || dayIndex === 6,
    dayNum: parts[0],
  };
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Çalıştı":
      return {
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
        stripe: "bg-emerald-500",
      };
    case "Gelmedi":
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
        stripe: "bg-rose-500",
      };
    case "Yıllık İzin":
      return {
        badge: "bg-sky-50 text-sky-700 border-sky-200/80",
        dot: "bg-sky-500",
        stripe: "bg-sky-500",
      };
    case "Raporlu":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
        stripe: "bg-amber-500",
      };
    case "Resmi Tatil":
      return {
        badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
        dot: "bg-indigo-500",
        stripe: "bg-indigo-500",
      };
    case "Hafta Tatili":
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200/80",
        dot: "bg-purple-500",
        stripe: "bg-purple-400",
      };
    default:
      return {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
        stripe: "bg-slate-300",
      };
  }
};

export default function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  const { dayName, isWeekend, dayNum } = getDayInfo(shift.date);
  const statusStyle = getStatusStyle(shift.status);

  const isOvertimeNegative = shift.overtime.startsWith("-");
  const isOvertimeZero = shift.overtime === "0:00" || shift.overtime === "";

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 mb-3 border border-slate-200/80 overflow-hidden flex flex-col sm:flex-row group">
      {/* Sol Çizgi / Mobil Üst Şerit */}
      <div className={`h-1.5 sm:h-auto sm:w-1.5 shrink-0 ${statusStyle.stripe}`} />

      <div className="flex-1 p-3.5 sm:p-4">
        {/* Üst Kısım: Tarih, Gün, Durum ve Eylemler */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {/* Gün Numarası Rozeti */}
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex flex-col items-center justify-center font-bold text-slate-800 leading-none shrink-0 border border-slate-200/60">
              <span className="text-xs">{dayNum}</span>
              <span className="text-[9px] text-slate-400 font-medium">GÜN</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 tracking-tight">
                  {shift.date}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isWeekend
                      ? "bg-amber-100/70 text-amber-800 border border-amber-200/60"
                      : "text-slate-500 bg-slate-100"
                  }`}
                >
                  {dayName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Durum Rozeti */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {shift.status}
            </span>

            {/* Aksiyon Butonları */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
              <button
                onClick={() => onEdit(shift)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Vardiyayı Düzenle"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `${shift.date} tarihli vardiyayı silmek istediğinize emin misiniz?`
                    )
                  ) {
                    onDelete(shift.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Vardiyayı Sil"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Rapor / İzin Gerekçesi veya Not Rozeti */}
        {(shift.reason || shift.note) && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
            {shift.reason && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium border border-slate-200">
                <FileText size={13} className="text-slate-500 shrink-0" />
                <span>{shift.reason}</span>
              </span>
            )}
            {shift.note && (
              <span className="inline-flex items-center text-slate-500 italic text-xs">
                &ldquo;{shift.note}&rdquo;
              </span>
            )}
          </div>
        )}

        {/* Alt Kısım: Giriş - Çıkış - Net - Mesai Metrikleri */}
        <div className="grid grid-cols-4 gap-2 text-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <MetricCell
            title="GİRİŞ"
            value={shift.checkIn || "—"}
            valueClass="text-slate-800 font-mono"
          />
          <MetricCell
            title="ÇIKIŞ"
            value={shift.checkOut || "—"}
            valueClass="text-slate-800 font-mono"
          />
          <MetricCell
            title="NET SÜRE"
            value={shift.netWork}
            valueClass="text-emerald-700 font-bold font-mono"
          />
          <MetricCell
            title="FAZLA MESAİ"
            value={shift.overtime}
            valueClass={`font-bold font-mono ${
              isOvertimeZero
                ? "text-slate-400"
                : isOvertimeNegative
                ? "text-rose-600"
                : "text-amber-600"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCell({
  title,
  value,
  valueClass = "text-slate-800",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-0.5">
        {title}
      </span>
      <span className={`text-xs sm:text-sm tracking-tight ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

