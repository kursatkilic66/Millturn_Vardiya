"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Menu,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarX,
  FileSpreadsheet,
  Activity,
  HeartPulse,
  UserX,
  Briefcase,
  Car,
  Users,
  LayoutGrid,
  Table2,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { ShiftCalculated, ShiftRecord, Employee } from "@/src/types";
import { calculateMonthlyTotals, processShift } from "@/src/utils/shiftLogic";
import { exportShiftsToExcel } from "@/src/utils/excelExport";
import { db } from "@/src/lib/firebase";
import Sidebar from "@/src/components/Sidebar";
import ShiftCard from "@/src/components/ShiftCard";
import SummaryBar from "@/src/components/SummaryBar";
import ShiftModal from "@/src/components/ShiftModal";
import EmployeeModal from "@/src/components/EmployeeModal";
import VehicleDashboard from "@/src/components/vehicles/VehicleDashboard";

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "1", name: "Bahri", title: "CNC Torna Operatörü", annualLeaveAllowance: 14 },
  { id: "2", name: "Batın", title: "CNC Freze Operatörü", annualLeaveAllowance: 14 },
  { id: "3", name: "Kerim", title: "Talaşlı İmalat Ustası", annualLeaveAllowance: 14 },
  { id: "4", name: "Furkan", title: "Üretim Personeli", annualLeaveAllowance: 14 },
];

