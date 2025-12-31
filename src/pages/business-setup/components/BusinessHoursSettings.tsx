import React, { useState, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { Clock, Zap, Info } from 'lucide-react';

// --- Types & Constants ---

const INT_TO_DAY: { [key: number]: string } = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const PRESETS = [
  { 
    label: 'Standard (9-5)', 
    action: (h: any[]) => h.map(d => ({ ...d, enabled: !['saturday', 'sunday'].includes(d.day_of_week), open_time: '09:00', close_time: '17:00' })) 
  },
  { 
    label: '24/7 Support', 
    action: (h: any[]) => h.map(d => ({ ...d, enabled: true, open_time: '00:00', close_time: '23:59' })) 
  },
  { 
    label: 'Weekend Only', 
    action: (h: any[]) => h.map(d => ({ ...d, enabled: ['saturday', 'sunday'].includes(d.day_of_week), open_time: '10:00', close_time: '18:00' })) 
  },
];

// --- Reusable UI Components ---

const CustomInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-lg focus:ring-0 focus:border-slate-400 px-3 py-2 transition-colors placeholder:text-slate-400"
  />
);

const CustomToggle: React.FC<{ active: boolean; onChange?: () => void; label?: string }> = ({ active, onChange, label }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}
    aria-pressed={active}
    aria-label={label || 'Toggle status'}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${active ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const PresetButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="group relative px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all active:scale-95"
  >
    {label}
    <div className="absolute inset-0 border border-slate-900 rounded-lg scale-105 opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100" />
  </button>
);

// --- Main Component ---

export const BusinessHoursSettings: React.FC = () => {
  const { state, actions } = useBusinessSetup();

  const [hours, setHours] = useState(() => {
    if (state.data.business_hours && state.data.business_hours.length > 0) {
      const convertedHours = state.data.business_hours.map((h: any) => ({
        ...h,
        day_of_week: INT_TO_DAY[parseInt(h.day_of_week)] || h.day_of_week,
        open_time: h.open_time ? h.open_time.slice(0, 5) : '09:00',
        close_time: h.close_time ? h.close_time.slice(0, 5) : '17:00'
      }));

      return DAYS.map(day => {
        const existing = convertedHours.find((h: any) => h.day_of_week === day.key);
        return existing || {
          day_of_week: day.key,
          enabled: false,
          open_time: '09:00',
          close_time: '17:00'
        };
      });
    }

    // Default hours
    return DAYS.map(day => ({
      day_of_week: day.key,
      enabled: ['saturday', 'sunday'].includes(day.key) ? false : true,
      open_time: '09:00',
      close_time: '17:00'
    }));
  });

  // Sync with global state when data is loaded
  useEffect(() => {
    if (state.data.business_hours && state.data.business_hours.length > 0) {
      const convertedHours = state.data.business_hours.map((h: any) => ({
        ...h,
        day_of_week: INT_TO_DAY[parseInt(h.day_of_week)] || h.day_of_week,
        open_time: h.open_time ? h.open_time.slice(0, 5) : '09:00',
        close_time: h.close_time ? h.close_time.slice(0, 5) : '17:00'
      }));

      const newHours = DAYS.map(day => {
        const existing = convertedHours.find((h: any) => h.day_of_week === day.key);
        return existing || {
          day_of_week: day.key,
          enabled: false,
          open_time: '09:00',
          close_time: '17:00'
        };
      });

      setHours(currentHours => {
        const isDifferent = JSON.stringify(currentHours) !== JSON.stringify(newHours);
        return isDifferent ? newHours : currentHours;
      });
    }
  }, [state.data.business_hours]);

  // Update context when hours change
  useEffect(() => {
    actions.updateBusinessHours(hours);
  }, [hours, actions]);

  const handleToggleChange = (index: number) => {
    const newHours = [...hours];
    newHours[index].enabled = !newHours[index].enabled;
    setHours(newHours);
  };

  const handleTimeChange = (index: number, field: 'open_time' | 'close_time', value: string) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const applyPreset = (preset: any) => {
    setHours(preset.action(hours));
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Presets Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">Quick Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <PresetButton
              key={idx}
              label={preset.label}
              onClick={() => applyPreset(preset)}
            />
          ))}
        </div>
      </div>

      {/* Hours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map((day, index) => {
          const isEnabled = hours[index]?.enabled || false;
          
          return (
            <div 
              key={day.key} 
              className={`
                relative p-5 rounded-xl border transition-all duration-300 group
                ${isEnabled 
                  ? 'bg-white border-slate-300 shadow-sm hover:shadow-md hover:border-slate-400' 
                  : 'bg-slate-50 border-slate-100'
                }
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold uppercase tracking-wide ${isEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                  {!isEnabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-500">
                      Closed
                    </span>
                  )}
                </div>
                
                <CustomToggle 
                  active={isEnabled} 
                  onChange={() => handleToggleChange(index)} 
                  label={`Toggle ${day.label}`} 
                />
              </div>

              {isEnabled && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Opens</label>
                    <CustomInput
                      type="time"
                      value={hours[index]?.open_time || ''}
                      onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Closes</label>
                    <CustomInput
                      type="time"
                      value={hours[index]?.close_time || ''}
                      onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Left Active Border Indicator */}
              {isEnabled && (
                <div className="absolute left-0 top-5 bottom-5 w-1 bg-emerald-500 rounded-r-sm" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Agent Behavior Tip */}
      <div className="mt-2 p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-4 text-slate-300">
        <div className="p-2 bg-slate-800 rounded-lg shrink-0">
          <Clock size={18} className="text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-1">Off-Hours Protocol</p>
          <p className="text-xs leading-relaxed text-slate-400">
            When calls arrive outside active windows, the AI will automatically switch to voicemail mode or route to emergency contacts based on your priority handling settings.
          </p>
        </div>
      </div>

    </div>
  );
};

export default BusinessHoursSettings;