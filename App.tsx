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
      <header className="bg-card text-textPrimary py-3 shadow-md z-20 flex-shrink-0">
        <h1 className="text-lg font-semibold text-center">Calculadora Taxi BA</h1>
      </header>

      {/* Contenedor principal para el contenido: se vuelve fila en 'md' y más grandes */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* --- Columna Izquierda (Controles) --- */}
        {/* Ocupa todo el ancho en móvil, 2/5 en 'md', y 1/3 en 'xl'. Con scroll si es necesario. */}
        <div className="w-full md:w-2/5 xl:w-1/3 flex flex-col p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto bg-background z-10 md:relative">
          {/* 
            - bg-background: Siempre tiene fondo para legibilidad.
            - z-10: En móvil, se superpone al mapa (que es z-0).
            - md:relative: En desktop, vuelve a ser parte del flujo normal.
          */}
          <InputOverlay
            origin={origin}
            destination={destination}
            onOriginSelected={(place) => { setOrigin(place); if (!place) { setRouteDetails(null); setEstimatedFareResult(null); setFareCalculationError(null);}}}
            onDestinationSelected={(place) => { setDestination(place); if (!place) { setRouteDetails(null); setEstimatedFareResult(null); setFareCalculationError(null);}}}
            travelDateTime={travelDateTime}
            onDateTimeChange={setTravelDateTime}
          />

          {/* Espaciador: empuja el BottomPanel hacia abajo */}
          <div className="flex-grow"></div>

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

        {/* --- Contenedor del Mapa (Unificado) --- */}
        {/* 
          - Móvil (por defecto): Posicionado absolutamente detrás de los controles (z-0) y debajo del header.
          - Desktop ('md' y más grandes): Se convierte en la columna derecha, ocupando el espacio restante.
        */}
        <div className="flex-grow absolute md:relative inset-0 md:inset-auto z-0">
          {/* Contenedor interno para OpenLayersMap. Maneja el padding del header en móviles. */}
          <div className="w-full h-full pt-14 md:pt-0"> 
            {/* 
              - pt-14: Padding superior en móviles para que el mapa no quede bajo el header. Ajustar si es necesario.
              - md:pt-0: Sin padding superior en desktop.
            */}
            <OpenLayersMap 
              origin={origin} 
              destination={destination} 
              onRouteCalculated={handleRouteCalculated}
              onRouteCalculationError={handleRouteCalculationError}
            />
          </div>
        </div>
      </div> {/* Fin de flex-grow flex ... */}
    </div>
  );
};

export default App;
