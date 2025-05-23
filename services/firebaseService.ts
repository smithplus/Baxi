
// Fix: Import Tariff from ../types and DEFAULT_TARIFF_DOC_ID from ../constants
import { DEFAULT_TARIFF_DOC_ID } from '../constants'; 
import { Tariff } from '../types'; // Ensure Tariff type is imported if not already
// Remove DEFAULT_TARIFF_DOC_ID if not used here, or adjust Tariff type accordingly

// Mock implementation for fetching tariffs.
// In a real Firebase app, you would use:
// import { getFirestore, doc, getDoc } from "firebase/firestore";
// import { firebaseApp } from "./firebaseConfig"; // Your Firebase app initialization

const MOCK_TARIFF_DATA: Tariff = {
  id: DEFAULT_TARIFF_DOC_ID,
  name: "Tarifas Oficiales CABA",
  currency: "ARS",
  flagDown: 1920.00, 
  dayTariff: {
    label: "Diurna",
    costPerDistanceUnit: 192.00,
    distanceUnitMeters: 200,
    costPerWaitingToken: 192.00, 
    waitingTokenSeconds: 60
  },
  nightTariff: {
    label: "Nocturna (20% Recargo)",
    costPerDistanceUnit: 230.40, // 192.00 * 1.2
    distanceUnitMeters: 200,
    costPerWaitingToken: 230.40, // 192.00 * 1.2
    waitingTokenSeconds: 60
  },
  nightTariffHours: {
    start: 22, // 10 PM
    end: 6     // 6 AM (next day)
  },
  lastUpdated: new Date().toISOString() 
};

export const fetchTariffs = async (tariffId: string = DEFAULT_TARIFF_DOC_ID): Promise<Tariff | null> => {
  console.log(`Mock fetching tariffs for ID: ${tariffId}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app:
  // const db = getFirestore(firebaseApp);
  // const tariffRef = doc(db, FIRESTORE_TARIFF_COLLECTION, tariffId);
  // const tariffSnap = await getDoc(tariffRef);
  // if (tariffSnap.exists()) {
  //   return { id: tariffSnap.id, ...tariffSnap.data() } as Tariff;
  // } else {
  //   console.error("No such tariff document!");
  //   return null;
  // }

  // For now, return mock data
  if (tariffId === DEFAULT_TARIFF_DOC_ID) {
    return MOCK_TARIFF_DATA;
  }
  return null;
};