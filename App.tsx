
import React, { useState, useEffect, useCallback } from 'react';
import { PlaceResult, RouteDetails, Tariff } from './types';
import { fetchTariffs } from './services/firebaseService';
import { calculateFare } from './services/fareCalculationService';
import { DEFAULT_TARIFF_DOC_ID } from './constants';

import OpenLayersMap from './components/MainMap';
import InputOverlay from './components/InputOverlay'; 
import BottomPanel from './components/BottomPanel';    

const App: React.FC = () => {
  const [origin, setOrigin] = useState<PlaceResult | null>(null);
  const [destination, setDestination] = useState<PlaceResult | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [travelDateTime, setTravelDateTime] = useState<Date>(new Date());
  
  const [currentTariff, setCurrentTariff] = useState<Tariff | null>(null);
  const [isLoadingTariff, setIsLoadingTariff] = useState<boolean>(true);
  const [tariffError, setTariffError] = useState<string | null>(null);

  const [estimatedFareResult, setEstimatedFareResult] = useState<{ totalFare: number; activeTariffLabel: string; isNight: boolean } | null>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState<boolean>(false);
  const [fareCalculationError, setFareCalculationError] = useState<string | null>(null);
  
  const [showTariffDetails, setShowTariffDetails] = useState(false);

  useEffect(() => {
    const loadTariffs = async () => {
      setIsLoadingTariff(true);
      setTariffError(null);
      try {
        const tariffData = await fetchTariffs(DEFAULT_TARIFF_DOC_ID);
        if (tariffData) {
          setCurrentTariff(tariffData);
        } else {
          setTariffError("No se pudo cargar la configuración de tarifas.");
        }
      } catch (error) {
        console.error("Error fetching tariffs:", error);
        setTariffError("Error al conectar con el servicio de tarifas.");
      } finally {
        setIsLoadingTariff(false);
      }
    };
    loadTariffs();
  }, []);

  const handleRouteCalculated = useCallback((details: RouteDetails | null) => {
    setRouteDetails(details);
    setFareCalculationError(null); 
    if (!details && origin && destination) { 
      setEstimatedFareResult(null);
    }
  }, [origin, destination]);
  
  const handleRouteCalculationError = useCallback((errorMsg: string) => {
    setRouteDetails(null);
    setEstimatedFareResult(null);
    setFareCalculationError(errorMsg);
  }, []);

  useEffect(() => {
    if (routeDetails && currentTariff && origin && destination) { 
      setIsCalculatingFare(true);
      setFareCalculationError(null); 
      try {
        const fareResult = calculateFare(routeDetails, currentTariff, travelDateTime);
        setEstimatedFareResult(fareResult);
      } catch (error) {
        console.error("Error calculating fare:", error);
        setFareCalculationError("Hubo un problema al calcular la tarifa.");
        setEstimatedFareResult(null);
      } finally {
        setIsCalculatingFare(false);
      }
    } else if (!origin || !destination) { 
        setEstimatedFareResult(null);
        setRouteDetails(null); 
        setFareCalculationError(null); 
    }
  }, [routeDetails, currentTariff, travelDateTime, origin, destination]);


  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden">
      <header className="bg-card text-textPrimary py-3 shadow-md z-30 flex-shrink-0">
        <h1 className="text-lg font-semibold text-center">Calculadora Taxi BA</h1>
      </header>

      <div className="flex-grow relative">
        {/* Map as background */}
        <div className="absolute inset-0 z-0">
          <OpenLayersMap 
            origin={origin} 
            destination={destination} 
            onRouteCalculated={handleRouteCalculated}
            onRouteCalculationError={handleRouteCalculationError}
          />
        </div>

        {/* Input Overlay */}
        <InputOverlay
          origin={origin}
          destination={destination}
          onOriginSelected={(place) => { setOrigin(place); if (!place) { setRouteDetails(null); setEstimatedFareResult(null); setFareCalculationError(null);}}}
          onDestinationSelected={(place) => { setDestination(place); if (!place) { setRouteDetails(null); setEstimatedFareResult(null); setFareCalculationError(null);}}}
          travelDateTime={travelDateTime}
          onDateTimeChange={setTravelDateTime}
        />

        {/* Bottom Panel */}
        <BottomPanel
            estimatedFareResult={estimatedFareResult}
            currentTariff={currentTariff}
            isLoadingTariff={isLoadingTariff}
            isCalculatingFare={isCalculatingFare}
            fareCalculationError={fareCalculationError}
            tariffError={tariffError}
            routeDetails={routeDetails}
            showTariffDetails={showTariffDetails}
            onToggleTariffDetails={() => setShowTariffDetails(!showTariffDetails)}
        />
      </div>
    </div>
  );
};

export default App;
