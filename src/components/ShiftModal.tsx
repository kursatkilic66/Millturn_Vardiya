// import { useState, useEffect } from "react";
// import { ShiftRecord } from "../types";
// import { X } from "lucide-react";

// interface ShiftModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (shift: ShiftRecord) => void;
//   editingShift: ShiftRecord | null;
// }

// const statuses = [
//   "Çalıştı",
//   "Gelmedi",
//   "Yıllık İzin",
//   "Raporlu",
//   "Resmi Tatil",
//   "Hafta Tatili",
//   "Diğer",
//   "Geç Kalma",
// ];

// export default function ShiftModal({
//   isOpen,
//   onClose,
//   onSave,
//   editingShift,
// }: ShiftModalProps) {
//   const [formData, setFormData] = useState<ShiftRecord>({
//     id: "",
//     employeeName: "",
//     monthId: "",
//     date: "",
//     status: "Çalıştı",
//     checkIn: "",
//     checkOut: "",
//     lunchBreakMinutes: 60,
//   });

//   useEffect(() => {
//     if (editingShift) {
//       setFormData(editingShift);
//     } else {
//       setFormData({
//         id: Date.now().toString(),
//         employeeName: "",
//         monthId: "",
//         date: new Date().toLocaleDateString("tr-TR").replace(/\./g, "."),
//         status: "Çalıştı",
//         checkIn: "07:30",
//         checkOut: "17:30",
//         lunchBreakMinutes: 60,
//       });
//     }
//   }, [editingShift, isOpen]);

//   if (!isOpen) return null;

//   // HTML <input type="date"> YYYY-MM-DD bekler. Bizdeki GG.AA.YYYY formatını çeviriyoruz.
//   const formatForDatePicker = (dateStr: string) => {
//     if (!dateStr) return "";
//     const parts = dateStr.split(".");
//     if (parts.length === 3) {
//       return `${parts[2]}-${parts[1]}-${parts[0]}`;
//     }
//     return dateStr;
//   };

//   // Takvimden YYYY-MM-DD geldiğinde tekrar GG.AA.YYYY formatına çeviriyoruz.
//   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     if (!val) return;
//     const parts = val.split("-");
//     if (parts.length === 3) {
//       const formatted = `${parts[2]}.${parts[1]}.${parts[0]}`;
//       setFormData({ ...formData, date: formatted });
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
//         <div className="flex justify-between items-center p-4 border-b border-gray-100">
//           <h3 className="font-bold text-lg text-gray-800">
//             {editingShift ? "Vardiya Düzenle" : "Yeni Vardiya Ekle"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-4 space-y-4">
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Tarih</label>
//             {/* type="text" yerine type="date" eklendi */}
//             <input
//               type="date"
//               value={formatForDatePicker(formData.date)}
//               onChange={handleDateChange}
//               className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">Durum</label>
//             <select
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData({ ...formData, status: e.target.value })
//               }
//               className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 bg-white text-gray-800"
//             >
//               {statuses.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm text-gray-600 mb-1">
//                 Giriş (SS:DD)
//               </label>
//               <input
//                 type="time"
//                 value={formData.checkIn || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, checkIn: e.target.value })
//                 }
//                 className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800"
//               />
//             </div>
//             <div>
//               <label className="block text-sm text-gray-600 mb-1">
//                 Çıkış (SS:DD)
//               </label>
//               <input
//                 type="time"
//                 value={formData.checkOut || ""}
//                 onChange={(e) =>
//                   setFormData({ ...formData, checkOut: e.target.value })
//                 }
//                 className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800"
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm text-gray-600 mb-1">
//               Mola (Dakika)
//             </label>
//             <input
//               type="number"
//               value={formData.lunchBreakMinutes}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   lunchBreakMinutes: Number(e.target.value),
//                 })
//               }
//               className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800"
//             />
//           </div>
//         </div>

//         <div className="p-4 bg-gray-50 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-200"
//           >
//             İptal
//           </button>
//           <button
//             onClick={() => {
//               onSave(formData);
//               onClose();
//             }}
//             className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800"
//           >
//             Kaydet
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { ShiftRecord } from "../types";
import { X } from "lucide-react";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: ShiftRecord) => void;
  editingShift: ShiftRecord | null;
}

const statuses = [
  "Çalıştı",
  "Gelmedi",
  "Yıllık İzin",
  "Raporlu",
  "Resmi Tatil",
];

export default function ShiftModal({
  isOpen,
  onClose,
  onSave,
  editingShift,
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
  });

  useEffect(() => {
    if (editingShift) {
      setFormData(editingShift);
    } else {
      setFormData({
        id: Date.now().toString(),
        employeeName: "",
        monthId: "",
        date: new Date().toLocaleDateString("tr-TR").replace(/\./g, "."),
        status: "Çalıştı",
        checkIn: "07:30",
        checkOut: "17:30",
        lunchBreakMinutes: 0,
      });
    }
  }, [editingShift, isOpen]);

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

  const isTimeDisabled = ["Yıllık İzin", "Raporlu"].includes(formData.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">
            {editingShift ? "Vardiya Düzenle" : "Yeni Vardiya Ekle"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tarih</label>
            <input
              type="date"
              value={formatForDatePicker(formData.date)}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Durum</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 bg-white text-gray-800"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Giriş (SS:DD)
              </label>
              <input
                type="time"
                disabled={isTimeDisabled}
                value={formData.checkIn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, checkIn: e.target.value })
                }
                className={`w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800 ${isTimeDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Çıkış (SS:DD)
              </label>
              <input
                type="time"
                disabled={isTimeDisabled}
                value={formData.checkOut || ""}
                onChange={(e) =>
                  setFormData({ ...formData, checkOut: e.target.value })
                }
                className={`w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-slate-500 text-gray-800 ${isTimeDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-200"
          >
            İptal
          </button>
          <button
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
