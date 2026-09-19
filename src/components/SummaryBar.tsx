import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface SummaryBarProps {
  netWorkTotal: string;
  overtimeTotal: string;
  isOvertimeNegative: boolean;
  totalShifts?: number;
}

export default function SummaryBar({
  netWorkTotal,
  overtimeTotal,
  isOvertimeNegative,
  totalShifts,
}: SummaryBarProps) {
  const isZeroOvertime = overtimeTotal === "0:00" || overtimeTotal === "";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] z-30 pb-safe">
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Net Çalışma KPI */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Aylık Net Çalışma
            </span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono tracking-tight">
              {netWorkTotal || "0:00"}
            </span>
          </div>
        </div>

        {/* Dikey Ayırıcı & Vardiya Sayısı */}
        <div className="flex flex-col items-center justify-center shrink-0 px-1">
          {totalShifts !== undefined && (
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {totalShifts} Gün
            </span>
          )}
        </div>

        {/* Toplam Mesai KPI */}
        <div className="flex-1 flex items-center justify-end gap-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Aylık Toplam Mesai
            </span>
            <span
              className={`text-base sm:text-lg font-extrabold font-mono tracking-tight ${
                isZeroOvertime
                  ? "text-slate-500"
                  : isOvertimeNegative
                  ? "text-rose-600"
                  : "text-amber-600"
              }`}
            >
              {overtimeTotal || "0:00"}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isZeroOvertime
                ? "bg-slate-100 border-slate-200 text-slate-500"
                : isOvertimeNegative
                ? "bg-rose-50 border-rose-200/80 text-rose-600"
                : "bg-amber-50 border-amber-200/80 text-amber-600"
            }`}
          >
            {isOvertimeNegative ? (
              <TrendingDown size={20} className="stroke-[2.2]" />
            ) : (
              <TrendingUp size={20} className="stroke-[2.2]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

