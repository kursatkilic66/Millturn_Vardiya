// KonforFuel sistemindeki Arac ve ilgili tüm alt varlıkların TypeScript tip tanımları

export interface MaintenanceRecord {
  id: string;
  islemTuru: string; // Periyodik Bakım, Ağır Bakım, Yağ Değişimi, Fren/Balata, Genel Kontrol vb.
  islemTarihi: string;
  km: number;
  sonrakiTarih?: string;
  sonrakiKm?: number;
  faturaNo?: string;
  faturaTarihi?: string;
  tutar: number;
  aciklama?: string;
}

export interface TireRecord {
  id: string;
  aciklama: string;
  seriNo?: string;
  konum: "Ön Sol" | "Ön Sağ" | "Arka Sol" | "Arka Sağ" | "Stepne";
  marka: string;
  tip: "Yaz" | "Kış" | "4 Mevsim";
  tabanBoyutu?: number;
  yanakGenisligi?: number;
  jantCapi?: number;
  satinAlmaTarihi?: string;
  sonrakiDegisimTarihi?: string;
  omurYil?: number;
  omurKm?: number;
  azamiHavaBasinciBar?: number;
  azamiHavaBasinciPsi?: number;
}

export interface FineRecord {
  id: string;
  aciklama: string;
  tarih: string;
  belgeNo?: string;
  cezaMaddesi?: string;
  cezaTutari: number;
  cezaPuani?: number;
  sofor?: string;
  rucu?: string;
  toplamMaliyet?: number;
  odendiMi?: boolean;
}

export interface DamageRecord {
  id: string;
  kazaTarihi: string;
  tip: "Tek Araç" | "İki Araç" | "Zincirleme" | "Park Halinde Hasar";
  aciklama: string;
  belgeNo?: string;
  karsiAracPlakasi?: string;
  karsiAracSurucusu?: string;
  karsiAracSigortasi?: string;
  asliKusur?: string;
  taliKusur?: string;
  kusurOrani?: string;
  rucu?: string;
  toplamMaliyet: number;
  dosyaDurumu?: "Açık" | "Ekspertizde" | "Onarımda" | "Kapatıldı";
}

export interface BreakdownRecord {
  id: string;
  aciklama: string;
  tarih: string;
  calisiyor: boolean;
  cekiciCagirildi: boolean;
  rucu?: string;
  sigortaKaskoRucu?: string;
  toplamMaliyet?: number;
  durum: "Açık" | "Onarımda" | "Tamamlandı";
}

export interface TaxRecord {
  id: string;
  tip: "MTV 1. Taksit" | "MTV 2. Taksit" | "Ek MTV" | "Diğer";
  aciklama: string;
  tarih: string;
  gelecekVergiTarihi?: string;
  vergiTutari: number;
  odendiMi?: boolean;
}

export interface AssignmentRecord {
  id: string;
  zimmetlenenKisi: string;
  sofor?: string;
  departman?: string;
  tahsisBaslangicTarihi: string;
  tahsisBitisTarihi?: string;
  baslangicKm?: number;
  bitisKm?: number;
  aciklama?: string;
  aktifMi: boolean;
}

export interface K2Card {
  belgeNumarasi: string;
  belgeTarihi?: string;
  sonGecerlilikTarihi?: string;
  aciklama?: string;
}

export interface SparePartRecord {
  id: string;
  tip: "Kusur" | "Tamir" | "Bakım" | "Yedek Parça";
  aciklama: string;
  tespit?: string;
  islem?: string;
  kullanilanYedekParcalar?: string;
  durum: "Tamamlandı" | "Bekliyor" | "Sipariş Verildi";
  faturaNo?: string;
  faturaTarihi?: string;
  faturaTutari?: number;
  iscilikBedeli?: number;
  aracKm?: number;
}

