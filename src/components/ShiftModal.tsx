"use client";
import { useState, useEffect } from "react";
import { ShiftRecord } from "../types";
import { X, Calendar, Clock, Lock, Sparkles } from "lucide-react";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: ShiftRecord) => void;
  editingShift: ShiftRecord | null;
  employeeName?: string;
}

const statuses = [
  { name: "Çalıştı", desc: "Normal Mesai", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { name: "Gelmedi", desc: "-10 Saat Kesinti", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { name: "Hafta Tatili", desc: "0 Saat (Hafta Sonu)", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { name: "Yıllık İzin", desc: "Ücretli İzin", color: "text-sky-700 bg-sky-50 border-sky-200" },
  { name: "Raporlu", desc: "Sağlık Raporu", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { name: "Resmi Tatil", desc: "Resmi Tatil Çalışması", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
];

export default function ShiftModal({
  isOpen,
  onClose,
  onSave,
  editingShift,
  employeeName,
}: ShiftModalProps) {
  const [formData, setFormData] = useState<ShiftRecord>({
    id: "",
    employeeName: "",
    monthId: "",
    date: "",
    status: "Çalıştı",
    checkIn: "",
    checkOut: "",
    lunchBreakMinutes: 0,
    reason: "",
    note: "",
  });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editingShift) {
      setFormData({
        ...editingShift,
        reason: editingShift.reason || "",
        note: editingShift.note || "",
      });
    } else {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const dateStr = `${day}.${month}.${year}`;

      setFormData({
        id: Date.now().toString(),
        employeeName: employeeName || "",
        monthId: `${year}-${month}`,
        date: dateStr,
        status: "Çalıştı",
        checkIn: "07:30",
        checkOut: "17:30",
        lunchBreakMinutes: 0,
        reason: "",
        note: "",
      });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editingShift, isOpen, employeeName]);

  if (!isOpen) return null;

  const formatForDatePicker = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      const formatted = `${parts[2]}.${parts[1]}.${parts[0]}`;
      setFormData({ ...formData, date: formatted });
    }
  };

  const isTimeDisabled = [
    "Yıllık İzin",
    "Raporlu",
    "Gelmedi",
    "Hafta Tatili",
  ].includes(formData.status);

  // Standart vardiya saatlerini hızlı doldurma
  const applyPreset = (inTime: string, outTime: string) => {
    setFormData({
      ...formData,
      status: "Çalıştı",
      checkIn: inTime,
      checkOut: outTime,
    });
  };

  // Hazır rapor/izin gerekçeleri
  const getQuickReasons = () => {
    if (formData.status === "Raporlu") {
      return ["Grip / İstirahat", "İş Kazası", "Hastanede Tedavi", "Heyet Raporu", "Diş Tedavisi"];
    }
    if (formData.status === "Yıllık İzin") {
      return ["Yıllık Ücretli İzin", "Mazeret İzni", "Evlilik İzni", "Vefat İzni", "Ücretsiz İzin"];
    }
    if (formData.status === "Gelmedi") {
      return ["Habersiz Gelmedi", "Ulaşım Sorunu", "Ailevi Mazeret", "İdari İzinli"];
    }
    return [];
  };

  const quickReasons = getQuickReasons();

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
        {/* Üst Başlık */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-slate-700" />
              {editingShift ? "Vardiya Düzenle" : "Yeni Vardiya Girişi"}
            </h3>
            {employeeName && (
              <p className="text-xs text-slate-500 mt-0.5">
                Personel: <span className="font-semibold text-slate-700">{employeeName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Alanları (Scroll edilebilir) */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Tarih Seçimi */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              Tarih
            </label>
            <input
              type="date"
              value={formatForDatePicker(formData.date)}
              onChange={handleDateChange}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent text-slate-900 bg-white transition"
              required
            />
          </div>

          {/* Durum Seçimi */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Vardiya Durumu
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                const shouldClearTimes = [
                  "Gelmedi",
                  "Yıllık İzin",
                  "Raporlu",
                  "Hafta Tatili",
                ].includes(newStatus);
                setFormData({
                  ...formData,
                  status: newStatus,
                  checkIn: shouldClearTimes ? "" : (formData.checkIn || "07:30"),
                  checkOut: shouldClearTimes ? "" : (formData.checkOut || "17:30"),
                  // Durum değiştiğinde varsayılan uygun nedeni ayarla
                  reason: newStatus === "Yıllık İzin" ? "Yıllık Ücretli İzin" : newStatus === "Raporlu" ? "Grip / İstirahat" : "",
                });
              }}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white text-slate-900 transition font-medium"
            >
              {statuses.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} ({s.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Rapor / İzin / Devamsızlık Gerekçesi (Varsa) */}
          {quickReasons.length > 0 && (
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {formData.status === "Raporlu"
                  ? "Rapor Gerekçesi"
                  : formData.status === "Yıllık İzin"
                  ? "İzin Türü"
                  : "Devamsızlık Nedeni"}
              </label>

              {/* Hızlı Çipler */}
              <div className="flex flex-wrap gap-1.5">
                {quickReasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, reason: r })}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer ${
                      formData.reason === r
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Serbest Metin Gerekçe / Detay */}
              <input
                type="text"
                value={formData.reason || ""}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Örn: 2 Günlük Heyet Raporu - Hastalık"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-900"
              />
            </div>
          )}

          {/* Hızlı Şablon Butonları (Sadece Normal Çalışma Modunda) */}
          {!isTimeDisabled && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                Hızlı Saat Şablonları
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("07:30", "17:30")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  07:30 - 17:30 (Standart 10 Sa)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("07:30", "19:30")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                >
                  07:30 - 19:30 (+2 Mesai)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("07:30", "15:30")}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  07:30 - 15:30 (8 Sa)
                </button>
              </div>
            </div>
          )}

          {/* Giriş ve Çıkış Saatleri */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Giriş Saati
              </label>
              <div className="relative">
                <input
                  type="time"
                  disabled={isTimeDisabled}
                  value={formData.checkIn || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, checkIn: e.target.value })
                  }
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-mono ${
                    isTimeDisabled
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Çıkış Saati
              </label>
              <div className="relative">
                <input
                  type="time"
                  disabled={isTimeDisabled}
                  value={formData.checkOut || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOut: e.target.value })
                  }
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition font-mono ${
                    isTimeDisabled
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                  }`}
                />
              </div>
            </div>
          </div>

          {isTimeDisabled && (
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              <Lock size={14} className="shrink-0 text-slate-400" />
              <span>
                Seçili durum (<strong className="text-slate-700">{formData.status}</strong>) için çalışma saati girilmez.
              </span>
            </div>
          )}

          {/* Ek Açıklama / Vardiya Notu */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Ek Açıklama / Vardiya Notu (Opsiyonel)
            </label>
            <input
              type="text"
              value={formData.note || ""}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Örn: Doktor raporu teslim alındı, gece mesaisi vb."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white text-slate-900"
            />
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

