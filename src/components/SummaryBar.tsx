interface SummaryBarProps {
  netWorkTotal: string;
  overtimeTotal: string;
  isOvertimeNegative: boolean;
}

export default function SummaryBar({
  netWorkTotal,
  overtimeTotal,
  isOvertimeNegative,
}: SummaryBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center p-4 max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Aylık Net Çalışma</p>
          <p className="text-lg font-bold text-green-700">{netWorkTotal}</p>
        </div>
        <div className="w-px h-10 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Aylık Toplam Mesai</p>
          <p
            className={`text-lg font-bold ${isOvertimeNegative ? "text-red-600" : "text-orange-600"}`}
          >
            {overtimeTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
