import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Vehicle } from "@/src/types/vehicle";

// KonforFuel'den ilham alan hazır başlangıç araçları (Firestore boşsa otomatik yüklenir)
// export const INITIAL_VEHICLES: Vehicle[] = [
//   {
//     id: "v1",
//     plate: "34 KNF 101",
//     brandName: "Renault",
//     modelName: "Megane Sedan",
//     modelYili: 2023,
//     vehicleLabel: "34 KNF 101 - FİLO BİNEK",
//     vehicleType: "Otomobil",
//     aracSinifi: "C Segment",
//     rengi: "Beyaz",
//     yakitTipi: "Dizel",
//     vites: "Otomatik",
//     guncelKm: 48500,
//     durum: "Sahada",
//     sahiplikDurumu: "Şirket Aracı",
//     tanimliSofor: "Bahri Yılmaz",
//     grupAdi: "Saha Operasyon",
//     motorNo: "K9K872U123456",
//     sasiNo: "VF1RFB00167890123",
//     motorHacmi: "1461 cc",
//     motorGucu: "115 HP",
//     koltukSayisi: "5",
//     netAgirlik: "1395 kg",
//     azamiYukluAgirlik: "1850 kg",

//     // Ruhsat
//     lisansSahibi: "Millturn Makina San. ve Tic. A.Ş.",
//     belgeSeriNo: "AA 123456",
//     tescilSiraNo: "34-101-2023",
//     tescilBelgesiSeriNo: "TR-349812",
//     tescilTarihi: "2023-04-12",
//     ilkTescilTarihi: "2023-04-12",
//     trafigeCikisTarihi: "2023-04-15",
//     verildigiIl: "İstanbul",
//     verildigiIlce: "Kartal",
//     ruhsatSonKullanmaTarihi: "2033-04-12",
//     romorkIstiabHaddi: 750,
//     takograf: false,
//     taksimetre: false,

//     // Muayene
//     muayeneRaporNo: "TUV-34-88491",
//     sonMuayeneTarihi: "2024-04-10",
//     muayeneBitisTarihi: "2026-10-15",
//     muayeneSonucu: "Geçti",
//     muayeneKusur: "Kusursuz geçti.",
//     muayeneUcreti: 1820,
//     egzozEmisyonBitis: "2026-10-15",

//     // Sigorta
//     trafikSigortaSirketi: "Anadolu Sigorta",
//     trafikPoliceNo: "POL-3498110",
//     trafikBaslangicTarihi: "2026-01-15",
//     trafikBitisTarihi: "2027-01-15",
//     trafikTutar: 8450,

//     // Kasko
//     kaskoSirketi: "Axa Sigorta",
//     kaskoPoliceNo: "KSK-887410",
//     kaskoBaslangicTarihi: "2026-01-15",
//     kaskoBitisTarihi: "2027-01-15",
//     kaskoTutari: 19800,
//     kaskoImm: "Sınırsız İMM",
//     kaskoIkame: "15 Gün Yılda 2 Kez",
//     kaskoMuafiyet: "Muafiyetsiz Tam Kasko",

//     // K2 Belgesi
//     k2Karti: {
//       belgeNumarasi: "İST-K2-887123",
//       belgeTarihi: "2023-05-01",
//       sonGecerlilikTarihi: "2027-05-01",
//       aciklama: "Ulaştırma Bakanlığı K2 Taşıt Kartı tanımlı.",
//     },

//     // 4 Takılı Lastik
//     onSolLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
//     onSagLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
//     arkaSolLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },
//     arkaSagLastik: { marka: "Michelin", ebat: "205/55 R16", tur: "4 Mevsim", durum: "İyi" },

