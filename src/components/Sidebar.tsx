// // src/components/Sidebar.tsx
// import { X } from "lucide-react";

// interface SidebarProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedEmployee: string;
//   onSelectEmployee: (name: string) => void; // Yeni eklendi
// }

// export default function Sidebar({
//   isOpen,
//   onClose,
//   selectedEmployee,
//   onSelectEmployee,
// }: SidebarProps) {
//   const employees = ["Bahri", "Batın", "Kerim"];

//   return (
//     <>
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
//           onClick={onClose}
//         />
//       )}
//       <div
//         className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="bg-slate-700 h-32 p-4 flex flex-col justify-end relative">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white"
//           >
//             <X size={24} />
//           </button>
//           <h2 className="text-white text-2xl font-bold">
//             Mıllturn Vardiya Sistemi
//           </h2>
//           <p className="text-slate-300 text-sm">Personel Seçimi</p>
//         </div>
//         <ul className="py-2">
//           {employees.map((emp) => (
//             <li key={emp} className="px-2 py-1">
//               <button
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${selectedEmployee === emp ? "bg-slate-100 font-bold text-slate-800" : "text-gray-600 hover:bg-gray-50"}`}
//                 onClick={() => {
//                   onSelectEmployee(emp); // Kişiyi güncelle
//                   onClose(); // Menüyü kapat
//                 }}
//               >
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${selectedEmployee === emp ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-700"}`}
//                 >
//                   {emp.charAt(0)}
//                 </div>
//                 {emp}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// }

// src/components/Sidebar.tsx
import { X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmployee: string;
  onSelectEmployee: (name: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  selectedEmployee,
  onSelectEmployee,
}: SidebarProps) {
  const employees = ["Bahri", "Batın", "Kerim"];
  const router = useRouter();

  const handleLogout = () => {
    // Çerezi silip login sayfasına yönlendiriyoruz
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Üst Kısım: Başlık */}
        <div className="bg-slate-700 h-32 p-4 flex flex-col justify-end relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-slate-300"
          >
            <X size={24} />
          </button>
          <h2 className="text-white text-2xl font-bold">Millturn Vardiya</h2>
          <p className="text-slate-300 text-sm">Personel Seçimi</p>
        </div>

        {/* Orta Kısım: Personel Listesi */}
        <div className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {employees.map((emp) => (
              <li key={emp} className="px-2 py-1">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${selectedEmployee === emp ? "bg-slate-100 font-bold text-slate-800" : "text-gray-600 hover:bg-gray-50"}`}
                  onClick={() => {
                    onSelectEmployee(emp);
                    onClose();
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

        {/* Alt Kısım: Çıkış Yap Butonu */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
}
