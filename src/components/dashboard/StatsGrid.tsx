import React from 'react';
import { Phone, Calendar, AlertTriangle, Clock, TrendingUp, type LucideIcon } from 'lucide-react';

interface StatsGridProps {
  stats: {
    total: number;
    urgent: number;
    handled: number;
    minutesSaved?: number;
  };
  appointmentsCount: number;
}

interface StatCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string; // Kept for interface compatibility, though unused in component
  bgColor: string;
  textColor: string;
  borderColor: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCard> = ({ label, value, icon: Icon, bgColor, textColor, borderColor, highlight }) => {
  return (
    <div 
      className={`group relative bg-white rounded-2xl border-2 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${borderColor} overflow-hidden`}
    >
      {/* Decorative Background Blob */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bgColor} opacity-50 blur-2xl group-hover:scale-125 transition-transform duration-500`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${bgColor} ${borderColor}`}>
            <Icon size={20} className={textColor} strokeWidth={2.5} />
          </div>
          {highlight && (
            <div className="animate-pulse">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
          {label === 'Total Calls' && (
             <div className="p-1 bg-emerald-50 rounded text-emerald-600">
               <TrendingUp size={12} strokeWidth={3} />
             </div>
          )}
        </div>
        
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
          {label}
        </p>
      </div>
    </div>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats, appointmentsCount }) => {
  const savedTime = stats.minutesSaved || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        label="Total Calls"
        value={stats.total}
        icon={Phone}
        color="blue" // Included to satisfy TypeScript
        bgColor="bg-blue-50"
        textColor="text-blue-600"
        borderColor="border-slate-100"
      />
      
      <StatCard 
        label="Appointments"
        value={appointmentsCount}
        icon={Calendar}
        color="purple" // Included to satisfy TypeScript
        bgColor="bg-purple-50"
        textColor="text-purple-600"
        borderColor="border-slate-100"
      />
      
      <StatCard 
        label="Action Req"
        value={stats.urgent}
        icon={AlertTriangle}
        color="orange" // Included to satisfy TypeScript
        bgColor="bg-orange-50"
        textColor="text-orange-600"
        borderColor={stats.urgent > 0 ? 'border-orange-200' : 'border-slate-100'}
        highlight={stats.urgent > 0}
      />
      
      <StatCard 
        label="Minutes Saved"
        value={`${savedTime}m`}
        icon={Clock}
        color="green" // Included to satisfy TypeScript
        bgColor="bg-emerald-50"
        textColor="text-emerald-600"
        borderColor="border-slate-100"
      />
    </div>
  );
};

export default StatsGrid;