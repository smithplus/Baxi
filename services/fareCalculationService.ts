
import { Tariff, RouteDetails, TariffSpecifics } from '../types';

export const isNightTariffActive = (tariff: Tariff, travelTime: Date): boolean => {
  const currentHour = travelTime.getHours();
  const { start, end } = tariff.nightTariffHours;

  if (start <= end) { // Night period does not cross midnight (e.g., 22:00-23:59 or 00:00-06:00)
    return currentHour >= start && currentHour < end;
  } else { // Night period crosses midnight (e.g., 22:00-06:00)
    return currentHour >= start || currentHour < end;
  }
};

export const calculateFare = (
  routeDetails: RouteDetails,
  tariff: Tariff,
  travelTime: Date
): { totalFare: number; activeTariffLabel: string; isNight: boolean } => {
  if (!routeDetails || !tariff) {
    return { totalFare: 0, activeTariffLabel: '', isNight: false };
  }

  const isNight = isNightTariffActive(tariff, travelTime);
  const activeTariffDetails: TariffSpecifics = isNight ? tariff.nightTariff : tariff.dayTariff;

  let totalFare = tariff.flagDown;

  // Calculate distance cost
  if (activeTariffDetails.distanceUnitMeters > 0) {
    const distanceUnits = Math.ceil(routeDetails.distanceMeters / activeTariffDetails.distanceUnitMeters);
    totalFare += distanceUnits * activeTariffDetails.costPerDistanceUnit;
  }

  // Calculate time cost (based on total duration as a proxy for waiting/slow travel)
  // This is a simplification. Real meters distinguish between moving time and true waiting time.
  // If durationSeconds is 0 (e.g., from straight-line calculation), this cost will be 0.
  if (activeTariffDetails.waitingTokenSeconds > 0 && routeDetails.durationSeconds > 0) {
    const timeTokens = Math.ceil(routeDetails.durationSeconds / activeTariffDetails.waitingTokenSeconds);
    totalFare += timeTokens * activeTariffDetails.costPerWaitingToken;
  }
  
  return {
    totalFare: parseFloat(totalFare.toFixed(2)), // Round to 2 decimal places
    activeTariffLabel: activeTariffDetails.label,
    isNight
  };
};