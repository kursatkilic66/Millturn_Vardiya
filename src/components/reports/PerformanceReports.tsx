"use client";
import { useState, useEffect, useMemo } from "react";
import { getShiftsByMonth } from "@/src/lib/shiftService";
import { Employee, ShiftRecord } from "@/src/types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CalendarDays, Filter, PieChart as PieChartIcon, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface PerformanceReportsProps {
  employees: Employee[];
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#64748b"];

export default function PerformanceReports({ employees, selectedMonth, setSelectedMonth }: PerformanceReportsProps) {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"aylik" | "haftalik">("aylik");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const handleMonthChange = (offset: number) => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    date.setMonth(date.getMonth() + offset);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  // Ay adını Türkçe formatlama
  const formattedMonthTitle = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
    return date.toLocaleString("tr-TR", { month: "long", year: "numeric" });
  }, [selectedMonth]);

  useEffect(() => {
    let cancelled = false;
    const fetchAllShiftsForMonth = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const loaded = await getShiftsByMonth(selectedMonth);
        if (!cancelled) setShifts(loaded);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        if (!cancelled) {
          setShifts([]);
          setLoadError("Rapor verileri yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllShiftsForMonth();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  // Hafta gruplaması (Basit bir 7 günlük gruplama)
  // 1-7: Hafta 1, 8-14: Hafta 2, 15-21: Hafta 3, 22+: Hafta 4/5
  const getWeekOfMonth = (dateStr: string) => {
    // dateStr format: DD.MM.YYYY
    const day = parseInt(dateStr.split(".")[0]);
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    if (day <= 28) return 4;
    return 5;
  };

  const filteredShifts = useMemo(() => {
    if (viewMode === "aylik") return shifts;
    return shifts.filter((s) => getWeekOfMonth(s.date) === selectedWeek);
  }, [shifts, viewMode, selectedWeek]);

  // Her personel için istatistikler
  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      const empShifts = filteredShifts.filter((s) => s.employeeName === emp.name);
      let worked = 0;
      let absent = 0;
      let sick = 0;
      let leave = 0;

      empShifts.forEach((s) => {
        if (s.status === "Çalıştı") worked++;
        else if (s.status === "Gelmedi") absent++;
        else if (s.status === "Raporlu") sick++;
        else if (s.status === "Yıllık İzin") leave++;
      });

      return {
        name: emp.name,
        title: emp.title || "Personel",
        worked,
        absent,
        sick,
        leave,
        total: empShifts.length,
        pieData: [
          { name: "Çalıştı", value: worked },
          { name: "Gelmedi", value: absent },
          { name: "Raporlu", value: sick },
          { name: "Yıllık İzin", value: leave },
        ].filter((d) => d.value > 0), // Sadece değeri olanları göster
      };
    });
  }, [employees, filteredShifts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium">Performans verileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {loadError && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm">
          {loadError}
        </div>
      )}
      {/* Üst Kısım: Kontroller ve Ay Seçici */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PieChartIcon size={20} className="text-slate-500" />
            Performans
          </h2>
          
          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
          
          {/* Ay Gezinme */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Önceki Ay"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer group">
              <Calendar size={15} className="text-slate-500 group-hover:text-slate-900 transition" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 capitalize select-none">
                {formattedMonthTitle}
              </span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Tarih seçin"
              />
            </div>

            <button
              onClick={() => handleMonthChange(1)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Sonraki Ay"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("aylik")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === "aylik" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setViewMode("haftalik")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                viewMode === "haftalik" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Haftalık
            </button>
          </div>
          
          {viewMode === "haftalik" && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-900 transition"
            >
              <option value={1}>1. Hafta (1-7)</option>
              <option value={2}>2. Hafta (8-14)</option>
              <option value={3}>3. Hafta (15-21)</option>
              <option value={4}>4. Hafta (22-28)</option>
              <option value={5}>5. Hafta (29+)</option>
            </select>
          )}
        </div>
      </div>

      {/* Bireysel Personel Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employeeStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center transition hover:shadow-md">
            <h3 className="font-bold text-slate-800 text-lg">{stat.name}</h3>
            <p className="text-xs text-slate-500 mb-4">{stat.title}</p>
            
            <div className="h-40 w-full relative">
              {stat.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stat.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {stat.pieData.map((entry, index) => {
                        let color = COLORS[index % COLORS.length];
                        if (entry.name === "Çalıştı") color = "#10b981";
                        if (entry.name === "Gelmedi") color = "#ef4444";
                        if (entry.name === "Raporlu") color = "#f59e0b";
                        if (entry.name === "Yıllık İzin") color = "#3b82f6";
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-full w-24 h-24 mx-auto border border-slate-100">
                  Veri yok
                </div>
              )}
              {/* Ortadaki Toplam Değeri */}
              {stat.pieData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-slate-700">{stat.total}</span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Kayıt</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between items-center text-sm p-1.5 rounded bg-emerald-50 text-emerald-700">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Çalıştı:</span>
                <span className="font-bold">{stat.worked}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1.5 rounded bg-rose-50 text-rose-700">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Gelmedi:</span>
                <span className="font-bold">{stat.absent}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1.5 rounded bg-amber-50 text-amber-700">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Raporlu:</span>
                <span className="font-bold">{stat.sick}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-1.5 rounded bg-blue-50 text-blue-700">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> İzin:</span>
                <span className="font-bold">{stat.leave}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Karşılaştırma Tablosu */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CalendarDays size={20} className="text-slate-500" />
          Genel Performans Karşılaştırması
        </h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={employeeStats} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Bar dataKey="worked" name="Çalıştı" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="absent" name="Gelmedi" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="sick" name="Raporlu" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="leave" name="Yıllık İzin" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
