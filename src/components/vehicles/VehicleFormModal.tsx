"use client";
import React, { useState, useEffect } from "react";
import { X, Car, Save, Shield, FileText, Wrench, Disc, Building, CreditCard } from "lucide-react";
import { Vehicle } from "@/src/types/vehicle";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
  initialVehicle?: Vehicle | null;
}

export default function VehicleFormModal({
  isOpen,
  onClose,
  onSave,
  initialVehicle,
}: VehicleFormModalProps) {
  const [activeFormTab, setActiveFormTab] = useState<"genel" | "ruhsat" | "sigorta" | "muayene" | "lastik" | "k2">("genel");

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plate: "",
    brandName: "",
    modelName: "",
    modelYili: 2023,
    vehicleLabel: "",
    vehicleType: "Otomobil",
    aracSinifi: "C Segment",
    rengi: "Beyaz",
    yakitTipi: "Dizel",
    vites: "Manuel",
    guncelKm: 0,
    durum: "Sahada",
    sahiplikDurumu: "Şirket Aracı",
    tanimliSofor: "",
    grupAdi: "",

    // Teknik
    motorNo: "",
    sasiNo: "",
    motorHacmi: "",
    motorGucu: "",
    koltukSayisi: "5",
    netAgirlik: "",

    // Kiralık
    kiraMaliyeti: undefined,
    kiraParaBirimi: "TL",
    kiraSuresi: "12 Ay",
    kiraBaslangicTarihi: "",
    kiraBitisTarihi: "",
    kiralayanSirket: "",

    // Ruhsat
    lisansSahibi: "Millturn Makina",
    belgeSeriNo: "",
    tescilSiraNo: "",
    tescilTarihi: "",
    verildigiIl: "İstanbul",
    verildigiIlce: "",
    ruhsatSonKullanmaTarihi: "",
    takograf: false,
    taksimetre: false,

    // Muayene
    muayeneRaporNo: "",
    sonMuayeneTarihi: "",
    muayeneBitisTarihi: "",
    muayeneSonucu: "Geçti",
    muayeneUcreti: undefined,
    egzozEmisyonBitis: "",

    // Sigorta & Kasko
    trafikSigortaSirketi: "",
    trafikPoliceNo: "",
    trafikBitisTarihi: "",
    trafikTutar: undefined,
    kaskoSirketi: "",
    kaskoPoliceNo: "",
    kaskoBitisTarihi: "",
    kaskoTutari: undefined,
    kaskoImm: "Sınırsız İMM",
    kaskoIkame: "15 Gün İkame",

    // Lastikler
    onSolLastik: { marka: "", ebat: "", tur: "4 Mevsim", durum: "İyi" },
    onSagLastik: { marka: "", ebat: "", tur: "4 Mevsim", durum: "İyi" },
    arkaSolLastik: { marka: "", ebat: "", tur: "4 Mevsim", durum: "İyi" },
    arkaSagLastik: { marka: "", ebat: "", tur: "4 Mevsim", durum: "İyi" },

    // K2 Taşıt Kartı
    k2Karti: {
      belgeNumarasi: "",
      belgeTarihi: "",
      sonGecerlilikTarihi: "",
      aciklama: "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı.",
    },
  });

  useEffect(() => {
    if (initialVehicle) {
      setFormData({
        ...initialVehicle,
        k2Karti: initialVehicle.k2Karti || {
          belgeNumarasi: "",
          belgeTarihi: "",
          sonGecerlilikTarihi: "",
          aciklama: "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı.",
        },
      });
    } else {
      setFormData({
        plate: "",
        brandName: "",
        modelName: "",
        modelYili: 2023,
        vehicleLabel: "",
        vehicleType: "Otomobil",
        aracSinifi: "C Segment",
        rengi: "Beyaz",
        yakitTipi: "Dizel",
        vites: "Manuel",
        guncelKm: 0,
        durum: "Sahada",
        sahiplikDurumu: "Şirket Aracı",
        tanimliSofor: "",
        grupAdi: "",
        lisansSahibi: "Millturn Makina",
        verildigiIl: "İstanbul",
        muayeneSonucu: "Geçti",
        onSolLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
        onSagLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
        arkaSolLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
        arkaSagLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
        k2Karti: {
          belgeNumarasi: "",
          belgeTarihi: "",
          sonGecerlilikTarihi: "",
          aciklama: "Ulaştırma ve Altyapı Bakanlığı K2 Yetki Belgesi ve Taşıt Kartı kaydı.",
        },
      });
    }
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plate?.trim()) {
      alert("Lütfen araç plakasını giriniz!");
      return;
    }
    if (!formData.brandName?.trim()) {
      alert("Lütfen marka adını giriniz!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Üst Başlık */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Car size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialVehicle ? `Aracı Düzenle (${initialVehicle.plate})` : "Yeni Araç Kaydı"}
              </h3>
              <p className="text-xs text-slate-400">
                KonforFuel araç yönetim ve takip parametreleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Sekmeleri */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto shrink-0">
          {[
            { key: "genel", label: "Genel & Özellikler", icon: <Car size={15} /> },
            { key: "ruhsat", label: "Ruhsat Bilgileri", icon: <FileText size={15} /> },
            { key: "sigorta", label: "Sigorta & Kasko", icon: <Shield size={15} /> },
            { key: "muayene", label: "Muayene & Egzoz", icon: <Wrench size={15} /> },
            { key: "lastik", label: "Takılı Lastikler", icon: <Disc size={15} /> },
            { key: "k2", label: "K2 Taşıt Kartı", icon: <CreditCard size={15} /> },
          ].map((tab) => {
            const isActive = activeFormTab === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveFormTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form İçeriği */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          
          {/* 1. GENEL & ÖZELLİKLER */}
          {activeFormTab === "genel" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Plaka <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    placeholder="34 KNF 101"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-sm text-blue-700 uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Marka <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Renault, Ford, Fiat..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    placeholder="Megane, Transit, Egea..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Model Yılı</label>
                  <input
                    type="number"
                    value={formData.modelYili || 2023}
                    onChange={(e) => setFormData({ ...formData, modelYili: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Yakıt Türü</label>
                  <select
                    value={formData.yakitTipi}
                    onChange={(e) => setFormData({ ...formData, yakitTipi: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Dizel">Dizel (Motorin)</option>
                    <option value="Benzin">Benzin</option>
                    <option value="Hibrit">Hibrit</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Vites Tipi</label>
                  <select
                    value={formData.vites}
                    onChange={(e) => setFormData({ ...formData, vites: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Manuel">Manuel</option>
                    <option value="Otomatik">Otomatik</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Mülkiyet Durumu</label>
                  <select
                    value={formData.sahiplikDurumu}
                    onChange={(e) => setFormData({ ...formData, sahiplikDurumu: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-blue-700"
                  >
                    <option value="Şirket Aracı">Şirket Öz Malı</option>
                    <option value="Kiralık">Kiralık Araç</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Operasyon Durumu</label>
                  <select
                    value={formData.durum}
                    onChange={(e) => setFormData({ ...formData, durum: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Sahada">Sahada (Aktif)</option>
                    <option value="Havuzda">Havuzda (Boşta)</option>
                    <option value="Serviste">Serviste (Onarımda)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Güncel Kilometre (KM)</label>
                  <input
                    type="number"
                    value={formData.guncelKm || 0}
                    onChange={(e) => setFormData({ ...formData, guncelKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Tanımlı Sürücü</label>
                  <input
                    type="text"
                    value={formData.tanimliSofor || ""}
                    onChange={(e) => setFormData({ ...formData, tanimliSofor: e.target.value })}
                    placeholder="Bahri Yılmaz"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Grup / Departman</label>
                  <input
                    type="text"
                    value={formData.grupAdi || ""}
                    onChange={(e) => setFormData({ ...formData, grupAdi: e.target.value })}
                    placeholder="Saha Operasyon"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Araç Etiketi / Kod</label>
                  <input
                    type="text"
                    value={formData.vehicleLabel || ""}
                    onChange={(e) => setFormData({ ...formData, vehicleLabel: e.target.value })}
                    placeholder="FİLO-01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Kiralık Araç Ek Alanları */}
              {formData.sahiplikDurumu === "Kiralık" && (
                <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 mt-3 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Building size={14} /> Kiralama Sözleşmesi Detayları
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1">Aylık Kira Bedeli</label>
                      <input
                        type="number"
                        value={formData.kiraMaliyeti || ""}
                        onChange={(e) => setFormData({ ...formData, kiraMaliyeti: Number(e.target.value) })}
                        placeholder="35000"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Kiralayan Filo Şirketi</label>
                      <input
                        type="text"
                        value={formData.kiralayanSirket || ""}
                        onChange={(e) => setFormData({ ...formData, kiralayanSirket: e.target.value })}
                        placeholder="LeasePlan, Hedef Filo..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Sözleşme Başlangıç</label>
                      <input
                        type="date"
                        value={formData.kiraBaslangicTarihi || ""}
                        onChange={(e) => setFormData({ ...formData, kiraBaslangicTarihi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Sözleşme Bitiş</label>
                      <input
                        type="date"
                        value={formData.kiraBitisTarihi || ""}
                        onChange={(e) => setFormData({ ...formData, kiraBitisTarihi: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. RUHSAT BİLGİLERİ */}
          {activeFormTab === "ruhsat" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Lisans Sahibi</label>
                <input
                  type="text"
                  value={formData.lisansSahibi || ""}
                  onChange={(e) => setFormData({ ...formData, lisansSahibi: e.target.value })}
                  placeholder="Millturn Makina"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Tescil Belgesi Seri No</label>
                <input
                  type="text"
                  value={formData.tescilBelgesiSeriNo || formData.belgeSeriNo || ""}
                  onChange={(e) => setFormData({ ...formData, tescilBelgesiSeriNo: e.target.value })}
                  placeholder="AA 123456"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Tescil Sıra No</label>
                <input
                  type="text"
                  value={formData.tescilSiraNo || ""}
                  onChange={(e) => setFormData({ ...formData, tescilSiraNo: e.target.value })}
                  placeholder="34-101-2023"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Tescil Tarihi</label>
                <input
                  type="date"
                  value={formData.tescilTarihi || ""}
                  onChange={(e) => setFormData({ ...formData, tescilTarihi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Verildiği İl</label>
                <input
                  type="text"
                  value={formData.verildigiIl || ""}
                  onChange={(e) => setFormData({ ...formData, verildigiIl: e.target.value })}
                  placeholder="İstanbul"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Verildiği İlçe</label>
                <input
                  type="text"
                  value={formData.verildigiIlce || ""}
                  onChange={(e) => setFormData({ ...formData, verildigiIlce: e.target.value })}
                  placeholder="Kartal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Motor Numarası</label>
                <input
                  type="text"
                  value={formData.motorNo || ""}
                  onChange={(e) => setFormData({ ...formData, motorNo: e.target.value })}
                  placeholder="K9K..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Şasi Numarası (VIN)</label>
                <input
                  type="text"
                  value={formData.sasiNo || ""}
                  onChange={(e) => setFormData({ ...formData, sasiNo: e.target.value })}
                  placeholder="VF1..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>
              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.takograf || false}
                    onChange={(e) => setFormData({ ...formData, takograf: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Takograf Var</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.taksimetre || false}
                    onChange={(e) => setFormData({ ...formData, taksimetre: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Taksimetre Var</span>
                </label>
              </div>
            </div>
          )}

          {/* 3. SİGORTA & KASKO */}
          {activeFormTab === "sigorta" && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield size={14} className="text-blue-600" /> Zorunlu Trafik Sigortası
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Sigorta Şirketi</label>
                    <input
                      type="text"
                      value={formData.trafikSigortaSirketi || ""}
                      onChange={(e) => setFormData({ ...formData, trafikSigortaSirketi: e.target.value })}
                      placeholder="Anadolu, Axa, Sompo..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Poliçe Numarası</label>
                    <input
                      type="text"
                      value={formData.trafikPoliceNo || ""}
                      onChange={(e) => setFormData({ ...formData, trafikPoliceNo: e.target.value })}
                      placeholder="POL-12345"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={formData.trafikBitisTarihi || ""}
                      onChange={(e) => setFormData({ ...formData, trafikBitisTarihi: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Poliçe Tutarı (₺)</label>
                    <input
                      type="number"
                      value={formData.trafikTutar || ""}
                      onChange={(e) => setFormData({ ...formData, trafikTutar: Number(e.target.value) })}
                      placeholder="8500"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Shield size={14} className="text-indigo-600" /> Kasko Poliçesi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Kasko Şirketi</label>
                    <input
                      type="text"
                      value={formData.kaskoSirketi || ""}
                      onChange={(e) => setFormData({ ...formData, kaskoSirketi: e.target.value })}
                      placeholder="Allianz, Axa..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Kasko Poliçe No</label>
                    <input
                      type="text"
                      value={formData.kaskoPoliceNo || ""}
                      onChange={(e) => setFormData({ ...formData, kaskoPoliceNo: e.target.value })}
                      placeholder="KSK-98765"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Kasko Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={formData.kaskoBitisTarihi || ""}
                      onChange={(e) => setFormData({ ...formData, kaskoBitisTarihi: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Kasko Tutarı (₺)</label>
                    <input
                      type="number"
                      value={formData.kaskoTutari || ""}
                      onChange={(e) => setFormData({ ...formData, kaskoTutari: Number(e.target.value) })}
                      placeholder="21000"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. MUAYENE & EGZOZ */}
          {activeFormTab === "muayene" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">TÜVTÜRK Muayene Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formData.muayeneBitisTarihi || ""}
                  onChange={(e) => setFormData({ ...formData, muayeneBitisTarihi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Son Muayene Tarihi</label>
                <input
                  type="date"
                  value={formData.sonMuayeneTarihi || ""}
                  onChange={(e) => setFormData({ ...formData, sonMuayeneTarihi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Muayene Rapor No</label>
                <input
                  type="text"
                  value={formData.muayeneRaporNo || ""}
                  onChange={(e) => setFormData({ ...formData, muayeneRaporNo: e.target.value })}
                  placeholder="TUV-34-..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Egzoz Emisyon Bitiş Tarihi</label>
                <input
                  type="date"
                  value={formData.egzozEmisyonBitis || ""}
                  onChange={(e) => setFormData({ ...formData, egzozEmisyonBitis: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Muayene Ücreti (₺)</label>
                <input
                  type="number"
                  value={formData.muayeneUcreti || ""}
                  onChange={(e) => setFormData({ ...formData, muayeneUcreti: Number(e.target.value) })}
                  placeholder="1820"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Muayene Sonucu</label>
                <select
                  value={formData.muayeneSonucu || "Geçti"}
                  onChange={(e) => setFormData({ ...formData, muayeneSonucu: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Geçti">Kusursuz Geçti</option>
                  <option value="Kusurlu Geçti">Hafif Kusurlu Geçti</option>
                  <option value="Kaldı">Kaldı (Muayene Tekrarı)</option>
                </select>
              </div>
            </div>
          )}

          {/* 5. TAKILI LASTİKLER */}
          {activeFormTab === "lastik" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { label: "Ön Sol Lastik", key: "onSolLastik" },
                { label: "Ön Sağ Lastik", key: "onSagLastik" },
                { label: "Arka Sol Lastik", key: "arkaSolLastik" },
                { label: "Arka Sağ Lastik", key: "arkaSagLastik" },
              ].map((pos) => {
                const tire = (formData as any)[pos.key] || {};
                return (
                  <div key={pos.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 block">{pos.label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-500 block mb-0.5">Marka</label>
                        <input
                          type="text"
                          value={tire.marka || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [pos.key]: { ...tire, marka: e.target.value },
                            })
                          }
                          placeholder="Michelin, Continental..."
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-0.5">Ebat</label>
                        <input
                          type="text"
                          value={tire.ebat || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [pos.key]: { ...tire, ebat: e.target.value },
                            })
                          }
                          placeholder="205/55 R16"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-0.5">Mevsim / Tür</label>
                        <select
                          value={tire.tur || "4 Mevsim"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [pos.key]: { ...tire, tur: e.target.value },
                            })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="4 Mevsim">4 Mevsim</option>
                          <option value="Yaz">Yaz</option>
                          <option value="Kış">Kış</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-0.5">Durum</label>
                        <select
                          value={tire.durum || "İyi"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [pos.key]: { ...tire, durum: e.target.value },
                            })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Yeni">Yeni</option>
                          <option value="İyi">İyi</option>
                          <option value="Orta">Orta</option>
                          <option value="Aşınmış">Aşınmış</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 6. K2 TAŞIT KARTI */}
          {activeFormTab === "k2" && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard size={15} className="text-amber-600" />
                Ulaştırma Bakanlığı K2 Taşıt Kartı Bilgileri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">K2 Belge Numarası</label>
                  <input
                    type="text"
                    value={formData.k2Karti?.belgeNumarasi || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        k2Karti: {
                          belgeNumarasi: e.target.value,
                          belgeTarihi: formData.k2Karti?.belgeTarihi,
                          sonGecerlilikTarihi: formData.k2Karti?.sonGecerlilikTarihi,
                          aciklama: formData.k2Karti?.aciklama,
                        },
                      })
                    }
                    placeholder="Örn: K2-34-99481"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Belge Veriliş Tarihi</label>
                  <input
                    type="date"
                    value={formData.k2Karti?.belgeTarihi || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        k2Karti: {
                          belgeNumarasi: formData.k2Karti?.belgeNumarasi || "",
                          belgeTarihi: e.target.value,
                          sonGecerlilikTarihi: formData.k2Karti?.sonGecerlilikTarihi,
                          aciklama: formData.k2Karti?.aciklama,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Son Geçerlilik Tarihi</label>
                  <input
                    type="date"
                    value={formData.k2Karti?.sonGecerlilikTarihi || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        k2Karti: {
                          belgeNumarasi: formData.k2Karti?.belgeNumarasi || "",
                          belgeTarihi: formData.k2Karti?.belgeTarihi,
                          sonGecerlilikTarihi: e.target.value,
                          aciklama: formData.k2Karti?.aciklama,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-slate-700 font-semibold block mb-1">Açıklama / Belge Notu</label>
                  <textarea
                    rows={3}
                    value={formData.k2Karti?.aciklama || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        k2Karti: {
                          belgeNumarasi: formData.k2Karti?.belgeNumarasi || "",
                          belgeTarihi: formData.k2Karti?.belgeTarihi,
                          sonGecerlilikTarihi: formData.k2Karti?.sonGecerlilikTarihi,
                          aciklama: e.target.value,
                        },
                      })
                    }
                    placeholder="K2 Taşıt Kartı ve Yetki Belgesi detayları..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Alt Butonları */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} />
              {initialVehicle ? "Değişiklikleri Güncelle" : "Aracı Kaydet"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
