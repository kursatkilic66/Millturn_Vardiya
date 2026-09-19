"use client";
import { useState } from "react";
import { X, LogOut, Users, Search, Check, Shield, UserPlus, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Employee } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: string;
  onSelectEmployee: (name: string) => void;
  employees: Employee[];
  onOpenAddEmployee: () => void;
  onOpenEditEmployee: (emp: Employee) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  selectedEmployee,
  onSelectEmployee,
  employees,
  onOpenAddEmployee,
  onOpenEditEmployee,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  return (
    <>
      {/* Arka Plan Karartması (Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer Menü */}
      <aside
        aria-label="Personel Menüsü"
        className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Üst Kısım: Kurumsal Başlık ve Logo */}
        <div className="bg-slate-900 text-white p-5 relative shrink-0 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer absolute top-4 right-4"
            title="Menüyü Kapat"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-slate-800 p-1.5 flex items-center justify-center border border-slate-700">
              <img
                src="/millturn-logo-transparent.png"
                alt="Millturn"
                className="w-full h-full object-contain brightness-110"
              />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Millturn
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                  Portal
                </span>
              </h2>
              <p className="text-xs text-slate-400">Personel & Vardiya Yönetimi</p>
            </div>
          </div>
        </div>

        {/* Personel Arama Kutusu */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Personel ara..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Orta Kısım: Personel Listesi */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} />
              Personel Listesi
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {filteredEmployees.length} kişi
            </span>
          </div>

          <ul className="space-y-1">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployee === emp.name;
              return (
                <li key={emp.id} className="relative group">
                  <div
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                    }`}
                    onClick={() => {
                      onSelectEmployee(emp.name);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? "bg-slate-800 text-white border border-slate-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {emp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold leading-tight truncate">
                          {emp.name}
                        </span>
                        <span
                          className={`text-[11px] truncate ${
                            isSelected ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {emp.title || "Üretim Personeli"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Düzenleme Butonu */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditEmployee(emp);
                        }}
                        className={`p-1.5 rounded-lg opacity-80 hover:opacity-100 transition cursor-pointer ${
                          isSelected
                            ? "text-slate-400 hover:text-white hover:bg-slate-800"
                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-200"
                        }`}
                        title="Personel Bilgilerini Düzenle"
                      >
                        <Settings2 size={14} />
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check size={13} className="text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}

            {filteredEmployees.length === 0 && (
              <li className="p-4 text-center text-xs text-slate-400">
                Aramanızla eşleşen personel bulunamadı.
              </li>
            )}
          </ul>

          {/* Yeni Personel Ekleme Butonu */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenAddEmployee();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <UserPlus size={15} />
              Yeni Personel Ekle
            </button>
          </div>
        </div>

        {/* Alt Kısım: Güvenli Çıkış ve Oturum */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2 shrink-0">
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield size={12} className="text-emerald-600" />
              Aktif Oturum Açık
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl border border-rose-200/60 transition cursor-pointer"
          >
            <LogOut size={16} />
            Güvenli Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}