export interface ActiveTireInfo {
  marka?: string;
  ebat?: string;
  tur?: "Yaz" | "Kış" | "4 Mevsim";
  durum?: "Yeni" | "İyi" | "Orta" | "Aşınmış";
}

export interface Vehicle {
  id: string;
  plate: string; // Plaka (Örn: 34 KNF 101)
  brandName: string; // Marka (Örn: Renault)
  modelName: string; // Model (Örn: Megane)
  modelYili?: number; // Model Yılı (Örn: 2023)
  vehicleLabel?: string; // Araç Etiketi
  vehicleType?: string; // Araç Tipi (Otomobil, Ticari, Kamyonet vb.)
  aracSinifi?: string; // Araç Sınıfı (B, C vb.)
  rengi?: string; // Renk
  yakitTipi: "Dizel" | "Benzin" | "Hibrit" | "Elektrik" | "LPG" | "Bilinmiyor";
  vites?: "Manuel" | "Otomatik";
  guncelKm: number;
  durum: "Sahada" | "Havuzda" | "Serviste";
  sahiplikDurumu: "Şirket Aracı" | "Kiralık";
  tanimliSofor?: string;
  grupAdi?: string; // Grup / Departman

  // Teknik & Motor Bilgileri
  motorNo?: string;
  sasiNo?: string;
  motorHacmi?: string;
  motorGucu?: string;
  koltukSayisi?: string;
  netAgirlik?: string;
  azamiYukluAgirlik?: string;

  // Kiralama / Sözleşme Bilgileri (Kiralık ise)
  kiraMaliyeti?: number;
  kiraParaBirimi?: string;
  kiraSuresi?: string;
  kiraBaslangicTarihi?: string;
  kiraBitisTarihi?: string;
  kiralayanSirket?: string;

  // Ruhsat Bilgileri
  lisansSahibi?: string;
  belgeSeriNo?: string;
  tescilSiraNo?: string;
  tescilBelgesiSeriNo?: string;
  tescilTarihi?: string;
  ilkTescilTarihi?: string;
  trafigeCikisTarihi?: string;
  verildigiIl?: string;
  verildigiIlce?: string;
  ruhsatSonKullanmaTarihi?: string;
  romorkIstiabHaddi?: number;
  takograf?: boolean;
  taksimetre?: boolean;

  // Muayene & Egzoz
  muayeneRaporNo?: string;
  sonMuayeneTarihi?: string;
  muayeneBitisTarihi?: string;
  muayeneSonucu?: "Geçti" | "Kaldı" | "Kusurlu Geçti";
  muayeneKusur?: string;
  muayeneUcreti?: number;
  egzozEmisyonBitis?: string;

  // Trafik Sigortası
  trafikSigortaSirketi?: string;
  trafikPoliceNo?: string;
  trafikBaslangicTarihi?: string;
  trafikBitisTarihi?: string;
  trafikTutar?: number;

  // Kasko Poliçesi
  kaskoSirketi?: string;
  kaskoPoliceNo?: string;
  kaskoBaslangicTarihi?: string;
  kaskoBitisTarihi?: string;
  kaskoTutari?: number;
  kaskoImm?: string;
  kaskoIkame?: string;
  kaskoMuafiyet?: string;

  // K2 Taşıt Kartı
  k2Karti?: K2Card;

  // 4 Takılı Lastik Bilgisi
  onSolLastik?: ActiveTireInfo;
  onSagLastik?: ActiveTireInfo;
  arkaSolLastik?: ActiveTireInfo;
  arkaSagLastik?: ActiveTireInfo;

  // Alt Koleksiyonlar / Listeler
  bakimlar?: MaintenanceRecord[];
  lastikler?: TireRecord[];
  cezalar?: FineRecord[];
  kazalar?: DamageRecord[];
  arizalar?: BreakdownRecord[];
  vergiler?: TaxRecord[];
  tahsisler?: AssignmentRecord[];
  yedekParcalar?: SparePartRecord[];

  createdAt?: string;
  updatedAt?: string;
}
