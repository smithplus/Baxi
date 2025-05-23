
import React, { useState, useRef, useCallback } from 'react';
import { PlaceResult, NominatimResult } from '../types'; // Adjusted path
import { NOMINATIM_SEARCH_URL } from '../constants'; // Adjusted path
import LoadingSpinner from './LoadingSpinner';

interface LocationSearchInputProps {
  id: string;
  label: string; // Kept for aria-label, but can be visually hidden if compact
  onPlaceSelected: (place: PlaceResult | null) => void;
  placeholder?: string;
  compact?: boolean; // New prop
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


const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ id, label, onPlaceSelected, placeholder, compact = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
          className={`w-full ${compact ? 'px-3 py-2.5' : 'px-4 py-3'} text-textPrimary bg-slate-100 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors duration-150 ease-in-out`}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
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
