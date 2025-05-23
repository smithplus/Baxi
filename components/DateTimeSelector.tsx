
import React from 'react';

interface DateTimeSelectorProps {
  selectedDateTime: Date;
  onDateTimeChange: (date: Date) => void;
  label?: string; // Main label, hidden if compact
  compact?: boolean; // New prop
}

const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ selectedDateTime, onDateTimeChange, label, compact = false }) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(selectedDateTime);
    const [year, month, day] = event.target.value.split('-').map(Number);
    newDate.setFullYear(year, month - 1, day); 
    onDateTimeChange(newDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(selectedDateTime);
    const [hours, minutes] = event.target.value.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    onDateTimeChange(newDate);
  };

  const dateString = selectedDateTime.toISOString().split('T')[0];
  const timeString = selectedDateTime.toTimeString().split(' ')[0].substring(0, 5);

  return (
    <div className={`w-full ${compact ? 'text-xs' : ''}`}>
      {!compact && label && (
         <h3 className="text-md font-medium text-textPrimary mb-2">
            {label}
         </h3>
      )}
      <div className={`grid grid-cols-2 gap-2 ${compact ? 'sm:gap-2' : 'sm:gap-3'}`}>
        <div>
          <label htmlFor="trip-date-overlay" className={`block font-medium text-textPrimary ${compact ? 'text-xs mb-1' : 'text-sm mb-1.5'}`}>Fecha</label>
          <input
            type="date"
            id="trip-date-overlay"
            value={dateString}
            onChange={handleDateChange}
            className={`w-full ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 sm:text-sm'} text-textPrimary bg-slate-100 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
          />
        </div>
        <div>
          <label htmlFor="trip-time-overlay" className={`block font-medium text-textPrimary ${compact ? 'text-xs mb-1' : 'text-sm mb-1.5'}`}>Hora</label>
          <input
            type="time"
            id="trip-time-overlay"
            value={timeString}
            onChange={handleTimeChange}
            className={`w-full ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 sm:text-sm'} text-textPrimary bg-slate-100 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
          />
        </div>
      </div>
      {!compact && (
        <p className={`mt-2.5 text-xs text-textSecondary bg-slate-100 p-2 rounded-md`}>
            <span className="font-medium">Programado para:</span> {selectedDateTime.toLocaleString('es-AR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
};

export default DateTimeSelector;
