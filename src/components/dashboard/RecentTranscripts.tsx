import React from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Call {
  id: string | number;
  caller_name: string;
  created_at: string;
  category: string;
  transcript_snippet?: string;
  summary?: string;
}

interface RecentTranscriptsProps {
  calls: Call[];
}

const RecentTranscripts: React.FC<RecentTranscriptsProps> = ({ calls }) => {
  const navigate = useNavigate();

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-rose-50 text-rose-600 border-rose-200',
      inquiry: 'bg-sky-50 text-sky-600 border-sky-200',
      support: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      default: 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  // UPDATED: Show exactly 6 items, as requested
  const displayedCalls = [...calls]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    // Removed h-full to allow natural expansion based on content
    <div className="bg-white border-slate-200/60 shadow-lg rounded-2xl overflow-hidden flex flex-col ring-1 ring-slate-200/20">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Transcripts</h3>
          <p className="text-sm text-gray-500 mt-1">Latest customer interactions</p>
        </div>
        {calls.length > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {calls.length}
          </span>
        )}
      </div>

      {/* List Content - Expands naturally */}
      <div className="divide-y divide-gray-50">
        {calls.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Phone size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No calls found</p>
            <p className="text-xs text-gray-400 mt-1">Calls will appear here when available</p>
          </div>
        ) : (
          displayedCalls.map((call) => (
            <div
              key={call.id}
              className="p-4 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(`/dashboard/calls/${call.id}`)}
            >
              <div className="flex items-start gap-3">
                {/* Avatar Circle */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-white/20">
                    {(call.caller_name || "U").charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {call.caller_name || "Unknown Caller"}
                    </h4>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(call.category)}`}>
                      {call.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2 font-medium">
                    {formatTime(call.created_at)}
                  </p>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    "{call.transcript_snippet || call.summary}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {calls.length > 0 && (
        <div className="p-3 bg-slate-50/50 border-t border-slate-100/60">
          <button
            onClick={() => navigate('/dashboard/calls')}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            View all call logs
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTranscripts;