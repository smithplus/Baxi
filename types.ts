
// types.ts

export interface TariffSpecifics {
  label: string;
  costPerDistanceUnit: number;
  distanceUnitMeters: number;
  costPerWaitingToken: number;
  waitingTokenSeconds: number;
}

export interface Tariff {
  id: string;
  name: string;
  currency: string;
  flagDown: number;
  dayTariff: TariffSpecifics;
  nightTariff: TariffSpecifics;
  nightTariffHours: {
    start: number; // Hour (0-23)
    end: number;   // Hour (0-23), if end < start, it crosses midnight
  };
  lastUpdated: string; // ISO date string
}

// Updated PlaceResult for Nominatim responses
export interface PlaceResult {
  address: string; // from display_name
  coordinates: { 
    lat: number;
    lng: number; // Nominatim provides 'lon', we map to 'lng' for internal consistency
  };
  raw?: any; // Optional: store the raw Nominatim result for debugging or extended use
}

export interface RouteDetails {
  distanceMeters: number; // distance in meters
  durationSeconds: number; // duration in seconds, will be 0 for straight-line
}

// For Nominatim API specific response structure (subset)
export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string; // Latitude as string
  lon: string; // Longitude as string
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    municipality?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
}
