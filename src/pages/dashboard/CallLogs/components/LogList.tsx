import React, { useState, useEffect } from 'react';
import {
  Phone, Clock, ChevronLeft, ChevronRight, Zap, MoreHorizontal
} from 'lucide-react';
import type { CallLog } from '../types';
import { format, parseISO } from 'date-fns';

interface LogListProps {
  logs: CallLog[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

const Badge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    Booking: 'bg-indigo-100/50 text-indigo-700 border-indigo-200/60 backdrop-blur-sm',
    Inquiry: 'bg-purple-100/50 text-purple-700 border-purple-200/60 backdrop-blur-sm',
    Urgent: 'bg-rose-100/50 text-rose-700 border-rose-200/60 backdrop-blur-sm',
    General: 'bg-slate-100/50 text-slate-600 border-slate-200/60 backdrop-blur-sm',
  };
  const style = styles[type] || styles.General;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${style}`}>
      {type}
    </span>
  );
};

const LogList: React.FC<LogListProps> = ({ logs, selectedId, onSelect, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Reduced slightly for a cleaner look

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [logs]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Modern Header with Gradient Border */}
      <div className="px-6 py-5 flex justify-between items-end border-b border-white/50 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xs font-bold text-indigo-400 tracking-[0.15em] uppercase mb-1">
            Activity Log
          </h2>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {logs.length} <span className="text-sm font-medium text-slate-400">calls</span>
          </p>
        </div>

        {/* Custom Pagination Controls */}
        <div className="flex items-center bg-white/80 p-1 rounded-xl shadow-sm border border-slate-100/60">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-600 w-8 text-center tabular-nums">
            {currentPage}<span className="text-slate-300">/{totalPages || 1}</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition-all duration-200"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {isLoading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-10 h-10 border-3 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Checking for logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-1 ring-white/50">
              <Phone size={24} className="text-indigo-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No logs available</p>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-600/10 overflow-hidden z-20">
                <div className="w-full h-full bg-indigo-600/40 animate-pulse"></div>
              </div>
            )}
            {currentLogs.map((log) => {
            const isSelected = selectedId === log.id;
            const isUrgent = log.is_urgent || log.status?.includes('Action');

            return (
              <div
                key={log.id}
                onClick={() => onSelect(log.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ease-out cursor-pointer
                  ${isSelected 
                    ? 'bg-white border-slate-900 shadow-xl shadow-indigo-900/5 ring-1 ring-slate-900/20 transform scale-[1.01]' 
                    : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5'
                  }`}
              >
                {/* Top Row: Name & Time */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                      ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      <Phone size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className={`block text-sm font-semibold leading-tight transition-colors ${
                        isSelected ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-700'
                      }`}>
                        {log.caller_name || 'Unknown Caller'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {log.phone_number || '--'}
                      </span>
                    </div>
                  </div>

                  {/* Date Display */}
                  <div className={`text-[10px] font-bold py-1 px-2 rounded-md transition-all ${
                    isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {format(parseISO(log.created_at), 'MMM dd')}
                    <span className="opacity-70 font-normal ml-1">
                      {format(parseISO(log.created_at), 'h:mm a')}
                    </span>
                  </div>
                </div>

                {/* Meta Data Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge type={log.category} />
                  
                  {/* Duration Pill */}
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors
                    ${isSelected ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    <Clock size={10} strokeWidth={2.5} />
                    {formatDuration(log.duration_seconds || 0)}
                  </div>

                  {isUrgent && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                      <Zap size={10} className="fill-amber-500" />
                      <span className="text-[10px] font-bold tracking-wide">URGENT</span>
                    </div>
                  )}
                </div>

                {/* Summary Text */}
                <p className={`text-xs leading-relaxed transition-all duration-300 ${
                  isSelected ? 'text-slate-700 font-medium' : 'text-slate-400 group-hover:text-slate-500'
                }`}>
                  {log.summary || log.transcript || 'No details available'}
                </p>

                {/* Action Button (Visual Only) */}
                <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isSelected ? 'opacity-100' : ''}`}>
                     <button className="text-slate-300 hover:text-indigo-500 transition-colors">
                        <MoreHorizontal size={16} />
                     </button>
                </div>

              </div>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
};

export default LogList;