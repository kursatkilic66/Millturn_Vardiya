import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Vehicle } from "@/src/types/vehicle";
import {
  isLocalMssqlMode,
  mssqlList,
  mssqlAdd,
  mssqlUpdate,
  mssqlDelete,
} from "@/src/lib/localDbClient";

const VEHICLES_COLLECTION = "vehicles";

/**
 * Firestore nesne veya dizi (array) içinde `undefined` değer kabul etmez.
 * Bu yardımcı fonksiyon tüm `undefined` alanları özyinelemeli olarak temizler.
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) {
        cleaned[k] = stripUndefined(v);
      }
    }
    return cleaned as T;
  }
  return value;
}

export async function getVehiclesFromFirestore(): Promise<Vehicle[]> {
  try {
    if (isLocalMssqlMode) {
      return await mssqlList<Vehicle>("vehicles");
    }

    const snapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
    const vehicles: Vehicle[] = [];
    snapshot.forEach((d) => {
      vehicles.push({ ...(d.data() as Vehicle), id: d.id });
    });
    return vehicles;
  } catch (error) {
    console.error("Araçları çekerken hata oluştu:", error);
    throw error;
  }
}

export async function addVehicleToFirestore(
  vehicle: Omit<Vehicle, "id">,
): Promise<Vehicle> {
  const cleanData = stripUndefined({
    ...vehicle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (isLocalMssqlMode) {
    const id = await mssqlAdd(
      "vehicles",
      cleanData as unknown as Record<string, unknown>,
    );
    return { ...(cleanData as Omit<Vehicle, "id">), id };
  }

  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), cleanData);
  return { ...(cleanData as Omit<Vehicle, "id">), id: docRef.id };
}

export async function updateVehicleInFirestore(
  id: string,
  vehicle: Partial<Vehicle>,
): Promise<void> {
  const cleanData = stripUndefined({
    ...vehicle,
    updatedAt: new Date().toISOString(),
  });

  if (isLocalMssqlMode) {
    await mssqlUpdate(
      "vehicles",
      id,
      cleanData as unknown as Record<string, unknown>,
    );
    return;
  }

  const docRef = doc(db, VEHICLES_COLLECTION, id);
  await updateDoc(docRef, cleanData);
}

export async function deleteVehicleFromFirestore(id: string): Promise<void> {
  if (isLocalMssqlMode) {
    await mssqlDelete("vehicles", id);
    return;
  }

  const docRef = doc(db, VEHICLES_COLLECTION, id);
  await deleteDoc(docRef);
}
