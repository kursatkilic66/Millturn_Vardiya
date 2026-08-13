// import { ShiftCalculated } from "../types";
// import { Edit2, Trash2 } from "lucide-react";

// interface ShiftCardProps {
//   shift: ShiftCalculated;
//   onEdit: (shift: ShiftCalculated) => void;
//   onDelete: (id: string) => void; // <-- Silme fonksiyonu eklendi
// }

// export default function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
//   return (
//     <div className="bg-white rounded-xl shadow-sm mb-3 flex overflow-hidden border border-gray-100 relative group">
//       {/* Sol Renk Şeridi */}
//       <div className={`w-3 shrink-0 ${shift.rowColor || "bg-gray-50"}`}></div>

//       <div className="flex-1 p-3">
//         {/* Üst Kısım: Tarih ve Durum */}
//         <div className="flex justify-between items-center mb-3">
//           <span className="font-bold text-gray-800">{shift.date}</span>
//           <div className="flex items-center gap-2">
//             <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
//               {shift.status}
//             </span>
//             <button
//               onClick={() => onEdit(shift)}
//               className="text-gray-400 hover:text-blue-500 p-1 rounded-md"
//               title="Düzenle"
//             >
//               <Edit2 size={16} />
//             </button>
//             <button
//               onClick={() => {
//                 if (
//                   window.confirm(
//                     "Bu vardiyayı silmek istediğinize emin misiniz?",
//                   )
//                 ) {
//                   onDelete(shift.id);
//                 }
//               }}
//               className="text-gray-400 hover:text-red-500 p-1 rounded-md"
//               title="Sil"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         </div>

//         {/* Alt Kısım: Saatler */}
//         <div className="grid grid-cols-5 text-center divide-x divide-gray-100 text-gray-800">
//           <InfoColumn title="Giriş" value={shift.checkIn || "-"} />
//           <InfoColumn title="Çıkış" value={shift.checkOut || "-"} />
//           <InfoColumn title="Mola" value={`${shift.lunchBreakMinutes} dk`} />
//           <InfoColumn
//             title="Net"
//             value={shift.netWork}
//             valueClass="text-green-600"
//           />
//           <InfoColumn
//             title="Mesai"
//             value={shift.overtime}
//             valueClass="text-orange-600"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function InfoColumn({
//   title,
//   value,
//   valueClass = "text-gray-800",
// }: {
//   title: string;
//   value: string;
//   valueClass?: string;
// }) {
//   return (
//     <div className="flex flex-col items-center justify-center px-1">
//       <span className="text-[10px] sm:text-xs text-gray-400 mb-1">{title}</span>
//       <span
//         className={`text-xs sm:text-sm font-semibold truncate w-full ${valueClass}`}
//       >
//         {value}
//       </span>
//     </div>
//   );
// }
import { ShiftCalculated } from "../types";
import { Edit2, Trash2 } from "lucide-react";

interface ShiftCardProps {
  shift: ShiftCalculated;
  onEdit: (shift: ShiftCalculated) => void;
  onDelete: (id: string) => void;
}

export default function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-3 flex overflow-hidden border border-gray-100 relative group">
      {/* Sol Renk Şeridi */}
      <div className={`w-3 shrink-0 ${shift.rowColor || "bg-gray-50"}`}></div>

      <div className="flex-1 p-3">
        {/* Üst Kısım: Tarih ve Durum */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-gray-800">{shift.date}</span>
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
              {shift.status}
            </span>
            <button
              onClick={() => onEdit(shift)}
              className="text-gray-400 hover:text-blue-500 p-1 rounded-md"
              title="Düzenle"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Bu vardiyayı silmek istediğinize emin misiniz?",
                  )
                ) {
                  onDelete(shift.id);
                }
              }}
              className="text-gray-400 hover:text-red-500 p-1 rounded-md"
              title="Sil"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Alt Kısım: Saatler (Mola çıkarıldı, grid-cols-4 yapıldı) */}
        <div className="grid grid-cols-4 text-center divide-x divide-gray-100 text-gray-800">
          <InfoColumn title="Giriş" value={shift.checkIn || "-"} />
          <InfoColumn title="Çıkış" value={shift.checkOut || "-"} />
          <InfoColumn
            title="Net"
            value={shift.netWork}
            valueClass="text-green-600"
          />
          <InfoColumn
            title="Mesai"
            value={shift.overtime}
            valueClass="text-orange-600"
          />
        </div>
      </div>
    </div>
  );
}

function InfoColumn({
  title,
  value,
  valueClass = "text-gray-800",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-1">
      <span className="text-[10px] sm:text-xs text-gray-400 mb-1">{title}</span>
      <span
        className={`text-xs sm:text-sm font-semibold truncate w-full ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
