// src/components/Sidebar.tsx
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: string;
  onSelectEmployee: (name: string) => void; // Yeni eklendi
}

export default function Sidebar({
  isOpen,
  onClose,
  selectedEmployee,
  onSelectEmployee,
}: SidebarProps) {
  const employees = ["Bahri", "Batın", "Kerim"];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="bg-slate-700 h-32 p-4 flex flex-col justify-end relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white"
          >
            <X size={24} />
          </button>
          <h2 className="text-white text-2xl font-bold">
            Mıllturn Vardiya Sistemi
          </h2>
          <p className="text-slate-300 text-sm">Personel Seçimi</p>
        </div>
        <ul className="py-2">
          {employees.map((emp) => (
            <li key={emp} className="px-2 py-1">
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${selectedEmployee === emp ? "bg-slate-100 font-bold text-slate-800" : "text-gray-600 hover:bg-gray-50"}`}
                onClick={() => {
                  onSelectEmployee(emp); // Kişiyi güncelle
                  onClose(); // Menüyü kapat
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedEmployee === emp ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {emp.charAt(0)}
                </div>
                {emp}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
