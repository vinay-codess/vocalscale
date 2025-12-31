import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useCallLogs } from '../../../hooks/useCallLogs';
import { useCallLog } from '../../../hooks/useCallLog';
import { useSearch } from '../../../context/SearchContext';
import type { CallLogFilters } from './types';
import LogList from './components/LogList';
import LogDetails from './components/LogDetails';
import LogFilters from './components/LogFilters';
import { Loader2, ArrowLeft, RefreshCw, Phone, XCircle, FileText, Zap, Clock, Calendar } from 'lucide-react';
import { startOfDay, subDays, isAfter, isBefore, parseISO } from 'date-fns';

const CallLogsPage = () => {
  const { callId } = useParams<{ callId?: string }>();
  const { searchQuery } = useSearch();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(callId || null);
  const [filters, setFilters] = useState<CallLogFilters>({
    search: searchQuery,
    status: 'All',
    type: 'All',
    dateRange: '7d'
  });
  const [customDate, setCustomDate] = useState<string>('');

  // Sync global search query with local filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  const { logs, loading: listLoading, error: listError, refetch } = useCallLogs({ ...filters, customDate });
  const { log: singleLog, loading: singleLoading, error: singleError } = useCallLog(callId);

  // --- Stats Calculation ---
  const stats = (() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(subDays(now, 1));
    const validLogs = logs.filter(log => log.created_at);
    
    const todayLogs = validLogs.filter(l => isAfter(parseISO(l.created_at), todayStart));
    const yesterdayLogs = validLogs.filter(l => {
      const date = parseISO(l.created_at);
      return isAfter(date, yesterdayStart) && isBefore(date, todayStart);
    });

    const callsToday = todayLogs.length;
    const callsYesterday = yesterdayLogs.length;
    const callsTrend = callsYesterday > 0 ? Math.round(((callsToday - callsYesterday) / callsYesterday) * 100) : (callsToday > 0 ? 100 : 0);

    const urgentToday = todayLogs.filter(l => l.is_urgent || l.status?.includes('Action')).length;
    
    const avgDuration = todayLogs.length > 0 
      ? Math.round(todayLogs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / todayLogs.length)
      : 0;

    return {
      callsToday,
      callsTrend: `${callsTrend > 0 ? '+' : ''}${callsTrend}%`,
      callsTrendUp: callsTrend >= 0,
      urgentToday,
      avgDuration: avgDuration > 60 ? `${Math.floor(avgDuration/60)}m ${avgDuration%60}s` : `${avgDuration}s`
    };
  })();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setCustomDate(date);
    if (date) {
      handleFilterChange('dateRange', 'Custom');
    }
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'All',
      type: 'All',
      dateRange: '7d'
    });
    setCustomDate('');
  };

  useEffect(() => {
    if (callId) {
      setSelectedLogId(callId);
    } else {
      setSelectedLogId(null);
    }
  }, [callId]);

  const selectedLog = callId ? singleLog : logs.find(l => l.id === selectedLogId);

  const filtersNav = (
    <div className="flex items-center gap-4 w-full">
      <select 
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
      >
        <option value="All">All Status</option>
        <option value="Completed">Completed</option>
        <option value="In Progress">In Progress</option>
        <option value="Failed">Failed</option>
      </select>

      <select 
        value={filters.type}
        onChange={(e) => handleFilterChange('type', e.target.value)}
        className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
      >
        <option value="All">All Types</option>
        <option value="Booking">Booking</option>
        <option value="Inquiry">Inquiry</option>
        <option value="Urgent">Urgent</option>
        <option value="General">General</option>
      </select>

      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Calendar size={14} className="text-slate-400 group-focus-within:text-indigo-500" />
        <input 
          type="date"
          value={customDate}
          onChange={handleCustomDateChange}
          className="bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-600 outline-none w-24 cursor-pointer"
        />
      </div>

      <select 
        value={filters.dateRange}
        onChange={(e) => {
          handleFilterChange('dateRange', e.target.value);
          if (e.target.value !== 'Custom') setCustomDate('');
        }}
        className="bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
      >
        <option value="24h">Last 24h</option>
        <option value="7d">Last 7 Days</option>
        <option value="30d">Last 30 Days</option>
        <option value="Custom" disabled={!customDate}>Custom Date</option>
        <option value="All">All Time</option>
      </select>

      <button 
        onClick={handleReset}
        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-95"
        title="Reset Filters"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );

  return (
    <DashboardLayout fullWidth secondaryNav={filtersNav}>
      <div className="bg-[#F8F9FB] h-full flex flex-col overflow-hidden">
        
        {/* --- Main Content Area: Split View --- */}
        <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full relative">
          
          {/* Left Panel: Master List */}
          <div className={`
            ${selectedLogId ? 'hidden md:flex' : 'flex'} 
            w-full md:w-[400px] lg:w-[450px] border-r border-slate-200 flex-col bg-white overflow-hidden shrink-0
          `}>
            {listError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
                  <XCircle size={24} />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">Failed to load logs</h3>
                <p className="text-slate-500 text-sm mb-4">{listError}</p>
                <button onClick={() => refetch()} className="text-slate-900 font-bold text-sm underline">Try again</button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <LogList 
                  logs={logs} 
                  selectedId={selectedLogId} 
                  onSelect={(id) => setSelectedLogId(id)}
                  isLoading={listLoading}
                />
              </div>
            )}
          </div>

          {/* Right Panel: Detail View */}
          <div className={`
            ${selectedLogId ? 'flex' : 'hidden md:flex'} 
            flex-1 bg-[#F8F9FB] overflow-y-auto custom-scrollbar relative
          `}>
            {selectedLogId ? (
              singleLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20">
                  <Loader2 className="animate-spin text-slate-900 mb-4" size={32} />
                  <p className="text-slate-900 font-bold">Analyzing Call Data...</p>
                </div>
              ) : selectedLog ? (
                <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300 w-full">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setSelectedLogId(null)}
                    className="md:hidden flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest mb-6 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back to List
                  </button>
                  <LogDetails log={selectedLog} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="text-red-500" size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Log Not Found</h2>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    The requested call record could not be retrieved. It may have been archived or deleted.
                  </p>
                  <button
                    onClick={() => setSelectedLogId(null)}
                    className="px-8 py-3 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Close View
                  </button>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <div className="w-24 h-24 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center mb-8 rotate-3">
                  <FileText size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Conversation</h3>
                <p className="max-w-xs mx-auto text-slate-500 text-sm leading-relaxed">
                  Click on any call log from the left panel to view full transcripts, AI analysis, and recordings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default CallLogsPage;