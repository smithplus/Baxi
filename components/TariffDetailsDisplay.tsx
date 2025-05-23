
import React from 'react';
import { Tariff, TariffSpecifics } from '../types';

interface TariffDetailsDisplayProps {
  tariff: Tariff | null;
  isLoading: boolean;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; unit?: string; className?: string }> = ({ label, value, unit, className ="" }) => (
  <div className={`py-1.5 flex justify-between items-center border-b border-slate-100 last:border-b-0 ${className}`}>
    <span className="text-textSecondary text-xs">{label}:</span>
    <div className="text-right">
      <span className="font-semibold text-textPrimary text-xs">{value}</span>
      {unit && <span className="text-textSecondary text-[0.65rem] ml-1"> {unit}</span>}
    </div>
  </div>
);

const SpecificTariffDetails: React.FC<{ details: TariffSpecifics; currency: string; titleClass: string }> = ({ details, currency, titleClass }) => (
  <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
    <h4 className={`font-semibold text-sm mb-1.5 ${titleClass}`}>{details.label}</h4>
    <div className="space-y-0">
      <DetailItem label="Costo ficha (dist.)" value={details.costPerDistanceUnit.toFixed(2)} unit={currency} />
      <DetailItem label="Dist. por ficha" value={details.distanceUnitMeters} unit="m" />
      <DetailItem label="Costo ficha (esp.)" value={details.costPerWaitingToken.toFixed(2)} unit={currency} />
      <DetailItem label="Espera / ficha" value={details.waitingTokenSeconds} unit="s" />
    </div>
  </div>
);

const TariffDetailsDisplay: React.FC<TariffDetailsDisplayProps> = ({ tariff, isLoading }) => {
  if (isLoading) {
    return <p className="text-xs text-textSecondary mt-3 p-3 text-center">Cargando detalles de tarifa...</p>;
  }

  if (!tariff) {
    return <p className="text-xs text-red-600 mt-3 p-3 bg-red-50 rounded-md text-center">No se pudo cargar la información de la tarifa.</p>;
  }

  return (
    <div className="w-full mt-2 p-3 bg-card rounded-lg shadow-inner border border-slate-100">
      <h3 className="text-md font-semibold text-textPrimary mb-2 text-center">Detalles de Tarifa ({tariff.name})</h3>
      <div className="p-2.5 bg-slate-100 rounded-md">
        <DetailItem 
            label="Bajada de Bandera" 
            value={tariff.flagDown.toFixed(2)} 
            unit={tariff.currency} 
            className="text-sm font-medium"
        />
        <DetailItem 
            label="Horario Nocturno" 
            value={`${tariff.nightTariffHours.start.toString().padStart(2, '0')}:00 - ${tariff.nightTariffHours.end.toString().padStart(2, '0')}:00`} 
            className="mt-0.5"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5">
        <SpecificTariffDetails details={tariff.dayTariff} currency={tariff.currency} titleClass="text-sky-700" />
        <SpecificTariffDetails details={tariff.nightTariff} currency={tariff.currency} titleClass="text-indigo-700" />
      </div>

      <p className="text-[0.65rem] text-textSecondary mt-3 text-center">
        Última actual.: {new Date(tariff.lastUpdated).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
    </div>
  );
};

export default TariffDetailsDisplay;
