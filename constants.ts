// constants.ts
// Using a simple object type for BUENOS_AIRES_CENTER now, consistent with PlaceResult.coordinates
export const BUENOS_AIRES_CENTER: { lat: number; lng: number } = {
  lat: -34.603722,
  lng: -58.381592
};

export const FIRESTORE_TARIFF_COLLECTION = "tariffs";
// For this example, we'll use a default ID. In a real app, you might query for the 'active' one.
export const DEFAULT_TARIFF_DOC_ID = "currentBuenosAires";

// Nominatim API endpoint
export const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
export const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";
