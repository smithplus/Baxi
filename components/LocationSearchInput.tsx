import React, { useState, useRef, useCallback } from 'react';
import { PlaceResult, NominatimResult } from '../types'; // Adjusted path
import { NOMINATIM_SEARCH_URL, NOMINATIM_REVERSE_URL } from '../constants'; // Adjusted path
import LoadingSpinner from './LoadingSpinner';

interface LocationSearchInputProps {
  id: string;
  label: string; // Kept for aria-label, but can be visually hidden if compact
  onPlaceSelected: (place: PlaceResult | null) => void;
  placeholder?: string;
  compact?: boolean; // New prop
  isOrigin?: boolean; // New prop to identify if it's the origin input
}

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ id, label, onPlaceSelected, placeholder, compact = false, isOrigin = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false); // New state for geolocation loading
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = async (currentQuery: string) => {
    if (currentQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: currentQuery,
        format: 'json',
        countrycodes: 'ar',
        addressdetails: '1',
        limit: '5'
      });
      const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: NominatimResult[] = await response.json();
      const mappedSuggestions: PlaceResult[] = data.map(item => ({
        address: item.display_name,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
        raw: item,
      }));
      setSuggestions(mappedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to fetch suggestions from Nominatim:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 400), []);

  const fetchAddressFromCoordinates = async (lat: number, lon: number): Promise<PlaceResult | null> => {
    setIsLoading(true); // Reuse isLoading or use isGeolocating
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
      });
      const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Nominatim reverse geocoding request failed');
      }
      const data: NominatimResult = await response.json();
      if (data && data.display_name) {
        return {
          address: data.display_name,
          coordinates: {
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lon),
          },
          raw: data,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch address from coordinates:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMyLocationClick = async () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es compatible con tu navegador.");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const place = await fetchAddressFromCoordinates(latitude, longitude);
          if (place) {
            setQuery(place.address);
            onPlaceSelected(place);
            setShowSuggestions(false);
          } else {
            alert("No se pudo obtener la dirección para tu ubicación actual. Verifica tu conexión o intenta más tarde.");
          }
        } catch (error) {
          // Error ya logueado en fetchAddressFromCoordinates
          alert("Ocurrió un error al buscar la dirección para tu ubicación.");
        } finally {
          setIsGeolocating(false);
        }
      },
      (error) => {
        console.error("Error getting current position:", error);
        let message = "Error al obtener la ubicación.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Permiso de geolocalización denegado. Por favor, habilítalo en la configuración de tu navegador.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Información de ubicación no disponible.";
        } else if (error.code === error.TIMEOUT) {
          message = "Se agotó el tiempo de espera para obtener la ubicación.";
        }
        alert(message);
        setIsGeolocating(false);
      }
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    if (newQuery.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      onPlaceSelected(null);
    } else {
      debouncedFetchSuggestions(newQuery);
    }
  };

  const handleSuggestionClick = (place: PlaceResult) => {
    setQuery(place.address); // Set query to selected address
    setSuggestions([]);
    setShowSuggestions(false);
    onPlaceSelected(place);
    // Don't directly set inputRef.current.value here, React state 'query' handles it
  };

  const handleBlur = () => {
    setTimeout(() => {
        setShowSuggestions(false);
    }, 150); // Delay to allow click on suggestion
  };
  
  const handleFocus = () => {
    if (query.trim().length >=3 && suggestions.length > 0) {
        setShowSuggestions(true);
    }
  };

  return (
    <div className="w-full relative">
      {!compact && (
        <label htmlFor={id} className="block text-sm font-medium text-textPrimary mb-1">
          {label}
        </label>
      )}
      {/* Use label for accessibility even if hidden */}
      {compact && <label htmlFor={id} className="sr-only">{label}</label>}
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={query} // Controlled input
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder || "Escriba una dirección..."}
          className={`w-full ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} ${isOrigin && compact ? 'pr-10' : ''} text-textPrimary bg-slate-100 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-150 ease-in-out`}
          autoComplete="off"
        />
        {(isLoading || isGeolocating) && (
          <div className={`absolute right-3 ${isOrigin && compact ? 'right-10' : 'right-3'} top-1/2 transform -translate-y-1/2`}>
            <LoadingSpinner size="sm" />
          </div>
        )}
        {isOrigin && compact && (
          <button 
            type="button"
            onClick={handleUseMyLocationClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-primary focus:outline-none"
            aria-label="Usar mi ubicación actual"
            disabled={isGeolocating}
          >
            <span role="img" aria-label="location icon" style={{ fontSize: '1.25rem' }}>🎯</span>
          </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-30 w-full bg-card border border-slate-200 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <li
              key={place.raw?.place_id || index}
              onClick={() => handleSuggestionClick(place)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-textPrimary transition-colors duration-150 ease-in-out"
            >
              {place.address}
            </li>
          ))}
           {suggestions.length > 0 && (
            <li className="px-4 py-2 text-xs text-textSecondary text-center">
              Sugerencias por OpenStreetMap Nominatim
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchInput;
