"use client";
import { useState, useEffect } from "react";
import { Employee } from "../types";
import { X, User, Briefcase, Phone, Calendar, Award, Trash2 } from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  editingEmployee: Employee | null;
}

const standardRoles = [
  "CNC Torna Operatörü",
  "CNC Freze Operatörü",
  "Talaşlı İmalat Ustası",
  "Kalite Kontrol Sorumlusu",
  "Bakım & Onarım Teknisyeni",
  "Vardiya Amiri",
  "Üretim Personeli",
];

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingEmployee,
}: EmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>({
    id: "",
    name: "",
    title: "Üretim Personeli",
    phone: "",
    startDate: "",
    annualLeaveAllowance: 14,
  });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editingEmployee) {
      setFormData(editingEmployee);
    } else {
      setFormData({
        id: Date.now().toString(),
        name: "",
        title: "Üretim Personeli",
        phone: "",
        startDate: new Date().toISOString().split("T")[0],
        annualLeaveAllowance: 14,
      });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editingEmployee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 transform transition-all">
        {/* Üst Başlık */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {editingEmployee ? "Personel Profilini Düzenle" : "Yeni Personel Ekle"}
              </h3>
              <p className="text-xs text-slate-400">Millturn Kurumsal Özlük Bilgileri</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Adı Soyadı *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            {/* Görev / Pozisyon */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Briefcase size={13} className="text-slate-400" />
                Görevi / Pozisyonu
              </label>
              <input
                type="text"
                list="roles-list"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: CNC Torna Operatörü"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white"
              />
              <datalist id="roles-list">
                {standardRoles.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                Telefon Numarası
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* İşe Başlama Tarihi */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  İşe Giriş
                </label>
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white"
                />
              </div>

              {/* Yıllık İzin Hakkı */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Award size={13} className="text-slate-400" />
                  Yıllık İzin Kotası
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={formData.annualLeaveAllowance || 14}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        annualLeaveAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-400 text-slate-900 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">
                    GÜN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Butonlar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {editingEmployee && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `${editingEmployee.name} personelini sistemden silmek istediğinize emin misiniz?`
                    )
                  ) {
                    onDelete(editingEmployee.id);
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                title="Personeli Sil"
              >
                <Trash2 size={18} />
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