//     // Alt Kayıtlar
//     bakimlar: [
//       {
//         id: "b1",
//         islemTuru: "Periyodik Bakım (40.000 KM)",
//         islemTarihi: "2026-03-10",
//         km: 40200,
//         sonrakiKm: 55000,
//         sonrakiTarih: "2027-03-10",
//         faturaNo: "FAT-2026-00412",
//         tutar: 6450,
//         aciklama: "Yağ filtresi, polen, hava filtresi, motor yağı değişti. Balatalar kontrol edildi.",
//       },
//       {
//         id: "b2",
//         islemTuru: "Ön Balata Değişimi",
//         islemTarihi: "2025-10-14",
//         km: 32000,
//         faturaNo: "FAT-2025-0811",
//         tutar: 3200,
//         aciklama: "Ön disk ve balata takımı orijinal parçayla yenilendi.",
//       },
//     ],
//     lastikler: [
//       {
//         id: "l1",
//         aciklama: "4 Adet Michelin CrossClimate 2 Takıldı",
//         konum: "Ön Sol",
//         marka: "Michelin",
//         tip: "4 Mevsim",
//         tabanBoyutu: 205,
//         yanakGenisligi: 55,
//         jantCapi: 16,
//         satinAlmaTarihi: "2025-11-01",
//         sonrakiDegisimTarihi: "2027-11-01",
//         azamiHavaBasinciBar: 2.3,
//         azamiHavaBasinciPsi: 33,
//       },
//     ],
//     cezalar: [
//       {
//         id: "c1",
//         aciklama: "Hız Sınırı Aşımı (%10-%30)",
//         tarih: "2026-02-18",
//         belgeNo: "MB-8472911",
//         cezaMaddesi: "51/2-a",
//         cezaTutari: 1506,
//         cezaPuani: 10,
//         sofor: "Bahri Yılmaz",
//         rucu: "Sürücüye Rücu Edildi",
//         toplamMaliyet: 1129.5,
//         odendiMi: true,
//       },
//     ],
//     kazalar: [],
//     arizalar: [],
//     vergiler: [
//       {
//         id: "t1",
//         tip: "MTV 1. Taksit",
//         aciklama: "2026 Yılı 1. Taksit MTV Ödemesi",
//         tarih: "2026-01-20",
//         gelecekVergiTarihi: "2026-07-31",
//         vergiTutari: 2180,
//         odendiMi: true,
//       },
//       {
//         id: "t2",
//         tip: "MTV 2. Taksit",
//         aciklama: "2026 Yılı 2. Taksit MTV Ödemesi",
//         tarih: "2026-07-15",
//         gelecekVergiTarihi: "2027-01-31",
//         vergiTutari: 2180,
//         odendiMi: true,
//       },
//     ],
//     tahsisler: [
//       {
//         id: "th1",
//         zimmetlenenKisi: "Bahri Yılmaz",
//         sofor: "Bahri Yılmaz",
//         departman: "Saha İmalat ve Montaj",
//         tahsisBaslangicTarihi: "2025-01-10",
//         baslangicKm: 18200,
//         aciklama: "İş takibi ve saha ziyaretleri için sürekli zimmet.",
//         aktifMi: true,
//       },
//     ],
//     yedekParcalar: [
//       {
//         id: "y1",
//         tip: "Bakım",
//         aciklama: "Silecek Takımı Değişimi",
//         tespit: "Ön silecekler iz bırakıyordu.",
//         islem: "Bosch Aerotwin silecek seti monte edildi.",
//         kullanilanYedekParcalar: "Bosch A294S",
//         durum: "Tamamlandı",
//         faturaNo: "FAT-7712",
//         faturaTutari: 850,
//         iscilikBedeli: 100,
//         aracKm: 42000,
//       },
//     ],
//   },
//   {
//     id: "v2",
//     plate: "35 MLT 202",
//     brandName: "Ford",
//     modelName: "Transit Custom 320L",
//     modelYili: 2024,
//     vehicleLabel: "35 MLT 202 - SERVİS & SEVKİYAT",
//     vehicleType: "Ticari / Panelvan",
//     aracSinifi: "N1",
//     rengi: "Gümüş Gri",
//     yakitTipi: "Dizel",
//     vites: "Manuel",
//     guncelKm: 27800,
//     durum: "Havuzda",
//     sahiplikDurumu: "Kiralık",
//     tanimliSofor: "Kerim Usta",
//     grupAdi: "Lojistik & Sevkiyat",
//     motorNo: "BK2X1029384",
//     sasiNo: "NM0XXXTTFX1029384",
//     motorHacmi: "1995 cc",
//     motorGucu: "130 HP",
//     koltukSayisi: "3",
//     netAgirlik: "2140 kg",
//     azamiYukluAgirlik: "3200 kg",

//     // Kiralama Sözleşmesi
//     kiraMaliyeti: 38500,
//     kiraParaBirimi: "TL",
//     kiraSuresi: "24 Ay",
//     kiraBaslangicTarihi: "2025-06-01",
//     kiraBitisTarihi: "2027-06-01",
//     kiralayanSirket: "Hedef Filo Hizmetleri A.Ş.",

