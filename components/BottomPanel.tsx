
import React from 'react';
import FareDisplay from './FareDisplay';
import TariffDetailsDisplay from './TariffDetailsDisplay';
import { Tariff, RouteDetails } from '../types'; // Assuming types.ts is in parent directory

interface BottomPanelProps {
  estimatedFareResult: { totalFare: number; activeTariffLabel: string; isNight: boolean } | null;
  currentTariff: Tariff | null;
  isLoadingTariff: boolean;
  isCalculatingFare: boolean;
  fareCalculationError: string | null;
  tariffError: string | null;
  routeDetails: RouteDetails | null;
  showTariffDetails: boolean;
  onToggleTariffDetails: () => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  estimatedFareResult,
  currentTariff,
  isLoadingTariff,
  isCalculatingFare,
  fareCalculationError,
  tariffError,
  routeDetails,
  showTariffDetails,
  onToggleTariffDetails,
}) => {
  // Determine the main loading state for FareDisplay
  const fareDisplayIsLoading = isCalculatingFare || isLoadingTariff || (!!routeDetails && !estimatedFareResult && !fareCalculationError);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-2 pb-3 sm:pb-4">
      <div className="bg-card rounded-t-xl shadow-2xl max-h-[70vh] flex flex-col">
        <div className="p-4 overflow-y-auto">
            <FareDisplay
                estimatedFare={estimatedFareResult?.totalFare ?? null}
                currency={currentTariff?.currency || "ARS"}
                activeTariffLabel={estimatedFareResult?.activeTariffLabel || (isLoadingTariff ? "..." : "N/A")}
                isLoading={fareDisplayIsLoading}
                error={fareCalculationError || tariffError}
                routeDistanceKm={routeDetails ? routeDetails.distanceMeters / 1000 : null}
                routeDurationMin={routeDetails ? routeDetails.durationSeconds / 60 : null} 
            />
            <div className="mt-4">
                <button
                    onClick={onToggleTariffDetails}
                    className="w-full px-4 py-3 bg-secondary text-card font-semibold rounded-lg shadow-md hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-150 ease-in-out text-sm"
                    aria-expanded={showTariffDetails}
                    aria-controls="tariff-details-content-panel"
                >
                    {showTariffDetails ? 'Ocultar' : 'Mostrar'} Detalles de Tarifa
                </button>
                {showTariffDetails && (
                    <div id="tariff-details-content-panel" className="mt-3">
                    <TariffDetailsDisplay tariff={currentTariff} isLoading={isLoadingTariff} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BottomPanel;
