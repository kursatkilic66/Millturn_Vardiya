"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Car,
  FileText,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Disc,
  AlertTriangle,
  Receipt,
  Building,
  Landmark,
  UserCheck,
  CreditCard,
  Cog,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Save,
} from "lucide-react";
import {
  Vehicle,
  MaintenanceRecord,
  TireRecord,
  FineRecord,
  DamageRecord,
  BreakdownRecord,
  TaxRecord,
  AssignmentRecord,
  SparePartRecord,
  K2Card,
} from "@/src/types/vehicle";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onEditVehicleDetails: (v: Vehicle) => void;
}

type TabKey =
  | "genel"
  | "ruhsat"
  | "muayene"
  | "sigorta"
  | "bakim"
  | "lastik"
  | "ceza"
  | "ariza"
  | "kaza"
  | "vergi"
  | "tahsis"
  | "k2"
  | "yedekparca";

export default function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onUpdateVehicle,
  onEditVehicleDetails,
}: VehicleDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("genel");

  // Hızlı alt kayıt ekleme form görünürlüğü
  const [showAddSubRecord, setShowAddSubRecord] = useState<TabKey | null>(null);

  // K2 Kartı düzenleme modu
  const [isEditingK2, setIsEditingK2] = useState(false);
  const [k2Form, setK2Form] = useState<K2Card>({
    belgeNumarasi: "",
    belgeTarihi: "",
    sonGecerlilikTarihi: "",
    aciklama: "",
  });

  useEffect(() => {
    if (vehicle) {
      setK2Form({
        belgeNumarasi: vehicle.k2Karti?.belgeNumarasi || "",
        belgeTarihi: vehicle.k2Karti?.belgeTarihi || "",
        sonGecerlilikTarihi: vehicle.k2Karti?.sonGecerlilikTarihi || "",
        aciklama:
          vehicle.k2Karti?.aciklama ||
          "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı.",
      });
      setIsEditingK2(false);
    }
  }, [vehicle]);

  // Form State'leri
  const [bakimForm, setBakimForm] = useState<Partial<MaintenanceRecord>>({
    islemTuru: "Periyodik Bakım",
    tutar: 0,
    km: vehicle?.guncelKm || 0,
    islemTarihi: new Date().toISOString().split("T")[0],
  });

  const [lastikForm, setLastikForm] = useState<Partial<TireRecord>>({
    konum: "Ön Sol",
    tip: "4 Mevsim",
    marka: "Michelin",
    aciklama: "Lastik Değişimi",
  });

  const [cezaForm, setCezaForm] = useState<Partial<FineRecord>>({
    cezaTutari: 0,
    tarih: new Date().toISOString().split("T")[0],
    aciklama: "Trafik Cezası",
    odendiMi: true,
  });

  const [arizaForm, setArizaForm] = useState<Partial<BreakdownRecord>>({
    tarih: new Date().toISOString().split("T")[0],
    calisiyor: true,
    cekiciCagirildi: false,
    durum: "Açık",
    aciklama: "Arıza Tespiti",
  });

  const [kazaForm, setKazaForm] = useState<Partial<DamageRecord>>({
    kazaTarihi: new Date().toISOString().split("T")[0],
    tip: "İki Araç",
    toplamMaliyet: 0,
    aciklama: "Maddi Hasarlı Kaza",
    dosyaDurumu: "Açık",
  });

  const [vergiForm, setVergiForm] = useState<Partial<TaxRecord>>({
    tip: "MTV 1. Taksit",
    tarih: new Date().toISOString().split("T")[0],
    vergiTutari: 0,
    odendiMi: true,
    aciklama: "MTV Ödemesi",
  });

  const [tahsisForm, setTahsisForm] = useState<Partial<AssignmentRecord>>({
    tahsisBaslangicTarihi: new Date().toISOString().split("T")[0],
    baslangicKm: vehicle?.guncelKm || 0,
    aktifMi: true,
    zimmetlenenKisi: "",
    departman: "",
  });

  const [yedekParcaForm, setYedekParcaForm] = useState<Partial<SparePartRecord>>({
    tip: "Yedek Parça",
    aciklama: "Parça Değişimi",
    durum: "Tamamlandı",
    faturaTutari: 0,
    iscilikBedeli: 0,
  });

  if (!isOpen || !vehicle) return null;

  // Kalan gün hesaplama yardımcısı
  const calculateDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const target = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderDaysBadge = (days: number | null, label: string) => {
    if (days === null) return <span className="text-slate-400 text-xs">Belirtilmemiş</span>;
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle size={12} />
          {label} Süresi Doldu ({Math.abs(days)} gün önce)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock size={12} />
          {label}: {days} gün kaldı!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 size={12} />
        {label}: {days} gün var
      </span>
    );
  };

  // K2 Kartı kaydetme
  const handleSaveK2 = () => {
    const updated: Vehicle = {
      ...vehicle,
      k2Karti: {
        belgeNumarasi: k2Form.belgeNumarasi?.trim() || "",
        belgeTarihi: k2Form.belgeTarihi || "",
        sonGecerlilikTarihi: k2Form.sonGecerlilikTarihi || "",
        aciklama: k2Form.aciklama?.trim() || "",
      },
    };
    onUpdateVehicle(updated);
    setIsEditingK2(false);
  };

  // Alt kayıt silme işlemi
  const handleDeleteSubRecord = (type: TabKey, recordId: string) => {
    const updated = { ...vehicle };
    if (type === "bakim") {
      updated.bakimlar = (updated.bakimlar || []).filter((r) => r.id !== recordId);
    } else if (type === "lastik") {
      updated.lastikler = (updated.lastikler || []).filter((r) => r.id !== recordId);
    } else if (type === "ceza") {
      updated.cezalar = (updated.cezalar || []).filter((r) => r.id !== recordId);
    } else if (type === "ariza") {
      updated.arizalar = (updated.arizalar || []).filter((r) => r.id !== recordId);
    } else if (type === "kaza") {
      updated.kazalar = (updated.kazalar || []).filter((r) => r.id !== recordId);
    } else if (type === "vergi") {
      updated.vergiler = (updated.vergiler || []).filter((r) => r.id !== recordId);
    } else if (type === "tahsis") {
      updated.tahsisler = (updated.tahsisler || []).filter((r) => r.id !== recordId);
    } else if (type === "yedekparca") {
      updated.yedekParcalar = (updated.yedekParcalar || []).filter((r) => r.id !== recordId);
    }
    onUpdateVehicle(updated);
  };

  // Alt kayıt ekleme işlemleri
  const handleSaveSubRecord = (type: TabKey) => {
    const updated = { ...vehicle };

    if (type === "bakim") {
      const newRec: MaintenanceRecord = {
        id: "b_" + Date.now(),
        islemTuru: bakimForm.islemTuru || "Periyodik Bakım",
        islemTarihi: bakimForm.islemTarihi || new Date().toISOString().split("T")[0],
        km: Number(bakimForm.km) || vehicle.guncelKm,
        sonrakiKm: bakimForm.sonrakiKm ? Number(bakimForm.sonrakiKm) : undefined,
        sonrakiTarih: bakimForm.sonrakiTarih,
        faturaNo: bakimForm.faturaNo,
        tutar: Number(bakimForm.tutar) || 0,
        aciklama: bakimForm.aciklama,
      };
      updated.bakimlar = [newRec, ...(updated.bakimlar || [])];
    } else if (type === "lastik") {
      const newRec: TireRecord = {
        id: "l_" + Date.now(),
        aciklama: lastikForm.aciklama || "Lastik Kaydı",
        konum: (lastikForm.konum as any) || "Ön Sol",
        marka: lastikForm.marka || "Bilinmiyor",
        tip: (lastikForm.tip as any) || "4 Mevsim",
        tabanBoyutu: lastikForm.tabanBoyutu ? Number(lastikForm.tabanBoyutu) : undefined,
        yanakGenisligi: lastikForm.yanakGenisligi ? Number(lastikForm.yanakGenisligi) : undefined,
        jantCapi: lastikForm.jantCapi ? Number(lastikForm.jantCapi) : undefined,
        satinAlmaTarihi: lastikForm.satinAlmaTarihi,
        sonrakiDegisimTarihi: lastikForm.sonrakiDegisimTarihi,
      };
      updated.lastikler = [newRec, ...(updated.lastikler || [])];
    } else if (type === "ceza") {
      const newRec: FineRecord = {
        id: "c_" + Date.now(),
        aciklama: cezaForm.aciklama || "Ceza",
        tarih: cezaForm.tarih || new Date().toISOString().split("T")[0],
        belgeNo: cezaForm.belgeNo,
        cezaMaddesi: cezaForm.cezaMaddesi,
        cezaTutari: Number(cezaForm.cezaTutari) || 0,
        cezaPuani: cezaForm.cezaPuani ? Number(cezaForm.cezaPuani) : undefined,
        sofor: cezaForm.sofor,
        rucu: cezaForm.rucu,
        odendiMi: cezaForm.odendiMi ?? true,
      };
      updated.cezalar = [newRec, ...(updated.cezalar || [])];
    } else if (type === "ariza") {
      const newRec: BreakdownRecord = {
        id: "a_" + Date.now(),
        aciklama: arizaForm.aciklama || "Arıza",
        tarih: arizaForm.tarih || new Date().toISOString().split("T")[0],
        calisiyor: arizaForm.calisiyor ?? true,
        cekiciCagirildi: arizaForm.cekiciCagirildi ?? false,
        durum: arizaForm.durum || "Açık",
        toplamMaliyet: Number(arizaForm.toplamMaliyet) || 0,
      };
      updated.arizalar = [newRec, ...(updated.arizalar || [])];
    } else if (type === "kaza") {
      const newRec: DamageRecord = {
        id: "k_" + Date.now(),
        aciklama: kazaForm.aciklama || "Kaza",
        kazaTarihi: kazaForm.kazaTarihi || new Date().toISOString().split("T")[0],
        tip: kazaForm.tip || "Tek Araç",
        belgeNo: kazaForm.belgeNo,
        karsiAracPlakasi: kazaForm.karsiAracPlakasi,
        karsiAracSurucusu: kazaForm.karsiAracSurucusu,
        kusurOrani: kazaForm.asliKusur,
        toplamMaliyet: Number(kazaForm.toplamMaliyet) || 0,
        dosyaDurumu: kazaForm.dosyaDurumu || "Açık",
      };
      updated.kazalar = [newRec, ...(updated.kazalar || [])];
    } else if (type === "vergi") {
      const newRec: TaxRecord = {
        id: "t_" + Date.now(),
        tip: vergiForm.tip || "MTV 1. Taksit",
        aciklama: vergiForm.aciklama || "MTV",
        tarih: vergiForm.tarih || new Date().toISOString().split("T")[0],
        gelecekVergiTarihi: vergiForm.gelecekVergiTarihi,
        vergiTutari: Number(vergiForm.vergiTutari) || 0,
        odendiMi: vergiForm.odendiMi ?? true,
      };
      updated.vergiler = [newRec, ...(updated.vergiler || [])];
    } else if (type === "tahsis") {
      const newRec: AssignmentRecord = {
        id: "th_" + Date.now(),
        zimmetlenenKisi: tahsisForm.zimmetlenenKisi || "Personel",
        sofor: tahsisForm.sofor,
        departman: tahsisForm.departman,
        tahsisBaslangicTarihi: tahsisForm.tahsisBaslangicTarihi || new Date().toISOString().split("T")[0],
        tahsisBitisTarihi: tahsisForm.tahsisBitisTarihi,
        baslangicKm: Number(tahsisForm.baslangicKm) || vehicle.guncelKm,
        bitisKm: tahsisForm.bitisKm ? Number(tahsisForm.bitisKm) : undefined,
        aciklama: tahsisForm.aciklama,
        aktifMi: tahsisForm.aktifMi ?? true,
      };
      updated.tahsisler = [newRec, ...(updated.tahsisler || [])];
    } else if (type === "yedekparca") {
      const newRec: SparePartRecord = {
        id: "y_" + Date.now(),
        tip: yedekParcaForm.tip || "Yedek Parça",
        aciklama: yedekParcaForm.aciklama || "Parça",
        tespit: yedekParcaForm.tespit,
        islem: yedekParcaForm.islem,
        kullanilanYedekParcalar: yedekParcaForm.kullanilanYedekParcalar,
        durum: yedekParcaForm.durum || "Tamamlandı",
        faturaNo: yedekParcaForm.faturaNo,
        faturaTutari: Number(yedekParcaForm.faturaTutari) || 0,
        iscilikBedeli: Number(yedekParcaForm.iscilikBedeli) || 0,
        aracKm: Number(yedekParcaForm.aracKm) || vehicle.guncelKm,
      };
      updated.yedekParcalar = [newRec, ...(updated.yedekParcalar || [])];
    }

    onUpdateVehicle(updated);
    setShowAddSubRecord(null);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "genel", label: "Özellikler & Genel", icon: <Car size={16} /> },
    { key: "ruhsat", label: "Ruhsat Bilgileri", icon: <FileText size={16} /> },
    { key: "muayene", label: "Muayene & Egzoz", icon: <Stethoscope size={16} /> },
    { key: "sigorta", label: "Sigorta & Kasko", icon: <ShieldCheck size={16} /> },
    { key: "bakim", label: "Bakım & Servis", icon: <Wrench size={16} />, badge: vehicle.bakimlar?.length },
    { key: "lastik", label: "Lastik Takibi", icon: <Disc size={16} />, badge: vehicle.lastikler?.length },
    { key: "ceza", label: "Trafik Cezaları", icon: <Receipt size={16} />, badge: vehicle.cezalar?.length },
    { key: "ariza", label: "Arıza Bildirimleri", icon: <AlertTriangle size={16} />, badge: vehicle.arizalar?.length },
    { key: "kaza", label: "Kaza & Hasar", icon: <AlertCircle size={16} />, badge: vehicle.kazalar?.length },
    { key: "vergi", label: "Vergi (MTV)", icon: <Landmark size={16} />, badge: vehicle.vergiler?.length },
    { key: "tahsis", label: "Tahsis & Zimmet", icon: <UserCheck size={16} />, badge: vehicle.tahsisler?.length },
    { key: "k2", label: "K2 Taşıt Kartı", icon: <CreditCard size={16} /> },
    { key: "yedekparca", label: "Yedek Parça", icon: <Cog size={16} />, badge: vehicle.yedekParcalar?.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Üst Başlık ve Araç Kimlik Kartı */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 shrink-0 border-b border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xl font-bold shadow-inner">
                <Car size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                    {vehicle.plate}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      vehicle.sahiplikDurumu === "Kiralık"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {vehicle.sahiplikDurumu}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      vehicle.durum === "Sahada"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : vehicle.durum === "Havuzda"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {vehicle.durum}
                  </span>
                  {vehicle.grupAdi && (
                    <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {vehicle.grupAdi}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  <span className="font-semibold text-white">{vehicle.brandName} {vehicle.modelName}</span>
                  {vehicle.modelYili && ` (${vehicle.modelYili})`}
                  <span className="mx-2 text-slate-600">|</span>
                  <span className="text-slate-400">Güncel: <strong className="text-white font-mono">{vehicle.guncelKm.toLocaleString("tr-TR")} KM</strong></span>
                  {vehicle.tanimliSofor && (
                    <>
                      <span className="mx-2 text-slate-600">|</span>
                      <span className="text-slate-400">Sürücü: <strong className="text-blue-300">{vehicle.tanimliSofor}</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditVehicleDetails(vehicle)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit size={14} />
                Düzenle
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Sekme Menüsü (Horizontal Scrollable Tabs) */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 overflow-x-auto shrink-0 flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setShowAddSubRecord(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sekme İçerik Alanı */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">

          {/* 1. ÖZELLİKLER & GENEL */}
          {activeTab === "genel" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Sol Kart: Araç Tip & Teknik Detayları */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3.5 flex items-center gap-2">
                    <Car size={16} className="text-blue-600" />
                    Tip ve Teknik Özellikleri
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Araç Tipi:</span>
                      <span className="font-semibold text-slate-800">{vehicle.vehicleType || "Otomobil"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Marka & Model:</span>
                      <span className="font-semibold text-blue-700">{vehicle.brandName} {vehicle.modelName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Model Yılı:</span>
                      <span className="font-semibold text-slate-800">{vehicle.modelYili || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Yakıt Türü:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{vehicle.yakitTipi}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Vites Tipi:</span>
                      <span className="font-semibold text-slate-800">{vehicle.vites || "Manuel"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Motor No:</span>
                      <span className="font-mono text-slate-700">{vehicle.motorNo || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Şasi No:</span>
                      <span className="font-mono text-slate-700">{vehicle.sasiNo || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Motor Gücü & Hacmi:</span>
                      <span className="font-semibold text-slate-800">{vehicle.motorGucu || "-"} / {vehicle.motorHacmi || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Koltuk / Net Ağırlık:</span>
                      <span className="font-semibold text-slate-800">{vehicle.koltukSayisi || "5"} Kişi / {vehicle.netAgirlik || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Sağ Kart: Sayaçlar & Durum Bilgileri */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3.5 flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-600" />
                      Mesafe ve Operasyon Durumu
                    </h4>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white mb-4">
                      <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider block">Güncel Kilometre Sayacı</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black font-mono tracking-tight text-white">{vehicle.guncelKm.toLocaleString("tr-TR")}</span>
                        <span className="text-xs text-slate-400 font-bold">KM</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Mülkiyet Biçimi:</span>
                        <span className="font-semibold text-slate-800">{vehicle.sahiplikDurumu}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Operasyon Durumu:</span>
                        <span className="font-semibold text-slate-800">{vehicle.durum}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Tanımlı Sürücü:</span>
                        <span className="font-semibold text-blue-700">{vehicle.tanimliSofor || "Havuz Aracı / Tanımlanmadı"}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Bağlı Departman/Grup:</span>
                        <span className="font-semibold text-slate-800">{vehicle.grupAdi || "Genel"}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Kiralık Araç Sözleşme Kartı */}
              {vehicle.sahiplikDurumu === "Kiralık" && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-3">
                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <Building size={16} className="text-amber-700" />
                      Kiralama ve Filo Sözleşme Detayları
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full">
                      Kiralık Sözleşmesi
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-slate-500 block mb-1">Aylık Kira Bedeli:</span>
                      <strong className="text-base text-rose-600 font-mono">
                        {vehicle.kiraMaliyeti?.toLocaleString("tr-TR") || "-"} {vehicle.kiraParaBirimi || "TL"}
                      </strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-slate-500 block mb-1">Kiralayan Şirket:</span>
                      <strong className="text-slate-800">{vehicle.kiralayanSirket || "-"}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-slate-500 block mb-1">Sözleşme Süresi:</span>
                      <strong className="text-slate-800">{vehicle.kiraSuresi || "-"}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-100">
                      <span className="text-slate-500 block mb-1">Sözleşme Bitiş & Kalan:</span>
                      <div>
                        {renderDaysBadge(calculateDaysLeft(vehicle.kiraBitisTarihi), "Sözleşme")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. RUHSAT BİLGİLERİ */}
          {activeTab === "ruhsat" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                Resmi Tescil ve Araç Ruhsat Kayıtları
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Ruhsat Sahibi (Lisans):</span>
                    <strong className="text-slate-800">{vehicle.lisansSahibi || "Millturn Makina"}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Tescil Tarihi:</span>
                    <span className="font-medium text-slate-800">{vehicle.tescilTarihi || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">İlk Tescil Tarihi:</span>
                    <span className="font-medium text-slate-800">{vehicle.ilkTescilTarihi || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Verildiği İl / İlçe:</span>
                    <span className="font-medium text-slate-800">{vehicle.verildigiIl || "-"} / {vehicle.verildigiIlce || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Trafiğe Çıkış Tarihi:</span>
                    <span className="font-medium text-slate-800">{vehicle.trafigeCikisTarihi || "-"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Tescil Belgesi Seri No:</span>
                    <span className="font-mono font-bold text-blue-700">{vehicle.tescilBelgesiSeriNo || vehicle.belgeSeriNo || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Tescil Sıra No:</span>
                    <span className="font-mono text-slate-800">{vehicle.tescilSiraNo || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Römork İstiap Haddi:</span>
                    <span className="font-medium text-slate-800">{vehicle.romorkIstiabHaddi ? `${vehicle.romorkIstiabHaddi} kg` : "-"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Ruhsat Son Geçerlilik:</span>
                    <span className="font-medium text-slate-800">{vehicle.ruhsatSonKullanmaTarihi || "Süresiz"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 items-center">
                    <span className="text-slate-500">Takograf & Taksimetre:</span>
                    <div className="flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${vehicle.takograf ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                        Takograf: {vehicle.takograf ? "Var" : "Yok"}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${vehicle.taksimetre ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                        Taksimetre: {vehicle.taksimetre ? "Var" : "Yok"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MUAYENE & EGZOZ */}
          {activeTab === "muayene" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* TÜVTÜRK Genel Muayene */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Stethoscope size={16} className="text-sky-600" />
                      TÜVTÜRK Periyodik Muayene
                    </h4>
                    {renderDaysBadge(calculateDaysLeft(vehicle.muayeneBitisTarihi), "Muayene")}
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Son Muayene Tarihi:</span>
                      <span className="font-semibold text-slate-800">{vehicle.sonMuayeneTarihi || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Muayene Bitiş Tarihi:</span>
                      <span className="font-bold text-rose-600">{vehicle.muayeneBitisTarihi || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Muayene Rapor No:</span>
                      <span className="font-mono text-slate-700">{vehicle.muayeneRaporNo || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Sonuç:</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded text-[11px]">
                        {vehicle.muayeneSonucu || "Geçti"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Muayene Ücreti:</span>
                      <span className="font-bold text-slate-800">{vehicle.muayeneUcreti ? `${vehicle.muayeneUcreti} ₺` : "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Egzoz Emisyon Ölçümü */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Stethoscope size={16} className="text-emerald-600" />
                      Egzoz Gazı Emisyon Ölçümü
                    </h4>
                    {renderDaysBadge(calculateDaysLeft(vehicle.egzozEmisyonBitis), "Emisyon")}
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Emisyon Bitiş Tarihi:</span>
                      <span className="font-bold text-slate-800">{vehicle.egzozEmisyonBitis || "-"}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-slate-500 block mb-1">Muayene Kusur Kayıtları / Notlar:</span>
                      <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs italic">
                        {vehicle.muayeneKusur || "Kayıtlı hafif kusur bulunmamaktadır. Araç muayeneden sorunsuz geçmiştir."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 4. SİGORTA & KASKO */}
          {activeTab === "sigorta" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Zorunlu Trafik Sigortası */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-600" />
                    Zorunlu Trafik Sigortası
                  </h4>
                  {renderDaysBadge(calculateDaysLeft(vehicle.trafikBitisTarihi), "Sigorta")}
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Sigorta Şirketi:</span>
                    <strong className="text-slate-800">{vehicle.trafikSigortaSirketi || "-"}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Poliçe Numarası:</span>
                    <span className="font-mono text-blue-700 font-bold">{vehicle.trafikPoliceNo || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Başlangıç Tarihi:</span>
                    <span className="text-slate-800">{vehicle.trafikBaslangicTarihi || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Bitiş Tarihi:</span>
                    <span className="font-bold text-rose-600">{vehicle.trafikBitisTarihi || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Poliçe Tutarı:</span>
                    <span className="font-bold text-slate-800">{vehicle.trafikTutar ? `${vehicle.trafikTutar.toLocaleString("tr-TR")} ₺` : "-"}</span>
                  </div>
                </div>
              </div>

              {/* Kasko Poliçesi */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3.5">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    Genişletilmiş Kasko Poliçesi
                  </h4>
                  {renderDaysBadge(calculateDaysLeft(vehicle.kaskoBitisTarihi), "Kasko")}
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Kasko Şirketi:</span>
                    <strong className="text-slate-800">{vehicle.kaskoSirketi || "-"}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Poliçe Numarası:</span>
                    <span className="font-mono text-indigo-700 font-bold">{vehicle.kaskoPoliceNo || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Bitiş Tarihi:</span>
                    <span className="font-bold text-rose-600">{vehicle.kaskoBitisTarihi || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">İMM / İkame Araç:</span>
                    <span className="font-medium text-slate-800">{vehicle.kaskoImm || "-"} / {vehicle.kaskoIkame || "-"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Kasko Prim Tutarı:</span>
                    <span className="font-bold text-slate-800">{vehicle.kaskoTutari ? `${vehicle.kaskoTutari.toLocaleString("tr-TR")} ₺` : "-"}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 5. BAKIM & SERVİS (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "bakim" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Wrench size={16} className="text-blue-600" />
                  Periyodik Bakım ve Onarım Geçmişi
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("bakim")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Bakım Ekle
                </button>
              </div>

              {/* Yeni Bakım Formu */}
              {showAddSubRecord === "bakim" && (
                <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-md animate-in fade-in">
                  <h5 className="text-xs font-bold text-blue-900 mb-3">Yeni Bakım Kaydı Formu</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <label className="text-slate-600 block mb-1">İşlem Türü</label>
                      <input
                        type="text"
                        value={bakimForm.islemTuru}
                        onChange={(e) => setBakimForm({ ...bakimForm, islemTuru: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: 40.000 KM Bakımı"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">İşlem Tarihi</label>
                      <input
                        type="date"
                        value={bakimForm.islemTarihi}
                        onChange={(e) => setBakimForm({ ...bakimForm, islemTarihi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">İşlem Kilometresi (KM)</label>
                      <input
                        type="number"
                        value={bakimForm.km}
                        onChange={(e) => setBakimForm({ ...bakimForm, km: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Sonraki Bakım KM</label>
                      <input
                        type="number"
                        value={bakimForm.sonrakiKm || ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, sonrakiKm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: 55000"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Fatura Tutarı (₺)</label>
                      <input
                        type="number"
                        value={bakimForm.tutar}
                        onChange={(e) => setBakimForm({ ...bakimForm, tutar: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Fatura Numarası</label>
                      <input
                        type="text"
                        value={bakimForm.faturaNo || ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, faturaNo: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="FAT-..."
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="text-slate-600 block mb-1">Açıklama / Değişen Parçalar</label>
                      <input
                        type="text"
                        value={bakimForm.aciklama || ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Yağ, filtreler, fren hidroliği değişti vb."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("bakim")}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {/* Bakım & Servis Kart Listesi */}
              {vehicle.bakimlar && vehicle.bakimlar.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.bakimlar.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-blue-300 transition flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Wrench size={15} />
                          </div>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900">{b.islemTuru}</h5>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar size={11} /> İşlem Tarihi: <strong className="text-slate-700">{b.islemTarihi}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold text-xs sm:text-sm">
                            {b.tutar.toLocaleString("tr-TR")} ₺
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("bakim", b.id)}
                            title="Kaydı Sil"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">İşlem Kilometresi</span>
                          <span className="font-mono font-bold text-slate-800">{b.km.toLocaleString("tr-TR")} KM</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Sonraki Bakım KM</span>
                          <span className="font-mono font-bold text-blue-700">
                            {b.sonrakiKm ? `${b.sonrakiKm.toLocaleString("tr-TR")} KM` : "Belirtilmedi"}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Fatura Numarası</span>
                          <span className="font-mono font-semibold text-slate-700">{b.faturaNo || "-"}</span>
                        </div>
                      </div>

                      {b.aciklama && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-xs text-slate-700">
                          <span className="font-bold text-blue-900 block mb-0.5 text-[11px]">Yapılan İşlemler & Açıklama:</span>
                          <p className="leading-relaxed whitespace-pre-wrap">{b.aciklama}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Kayıtlı bakım geçmişi bulunmuyor.
                </div>
              )}
            </div>
          )}

          {/* 6. LASTİK TAKİBİ (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "lastik" && (
            <div className="space-y-6">
              {/* 4 Takılı Lastik Kartı */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Disc size={16} className="text-rose-600" />
                  Araç Üzerinde Takılı 4 Lastik Durumu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { title: "Ön Sol", info: vehicle.onSolLastik },
                    { title: "Ön Sağ", info: vehicle.onSagLastik },
                    { title: "Arka Sol", info: vehicle.arkaSolLastik },
                    { title: "Arka Sağ", info: vehicle.arkaSagLastik },
                  ].map((tire, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{tire.title}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tire.info?.tur || "4 Mevsim"}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mb-1">{tire.info?.marka || "Marka Belirtilmedi"}</div>
                      <div className="text-xs text-slate-500 font-mono mb-2">{tire.info?.ebat || "Ebat Belirtilmedi"}</div>
                      <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Durum: {tire.info?.durum || "İyi"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lastik Değişim Geçmişi */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-700">Lastik Kayıt ve Değişim Geçmişi</h5>
                  <button
                    onClick={() => setShowAddSubRecord("lastik")}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus size={14} /> Yeni Lastik Ekle
                  </button>
                </div>

                {showAddSubRecord === "lastik" && (
                  <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-md">
                    <h5 className="text-xs font-bold text-rose-900 mb-3">Yeni Lastik Kaydı</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                      <div>
                        <label className="text-slate-600 block mb-1">Açıklama</label>
                        <input
                          type="text"
                          value={lastikForm.aciklama}
                          onChange={(e) => setLastikForm({ ...lastikForm, aciklama: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Konum</label>
                        <select
                          value={lastikForm.konum}
                          onChange={(e) => setLastikForm({ ...lastikForm, konum: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        >
                          <option value="Ön Sol">Ön Sol</option>
                          <option value="Ön Sağ">Ön Sağ</option>
                          <option value="Arka Sol">Arka Sol</option>
                          <option value="Arka Sağ">Arka Sağ</option>
                          <option value="Stepne">Stepne</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Marka</label>
                        <input
                          type="text"
                          value={lastikForm.marka}
                          onChange={(e) => setLastikForm({ ...lastikForm, marka: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Tür</label>
                        <select
                          value={lastikForm.tip}
                          onChange={(e) => setLastikForm({ ...lastikForm, tip: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        >
                          <option value="Yaz">Yaz</option>
                          <option value="Kış">Kış</option>
                          <option value="4 Mevsim">4 Mevsim</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddSubRecord(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        onClick={() => handleSaveSubRecord("lastik")}
                        className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg cursor-pointer"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}

                {vehicle.lastikler && vehicle.lastikler.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {vehicle.lastikler.map((l) => (
                      <div
                        key={l.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold">
                                {l.konum}
                              </span>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold">
                                {l.tip}
                              </span>
                            </div>
                            <h6 className="text-xs font-bold text-slate-800 mt-1.5">{l.aciklama}</h6>
                          </div>
                          <button
                            onClick={() => handleDeleteSubRecord("lastik", l.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Marka & Ebat</span>
                            <span className="font-semibold text-slate-800">
                              {l.marka} {l.tabanBoyutu ? `${l.tabanBoyutu}/${l.yanakGenisligi} R${l.jantCapi}` : ""}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Satın Alma</span>
                            <span className="font-medium text-slate-700">{l.satinAlmaTarihi || "-"}</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="text-[10px] text-slate-400 block">Basınç</span>
                            <span className="font-mono font-semibold text-slate-700">
                              {l.azamiHavaBasinciPsi ? `${l.azamiHavaBasinciPsi} PSI` : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                    Kayıtlı lastik geçmişi bulunmuyor.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. TRAFİK CEZALARI (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "ceza" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Receipt size={16} className="text-rose-600" />
                  Araca ve Sürücüye Kesilen Trafik Cezaları
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("ceza")}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Ceza Ekle
                </button>
              </div>

              {showAddSubRecord === "ceza" && (
                <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-md">
                  <h5 className="text-xs font-bold text-rose-900 mb-3">Yeni Trafik Cezası Kaydı</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Ceza Açıklaması</label>
                      <input
                        type="text"
                        value={cezaForm.aciklama}
                        onChange={(e) => setCezaForm({ ...cezaForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Tarih</label>
                      <input
                        type="date"
                        value={cezaForm.tarih}
                        onChange={(e) => setCezaForm({ ...cezaForm, tarih: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Ceza Tutarı (₺)</label>
                      <input
                        type="number"
                        value={cezaForm.cezaTutari}
                        onChange={(e) => setCezaForm({ ...cezaForm, cezaTutari: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Ceza Maddesi</label>
                      <input
                        type="text"
                        value={cezaForm.cezaMaddesi || ""}
                        onChange={(e) => setCezaForm({ ...cezaForm, cezaMaddesi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: 51/2-a"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Ceza Puanı</label>
                      <input
                        type="number"
                        value={cezaForm.cezaPuani || ""}
                        onChange={(e) => setCezaForm({ ...cezaForm, cezaPuani: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">İlgili Sürücü</label>
                      <input
                        type="text"
                        value={cezaForm.sofor || ""}
                        onChange={(e) => setCezaForm({ ...cezaForm, sofor: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Ad Soyad"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("ceza")}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.cezalar && vehicle.cezalar.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.cezalar.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-mono font-bold text-xs">
                            Madde: {c.cezaMaddesi || "Genel"}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900">{c.aciklama}</h5>
                            <span className="text-[11px] text-slate-500">Tarih: {c.tarih}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-semibold text-xs ${
                              c.odendiMi
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {c.odendiMi ? "Ödendi" : "Ödeme Bekliyor"}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs sm:text-sm">
                            {c.cezaTutari.toLocaleString("tr-TR")} ₺
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("ceza", c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">İlgili Sürücü</span>
                          <span className="font-semibold text-slate-800">{c.sofor || "-"}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Ceza Puanı</span>
                          <span className="font-bold text-slate-800">{c.cezaPuani || 0} Puan</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 block">Belge No / Rücu</span>
                          <span className="font-mono text-slate-700">{c.belgeNo || c.rucu || "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Bu araca ait kayıtlı ceza bulunmamaktadır.
                </div>
              )}
            </div>
          )}

          {/* 8. ARIZA BİLDİRİMLERİ (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "ariza" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Mekanik & Elektronik Arıza Bildirimleri
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("ariza")}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Arıza Bildirimi
                </button>
              </div>

              {showAddSubRecord === "ariza" && (
                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-md">
                  <h5 className="text-xs font-bold text-amber-900 mb-3">Yeni Arıza Kaydı</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 block mb-1">Arıza Tanımı / Belirtiler</label>
                      <input
                        type="text"
                        value={arizaForm.aciklama}
                        onChange={(e) => setArizaForm({ ...arizaForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Tarih</label>
                      <input
                        type="date"
                        value={arizaForm.tarih}
                        onChange={(e) => setArizaForm({ ...arizaForm, tarih: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Araç Yürür Durumda mı?</label>
                      <select
                        value={arizaForm.calisiyor ? "true" : "false"}
                        onChange={(e) => setArizaForm({ ...arizaForm, calisiyor: e.target.value === "true" })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value="true">Evet (Çalışıyor)</option>
                        <option value="false">Hayır (Kaldı)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Çekici Çağrıldı mı?</label>
                      <select
                        value={arizaForm.cekiciCagirildi ? "true" : "false"}
                        onChange={(e) => setArizaForm({ ...arizaForm, cekiciCagirildi: e.target.value === "true" })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value="false">Hayır</option>
                        <option value="true">Evet</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Tahmini / Toplam Maliyet (₺)</label>
                      <input
                        type="number"
                        value={arizaForm.toplamMaliyet || 0}
                        onChange={(e) => setArizaForm({ ...arizaForm, toplamMaliyet: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("ariza")}
                      className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.arizalar && vehicle.arizalar.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.arizalar.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">{a.aciklama}</h5>
                          <span className="text-[11px] text-slate-500">Bildirim Tarihi: {a.tarih}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-semibold rounded-lg text-xs">
                            {a.durum}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                            {(a.toplamMaliyet || 0).toLocaleString("tr-TR")} ₺
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("ariza", a.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                          <span className="text-slate-500">Yürür Durumda mı?</span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              a.calisiyor ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {a.calisiyor ? "Evet (Çalışıyor)" : "Hayır (Yolda Kaldı)"}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between">
                          <span className="text-slate-500">Çekici Çağrıldı mı?</span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              a.cekiciCagirildi ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {a.cekiciCagirildi ? "Evet Çağrıldı" : "Hayır"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Aktif veya geçmiş bir arıza kaydı bulunmamaktadır.
                </div>
              )}
            </div>
          )}

          {/* 9. KAZA & HASAR DOSYALARI (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "kaza" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" />
                  Kaza ve Hasar Dosyaları
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("kaza")}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Kaza Kaydı
                </button>
              </div>

              {showAddSubRecord === "kaza" && (
                <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-md">
                  <h5 className="text-xs font-bold text-rose-900 mb-3">Yeni Kaza & Hasar Kaydı</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 block mb-1">Kaza Açıklaması</label>
                      <input
                        type="text"
                        value={kazaForm.aciklama}
                        onChange={(e) => setKazaForm({ ...kazaForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Kaza Tarihi</label>
                      <input
                        type="date"
                        value={kazaForm.kazaTarihi}
                        onChange={(e) => setKazaForm({ ...kazaForm, kazaTarihi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Kaza Türü</label>
                      <select
                        value={kazaForm.tip}
                        onChange={(e) => setKazaForm({ ...kazaForm, tip: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value="Tek Araç">Tek Araç</option>
                        <option value="İki Araç">İki Araç</option>
                        <option value="Zincirleme">Zincirleme</option>
                        <option value="Park Halinde Hasar">Park Halinde Hasar</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Karşı Plaka</label>
                      <input
                        type="text"
                        value={kazaForm.karsiAracPlakasi || ""}
                        onChange={(e) => setKazaForm({ ...kazaForm, karsiAracPlakasi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: 06 ABC 12"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Toplam Hasar Tutarı (₺)</label>
                      <input
                        type="number"
                        value={kazaForm.toplamMaliyet || 0}
                        onChange={(e) => setKazaForm({ ...kazaForm, toplamMaliyet: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("kaza")}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.kazalar && vehicle.kazalar.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.kazalar.map((k) => (
                    <div
                      key={k.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs">
                            {k.tip}
                          </span>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900">{k.aciklama}</h5>
                            <span className="text-[11px] text-slate-500">Kaza Tarihi: {k.kazaTarihi}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs">
                            Dosya: {k.dosyaDurumu || "Açık"}
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono font-bold text-xs sm:text-sm">
                            {k.toplamMaliyet.toLocaleString("tr-TR")} ₺
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("kaza", k.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Karşı Araç Plakası</span>
                          <span className="font-mono font-bold text-slate-800">{k.karsiAracPlakasi || "-"}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Kusur / Dosya No</span>
                          <span className="font-semibold text-slate-700">{k.kusurOrani || k.belgeNo || "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Kayıtlı bir kaza ve hasar dosyası bulunmamaktadır.
                </div>
              )}
            </div>
          )}

          {/* 10. VERGİ (MTV) (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "vergi" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Landmark size={16} className="text-indigo-600" />
                  Motorlu Taşıtlar Vergisi (MTV) Kayıtları
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("vergi")}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni MTV Ekle
                </button>
              </div>

              {showAddSubRecord === "vergi" && (
                <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-md">
                  <h5 className="text-xs font-bold text-indigo-900 mb-3">Yeni Vergi / MTV Kaydı</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Vergi Türü</label>
                      <select
                        value={vergiForm.tip}
                        onChange={(e) => setVergiForm({ ...vergiForm, tip: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value="MTV 1. Taksit">MTV 1. Taksit</option>
                        <option value="MTV 2. Taksit">MTV 2. Taksit</option>
                        <option value="Ek MTV">Ek MTV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Ödeme Tarihi</label>
                      <input
                        type="date"
                        value={vergiForm.tarih}
                        onChange={(e) => setVergiForm({ ...vergiForm, tarih: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Vergi Tutarı (₺)</label>
                      <input
                        type="number"
                        value={vergiForm.vergiTutari}
                        onChange={(e) => setVergiForm({ ...vergiForm, vergiTutari: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Açıklama</label>
                      <input
                        type="text"
                        value={vergiForm.aciklama}
                        onChange={(e) => setVergiForm({ ...vergiForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("vergi")}
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.vergiler && vehicle.vergiler.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {vehicle.vergiler.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">
                            {v.tip}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800 mt-1.5">{v.aciklama}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-[11px]">
                            {v.odendiMi ? "Ödendi" : "Bekliyor"}
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("vergi", v.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs">
                        <span className="text-slate-500">Tarih: <strong className="text-slate-700">{v.tarih}</strong></span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {v.vergiTutari.toLocaleString("tr-TR")} ₺
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Kayıtlı vergi ödemesi bulunmamaktadır.
                </div>
              )}
            </div>
          )}

          {/* 11. TAHSİS & ZİMMET (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "tahsis" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck size={16} className="text-emerald-600" />
                  Araç Tahsis ve Zimmet Geçmişi
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("tahsis")}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Tahsis Yap
                </button>
              </div>

              {showAddSubRecord === "tahsis" && (
                <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-md">
                  <h5 className="text-xs font-bold text-emerald-900 mb-3">Yeni Araç Zimmeti / Tahsisi</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Zimmetlenen Personel</label>
                      <input
                        type="text"
                        value={tahsisForm.zimmetlenenKisi}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, zimmetlenenKisi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Ad Soyad"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Departman</label>
                      <input
                        type="text"
                        value={tahsisForm.departman || ""}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, departman: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: Saha Operasyon"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Tahsis Başlangıç Tarihi</label>
                      <input
                        type="date"
                        value={tahsisForm.tahsisBaslangicTarihi}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, tahsisBaslangicTarihi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Teslim KM</label>
                      <input
                        type="number"
                        value={tahsisForm.baslangicKm}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, baslangicKm: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 block mb-1">Zimmet Açıklaması</label>
                      <input
                        type="text"
                        value={tahsisForm.aciklama || ""}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Görev aracı olarak teslim edildi."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("tahsis")}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.tahsisler && vehicle.tahsisler.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.tahsisler.map((th) => (
                    <div
                      key={th.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            <UserCheck size={15} />
                          </div>
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900">{th.zimmetlenenKisi}</h5>
                            <span className="text-[11px] text-slate-500">{th.departman || "Genel Departman"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-semibold text-xs ${
                              th.aktifMi ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {th.aktifMi ? "Aktif Zimmet" : "Teslim Alındı"}
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("tahsis", th.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Başlangıç Tarihi</span>
                          <span className="font-semibold text-slate-800">{th.tahsisBaslangicTarihi}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Teslim Kilometresi</span>
                          <span className="font-mono font-bold text-slate-800">
                            {th.baslangicKm ? `${th.baslangicKm.toLocaleString("tr-TR")} KM` : "-"}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 block">Bitiş KM</span>
                          <span className="font-mono text-slate-600">
                            {th.bitisKm ? `${th.bitisKm.toLocaleString("tr-TR")} KM` : "Devam Ediyor"}
                          </span>
                        </div>
                      </div>
                      {th.aciklama && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                          {th.aciklama}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Kayıtlı bir tahsis veya zimmet geçmişi bulunmuyor.
                </div>
              )}
            </div>
          )}

          {/* 12. K2 TAŞIT KARTI (DÜZENLENEBİLİR) */}
          {activeTab === "k2" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard size={16} className="text-amber-600" />
                  K2 Taşıt Kartı Bilgileri
                </h4>
                <div className="flex items-center gap-2">
                  {renderDaysBadge(calculateDaysLeft(vehicle.k2Karti?.sonGecerlilikTarihi), "K2 Kart")}
                  {!isEditingK2 && (
                    <button
                      onClick={() => setIsEditingK2(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Edit size={13} />
                      K2 Bilgilerini Düzenle
                    </button>
                  )}
                </div>
              </div>

              {isEditingK2 ? (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-4 animate-in fade-in">
                  <h5 className="text-xs font-bold text-amber-900">K2 Taşıt Kartı Bilgilerini Güncelle</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">K2 Belge Numarası</label>
                      <input
                        type="text"
                        value={k2Form.belgeNumarasi || ""}
                        onChange={(e) => setK2Form({ ...k2Form, belgeNumarasi: e.target.value })}
                        placeholder="Örn: K2-34-99481"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-blue-700"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">Belge Veriliş Tarihi</label>
                      <input
                        type="date"
                        value={k2Form.belgeTarihi || ""}
                        onChange={(e) => setK2Form({ ...k2Form, belgeTarihi: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">Son Geçerlilik Tarihi</label>
                      <input
                        type="date"
                        value={k2Form.sonGecerlilikTarihi || ""}
                        onChange={(e) => setK2Form({ ...k2Form, sonGecerlilikTarihi: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-slate-700 font-semibold block mb-1">Açıklama / Belge Notu</label>
                      <textarea
                        rows={3}
                        value={k2Form.aciklama || ""}
                        onChange={(e) => setK2Form({ ...k2Form, aciklama: e.target.value })}
                        placeholder="Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı notları..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsEditingK2(false);
                        setK2Form({
                          belgeNumarasi: vehicle.k2Karti?.belgeNumarasi || "",
                          belgeTarihi: vehicle.k2Karti?.belgeTarihi || "",
                          sonGecerlilikTarihi: vehicle.k2Karti?.sonGecerlilikTarihi || "",
                          aciklama:
                            vehicle.k2Karti?.aciklama ||
                            "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı.",
                        });
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={handleSaveK2}
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save size={14} />
                      K2 Kartını Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-slate-500">K2 Belge Numarası:</span>
                      <strong className="font-mono text-blue-700 font-bold text-sm">
                        {vehicle.k2Karti?.belgeNumarasi || "Tanımlanmadı"}
                      </strong>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-50">
                      <span className="text-slate-500">Belge Veriliş Tarihi:</span>
                      <span className="text-slate-800 font-medium">{vehicle.k2Karti?.belgeTarihi || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Son Geçerlilik Tarihi:</span>
                      <span className="font-bold text-rose-600">{vehicle.k2Karti?.sonGecerlilikTarihi || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1.5">Açıklama / Belge Notu:</span>
                    <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 italic leading-relaxed">
                      {vehicle.k2Karti?.aciklama || "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 13. YEDEK PARÇA (COMPONENT / CARD BAZLI TASARIM) */}
          {activeTab === "yedekparca" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Cog size={16} className="text-slate-700" />
                  Yedek Parça ve Servis Onarım Kayıtları
                </h4>
                <button
                  onClick={() => setShowAddSubRecord("yedekparca")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={14} /> Yeni Parça Kaydı
                </button>
              </div>

              {showAddSubRecord === "yedekparca" && (
                <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-md">
                  <h5 className="text-xs font-bold text-slate-900 mb-3">Yeni Yedek Parça / Onarım</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Kayıt Türü</label>
                      <select
                        value={yedekParcaForm.tip}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, tip: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      >
                        <option value="Yedek Parça">Yedek Parça</option>
                        <option value="Tamir">Tamir</option>
                        <option value="Bakım">Bakım</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 block mb-1">Açıklama / İşlem</label>
                      <input
                        type="text"
                        value={yedekParcaForm.aciklama}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, aciklama: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Kullanılan Parçalar</label>
                      <input
                        type="text"
                        value={yedekParcaForm.kullanilanYedekParcalar || ""}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, kullanilanYedekParcalar: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: Fren diski, filtre"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Parça Bedeli (₺)</label>
                      <input
                        type="number"
                        value={yedekParcaForm.faturaTutari || 0}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, faturaTutari: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">İşçilik Bedeli (₺)</label>
                      <input
                        type="number"
                        value={yedekParcaForm.iscilikBedeli || 0}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, iscilikBedeli: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddSubRecord(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Vazgeç
                    </button>
                    <button
                      onClick={() => handleSaveSubRecord("yedekparca")}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              )}

              {vehicle.yedekParcalar && vehicle.yedekParcalar.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {vehicle.yedekParcalar.map((y) => (
                    <div
                      key={y.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs">
                            {y.tip}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">{y.aciklama}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs">
                            {y.durum}
                          </span>
                          <button
                            onClick={() => handleDeleteSubRecord("yedekparca", y.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl col-span-2">
                          <span className="text-[10px] text-slate-400 block">Kullanılan Yedek Parçalar</span>
                          <span className="font-semibold text-slate-800">{y.kullanilanYedekParcalar || "-"}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">Parça Bedeli</span>
                          <span className="font-mono font-bold text-slate-900">
                            {(y.faturaTutari || 0).toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-slate-400 block">İşçilik Bedeli</span>
                          <span className="font-mono font-bold text-slate-700">
                            {(y.iscilikBedeli || 0).toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                  Kayıtlı yedek parça veya onarım işlemi bulunmuyor.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
