import React from 'react';
import { AlertCircle, Globe, Save } from 'lucide-react';
import { Toggle } from '../../components/SettingsComponents';
import type { NotificationSettingsProps } from '../../../../types/settings';

export const NotificationSettingsContent: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      {/* Urgent Call Alerts */}
      <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-rose-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 tracking-tight">Urgent Call Alerts</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Receive SMS immediately for emergency mentions</p>
          </div>
        </div>
        <Toggle 
          active={settings.urgent_call_alerts} 
          onChange={() => onChange({ urgent_call_alerts: !settings.urgent_call_alerts })} 
        />
      </div>

      {/* Booking Confirmations */}
      <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 tracking-tight">New Booking Confirmations</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Email notification for new calendar bookings</p>
          </div>
        </div>
        <Toggle 
          active={settings.booking_confirmations} 
          onChange={() => onChange({ booking_confirmations: !settings.booking_confirmations })} 
        />
      </div>

      {/* Daily Summary */}
      <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl hover:bg-white hover:border-indigo-100 transition-all duration-300 border border-slate-100 group">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <Save size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 tracking-tight">Daily Activity Summary</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Digest of all daily calls and bookings</p>
          </div>
        </div>
        <Toggle 
          active={settings.daily_summary} 
          onChange={() => onChange({ daily_summary: !settings.daily_summary })} 
        />
      </div>
    </div>
  );
};
