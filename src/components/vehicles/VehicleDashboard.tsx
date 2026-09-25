"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Car,
  Search,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Trash2,
  Edit,
  ChevronRight,
  Building,
  Key,
  LayoutGrid,
  Table2,
  User,
  Gauge,
  CreditCard,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Vehicle } from "@/src/types/vehicle";
import {
  getVehiclesFromFirestore,
  addVehicleToFirestore,
  updateVehicleInFirestore,
  deleteVehicleFromFirestore,
} from "@/src/lib/vehicleService";
import VehicleDetailModal from "./VehicleDetailModal";
import VehicleFormModal from "./VehicleFormModal";

interface VehicleDashboardProps {
  viewMode?: "card" | "table";
  onViewModeChange?: (mode: "card" | "table") => void;
}

export default function VehicleDashboard({
  viewMode: propViewMode,
  onViewModeChange,
}: VehicleDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalViewMode, setInternalViewMode] = useState<"card" | "table">("card");

  const currentViewMode = propViewMode ?? internalViewMode;
  const handleSetViewMode = (mode: "card" | "table") => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Arama & Filtreleme
  const [searchTerm, setSearchTerm] = useState("");
  const [sahiplikFilter, setSahiplikFilter] = useState<string>("Tümü");
  const [durumFilter, setDurumFilter] = useState<string>("Tümü");

  // Modal State'leri
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Firestore'dan araçları yükleme
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await getVehiclesFromFirestore();
      setVehicles(data);
    } catch (err) {
      console.error("Araç yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // Kalan gün hesaplayıcı
  const getDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Metrikler & İstatistikler
  const stats = useMemo(() => {
    const total = vehicles.length;
    const sahada = vehicles.filter((v) => v.durum === "Sahada").length;
    const havuzda = vehicles.filter((v) => v.durum === "Havuzda").length;
    const serviste = vehicles.filter((v) => v.durum === "Serviste").length;
    const kiralik = vehicles.filter((v) => v.sahiplikDurumu === "Kiralık").length;

    // Muayenesi veya sigortası 30 günden az kalanlar
    const yaklasanlar = vehicles.filter((v) => {
      const muayeneDays = getDaysLeft(v.muayeneBitisTarihi);
      const sigortaDays = getDaysLeft(v.trafikBitisTarihi);
      const kaskoDays = getDaysLeft(v.kaskoBitisTarihi);
      return (
        (muayeneDays !== null && muayeneDays <= 30) ||
        (sigortaDays !== null && sigortaDays <= 30) ||
        (kaskoDays !== null && kaskoDays <= 30)
      );
    }).length;

    return { total, sahada, havuzda, serviste, kiralik, yaklasanlar };
  }, [vehicles]);

  // Filtrelenmiş Araçlar
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        v.plate.toLowerCase().includes(search) ||
        v.brandName.toLowerCase().includes(search) ||
        v.modelName.toLowerCase().includes(search) ||
        (v.tanimliSofor && v.tanimliSofor.toLowerCase().includes(search)) ||
        (v.vehicleLabel && v.vehicleLabel.toLowerCase().includes(search));

      const matchSahiplik = sahiplikFilter === "Tümü" || v.sahiplikDurumu === sahiplikFilter;
      const matchDurum = durumFilter === "Tümü" || v.durum === durumFilter;

      return matchSearch && matchSahiplik && matchDurum;
    });
  }, [vehicles, searchTerm, sahiplikFilter, durumFilter]);

  // Yeni Araç Kaydet veya Güncelle
  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      if (editingVehicle) {
        await updateVehicleInFirestore(editingVehicle.id, vehicleData);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? ({ ...v, ...vehicleData } as Vehicle) : v))
        );
        if (selectedVehicleForDetail?.id === editingVehicle.id) {
          setSelectedVehicleForDetail((prev) => (prev ? ({ ...prev, ...vehicleData } as Vehicle) : null));
        }
      } else {
        const newVehicle = await addVehicleToFirestore(vehicleData as Omit<Vehicle, "id">);
        setVehicles((prev) => [newVehicle, ...prev]);
      }
      setFormModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error("Araç kaydetme hatası:", error);
      alert("Araç kaydedilirken bir hata oluştu.");
    }
  };

  // Detay Modalından güncellenen araç
  const handleUpdateVehicleFromDetail = async (updated: Vehicle) => {
    try {
      await updateVehicleInFirestore(updated.id, updated);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setSelectedVehicleForDetail(updated);
    } catch (error) {
      console.error("Araç güncelleme hatası:", error);
    }
  };

  // Araç Sil
  const handleDeleteVehicle = async (id: string, plate: string) => {
    if (confirm(`${plate} plakalı aracı ve tüm takip kayıtlarını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteVehicleFromFirestore(id);
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        if (selectedVehicleForDetail?.id === id) {
          setSelectedVehicleForDetail(null);
        }
      } catch (error) {
        console.error("Araç silme hatası:", error);
        alert("Araç silinirken hata oluştu.");
      }
    }
  };

  // Excel Dışa Aktarma
  const exportVehiclesToExcel = () => {
    const rows = filteredVehicles.map((v) => ({
      Plaka: v.plate,
      Marka: v.brandName,
      Model: v.modelName,
      "Model Yılı": v.modelYili || "-",
      "Güncel KM": v.guncelKm,
      "Mülkiyet Biçimi": v.sahiplikDurumu,
      "Operasyon Durumu": v.durum,
      "Yakıt Türü": v.yakitTipi,
      "Tanımlı Sürücü": v.tanimliSofor || "-",
      "Departman / Grup": v.grupAdi || "-",
      "Muayene Bitiş": v.muayeneBitisTarihi || "-",
      "Sigorta Bitiş": v.trafikBitisTarihi || "-",
      "Kasko Bitiş": v.kaskoBitisTarihi || "-",
      "K2 Belge No": v.k2Karti?.belgeNumarasi || "-",
      "Aylık Kira Bedeli": v.kiraMaliyeti ? `${v.kiraMaliyeti} ${v.kiraParaBirimi || "TL"}` : "-",
      "Kiralayan Şirket": v.kiralayanSirket || "-",
      "Motor No": v.motorNo || "-",
      "Şasi No": v.sasiNo || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Araçlar");
    XLSX.writeFile(workbook, `Millturn_Filo_Arac_Listesi_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Üst Metrik ve Sayaç Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Toplam Filo</span>
            <Car size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
            <span className="text-xs text-slate-400 font-medium">Araç</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sahada Aktif</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{stats.sahada}</span>
            <span className="text-xs text-slate-400 font-medium">Araç</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Havuzda (Boşta)</span>
            <Key size={16} className="text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-600 font-mono">{stats.havuzda}</span>
            <span className="text-xs text-slate-400 font-medium">Araç</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Servis / Bakım</span>
            <Wrench size={16} className="text-rose-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-600 font-mono">{stats.serviste}</span>
            <span className="text-xs text-slate-400 font-medium">Araç</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Kiralık Filo</span>
            <Building size={16} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 font-mono">{stats.kiralik}</span>
            <span className="text-xs text-slate-400 font-medium">Araç</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Vade / Uyarılar</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-600 font-mono">{stats.yaklasanlar}</span>
            <span className="text-xs text-slate-400 font-medium">İşlem</span>
          </div>
        </div>
      </div>

      {/* 2. Filtreleme, Görünüm Seçici ve Aksiyon Barı */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Arama & Filtre Seçenekleri */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Plaka, Marka, Model, Sürücü Ara..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sahiplikFilter}
              onChange={(e) => setSahiplikFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Tümü">Tüm Sahiplikler</option>
              <option value="Şirket Aracı">Şirket Öz Malı</option>
              <option value="Kiralık">Kiralık Araçlar</option>
            </select>

            <select
              value={durumFilter}
              onChange={(e) => setDurumFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Sahada">Sahada</option>
              <option value="Havuzda">Havuzda</option>
              <option value="Serviste">Serviste</option>
            </select>
          </div>
        </div>

        {/* Sağ: Kart / Tablo Görünüm Seçici + Excel + Yeni Araç */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Görünüm Seçici (Kart / Tablo) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleSetViewMode("card")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentViewMode === "card"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid size={14} />
              <span>Kart</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                currentViewMode === "table"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Tablo Görünümü"
            >
              <Table2 size={14} />
              <span>Tablo</span>
            </button>
          </div>

          <button
            onClick={exportVehiclesToExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Araç Listesini Excel Olarak İndir"
          >
            <FileSpreadsheet size={15} />
            Excel İndir
          </button>
          <button
            onClick={() => {
              setEditingVehicle(null);
              setFormModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            Yeni Araç Ekle
          </button>
        </div>

      </div>

      {/* 3. Araç Listesi: KART GÖRÜNÜMÜ veya TABLO GÖRÜNÜMÜ */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
          Araç verileri yükleniyor...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Car size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Filtreye uygun araç bulunamadı.</p>
          <p className="text-xs text-slate-400 mt-1">Arama kriterlerinizi değiştirin veya yeni bir araç ekleyin.</p>
        </div>
      ) : currentViewMode === "card" ? (
        /* ==================== KART (CARD) GÖRÜNÜMÜ ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((v) => {
            const muayeneDays = getDaysLeft(v.muayeneBitisTarihi);
            const sigortaDays = getDaysLeft(v.trafikBitisTarihi);
            const kaskoDays = getDaysLeft(v.kaskoBitisTarihi);

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleForDetail(v)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                {/* Kart Üst Başlık */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* TR Plaka Stili Rozet */}
                      <div className="flex items-center bg-white text-slate-900 rounded-lg overflow-hidden border-2 border-slate-300 shadow-xs shrink-0">
                        <span className="bg-blue-700 text-white text-[9px] font-bold px-1.5 py-1.5 leading-none flex flex-col items-center justify-center">
                          TR
                        </span>
                        <span className="font-mono font-black text-sm px-2.5 py-1 tracking-tight">
                          {v.plate}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {v.brandName} {v.modelName}
                        </h3>
                        <span className="text-[11px] text-slate-300">
                          {v.modelYili ? `${v.modelYili} Model` : ""} • {v.yakitTipi} {v.vites ? `• ${v.vites}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Durum Rozeti */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                        v.durum === "Sahada"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : v.durum === "Havuzda"
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          v.durum === "Sahada"
                            ? "bg-emerald-400"
                            : v.durum === "Havuzda"
                            ? "bg-sky-400"
                            : "bg-rose-400"
                        }`}
                      />
                      {v.durum}
                    </span>
                  </div>
                </div>

                {/* Kart Gövdesi: 2x2 Bilgi Izgarası */}
                <div className="p-4 space-y-3 flex-1">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {/* Güncel KM */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Gauge size={11} className="text-blue-600" /> Güncel KM
                      </span>
                      <span className="font-mono font-black text-sm text-slate-900 mt-0.5 block">
                        {v.guncelKm.toLocaleString("tr-TR")} KM
                      </span>
                    </div>

                    {/* Sürücü & Grup */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <User size={11} className="text-indigo-600" /> Sürücü / Birim
                      </span>
                      <span className="font-bold text-slate-800 mt-0.5 block truncate">
                        {v.tanimliSofor || "Havuz Aracı"}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {v.grupAdi || "Genel Filo"}
                      </span>
                    </div>

                    {/* Muayene Vadesi */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Stethoscope size={11} className="text-sky-600" /> Muayene
                      </span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">
                        {v.muayeneBitisTarihi || "Belirtilmedi"}
                      </span>
                      {muayeneDays !== null && (
                        <span
                          className={`text-[10px] font-bold ${
                            muayeneDays < 0
                              ? "text-rose-600"
                              : muayeneDays <= 30
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {muayeneDays < 0
                            ? `${Math.abs(muayeneDays)} gün geçti!`
                            : `${muayeneDays} gün kaldı`}
                        </span>
                      )}
                    </div>

                    {/* Trafik Sigortası & Kasko */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-600" /> Sigorta / Kasko
                      </span>
                      <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                        {v.trafikSigortaSirketi || "Tanımlanmadı"}
                      </span>
                      {sigortaDays !== null ? (
                        <span
                          className={`text-[10px] font-bold ${
                            sigortaDays < 0
                              ? "text-rose-600"
                              : sigortaDays <= 30
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {sigortaDays < 0
                            ? "Poliçe bitti!"
                            : `Sigorta: ${sigortaDays} gün`}
                        </span>
                      ) : kaskoDays !== null ? (
                        <span className="text-[10px] text-slate-500">Kasko: {kaskoDays} gün</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </div>
                  </div>

                  {/* Mülkiyet & Alt Kayıt Rozetleri */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        v.sahiplikDurumu === "Kiralık"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {v.sahiplikDurumu}
                      {v.sahiplikDurumu === "Kiralık" && v.kiraMaliyeti
                        ? ` (${v.kiraMaliyeti.toLocaleString("tr-TR")} TL)`
                        : ""}
                    </span>

                    {v.bakimlar && v.bakimlar.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        🔧 {v.bakimlar.length} Bakım
                      </span>
                    )}

                    {v.k2Karti?.belgeNumarasi && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <CreditCard size={10} /> K2: {v.k2Karti.belgeNumarasi}
                      </span>
                    )}
                  </div>
                </div>

                {/* Kart Alt Aksiyon Barı */}
                <div
                  className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedVehicleForDetail(v)}
                    className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>Detay & 13 Sekme</span>
                    <ChevronRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingVehicle(v);
                      setFormModalOpen(true);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
                    title="Aracı Düzenle"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(v.id, v.plate)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Aracı Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== TABLO GÖRÜNÜMÜ ==================== */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Plaka & Araç Bilgisi</th>
                  <th className="p-3.5">Mülkiyet</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5">Güncel KM</th>
                  <th className="p-3.5">Sürücü / Grup</th>
                  <th className="p-3.5">Muayene Vadesi</th>
                  <th className="p-3.5">Sigorta & Kasko</th>
                  <th className="p-3.5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => {
                  const muayeneDays = getDaysLeft(v.muayeneBitisTarihi);
                  const sigortaDays = getDaysLeft(v.trafikBitisTarihi);

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedVehicleForDetail(v)}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center font-mono border border-blue-100 shrink-0">
                            <Car size={16} />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600 transition block">
                              {v.plate}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {v.brandName} {v.modelName} {v.modelYili ? `(${v.modelYili})` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            v.sahiplikDurumu === "Kiralık"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {v.sahiplikDurumu}
                        </span>
                        {v.sahiplikDurumu === "Kiralık" && v.kiraMaliyeti && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {v.kiraMaliyeti.toLocaleString("tr-TR")} TL/Ay
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            v.durum === "Sahada"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : v.durum === "Havuzda"
                              ? "bg-sky-50 text-sky-800 border border-sky-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              v.durum === "Sahada"
                                ? "bg-emerald-500"
                                : v.durum === "Havuzda"
                                ? "bg-sky-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {v.durum}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {v.guncelKm.toLocaleString("tr-TR")} KM
                        <span className="block text-[10px] font-normal text-slate-400 font-sans">
                          {v.yakitTipi}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {v.tanimliSofor || "Tanımlanmadı"}
                        </span>
                        <span className="text-[11px] text-slate-400">{v.grupAdi || "Genel"}</span>
                      </td>

                      <td className="p-3.5">
                        {v.muayeneBitisTarihi ? (
                          <div>
                            <span className="font-medium text-slate-800 block">{v.muayeneBitisTarihi}</span>
                            {muayeneDays !== null && (
                              <span
                                className={`text-[10px] font-semibold ${
                                  muayeneDays < 0
                                    ? "text-rose-600"
                                    : muayeneDays <= 30
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {muayeneDays < 0
                                  ? `${Math.abs(muayeneDays)} gün geçti!`
                                  : `${muayeneDays} gün kaldı`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {v.trafikBitisTarihi ? (
                          <div>
                            <span className="text-slate-800 font-medium block">
                              {v.trafikSigortaSirketi || "Sigorta"}
                            </span>
                            {sigortaDays !== null && (
                              <span
                                className={`text-[10px] font-semibold ${
                                  sigortaDays < 0
                                    ? "text-rose-600"
                                    : sigortaDays <= 30
                                    ? "text-amber-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {sigortaDays < 0
                                  ? "Poliçe bitti!"
                                  : `${sigortaDays} gün kaldı`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedVehicleForDetail(v)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="Tüm Sekmeleri İncele"
                          >
                            Detay & Sekmeler
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingVehicle(v);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="Bilgileri Düzenle"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(v.id, v.plate)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Aracı Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detay & 13 Sekmeli Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          isOpen={!!selectedVehicleForDetail}
          onClose={() => setSelectedVehicleForDetail(null)}
          onUpdateVehicle={handleUpdateVehicleFromDetail}
          onEditVehicleDetails={(v) => {
            setEditingVehicle(v);
            setFormModalOpen(true);
          }}
        />
      )}

      {/* Yeni Araç / Düzenleme Modalı */}
      {isFormModalOpen && (
        <VehicleFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingVehicle(null);
          }}
          onSave={handleSaveVehicle}
          initialVehicle={editingVehicle}
        />
      )}

    </div>
  );
}