//     // Ruhsat
//     lisansSahibi: "Hedef Araç Kiralama A.Ş.",
//     belgeSeriNo: "HF 994821",
//     tescilSiraNo: "35-202-2024",
//     tescilTarihi: "2024-06-01",
//     trafigeCikisTarihi: "2024-06-05",
//     verildigiIl: "İzmir",
//     verildigiIlce: "Bornova",
//     ruhsatSonKullanmaTarihi: "2034-06-01",
//     romorkIstiabHaddi: 1500,
//     takograf: true,
//     taksimetre: false,

//     // Muayene (Ticari araç - her yıl muayene)
//     muayeneRaporNo: "TUV-35-10294",
//     sonMuayeneTarihi: "2025-06-02",
//     muayeneBitisTarihi: "2026-11-20",
//     muayeneSonucu: "Geçti",
//     muayeneUcreti: 2450,
//     egzozEmisyonBitis: "2026-11-20",

//     // Sigorta
//     trafikSigortaSirketi: "Sompo Sigorta",
//     trafikPoliceNo: "SOM-99201",
//     trafikBaslangicTarihi: "2026-06-01",
//     trafikBitisTarihi: "2027-06-01",
//     trafikTutar: 14200,

//     // Kasko
//     kaskoSirketi: "Allianz Sigorta",
//     kaskoPoliceNo: "ALZ-77301",
//     kaskoBaslangicTarihi: "2026-06-01",
//     kaskoBitisTarihi: "2027-06-01",
//     kaskoTutari: 28500,
//     kaskoImm: "5.000.000 ₺",
//     kaskoIkame: "Ticari İkame Minibüs",

//     // K2 Belgesi
//     k2Karti: {
//       belgeNumarasi: "İZM-K2-441029",
//       belgeTarihi: "2024-06-10",
//       sonGecerlilikTarihi: "2029-06-10",
//       aciklama: "Ticari Eşya Taşımacılığı K2 Kartı",
//     },

//     // 4 Lastik
//     onSolLastik: { marka: "Bridgestone", ebat: "215/65 R16C", tur: "Kış", durum: "Yeni" },
//     onSagLastik: { marka: "Bridgestone", ebat: "215/65 R16C", tur: "Kış", durum: "Yeni" },
//     arkaSolLastik: { marka: "Bridgestone", ebat: "215/65 R16C", tur: "Kış", durum: "Yeni" },
//     arkaSagLastik: { marka: "Bridgestone", ebat: "215/65 R16C", tur: "Kış", durum: "Yeni" },

//     bakimlar: [
//       {
//         id: "b3",
//         islemTuru: "İlk Yıl / 20.000 KM Bakımı",
//         islemTarihi: "2025-05-18",
//         km: 19800,
//         sonrakiKm: 40000,
//         sonrakiTarih: "2026-05-18",
//         faturaNo: "FRD-2025-991",
//         tutar: 8200,
//         aciklama: "Yetkili serviste periyodik bakım yapıldı.",
//       },
//     ],
//     lastikler: [],
//     cezalar: [],
//     kazalar: [],
//     arizalar: [],
//     vergiler: [],
//     tahsisler: [],
//     yedekParcalar: [],
//   },
// ];

// Firebase Firestore CRUD Operasyonları
const VEHICLES_COLLECTION = "vehicles";

export async function getVehiclesFromFirestore(): Promise<Vehicle[]> {
  try {
    const snapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
    if (snapshot.empty) {
      // Veritabanı henüz boşsa veritabanında araç kayıtlı olmadıgını belirt
    }
    const vehicles: Vehicle[] = [];
    snapshot.forEach((d) => {
      vehicles.push({ ...(d.data() as Vehicle), id: d.id });
    });
    return vehicles;
  } catch (error) {
    console.error("Araçları çekerken hata oluştu:", error);
    return [];
    // return INITIAL_VEHICLES;
  }
}

export async function addVehicleToFirestore(
  vehicle: Omit<Vehicle, "id">,
): Promise<Vehicle> {
  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
    ...vehicle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { ...vehicle, id: docRef.id };
}

export async function updateVehicleInFirestore(
  id: string,
  vehicle: Partial<Vehicle>,
): Promise<void> {
  const docRef = doc(db, VEHICLES_COLLECTION, id);
  await updateDoc(docRef, {
    ...vehicle,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteVehicleFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, VEHICLES_COLLECTION, id);
  await deleteDoc(docRef);
}
