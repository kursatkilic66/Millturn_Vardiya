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
  RefreshCw,
  ArrowLeftRight,
  History,
  Gauge,
} from "lucide-react";
import {
  Vehicle,
  MaintenanceRecord,
  TireRecord,
  TireLogEntry,
  ActiveTireInfo,
  FineRecord,
  DamageRecord,
  BreakdownRecord,
  TaxRecord,
  AssignmentRecord,
  SparePartRecord,
  K2Card,
} from "@/src/types/vehicle";
import { useToast } from "@/src/components/ToastProvider";

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateVehicle: (updated: Vehicle) => Promise<void> | void;
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

const todayStr = () => new Date().toISOString().split("T")[0];

const parseNumInput = (val: string): number | undefined =>
  val === "" ? undefined : Number(val);

export default function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onUpdateVehicle,
  onEditVehicleDetails,
}: VehicleDetailModalProps) {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("genel");

  // Hızlı alt kayıt ekleme form görünürlüğü ve kayıt durumu
  const [showAddSubRecord, setShowAddSubRecord] = useState<TabKey | null>(null);
  const [subRecordError, setSubRecordError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Form State'leri (para/sayı alanları başlangıçta boş/undefined gelir, başta 0 kalmaz)
  const [bakimForm, setBakimForm] = useState<Partial<MaintenanceRecord>>({
    islemTuru: "Periyodik Bakım",
    tutar: undefined,
    km: undefined,
    islemTarihi: todayStr(),
  });

  const [lastikForm, setLastikForm] = useState<Partial<TireRecord> & { setOlarakEkle?: boolean }>({
    konum: "Ön Sol",
    tip: "4 Mevsim",
    marka: "Michelin",
    ebat: "205/55 R16",
    kondisyon: "Yeni",
    aciklama: "Lastik Kaydı",
    setOlarakEkle: false,
  });

  // "Lastikleri Değiştir" Alanı State'leri (Önce değişecek lastikler seçilir, sonra tek seferde KM sorulur)
  const [showTireChangePanel, setShowTireChangePanel] = useState<boolean>(false);
  const [tireChangeSelections, setTireChangeSelections] = useState<
    Record<"Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ", string>
  >({
    "Ön Sol": "",
    "Ön Sağ": "",
    "Arka Sol": "",
    "Arka Sağ": "",
  });
  const [tireChangeKm, setTireChangeKm] = useState<number | undefined>(undefined);
  const [quickSwapTipFilter, setQuickSwapTipFilter] = useState<"Tümü" | "Yaz" | "Kış" | "4 Mevsim">("Tümü");
  const [tireListFilter, setTireListFilter] = useState<"tumu" | "takili" | "yedek">("tumu");

  const [cezaForm, setCezaForm] = useState<Partial<FineRecord>>({
    cezaTutari: undefined,
    tarih: todayStr(),
    aciklama: "Trafik Cezası",
    odendiMi: true,
  });

  const [arizaForm, setArizaForm] = useState<Partial<BreakdownRecord>>({
    tarih: todayStr(),
    calisiyor: true,
    cekiciCagirildi: false,
    durum: "Açık",
    aciklama: "Arıza Tespiti",
    toplamMaliyet: undefined,
  });

  const [kazaForm, setKazaForm] = useState<Partial<DamageRecord>>({
    kazaTarihi: todayStr(),
    tip: "İki Araç",
    toplamMaliyet: undefined,
    aciklama: "Maddi Hasarlı Kaza",
    dosyaDurumu: "Açık",
  });

  const [vergiForm, setVergiForm] = useState<Partial<TaxRecord>>({
    tip: "MTV 1. Taksit",
    tarih: todayStr(),
    vergiTutari: undefined,
    odendiMi: true,
    aciklama: "MTV Ödemesi",
  });

  const [tahsisForm, setTahsisForm] = useState<Partial<AssignmentRecord>>({
    tahsisBaslangicTarihi: todayStr(),
    baslangicKm: undefined,
    aktifMi: true,
    zimmetlenenKisi: "",
    departman: "",
  });

  const [yedekParcaForm, setYedekParcaForm] = useState<Partial<SparePartRecord>>({
    tip: "Yedek Parça",
    aciklama: "Parça Değişimi",
    durum: "Tamamlandı",
    faturaTutari: undefined,
    iscilikBedeli: undefined,
    aracKm: undefined,
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
  const handleSaveK2 = async () => {
    setSubRecordError(null);
    setIsSaving(true);
    try {
      const updated: Vehicle = {
        ...vehicle,
        k2Karti: {
          belgeNumarasi: k2Form.belgeNumarasi?.trim() || "",
          belgeTarihi: k2Form.belgeTarihi || "",
          sonGecerlilikTarihi: k2Form.sonGecerlilikTarihi || "",
          aciklama: k2Form.aciklama?.trim() || "",
        },
      };
      await onUpdateVehicle(updated);
      setIsEditingK2(false);
      showSuccess("K2 Taşıt Kartı başarıyla güncellendi.");
    } catch {
      setSubRecordError("K2 Taşıt Kartı kaydedilemedi. Lütfen tekrar deneyin.");
      showError("K2 Taşıt Kartı kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const WHEEL_SLOTS: {
    konum: "Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ";
    field: "onSolLastik" | "onSagLastik" | "arkaSolLastik" | "arkaSagLastik";
  }[] = [
    { konum: "Ön Sol", field: "onSolLastik" },
    { konum: "Ön Sağ", field: "onSagLastik" },
    { konum: "Arka Sol", field: "arkaSolLastik" },
    { konum: "Arka Sağ", field: "arkaSagLastik" },
  ];

  const formatTireEbat = (t?: Partial<TireRecord> | null): string => {
    if (!t) return "Ebat Belirtilmedi";
    if (t.ebat && t.ebat.trim()) return t.ebat.trim();
    if (t.tabanBoyutu && t.yanakGenisligi && t.jantCapi) {
      return `${t.tabanBoyutu}/${t.yanakGenisligi} R${t.jantCapi}`;
    }
    if (t.tabanBoyutu) return `${t.tabanBoyutu}`;
    return "205/55 R16";
  };

  /**
   * Araçtaki tüm lastikleri (hem `lastikler` listesindekileri hem de daha önce
   * `onSolLastik` vb. alanlarda tanımlanmış başlangıç lastiklerini) tek bir SSOT
   * listesinde birleştirir. Böylece eski araçlardaki takılı lastikler de söküldüğünde
   * kaybolmaz ve loglarıyla birlikte listede kalır.
   */
  const getNormalizedTires = (v: Vehicle): TireRecord[] => {
    const list: TireRecord[] = (v.lastikler || []).map((t) => ({
      ...t,
      ebat: formatTireEbat(t),
      kondisyon: t.kondisyon || "İyi",
      takiliMi: t.takiliMi ?? false,
      loglar:
        t.loglar && t.loglar.length > 0
          ? t.loglar
          : [
              {
                id: `log_init_${t.id}`,
                tarih: t.sonIslemTarihi || t.satinAlmaTarihi || v.createdAt?.split("T")[0] || todayStr(),
                islem: t.takiliMi ? `Araç üzerinde (${t.konum}) kayıtlı` : `Sisteme kayıtlı (${t.konum})`,
                konum: t.konum,
                km: t.islemKm ?? v.guncelKm ?? 0,
                aciklama: t.aciklama,
              },
            ],
    }));

    for (const slot of WHEEL_SLOTS) {
      const hasMountedInList = list.some((t) => t.takiliMi && t.konum === slot.konum);
      const slotInfo = v[slot.field];
      const initId = `init_${v.id}_${slot.field}`;
      const alreadyExistsById = list.some((t) => t.id === initId);

      if (!hasMountedInList && !alreadyExistsById && slotInfo && slotInfo.marka && slotInfo.marka.trim() !== "") {
        list.push({
          id: initId,
          aciklama: `${slot.konum} Başlangıç Lastiği`,
          konum: slot.konum,
          marka: slotInfo.marka,
          ebat: slotInfo.ebat || "205/55 R16",
          tip: slotInfo.tur || "4 Mevsim",
          kondisyon: slotInfo.durum || "İyi",
          takiliMi: true,
          islemKm: v.guncelKm || 0,
          sonIslemTarihi: v.createdAt?.split("T")[0] || todayStr(),
          loglar: [
            {
              id: `log_${initId}`,
              tarih: v.createdAt?.split("T")[0] || todayStr(),
              islem: `Araç üzerinde (${slot.konum}) takılı olarak tanımlandı`,
              konum: slot.konum,
              km: v.guncelKm || 0,
            },
          ],
        });
      }
    }

    return list;
  };

  /**
   * `lastikler` listesindeki takılı (`takiliMi === true`) lastikleri aracın
   * `onSolLastik`, `onSagLastik`, `arkaSolLastik`, `arkaSagLastik` alanlarıyla senkronize eder.
   */
  const syncActiveTireSlots = (v: Vehicle, tires: TireRecord[]): Vehicle => {
    const next = { ...v, lastikler: tires };
    for (const slot of WHEEL_SLOTS) {
      const mounted = tires.find((t) => t.takiliMi && t.konum === slot.konum);
      if (mounted) {
        next[slot.field] = {
          marka: mounted.marka,
          ebat: formatTireEbat(mounted),
          tur: mounted.tip,
          durum: mounted.kondisyon || "İyi",
        };
      } else {
        next[slot.field] = {
          marka: "",
          ebat: "",
          tur: "4 Mevsim",
          durum: "İyi",
        };
      }
    }
    return next;
  };

  const allTires = getNormalizedTires(vehicle);

  // Belirli bir tekerlek konumu için listeden yedek lastik seçme (Aynı yedek lastik başka konuma seçilmişse oradan temizler)
  const handleSelectTireForSlot = (
    slotKonum: "Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ",
    value: string,
  ) => {
    setTireChangeSelections((prev) => {
      const next = { ...prev };
      if (value && value !== "__UNMOUNT__") {
        for (const k of ["Ön Sol", "Ön Sağ", "Arka Sol", "Arka Sağ"] as const) {
          if (k !== slotKonum && next[k] === value) {
            next[k] = "";
          }
        }
      }
      next[slotKonum] = value;
      return next;
    });
  };

  // Yedekteki lastikleri tek tuşla konumlarına otomatik yerleştirme (4'ten az varsa sadece bulunanları seçer)
  const handleAutoFillSpareSelections = (
    filterOverride?: "Tümü" | "Yaz" | "Kış" | "4 Mevsim",
  ) => {
    const activeFilter = filterOverride ?? quickSwapTipFilter;
    const sparePool = allTires.filter(
      (t) => !t.takiliMi && (activeFilter === "Tümü" || t.tip === activeFilter),
    );
    const usedIds = new Set<string>();
    const nextSelections: Record<"Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ", string> = {
      "Ön Sol": "",
      "Ön Sağ": "",
      "Arka Sol": "",
      "Arka Sağ": "",
    };

    // 1. Öncelik: Kendi konumuna ("Ön Sol" vb.) kayıtlı yedek lastikleri eşleştir
    for (const slot of WHEEL_SLOTS) {
      const exactMatch = sparePool.find(
        (t) => t.konum === slot.konum && !usedIds.has(t.id),
      );
      if (exactMatch) {
        usedIds.add(exactMatch.id);
        nextSelections[slot.konum] = exactMatch.id;
      }
    }

    // 2. Kendi konumunda bulamayan varsa ve boşta yedek (Stepne vb.) kalmışsa sırayla yerleştir
    for (const slot of WHEEL_SLOTS) {
      if (!nextSelections[slot.konum]) {
        const fallback = sparePool.find((t) => !usedIds.has(t.id));
        if (fallback) {
          usedIds.add(fallback.id);
          nextSelections[slot.konum] = fallback.id;
        }
      }
    }

    setTireChangeSelections(nextSelections);
  };

  // Seçilen lastikleri araca takma / değiştirme ve tek seferde KM güncelleme
  const handleApplyTireChanges = async () => {
    const activeSlots = WHEEL_SLOTS.filter(
      (s) => tireChangeSelections[s.konum] && tireChangeSelections[s.konum] !== "",
    );

    if (activeSlots.length === 0) {
      setSubRecordError("Lütfen en az bir tekerlek konumu için listeden takılacak yedek lastiği seçiniz.");
      showError("Değiştirilecek lastik seçilmedi.");
      return;
    }

    if (tireChangeKm === undefined || isNaN(Number(tireChangeKm)) || Number(tireChangeKm) < 0) {
      setSubRecordError("Lütfen aracın güncel kilometresini (KM) giriniz.");
      showError("Lütfen aracın güncel KM bilgisini giriniz.");
      return;
    }

    setSubRecordError(null);
    setIsSaving(true);
    const girilenKm = Number(tireChangeKm);
    const nowDate = todayStr();

    // Hangi mevcut takılı lastikler sökülecek ve hangi yedek lastikler hangi konuma takılacak belirle
    const unmountSlotMap = new Map<string, "Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ">();
    const mountSlotMap = new Map<string, "Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ">();

    for (const slot of activeSlots) {
      const selVal = tireChangeSelections[slot.konum];
      const currentMounted = allTires.find((t) => t.takiliMi && t.konum === slot.konum);

      if (currentMounted && currentMounted.id !== selVal) {
        unmountSlotMap.set(currentMounted.id, slot.konum);
      }

      if (selVal !== "__UNMOUNT__") {
        mountSlotMap.set(selVal, slot.konum);
      }
    }

    const updatedTires = allTires.map((t) => {
      if (unmountSlotMap.has(t.id)) {
        const pos = unmountSlotMap.get(t.id)!;
        const logEntry: TireLogEntry = {
          id: `log_${Date.now()}_out_${t.id}`,
          tarih: nowDate,
          islem: `${pos} konumundan çıkarıldı (Yedeğe alındı)`,
          konum: pos,
          km: girilenKm,
        };
        return {
          ...t,
          takiliMi: false,
          islemKm: girilenKm,
          sonIslemTarihi: nowDate,
          loglar: [logEntry, ...(t.loglar || [])],
        };
      }

      if (mountSlotMap.has(t.id)) {
        const pos = mountSlotMap.get(t.id)!;
        const logEntry: TireLogEntry = {
          id: `log_${Date.now()}_in_${t.id}`,
          tarih: nowDate,
          islem: `${pos} konumuna takıldı`,
          konum: pos,
          km: girilenKm,
        };
        return {
          ...t,
          konum: pos,
          takiliMi: true,
          islemKm: girilenKm,
          sonIslemTarihi: nowDate,
          loglar: [logEntry, ...(t.loglar || [])],
        };
      }

      return t;
    });

    const syncedVehicle = syncActiveTireSlots(
      { ...vehicle, guncelKm: girilenKm },
      updatedTires,
    );

    try {
      await onUpdateVehicle(syncedVehicle);
      setShowTireChangePanel(false);
      setTireChangeSelections({
        "Ön Sol": "",
        "Ön Sağ": "",
        "Arka Sol": "",
        "Arka Sağ": "",
      });
      setTireChangeKm(undefined);
      showSuccess(
        `${activeSlots.length} tekerlek için lastik değişimi tamamlandı ve aracın güncel KM'si (${girilenKm.toLocaleString("tr-TR")} KM) olarak güncellendi.`,
      );
    } catch {
      setSubRecordError("Lastik değişimi kaydedilemedi. Lütfen tekrar deneyin.");
      showError("Lastik değişimi sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Alt kayıt silme işlemi
  const handleDeleteSubRecord = async (type: TabKey, recordId: string) => {
    setSubRecordError(null);
    let updated: Vehicle = { ...vehicle };
    if (type === "bakim") {
      updated.bakimlar = (updated.bakimlar || []).filter((r) => r.id !== recordId);
    } else if (type === "lastik") {
      const remainingTires = allTires.filter((r) => r.id !== recordId);
      updated = syncActiveTireSlots(updated, remainingTires);
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
    try {
      await onUpdateVehicle(updated);
      showSuccess("Kayıt başarıyla silindi.");
    } catch {
      setSubRecordError("Kayıt silinemedi. Lütfen tekrar deneyin.");
      showError("Kayıt silinirken bir hata oluştu.");
    }
  };

  // Alt kayıt ekleme işlemleri
  const handleSaveSubRecord = async (type: TabKey) => {
    setSubRecordError(null);
    setIsSaving(true);
    let updated: Vehicle = { ...vehicle };

    if (type === "bakim") {
      const islemKm = bakimForm.km !== undefined && bakimForm.km > 0 ? Number(bakimForm.km) : vehicle.guncelKm;
      const newRec: MaintenanceRecord = {
        id: "b_" + Date.now(),
        islemTuru: bakimForm.islemTuru?.trim() || "Periyodik Bakım",
        islemTarihi: bakimForm.islemTarihi || todayStr(),
        km: islemKm,
        sonrakiKm: bakimForm.sonrakiKm ? Number(bakimForm.sonrakiKm) : undefined,
        sonrakiTarih: bakimForm.sonrakiTarih || undefined,
        faturaNo: bakimForm.faturaNo?.trim() || undefined,
        tutar: Number(bakimForm.tutar) || 0,
        aciklama: bakimForm.aciklama?.trim() || undefined,
      };
      if (islemKm > (updated.guncelKm || 0)) {
        updated.guncelKm = islemKm;
      }
      updated.bakimlar = [newRec, ...(updated.bakimlar || [])];
    } else if (type === "lastik") {
      const nowDate = todayStr();
      const targetPositions: ("Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ" | "Stepne")[] =
        lastikForm.setOlarakEkle
          ? ["Ön Sol", "Ön Sağ", "Arka Sol", "Arka Sağ"]
          : [lastikForm.konum || "Ön Sol"];

      const computedEbat =
        lastikForm.ebat?.trim() ||
        (lastikForm.tabanBoyutu && lastikForm.yanakGenisligi && lastikForm.jantCapi
          ? `${lastikForm.tabanBoyutu}/${lastikForm.yanakGenisligi} R${lastikForm.jantCapi}`
          : "205/55 R16");

      const currentTires = [...allTires];

      const newRecords: TireRecord[] = targetPositions.map((pos, idx) => {
        const recId = `l_${Date.now()}_${idx}`;
        const initLog: TireLogEntry = {
          id: `log_${recId}_init`,
          tarih: nowDate,
          islem: `Sisteme yedek/envanter lastiği olarak eklendi (${pos})`,
          konum: pos,
          km: vehicle.guncelKm || 0,
          aciklama: lastikForm.aciklama?.trim() || undefined,
        };

        return {
          id: recId,
          aciklama: lastikForm.aciklama?.trim() || "Lastik Kaydı",
          seriNo: lastikForm.seriNo?.trim() || undefined,
          konum: pos,
          marka: lastikForm.marka?.trim() || "Bilinmiyor",
          tip: lastikForm.tip || "4 Mevsim",
          ebat: computedEbat,
          kondisyon: lastikForm.kondisyon || "Yeni",
          takiliMi: false,
          sonIslemTarihi: nowDate,
          tabanBoyutu: lastikForm.tabanBoyutu ? Number(lastikForm.tabanBoyutu) : undefined,
          yanakGenisligi: lastikForm.yanakGenisligi ? Number(lastikForm.yanakGenisligi) : undefined,
          jantCapi: lastikForm.jantCapi ? Number(lastikForm.jantCapi) : undefined,
          satinAlmaTarihi: lastikForm.satinAlmaTarihi || undefined,
          sonrakiDegisimTarihi: lastikForm.sonrakiDegisimTarihi || undefined,
          omurYil: lastikForm.omurYil ? Number(lastikForm.omurYil) : undefined,
          omurKm: lastikForm.omurKm ? Number(lastikForm.omurKm) : undefined,
          azamiHavaBasinciBar: lastikForm.azamiHavaBasinciBar ? Number(lastikForm.azamiHavaBasinciBar) : undefined,
          azamiHavaBasinciPsi: lastikForm.azamiHavaBasinciPsi ? Number(lastikForm.azamiHavaBasinciPsi) : undefined,
          loglar: [initLog],
        };
      });

      updated = syncActiveTireSlots(updated, [...newRecords, ...currentTires]);
    } else if (type === "ceza") {
      const newRec: FineRecord = {
        id: "c_" + Date.now(),
        aciklama: cezaForm.aciklama?.trim() || "Ceza",
        tarih: cezaForm.tarih || todayStr(),
        belgeNo: cezaForm.belgeNo?.trim() || undefined,
        cezaMaddesi: cezaForm.cezaMaddesi?.trim() || undefined,
        cezaTutari: Number(cezaForm.cezaTutari) || 0,
        cezaPuani: cezaForm.cezaPuani ? Number(cezaForm.cezaPuani) : undefined,
        sofor: cezaForm.sofor?.trim() || undefined,
        rucu: cezaForm.rucu?.trim() || undefined,
        odendiMi: cezaForm.odendiMi ?? true,
      };
      updated.cezalar = [newRec, ...(updated.cezalar || [])];
    } else if (type === "ariza") {
      const newRec: BreakdownRecord = {
        id: "a_" + Date.now(),
        aciklama: arizaForm.aciklama?.trim() || "Arıza",
        tarih: arizaForm.tarih || todayStr(),
        calisiyor: arizaForm.calisiyor ?? true,
        cekiciCagirildi: arizaForm.cekiciCagirildi ?? false,
        durum: arizaForm.durum || "Açık",
        toplamMaliyet: Number(arizaForm.toplamMaliyet) || 0,
      };
      updated.arizalar = [newRec, ...(updated.arizalar || [])];
    } else if (type === "kaza") {
      const newRec: DamageRecord = {
        id: "k_" + Date.now(),
        aciklama: kazaForm.aciklama?.trim() || "Kaza",
        kazaTarihi: kazaForm.kazaTarihi || todayStr(),
        tip: kazaForm.tip || "Tek Araç",
        belgeNo: kazaForm.belgeNo?.trim() || undefined,
        karsiAracPlakasi: kazaForm.karsiAracPlakasi?.trim() || undefined,
        karsiAracSurucusu: kazaForm.karsiAracSurucusu?.trim() || undefined,
        kusurOrani: kazaForm.kusurOrani || kazaForm.asliKusur || undefined,
        toplamMaliyet: Number(kazaForm.toplamMaliyet) || 0,
        dosyaDurumu: kazaForm.dosyaDurumu || "Açık",
      };
      updated.kazalar = [newRec, ...(updated.kazalar || [])];
    } else if (type === "vergi") {
      const newRec: TaxRecord = {
        id: "t_" + Date.now(),
        tip: vergiForm.tip || "MTV 1. Taksit",
        aciklama: vergiForm.aciklama?.trim() || "MTV",
        tarih: vergiForm.tarih || todayStr(),
        gelecekVergiTarihi: vergiForm.gelecekVergiTarihi || undefined,
        vergiTutari: Number(vergiForm.vergiTutari) || 0,
        odendiMi: vergiForm.odendiMi ?? true,
      };
      updated.vergiler = [newRec, ...(updated.vergiler || [])];
    } else if (type === "tahsis") {
      const teslimKm =
        tahsisForm.baslangicKm !== undefined && tahsisForm.baslangicKm > 0
          ? Number(tahsisForm.baslangicKm)
          : vehicle.guncelKm;
      const bitisKmVal = tahsisForm.bitisKm ? Number(tahsisForm.bitisKm) : undefined;
      const newRec: AssignmentRecord = {
        id: "th_" + Date.now(),
        zimmetlenenKisi: tahsisForm.zimmetlenenKisi?.trim() || "Personel",
        sofor: tahsisForm.sofor?.trim() || undefined,
        departman: tahsisForm.departman?.trim() || undefined,
        tahsisBaslangicTarihi: tahsisForm.tahsisBaslangicTarihi || todayStr(),
        tahsisBitisTarihi: tahsisForm.tahsisBitisTarihi || undefined,
        baslangicKm: teslimKm,
        bitisKm: bitisKmVal,
        aciklama: tahsisForm.aciklama?.trim() || undefined,
        aktifMi: tahsisForm.aktifMi ?? true,
      };
      const maxTahsisKm = Math.max(teslimKm || 0, bitisKmVal || 0);
      if (maxTahsisKm > (updated.guncelKm || 0)) {
        updated.guncelKm = maxTahsisKm;
      }
      updated.tahsisler = [newRec, ...(updated.tahsisler || [])];
    } else if (type === "yedekparca") {
      const parcaKm =
        yedekParcaForm.aracKm !== undefined && yedekParcaForm.aracKm > 0
          ? Number(yedekParcaForm.aracKm)
          : vehicle.guncelKm;
      const newRec: SparePartRecord = {
        id: "y_" + Date.now(),
        tip: yedekParcaForm.tip || "Yedek Parça",
        aciklama: yedekParcaForm.aciklama?.trim() || "Parça",
        tespit: yedekParcaForm.tespit?.trim() || undefined,
        islem: yedekParcaForm.islem?.trim() || undefined,
        kullanilanYedekParcalar: yedekParcaForm.kullanilanYedekParcalar?.trim() || undefined,
        durum: yedekParcaForm.durum || "Tamamlandı",
        faturaNo: yedekParcaForm.faturaNo?.trim() || undefined,
        faturaTutari: Number(yedekParcaForm.faturaTutari) || 0,
        iscilikBedeli: Number(yedekParcaForm.iscilikBedeli) || 0,
        aracKm: parcaKm,
      };
      if (parcaKm > (updated.guncelKm || 0)) {
        updated.guncelKm = parcaKm;
      }
      updated.yedekParcalar = [newRec, ...(updated.yedekParcalar || [])];
    }

    try {
      await onUpdateVehicle(updated);
      // Başarılı kayıttan sonra ilgili formu sıfırla ve kapat
      if (type === "bakim") {
        setBakimForm({ islemTuru: "Periyodik Bakım", tutar: undefined, km: undefined, islemTarihi: todayStr() });
      } else if (type === "lastik") {
        setLastikForm({
          konum: "Ön Sol",
          tip: "4 Mevsim",
          marka: "Michelin",
          ebat: "205/55 R16",
          kondisyon: "Yeni",
          takiliMi: false,
          islemKm: undefined,
          aciklama: "Lastik Kaydı",
          setOlarakEkle: false,
        });
      } else if (type === "ceza") {
        setCezaForm({ cezaTutari: undefined, tarih: todayStr(), aciklama: "Trafik Cezası", odendiMi: true });
      } else if (type === "ariza") {
        setArizaForm({ tarih: todayStr(), calisiyor: true, cekiciCagirildi: false, durum: "Açık", aciklama: "Arıza Tespiti", toplamMaliyet: undefined });
      } else if (type === "kaza") {
        setKazaForm({ kazaTarihi: todayStr(), tip: "İki Araç", toplamMaliyet: undefined, aciklama: "Maddi Hasarlı Kaza", dosyaDurumu: "Açık" });
      } else if (type === "vergi") {
        setVergiForm({ tip: "MTV 1. Taksit", tarih: todayStr(), vergiTutari: undefined, odendiMi: true, aciklama: "MTV Ödemesi" });
      } else if (type === "tahsis") {
        setTahsisForm({ tahsisBaslangicTarihi: todayStr(), baslangicKm: undefined, aktifMi: true, zimmetlenenKisi: "", departman: "" });
      } else if (type === "yedekparca") {
        setYedekParcaForm({ tip: "Yedek Parça", aciklama: "Parça Değişimi", durum: "Tamamlandı", faturaTutari: undefined, iscilikBedeli: undefined, aracKm: undefined });
      }
      setShowAddSubRecord(null);
      const labelMap: Record<string, string> = {
        bakim: "Bakım kaydı başarıyla eklendi.",
        lastik: "Lastik kaydı başarıyla eklendi.",
        ceza: "Trafik cezası başarıyla eklendi.",
        ariza: "Arıza bildirimi başarıyla eklendi.",
        kaza: "Kaza ve hasar kaydı başarıyla eklendi.",
        vergi: "MTV vergi kaydı başarıyla eklendi.",
        tahsis: "Araç zimmet/tahsis kaydı başarıyla eklendi.",
        yedekparca: "Yedek parça kaydı başarıyla eklendi.",
      };
      showSuccess(labelMap[type] || "İşlem başarıyla gerçekleştirildi.");
    } catch {
      setSubRecordError("Kayıt eklenemedi. Lütfen bağlantınızı ve oturumunuzu kontrol edip tekrar deneyin.");
      showError("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "genel", label: "Özellikler & Genel", icon: <Car size={16} /> },
    { key: "ruhsat", label: "Ruhsat Bilgileri", icon: <FileText size={16} /> },
    { key: "muayene", label: "Muayene & Egzoz", icon: <Stethoscope size={16} /> },
    { key: "sigorta", label: "Sigorta & Kasko", icon: <ShieldCheck size={16} /> },
    { key: "bakim", label: "Bakım & Servis", icon: <Wrench size={16} />, badge: vehicle.bakimlar?.length },
    { key: "lastik", label: "Lastik Takibi", icon: <Disc size={16} />, badge: allTires.length },
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
                  setSubRecordError(null);
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
          {subRecordError && (
            <div
              role="alert"
              className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between gap-2"
            >
              <span>{subRecordError}</span>
              <button
                type="button"
                onClick={() => setSubRecordError(null)}
                className="font-bold text-rose-700 hover:text-rose-900 px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

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
                        min="0"
                        value={bakimForm.km ?? ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, km: parseNumInput(e.target.value) })}
                        placeholder={String(vehicle.guncelKm || 0)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Sonraki Bakım KM</label>
                      <input
                        type="number"
                        min="0"
                        value={bakimForm.sonrakiKm ?? ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, sonrakiKm: parseNumInput(e.target.value) })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        placeholder="Örn: 55000"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Fatura Tutarı (₺)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={bakimForm.tutar ?? ""}
                        onChange={(e) => setBakimForm({ ...bakimForm, tutar: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("bakim")}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
          {activeTab === "lastik" && (() => {
            const mountedTires = allTires.filter((t) => t.takiliMi);
            const spareTires = allTires.filter((t) => !t.takiliMi);
            const filteredTireList =
              tireListFilter === "takili"
                ? mountedTires
                : tireListFilter === "yedek"
                ? spareTires
                : allTires;

            const selectedChangeCount = WHEEL_SLOTS.filter(
              (s) => tireChangeSelections[s.konum] && tireChangeSelections[s.konum] !== "",
            ).length;

            return (
              <div className="space-y-6">
                {/* 1. Üst Bölüm: Araç Üzerinde Takılı 4 Lastik & "Lastikleri Değiştir" Alanı */}
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Disc size={16} className="text-rose-600" />
                        Araç Üzerinde Takılı 4 Lastik Durumu
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        &quot;Lastikleri Değiştir&quot; alanından değişecek lastikleri seçip tek seferde araç KM&apos;sini güncelleyebilirsiniz.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTireChangePanel((prev) => !prev);
                          setShowAddSubRecord(null);
                          setSubRecordError(null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs ${
                          showTireChangePanel
                            ? "bg-slate-800 text-white"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <ArrowLeftRight size={14} />
                        {showTireChangePanel ? "Lastik Değişim Alanını Kapat" : "Lastikleri Değiştir"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddSubRecord((prev) => (prev === "lastik" ? null : "lastik"));
                          setShowTireChangePanel(false);
                          setSubRecordError(null);
                        }}
                        className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                      >
                        <Plus size={14} />
                        Yeni Lastik Ekle
                      </button>
                    </div>
                  </div>

                  {/* Birleşik "Lastikleri Değiştir" Alanı (1. Adım: Lastik Seçimi -> 2. Adım: Tek Seferde KM Girişi) */}
                  {showTireChangePanel && (
                    <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 sm:p-5 shadow-md space-y-4 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/70 pb-3">
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                            <RefreshCw size={15} className="text-indigo-600" />
                            Lastikleri Değiştir (1. Değişecek Lastikleri Seçin → 2. Güncel KM Girin)
                          </h5>
                          <p className="text-[11px] text-indigo-700 mt-0.5">
                            İster teker teker listeden seçin, ister &quot;Hızlı Değiş (Yedekleri Otomatik Seç)&quot; ile yedek takımı tek tuşla yerleştirin.
                          </p>
                        </div>

                        {/* Tek Tuşla Yedekleri Otomatik Seçme (Hızlı Değiş) */}
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={quickSwapTipFilter}
                            onChange={(e) => {
                              const nextFilter = e.target.value as "Tümü" | "Yaz" | "Kış" | "4 Mevsim";
                              setQuickSwapTipFilter(nextFilter);
                            }}
                            className="px-2.5 py-1.5 text-xs border border-indigo-300 rounded-xl bg-white text-slate-800 font-medium"
                          >
                            <option value="Tümü">Tüm Yedekler</option>
                            <option value="Kış">Kışlık Yedekler</option>
                            <option value="Yaz">Yazlık Yedekler</option>
                            <option value="4 Mevsim">4 Mevsim Yedekler</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAutoFillSpareSelections(quickSwapTipFilter)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                          >
                            <ArrowLeftRight size={13} />
                            Hızlı Değiş (Yedekleri Otomatik Seç)
                          </button>
                        </div>
                      </div>

                      {/* 1. ADIM: 4 Tekerlek Konumu İçin Listeden Yedek Lastik Seçimi */}
                      <div>
                        <div className="text-xs font-bold text-indigo-950 mb-2 flex items-center justify-between">
                          <span>1. Adım: Değiştirilecek Tekerlek Konumları İçin Yedek Lastikleri Seçin</span>
                          {selectedChangeCount > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setTireChangeSelections({
                                  "Ön Sol": "",
                                  "Ön Sağ": "",
                                  "Arka Sol": "",
                                  "Arka Sağ": "",
                                })
                              }
                              className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                            >
                              Seçimleri Temizle
                            </button>
                          )}
                        </div>

                        {spareTires.length === 0 && (
                          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                            Envanterde henüz yedek (boşta) lastik bulunmuyor. Önce &quot;Yeni Lastik Ekle&quot; butonundan lastik ekleyebilirsiniz.
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          {WHEEL_SLOTS.map((slot) => {
                            const currentMounted = allTires.find(
                              (t) => t.takiliMi && t.konum === slot.konum,
                            );
                            const selectedVal = tireChangeSelections[slot.konum];
                            const selectedSpareObj = spareTires.find((s) => s.id === selectedVal);

                            // Kendi konumuna ait yedekleri üstte, diğerlerini altta sırala
                            const sortedSpares = [
                              ...spareTires.filter((s) => s.konum === slot.konum),
                              ...spareTires.filter((s) => s.konum !== slot.konum),
                            ];

                            return (
                              <div
                                key={slot.konum}
                                className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${
                                  selectedVal
                                    ? "bg-white border-indigo-500 ring-2 ring-indigo-500/15 shadow-xs"
                                    : "bg-white/90 border-indigo-200/80"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-indigo-950">{slot.konum}</span>
                                    {selectedVal ? (
                                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                        {selectedVal === "__UNMOUNT__" ? "Sökülecek" : "Değişecek"}
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-500 rounded">
                                        Sabit Kalacak
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
                                    <span className="block text-[10px] text-slate-400">Şu An Takılı:</span>
                                    <strong className="text-slate-800">
                                      {currentMounted
                                        ? `${currentMounted.marka} • ${currentMounted.tip} (${formatTireEbat(currentMounted)})`
                                        : "Takılı Lastik Yok"}
                                    </strong>
                                  </div>

                                  <label className="text-[11px] font-semibold text-indigo-900 block mb-1">
                                    Takılacak Yedek Lastik:
                                  </label>
                                  <select
                                    value={selectedVal}
                                    onChange={(e) => handleSelectTireForSlot(slot.konum, e.target.value)}
                                    className="w-full px-2.5 py-2 border border-indigo-300 rounded-lg bg-white text-slate-800 text-xs font-medium"
                                  >
                                    <option value="">-- Değiştirme (Mevcut Kalsın) --</option>
                                    {sortedSpares.map((sp) => {
                                      const usedElsewhere = (
                                        ["Ön Sol", "Ön Sağ", "Arka Sol", "Arka Sağ"] as const
                                      ).find((k) => k !== slot.konum && tireChangeSelections[k] === sp.id);
                                      return (
                                        <option key={sp.id} value={sp.id}>
                                          [{sp.konum}] {sp.marka} • {sp.tip} • {formatTireEbat(sp)} ({sp.kondisyon || "İyi"})
                                          {usedElsewhere ? ` (${usedElsewhere} için seçili)` : ""}
                                        </option>
                                      );
                                    })}
                                    {currentMounted && (
                                      <option value="__UNMOUNT__">
                                        ✕ Mevcut Lastiği Sök (Yedeğe Ayır)
                                      </option>
                                    )}
                                  </select>
                                </div>

                                {selectedSpareObj && (
                                  <div className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded-lg">
                                    <span className="font-bold">Yeni Takılacak:</span> {selectedSpareObj.marka} (
                                    {selectedSpareObj.tip} • {formatTireEbat(selectedSpareObj)})
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. ADIM: Tek Seferde Araç Güncel KM Sorulması ve Onay */}
                      <div className="bg-white p-4 rounded-xl border border-indigo-200 flex flex-wrap items-end justify-between gap-4">
                        <div className="flex-1 min-w-[240px]">
                          <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                            <Gauge size={15} className="text-indigo-600" />
                            2. Adım: Aracın Güncel KM&apos;si <span className="text-rose-600">*</span>
                          </label>
                          <p className="text-[11px] text-slate-500 mb-2">
                            Seçilen tüm lastiklerin değişimi için araç KM&apos;si tek seferde güncellenir.
                          </p>
                          <input
                            type="number"
                            min="0"
                            value={tireChangeKm ?? ""}
                            onChange={(e) => setTireChangeKm(parseNumInput(e.target.value))}
                            placeholder={`Mevcut KM: ${vehicle.guncelKm.toLocaleString("tr-TR")}`}
                            className="w-full sm:max-w-xs px-3 py-2 border border-indigo-300 rounded-xl bg-white font-mono font-bold text-sm text-slate-900"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowTireChangePanel(false)}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                          >
                            Vazgeç
                          </button>
                          <button
                            type="button"
                            disabled={isSaving || selectedChangeCount === 0}
                            onClick={handleApplyTireChanges}
                            className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={15} />
                            {isSaving
                              ? "Kaydediliyor..."
                              : `Seçilen ${selectedChangeCount} Lastiği Değiştir ve KM Güncelle`}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4 Tekerlek Kartı (Mevcut Takılı Durum Özeti) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {WHEEL_SLOTS.map((slot) => {
                      const mounted = allTires.find((t) => t.takiliMi && t.konum === slot.konum);

                      return (
                        <div
                          key={slot.konum}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                {slot.konum}
                              </span>
                              {mounted ? (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    mounted.tip === "Kış"
                                      ? "bg-sky-100 text-sky-800"
                                      : mounted.tip === "Yaz"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {mounted.tip}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                  Takılı Değil
                                </span>
                              )}
                            </div>

                            {mounted ? (
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-slate-900">{mounted.marka}</div>
                                <div className="text-xs text-slate-600 font-mono">{formatTireEbat(mounted)}</div>
                                {mounted.seriNo && (
                                  <div className="text-[11px] text-slate-400 font-mono">Seri/DOT: {mounted.seriNo}</div>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    Kondisyon: {mounted.kondisyon || "İyi"}
                                  </span>
                                  {mounted.islemKm !== undefined && (
                                    <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                      {mounted.islemKm.toLocaleString("tr-TR")} KM
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                Bu konumda takılı lastik yok.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Yeni Lastik Ekleme Formu (KM Sormaz, Doğrudan Envantere Ekler) */}
                {showAddSubRecord === "lastik" && (
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-md space-y-4 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3">
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-rose-900">Yeni Lastik Kaydı Ekle</h5>
                        <p className="text-[11px] text-slate-500">
                          Eklenen lastikler aracın lastik listesine kaydedilir; ardından &quot;Lastikleri Değiştir&quot; alanından araca takabilirsiniz.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lastikForm.setOlarakEkle || false}
                          onChange={(e) => setLastikForm({ ...lastikForm, setOlarakEkle: e.target.checked })}
                          className="rounded text-rose-600"
                        />
                        <span>4&apos;lü Takım Olarak Ekle (Ön Sol, Ön Sağ, Arka Sol, Arka Sağ)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Tekerlek Konumu</label>
                        {lastikForm.setOlarakEkle ? (
                          <div className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-semibold">
                            4 Tekerlek (Ön/Arka Sol & Sağ)
                          </div>
                        ) : (
                          <select
                            value={lastikForm.konum}
                            onChange={(e) => setLastikForm({ ...lastikForm, konum: e.target.value as any })}
                            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                          >
                            <option value="Ön Sol">Ön Sol</option>
                            <option value="Ön Sağ">Ön Sağ</option>
                            <option value="Arka Sol">Arka Sol</option>
                            <option value="Arka Sağ">Arka Sağ</option>
                            <option value="Stepne">Stepne</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Marka</label>
                        <input
                          type="text"
                          value={lastikForm.marka || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, marka: e.target.value })}
                          placeholder="Michelin, Lassa, Continental..."
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Mevsim / Tür</label>
                        <select
                          value={lastikForm.tip}
                          onChange={(e) => setLastikForm({ ...lastikForm, tip: e.target.value as any })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Yaz">Yaz</option>
                          <option value="Kış">Kış</option>
                          <option value="4 Mevsim">4 Mevsim</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Ebat (Örn: 205/55 R16)</label>
                        <input
                          type="text"
                          value={lastikForm.ebat || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, ebat: e.target.value })}
                          placeholder="205/55 R16"
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Kondisyon / Durum</label>
                        <select
                          value={lastikForm.kondisyon || "Yeni"}
                          onChange={(e) => setLastikForm({ ...lastikForm, kondisyon: e.target.value as any })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Yeni">Yeni</option>
                          <option value="İyi">İyi</option>
                          <option value="Orta">Orta</option>
                          <option value="Aşınmış">Aşınmış</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Seri No / DOT Kodu</label>
                        <input
                          type="text"
                          value={lastikForm.seriNo || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, seriNo: e.target.value })}
                          placeholder="DOT-2026-..."
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Satın Alma Tarihi</label>
                        <input
                          type="date"
                          value={lastikForm.satinAlmaTarihi || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, satinAlmaTarihi: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Sonraki Değişim Tarihi</label>
                        <input
                          type="date"
                          value={lastikForm.sonrakiDegisimTarihi || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, sonrakiDegisimTarihi: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Hava Basıncı (PSI / Bar)</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={lastikForm.azamiHavaBasinciPsi ?? ""}
                            onChange={(e) =>
                              setLastikForm({ ...lastikForm, azamiHavaBasinciPsi: parseNumInput(e.target.value) })
                            }
                            placeholder="32 PSI"
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono"
                          />
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={lastikForm.azamiHavaBasinciBar ?? ""}
                            onChange={(e) =>
                              setLastikForm({ ...lastikForm, azamiHavaBasinciBar: parseNumInput(e.target.value) })
                            }
                            placeholder="2.2 Bar"
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-700 font-semibold block mb-1">Tahmini Ömür (KM / Yıl)</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={lastikForm.omurKm ?? ""}
                            onChange={(e) => setLastikForm({ ...lastikForm, omurKm: parseNumInput(e.target.value) })}
                            placeholder="50000 KM"
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono"
                          />
                          <input
                            type="number"
                            min="0"
                            value={lastikForm.omurYil ?? ""}
                            onChange={(e) => setLastikForm({ ...lastikForm, omurYil: parseNumInput(e.target.value) })}
                            placeholder="4 Yıl"
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-slate-700 font-semibold block mb-1">Açıklama / Not</label>
                        <input
                          type="text"
                          value={lastikForm.aciklama || ""}
                          onChange={(e) => setLastikForm({ ...lastikForm, aciklama: e.target.value })}
                          placeholder="Örn: Kışlık takım olarak alındı, depoda numaralı rafta vb."
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddSubRecord(null)}
                        className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        Vazgeç
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveSubRecord("lastik")}
                        className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                      >
                        {isSaving
                          ? "Kaydediliyor..."
                          : lastikForm.setOlarakEkle
                          ? "4'lü Lastik Setini Kaydet"
                          : "Lastiği Kaydet"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Kayıtlı Tüm Lastikler, Detay Bilgileri ve Değişim Logları */}
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <History size={15} className="text-slate-600" />
                        Kayıtlı Tüm Lastikler ve Hareket Logları
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Araçtan çıkarılmış (yedeğe alınmış) olsa dahi silinmeyen tüm lastiklerin tüm detayları ve KM logları burada saklanır.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setTireListFilter("tumu")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          tireListFilter === "tumu"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Tümü ({allTires.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTireListFilter("takili")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          tireListFilter === "takili"
                            ? "bg-white text-emerald-700 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Araçta Takılı ({mountedTires.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTireListFilter("yedek")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                          tireListFilter === "yedek"
                            ? "bg-white text-amber-700 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Yedek / Çıkarılmış ({spareTires.length})
                      </button>
                    </div>
                  </div>

                  {filteredTireList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTireList.map((l) => (
                        <div
                          key={l.id}
                          className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3.5 transition ${
                            l.takiliMi
                              ? "border-emerald-200/90 ring-1 ring-emerald-500/10"
                              : "border-slate-200/90"
                          }`}
                        >
                          {/* Üst Satır: Rozetler & Sil / Değişim İçin Seç Butonları */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold">
                                  {l.konum}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                    l.takiliMi
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {l.takiliMi ? "Araçta Takılı" : "Yedek / Çıkarılmış"}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-semibold">
                                  {l.tip}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                                  Kondisyon: {l.kondisyon || "İyi"}
                                </span>
                              </div>
                              <h6 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5">
                                {l.marka} — <span className="font-mono text-blue-700">{formatTireEbat(l)}</span>
                              </h6>
                              <p className="text-[11px] text-slate-500 mt-0.5">{l.aciklama}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {!l.takiliMi && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetSlot =
                                      l.konum === "Stepne" ? "Ön Sol" : l.konum;
                                    setShowTireChangePanel(true);
                                    setShowAddSubRecord(null);
                                    handleSelectTireForSlot(targetSlot, l.id);
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold cursor-pointer transition"
                                >
                                  Değişim İçin Seç
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteSubRecord("lastik", l.id)}
                                title="Lastik Kaydını Kalıcı Olarak Sil"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Orta Satır: Tüm Lastik Detay Bilgileri */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Son İşlem KM</span>
                              <span className="font-mono font-bold text-slate-800">
                                {l.islemKm !== undefined ? `${l.islemKm.toLocaleString("tr-TR")} KM` : "-"}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Seri No / DOT</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {l.seriNo || "-"}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Hava Basıncı</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {l.azamiHavaBasinciPsi || l.azamiHavaBasinciBar
                                  ? `${l.azamiHavaBasinciPsi ? `${l.azamiHavaBasinciPsi} PSI` : ""}${
                                      l.azamiHavaBasinciPsi && l.azamiHavaBasinciBar ? " / " : ""
                                    }${l.azamiHavaBasinciBar ? `${l.azamiHavaBasinciBar} Bar` : ""}`
                                  : "-"}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Satın Alma Tarihi</span>
                              <span className="font-medium text-slate-700">{l.satinAlmaTarihi || "-"}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Sonraki Değişim</span>
                              <span className="font-medium text-slate-700">{l.sonrakiDegisimTarihi || "-"}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Tahmini Ömür</span>
                              <span className="font-mono font-semibold text-slate-700">
                                {l.omurKm || l.omurYil
                                  ? `${l.omurKm ? `${l.omurKm.toLocaleString("tr-TR")} KM` : ""}${
                                      l.omurKm && l.omurYil ? " / " : ""
                                    }${l.omurYil ? `${l.omurYil} Yıl` : ""}`
                                  : "-"}
                              </span>
                            </div>
                          </div>

                          {/* Alt Satır: Lastik Hareket ve Değişim Logları */}
                          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <History size={12} className="text-blue-600" />
                              Lastik Hareket ve Değişim Logları ({l.loglar?.length || 0})
                            </div>
                            {l.loglar && l.loglar.length > 0 ? (
                              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                {l.loglar.map((log) => (
                                  <div
                                    key={log.id}
                                    className="text-[11px] bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-1"
                                  >
                                    <span className="text-slate-700 font-medium">{log.islem}</span>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                        {log.km.toLocaleString("tr-TR")} KM
                                      </span>
                                      <span>{log.tarih}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 italic">Henüz log kaydı yok.</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
                      Seçili filtreye uygun lastik kaydı bulunmuyor.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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
                        min="0"
                        step="any"
                        value={cezaForm.cezaTutari ?? ""}
                        onChange={(e) => setCezaForm({ ...cezaForm, cezaTutari: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                        min="0"
                        value={cezaForm.cezaPuani ?? ""}
                        onChange={(e) => setCezaForm({ ...cezaForm, cezaPuani: parseNumInput(e.target.value) })}
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("ceza")}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
                        min="0"
                        step="any"
                        value={arizaForm.toplamMaliyet ?? ""}
                        onChange={(e) => setArizaForm({ ...arizaForm, toplamMaliyet: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("ariza")}
                      className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
                        min="0"
                        step="any"
                        value={kazaForm.toplamMaliyet ?? ""}
                        onChange={(e) => setKazaForm({ ...kazaForm, toplamMaliyet: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("kaza")}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
                        min="0"
                        step="any"
                        value={vergiForm.vergiTutari ?? ""}
                        onChange={(e) => setVergiForm({ ...vergiForm, vergiTutari: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("vergi")}
                      className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
                        min="0"
                        value={tahsisForm.baslangicKm ?? ""}
                        onChange={(e) => setTahsisForm({ ...tahsisForm, baslangicKm: parseNumInput(e.target.value) })}
                        placeholder={String(vehicle.guncelKm || 0)}
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("tahsis")}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
                        min="0"
                        step="any"
                        value={yedekParcaForm.faturaTutari ?? ""}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, faturaTutari: parseNumInput(e.target.value) })}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">İşçilik Bedeli (₺)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={yedekParcaForm.iscilikBedeli ?? ""}
                        onChange={(e) => setYedekParcaForm({ ...yedekParcaForm, iscilikBedeli: parseNumInput(e.target.value) })}
                        placeholder="0"
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
                      disabled={isSaving}
                      onClick={() => handleSaveSubRecord("yedekparca")}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white font-semibold rounded-lg cursor-pointer"
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
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
