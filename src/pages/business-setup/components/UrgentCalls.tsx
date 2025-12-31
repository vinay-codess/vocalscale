import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { 
  PhoneForwarded, FileText, Calendar, 
  Check, AlertCircle, Edit2, Save, X, Info
} from 'lucide-react';

// --- Types ---

type UrgentCallOption = 'transfer' | 'gather' | 'auto-schedule';

interface UrgentCallConfig {
  id: UrgentCallOption;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// --- Shared Styled Components ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block transition-all placeholder-gray-400"
  />
);

// --- Main Component ---

export const UrgentCalls: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<UrgentCallOption>('gather');
  const [transferNumber, setTransferNumber] = useState('+1 (555) 000-0000');
  const [isEditing, setIsEditing] = useState(false);

  const options: UrgentCallConfig[] = [
    {
      id: 'transfer',
      title: 'Instant Transfer',
      description: 'Forward high-priority calls directly to your phone immediately.',
      color: 'red',
      icon: <PhoneForwarded size={24} />,
    },
    {
      id: 'gather',
      title: 'Intelligent Gathering',
      description: 'AI collects critical details and sends a summary via notification.',
      color: 'blue',
      icon: <FileText size={24} />,
    },
    {
      id: 'auto-schedule',
      title: 'Priority Booking',
      description: 'Book the next available slot and flag the appointment as urgent.',
      color: 'amber',
      icon: <Calendar size={24} />,
    },
  ];

  // Helper for styling based on state
  const getOptionStyles = (color: string, isSelected: boolean) => {
    const base = "relative p-5 rounded-xl border-2 text-left transition-all duration-300 group";
    
    if (isSelected) {
      const colorMap: Record<string, string> = {
        red: 'border-red-500 bg-red-50/50 shadow-sm',
        blue: 'border-indigo-500 bg-indigo-50/50 shadow-sm',
        amber: 'border-amber-500 bg-amber-50/50 shadow-sm',
      };
      return `${base} ${colorMap[color]}`;
    }
    
    return `${base} border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`;
  };

  const getIconContainer = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
      red: { bg: 'bg-red-100', text: 'text-red-600', ring: 'ring-red-200' },
      blue: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
    };
    const styles = colorMap[color];
    return `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${styles.bg} ${styles.text} ${isSelected ? 'ring-4 ' + styles.ring : ''}`;
  };

  const getCheckmarkColor = (color: string) => {
     const colorMap: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-indigo-500',
      amber: 'bg-amber-500',
    };
    return colorMap[color];
  }

  return (
    <div className="space-y-6">
    
      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={getOptionStyles(option.color, isSelected)}
            >
              {/* Check Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className={`w-6 h-6 rounded-full ${getCheckmarkColor(option.color)} flex items-center justify-center text-white shadow-sm`}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={getIconContainer(option.color, isSelected)}>
                {option.icon}
              </div>

              {/* Content */}
              <div className="mt-4">
                <h3 className={`font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.title}
                </h3>
                <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Configuration Panels (Animated) */}
      <div className="min-h-[100px]">
        <AnimatePresence mode="wait">
          
          {/* TRANSFER CONFIG */}
          {selectedOption === 'transfer' && (
            <m.div
              key="transfer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-white rounded-xl border border-red-100 shadow-sm ring-1 ring-red-50"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                   <PhoneForwarded size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Call Forwarding Number</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Urgent calls will bridge directly to this number immediately.
                  </p>
                  
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        value={transferNumber}
                        onChange={(e) => setTransferNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        autoFocus
                      />
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <Save size={16} /> Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xl grayscale opacity-50">📱</span>
                        <span className="text-gray-900 font-mono font-medium">{transferNumber}</span>
                      </div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="ml-2 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Edit Number"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}

          {/* GATHER INFO CONFIG */}
          {selectedOption === 'gather' && (
            <m.div
              key="gather"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-white rounded-xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                   <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Delivery Channels</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Where should the AI send the transcript and summary?
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'SMS Notification', default: true },
                      { label: 'Push Notification', default: true },
                      { label: 'Email Digest', default: false }
                    ].map((channel, idx) => (
                      <label key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                           <div className="relative flex items-center">
                              <input 
                                type="checkbox" 
                                defaultChecked={channel.default}
                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                              />
                              <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 14" fill="none">
                                <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                           </div>
                           <span className="text-sm font-medium text-gray-700">{channel.label}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 peer-checked:bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          )}

          {/* AUTO SCHEDULE CONFIG (Empty/Placeholder) */}
          {selectedOption === 'auto-schedule' && (
             <m.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 bg-white rounded-xl border border-amber-100 shadow-sm ring-1 ring-amber-50"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                   <Calendar size={20} />
                </div>
                <div>
                   <h4 className="font-semibold text-gray-900 mb-1">Priority Booking</h4>
                   <p className="text-sm text-gray-500">
                     The AI will identify the next available slot in your calendar and offer it to the caller immediately.
                   </p>
                </div>
              </div>
            </m.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default UrgentCalls;