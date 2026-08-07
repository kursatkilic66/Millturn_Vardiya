"use client";
import { useState, useEffect, useMemo } from "react";
import { Menu, Plus } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { ShiftCalculated, ShiftRecord } from "@/src/types";
import { calculateMonthlyTotals, processShift } from "@/src/utils/shiftLogic";
import { db } from "@/src/lib/firebase";
import Sidebar from "@/src/components/Sidebar";
import ShiftCard from "@/src/components/ShiftCard";
import SummaryBar from "@/src/components/SummaryBar";
import ShiftModal from "@/src/components/ShiftModal";

export default function Dashboard() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRecord | null>(null);

  // Seçili Personel ve Ay State'leri
  const [selectedEmployee, setSelectedEmployee] = useState("Bahri");
  const [selectedMonth, setSelectedMonth] = useState("2026-08"); // YYYY-MM format

  // Firebase'den Verileri Çekme (Seçili kişiye ve aya göre filtrelenmiş)
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
        });
      });

      // Tarihe göre sırala
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
    fetchShifts();
  }, [selectedEmployee, selectedMonth]);

  const calculatedShifts: ShiftCalculated[] = useMemo(() => {
    return shifts.map(processShift);
  }, [shifts]);

  const totals = useMemo(() => {
    return calculateMonthlyTotals(calculatedShifts);
  }, [calculatedShifts]);

  const handleSaveShift = async (savedShift: ShiftRecord) => {
    try {
      const [day, month, year] = savedShift.date.split(".");
      const derivedMonthId = `${year}-${month}`;
      const shiftDataToSave = {
        employeeName: selectedEmployee,
        monthId: derivedMonthId,
        date: savedShift.date,
        status: savedShift.status,
        checkIn: savedShift.checkIn,
        checkOut: savedShift.checkOut,
        lunchBreakMinutes: savedShift.lunchBreakMinutes,
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

  const openAddModal = () => {
    setEditingShift(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={(name) => setSelectedEmployee(name)}
      />

      <header className="bg-slate-700 text-white sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between p-4 max-w-3xl mx-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 hover:bg-slate-600 rounded"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-lg">{selectedEmployee}</h1>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-600 text-white border-none rounded p-1 text-sm outline-none cursor-pointer"
            />
          </div>
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          </div>
        ) : calculatedShifts.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            Bu ay için kayıt bulunamadı
          </p>
        ) : (
          calculatedShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              onEdit={(s) => {
                setEditingShift(s);
                setModalOpen(true);
              }}
              onDelete={handleDeleteShift}
            />
          ))
        )}
      </main>

      <button
        onClick={openAddModal}
        className="fixed right-6 bottom-24 bg-slate-700 text-white p-4 rounded-full shadow-lg hover:bg-slate-800 transition-colors z-30"
      >
        <Plus size={24} />
      </button>

      <SummaryBar
        netWorkTotal={totals.netWorkTotal}
        overtimeTotal={totals.overtimeTotal}
        isOvertimeNegative={totals.isOvertimeNegative}
      />

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveShift}
        editingShift={editingShift}
      />
    </div>
  );
}
