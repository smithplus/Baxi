
import React from 'react';

interface FareDisplayProps {
  estimatedFare: number | null;
  currency: string;
  activeTariffLabel: string;
  isLoading: boolean;
  error?: string | null;
  routeDistanceKm?: number | null;
  routeDurationMin?: number | null;
}

const FareDisplay: React.FC<FareDisplayProps> = ({ 
    estimatedFare, 
    currency, 
    activeTariffLabel, 
    isLoading, 
    error,
    routeDistanceKm,
    routeDurationMin 
}) => {
  if (isLoading) {
    return (
      <div className="w-full p-4 bg-primary/80 text-secondary rounded-xl shadow-lg animate-pulse">
        <p className="font-semibold text-lg text-center">Calculando tarifa...</p>
        <p className="text-xs text-center mt-1">Un momento por favor.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
        <p className="font-bold text-md">Error en Estimación</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (estimatedFare === null || estimatedFare === undefined) {
    return (
      <div className="w-full p-4 bg-slate-100 text-textSecondary rounded-xl shadow-md text-center">
        <p className="text-md font-medium">Ingrese origen y destino.</p>
        <p className="text-xs mt-1">Seleccione puntos para estimar.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-primary text-secondary rounded-xl shadow-lg">
      <h3 className="text-sm font-semibold text-secondary/80 mb-0.5 text-center uppercase">Costo Estimado</h3>
      <p className="text-4xl sm:text-5xl font-extrabold my-1 text-center tracking-tight">
        {currency} {estimatedFare.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <div className="mt-2.5 space-y-0.5 text-xs opacity-90 border-t border-secondary/10 pt-2">
        <div className="flex justify-between">
          <span>Tarifa:</span>
          <span className="font-semibold">{activeTariffLabel}</span>
        </div>
        {routeDistanceKm !== null && routeDistanceKm !== undefined && (
           <div className="flex justify-between">
            <span>Distancia (directa):</span>
            <span className="font-semibold">{routeDistanceKm.toFixed(1)} km</span>
           </div>
        )}
        {routeDurationMin === 0 && (
             <p className="text-center text-xs opacity-80">Cálculo basado en distancia directa.</p>
        )}
      </div>
      <p className="mt-3 text-[0.65rem] opacity-80 text-center">
        Estimación. Costo final puede variar por tráfico, ruta y esperas.
      </p>
    </div>
  );
};

export default FareDisplay;
