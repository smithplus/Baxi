
import React from 'react';
import LocationSearchInput from './LocationSearchInput';
import DateTimeSelector from './DateTimeSelector';
import { PlaceResult } from '../types'; // Assuming types.ts is in parent directory

interface InputOverlayProps {
  origin: PlaceResult | null;
  destination: PlaceResult | null;
  onOriginSelected: (place: PlaceResult | null) => void;
  onDestinationSelected: (place: PlaceResult | null) => void;
  travelDateTime: Date;
  onDateTimeChange: (date: Date) => void;
}

const InputOverlay: React.FC<InputOverlayProps> = ({
  origin,
  destination,
  onOriginSelected,
  onDestinationSelected,
  travelDateTime,
  onDateTimeChange,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-20 p-1">
      <div className="bg-card rounded-xl shadow-xl p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-center self-stretch pt-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-full"></div> {/* Origin Dot */}
            <div className="w-px flex-grow bg-slate-300 my-1.5"></div> {/* Dotted line (approximated) */}
            <div className="w-2.5 h-2.5 bg-accent rounded-full"></div> {/* Destination Dot */}
          </div>
          <div className="flex-grow space-y-2.5">
            <LocationSearchInput
              id="origin-overlay"
              label="" 
              onPlaceSelected={onOriginSelected}
              placeholder="Punto de partida"
              compact={true}
            />
            <LocationSearchInput
              id="destination-overlay"
              label=""
              onPlaceSelected={onDestinationSelected}
              placeholder="Punto de destino"
              compact={true}
            />
          </div>
        </div>
        <div className="pt-3 border-t border-slate-200">
          <DateTimeSelector
            selectedDateTime={travelDateTime}
            onDateTimeChange={onDateTimeChange}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default InputOverlay;