export default function Dashboard() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);

  // Personel Yönetimi State'leri
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Seçili Personel ve Ay State'leri (Varsayılan olarak içinde bulunulan ay)
  const [selectedEmployee, setSelectedEmployee] = useState("Bahri");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Aktif Modül (Personel Vardiya / Araç Takip Filo) ve Araç Görünüm Modu (Kart / Tablo)
  const [activeModule, setActiveModule] = useState<"vardiya" | "araclar">("vardiya");
  const [vehicleViewMode, setVehicleViewMode] = useState<"card" | "table">("card");

  // Firebase'den Personelleri Çekme
  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "employees"));
      if (!snapshot.empty) {
        const loaded: Employee[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            name: data.name,
            title: data.title || "Üretim Personeli",
            phone: data.phone || "",
            startDate: data.startDate || "",
            annualLeaveAllowance: data.annualLeaveAllowance ?? 14,
          });
        });
        setEmployees(loaded);
      } else {
        // İlk kurulumda varsayılan personelleri Firestore'a yükle
        for (const emp of INITIAL_EMPLOYEES) {
          await setDoc(doc(db, "employees", emp.id), emp);
        }
      }
    } catch (error) {
      console.error("Personel çekme hatası:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
  }, []);

  // Firebase'den Vardiya Verilerini Çekme (Seçili kişiye ve aya göre filtrelenmiş)
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "shifts"),
        where("employeeName", "==", selectedEmployee),
        where("monthId", "==", selectedMonth),
      );
      const querySnapshot = await getDocs(q);
      const loadedShifts: ShiftRecord[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedShifts.push({
          id: docSnap.id,
          employeeName: data.employeeName,
          monthId: data.monthId,
          date: data.date,
          status: data.status,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          lunchBreakMinutes: data.lunchBreakMinutes,
          reason: data.reason || "",
          note: data.note || "",
        });
      });

      // Tarihe göre sırala (gün sayısına göre)
      loadedShifts.sort((a, b) => {
        const dayA = parseInt(a.date.split(".")[0]);
        const dayB = parseInt(b.date.split(".")[0]);
        return dayA - dayB;
      });

      setShifts(loadedShifts);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, selectedMonth]);

  const calculatedShifts: ShiftCalculated[] = useMemo(() => {
    return shifts.map(processShift);
  }, [shifts]);

  const totals = useMemo(() => {
    return calculateMonthlyTotals(calculatedShifts);
  }, [calculatedShifts]);

  // Aylık İK & İzin / Rapor İstatistikleri
  const hrStats = useMemo(() => {
    let worked = 0;
    let leaves = 0;
    let sick = 0;
    let absent = 0;

    calculatedShifts.forEach((s) => {
      if (s.status === "Çalıştı") worked++;
      else if (s.status === "Yıllık İzin") leaves++;
      else if (s.status === "Raporlu") sick++;
      else if (s.status === "Gelmedi") absent++;
    });

    return { worked, leaves, sick, absent };
  }, [calculatedShifts]);

  const currentEmployeeObj = useMemo(() => {
    return employees.find((e) => e.name === selectedEmployee);
  }, [employees, selectedEmployee]);

  const handleSaveShift = async (savedShift: ShiftRecord) => {
    try {
      const [, month, year] = savedShift.date.split(".");
      const derivedMonthId = `${year}-${month}`;
      const shiftDataToSave = {
        employeeName: selectedEmployee,
        monthId: derivedMonthId,
        date: savedShift.date,
        status: savedShift.status,
        checkIn: savedShift.checkIn,
        checkOut: savedShift.checkOut,
        lunchBreakMinutes: savedShift.lunchBreakMinutes,
        reason: savedShift.reason || "",
        note: savedShift.note || "",
      };

      if (editingShift && editingShift.id) {
        const docRef = doc(db, "shifts", editingShift.id);
        await updateDoc(docRef, shiftDataToSave);
      } else {
        await addDoc(collection(db, "shifts"), shiftDataToSave);
      }

      if (derivedMonthId !== selectedMonth) {
        setSelectedMonth(derivedMonthId);
      } else {
        fetchShifts();
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await deleteDoc(doc(db, "shifts", id));
      fetchShifts();
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleSaveEmployee = async (emp: Employee) => {
    try {
      const docRef = doc(db, "employees", emp.id);
      await setDoc(docRef, emp, { merge: true });
      fetchEmployees();
      setSelectedEmployee(emp.name);
    } catch (error) {
      console.error("Personel kaydedilemedi:", error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, "employees", id));
      const remaining = employees.filter((e) => e.id !== id);
      setEmployees(remaining);
      if (remaining.length > 0) {
        setSelectedEmployee(remaining[0].name);
      }
    } catch (error) {
      console.error("Personel silinemedi:", error);
    }
  };

  const openAddModal = () => {
    setEditingShift(null);
    setModalOpen(true);
  };

  // Önceki / Sonraki Ay Geçişi
  const handleMonthChange = (delta: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  // Ay başlığını Türkçe formatlama (örn: "Ağustos 2026")
  const formattedMonthTitle = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Yan Çekmece Menü */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={(name) => setSelectedEmployee(name)}
        employees={employees}
        onOpenAddEmployee={() => {
          setEditingEmployee(null);
          setEmployeeModalOpen(true);
        }}
        onOpenEditEmployee={(emp) => {
          setEditingEmployee(emp);
          setEmployeeModalOpen(true);
        }}
        activeModule={activeModule}
        onSelectModule={(m) => {
          setActiveModule(m);
          setSidebarOpen(false);
        }}
      />

      {/* Kurumsal Üst Bar (Header) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto gap-3">
          {/* Sol: Menü Butonu & Marka */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Menü"
              aria-label="Menü"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 p-1 flex items-center justify-center border border-slate-700">
                <img
                  src="/millturn-logo-transparent.png"
                  alt="Millturn"
                  className="w-full h-full object-contain brightness-110"
                />
              </div>
              <span className="font-bold tracking-tight text-white hidden sm:inline text-sm sm:text-base">
                Millturn
              </span>
            </div>
          </div>

          {/* Orta: Modül Seçici (Personel & Vardiya vs Araç Takip) */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            <button
              onClick={() => setActiveModule("vardiya")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "vardiya"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users size={14} />
              <span className="hidden xs:inline">Personel &</span> Vardiya
            </button>
            <button
              onClick={() => setActiveModule("araclar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeModule === "araclar"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Car size={14} />
              <span>Araç Takip (Filo)</span>
            </button>
          </div>

          {/* Sağ: Durum veya Seçili Personel Rozeti */}
          {activeModule === "vardiya" ? (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white transition cursor-pointer"
              title="Personel Değiştir"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                {selectedEmployee.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col items-start leading-none text-left">
                <span>{selectedEmployee}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 hidden sm:inline">
                  {currentEmployeeObj?.title || "Personel"}
                </span>
              </div>
            </button>
          ) : (
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                onClick={() => setVehicleViewMode("card")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vehicleViewMode === "card"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid size={14} />
                <span className="hidden xs:inline">Kart</span>
              </button>
              <button
                onClick={() => setVehicleViewMode("table")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  vehicleViewMode === "table"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tablo Görünümü"
              >
                <Table2 size={14} />
                <span className="hidden xs:inline">Tablo</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modüle Göre Ana İçerik */}
      {activeModule === "araclar" ? (
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
          <VehicleDashboard
            viewMode={vehicleViewMode}
            onViewModeChange={setVehicleViewMode}
          />
        </main>
      ) : (
        <>
          {/* Alt Başlık, Ay Seçici ve Excel Butonu */}
          <section className="bg-white border-b border-slate-200/80 sticky top-[57px] z-20 shadow-2xs">
            <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
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

              {/* Sağ: Excel Dışa Aktarma Butonu */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    exportShiftsToExcel(calculatedShifts, selectedEmployee, selectedMonth, totals)
                  }
                  disabled={calculatedShifts.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Puantajı Excel Olarak İndir"
                >
                  <FileSpreadsheet size={15} className="text-emerald-700" />
                  <span className="hidden xs:inline">Excel İndir</span>
                </button>
              </div>
            </div>
          </section>

          {/* Personel İK & İzin / Rapor Özet Şeridi */}
          <section className="max-w-3xl mx-auto px-4 mt-3">
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Briefcase size={14} className="text-slate-400" />
                <span className="font-bold text-slate-900">{selectedEmployee}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{currentEmployeeObj?.title || "Üretim Personeli"}</span>
              </div>

              {/* Mini İK Sayaçları */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                  <Activity size={12} />
                  {hrStats.worked} Çalıştı
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold border border-sky-100">
                  {hrStats.leaves} İzin
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                  <HeartPulse size={12} />
                  {hrStats.sick} Rapor
                </span>
                {hrStats.absent > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-100">
                    <UserX size={12} />
                    {hrStats.absent} Gelmedi
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Ana İçerik Alanı */}
          <main className="p-4 max-w-3xl mx-auto">
            {loading ? (
              /* Yükleniyor Durumu (Skeleton) */
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl p-4 border border-slate-200/60 animate-pulse flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                      <div className="h-4 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                      <div className="h-6 bg-slate-100 rounded" />
                      <div className="h-6 bg-slate-100 rounded" />
                      <div className="h-6 bg-slate-100 rounded" />
                      <div className="h-6 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : calculatedShifts.length === 0 ? (
              /* Boş Durum (Empty State) */
              <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs mt-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                  <CalendarX size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Bu Ay İçin Kayıt Bulunamadı
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
                  <strong className="text-slate-700">{selectedEmployee}</strong> için{" "}
                  <span className="capitalize">{formattedMonthTitle}</span> dönemine ait henüz vardiya kaydı girilmemiş.
                </p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition active:scale-98 cursor-pointer"
                >
                  <Plus size={16} />
                  İlk Vardiyayı Ekle
                </button>
              </div>
            ) : (
              /* Vardiya Kartları Listesi */
              <div className="space-y-3">
                {calculatedShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    onEdit={(s) => {
                      setEditingShift(s);
                      setModalOpen(true);
                    }}
                    onDelete={handleDeleteShift}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Sağ Alttaki Hızlı Vardiya Ekleme Butonu (FAB) */}
          <button
            onClick={openAddModal}
            aria-label="Yeni Vardiya Ekle"
            className="fixed right-5 bottom-20 sm:bottom-24 bg-slate-900 hover:bg-slate-800 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-xl hover:shadow-slate-900/30 transition-all duration-200 active:scale-95 z-30 flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <Plus size={22} className="stroke-[2.5]" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wide">
              Vardiya Ekle
            </span>
          </button>

          {/* Alt Özet Çubuğu (Executive KPI Summary) */}
          <SummaryBar
            netWorkTotal={totals.netWorkTotal}
            overtimeTotal={totals.overtimeTotal}
            isOvertimeNegative={totals.isOvertimeNegative}
            totalShifts={calculatedShifts.length}
          />

          {/* Vardiya Ekleme / Düzenleme Modalı */}
          <ShiftModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveShift}
            editingShift={editingShift}
            employeeName={selectedEmployee}
          />
        </>
      )}

      {/* Personel Ekleme / Düzenleme Modalı */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        onDelete={handleDeleteEmployee}
        editingEmployee={editingEmployee}
      />
    </div>
  );
}


