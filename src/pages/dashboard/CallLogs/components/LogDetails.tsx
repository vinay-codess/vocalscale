import React from 'react';
import { Share, Download, Check, FileText, Flag, Bot, ArrowUpRight, Info, Mic, Clock } from 'lucide-react';
import type { CallLog } from '../types';
import AISummary from './AISummary';
import { format, parseISO } from 'date-fns';

interface LogDetailsProps {
  log: CallLog;
}

const parseTranscript = (transcript?: string) => {
  if (!transcript) return [];
  
  const lines = transcript.split('\n');
  const messages: { role: string; rawRole: string; content: string; id: number }[] = [];
  let currentMessage: { role: string; rawRole: string; content: string; id: number } | null = null;
  
  lines.forEach((line, index) => {
    const colonIndex = line.indexOf(':');
    let isNewMessage = false;
    let potentialRole = '';
    
    if (colonIndex !== -1) {
      potentialRole = line.substring(0, colonIndex).trim().toLowerCase();
      if (['system', 'user', 'caller', 'assistant', 'ai'].includes(potentialRole)) {
        isNewMessage = true;
      }
    }
    
    if (isNewMessage) {
      let normalizedRole = 'unknown';
      if (potentialRole.includes('assistant') || potentialRole.includes('ai')) normalizedRole = 'assistant';
      else if (potentialRole.includes('user') || potentialRole.includes('caller')) normalizedRole = 'user';
      else if (potentialRole.includes('system')) normalizedRole = 'system';
      
      // Skip technical roles like 'tool' or 'error'
      if (['tool', 'error', 'debug', 'internal'].includes(potentialRole)) {
        currentMessage = null;
        return;
      }

      currentMessage = { 
        role: normalizedRole, 
        rawRole: potentialRole, 
        content: line.substring(colonIndex + 1).trim(), 
        id: index 
      };
      messages.push(currentMessage);
    } else {
      // If it's not a new message, check if the line itself looks like technical output
      const technicalPatterns = [
        /^tool:/i,
        /^error:/i,
        /^{"error":/i,
        /^{"status":/i,
        /^debug:/i
      ];
      
      if (technicalPatterns.some(pattern => pattern.test(line.trim()))) {
        return; // Skip technical lines
      }

      if (currentMessage) {
        currentMessage.content += '\n' + line;
      } else {
        // Only create unknown message if it doesn't look like technical output
        currentMessage = { role: 'unknown', rawRole: 'unknown', content: line, id: index };
        messages.push(currentMessage);
      }
    }
  });
  
  return messages.filter(m => m.role === 'user' || m.role === 'assistant');
};

const LogDetails: React.FC<LogDetailsProps> = ({ log }) => {
  const formattedDate = format(parseISO(log.created_at), 'MMM dd, yyyy');
  const formattedTime = format(parseISO(log.created_at), 'h:mm a');
  
  const transcriptMessages = parseTranscript(log.transcript);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 w-full">
      
      {/* --- Top Metadata & Actions --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
         <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm shrink-0">
  <Mic size={20} />
         </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black text-slate-900 tracking-tight truncate">Call Intelligence</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate">
              {formattedDate} • {formattedTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <span className="px-3 py-1.5 bg-white text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200 shadow-sm whitespace-nowrap">
            UUID: {log.id.slice(-8)}
          </span>
          <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm active:scale-95">
              <Share size={18} />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm active:scale-95">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- AI Summary Card --- */}
      <AISummary summary={log.summary || log.notes} />

      {/* --- Main Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Caller Identity & Actions Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-500 shrink-0">
                  {log.caller_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900 truncate">{log.caller_name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                    <span className="flex items-center gap-1 shrink-0"><Mic size={12} /> {log.phone_number}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full hidden xs:block"></span>
                    <span className="uppercase font-bold tracking-wider bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0">{log.category}</span>
                  </div>
                  {log.tags && log.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                          {log.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 whitespace-nowrap">
                                  #{tag}
                              </span>
                          ))}
                      </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 w-full sm:w-auto">
                  <Check size={14} />
                  Resolve
                </button>
              </div>
            </div>
          </div>

          {/* Transcript Container */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">Live Transcript</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Recorded
              </div>
            </div>
          
            <div className="p-6 space-y-6 bg-white flex-1">
              {transcriptMessages.length > 0 ? (
                 transcriptMessages.map((msg) => {
                   const isAI = msg.role === 'assistant';
                   
                   return (
                    <div key={msg.id} className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}>
                       <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${isAI ? 'bg-slate-900 border-slate-900 text-white' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          {isAI ? <Bot size={16} strokeWidth={2.5} /> : <span className="text-xs font-bold">{log.caller_name.substring(0,1).toUpperCase()}</span>}
                       </div>
                       <div className={`space-y-1 max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                         <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap border ${
                           isAI 
                             ? 'bg-slate-50 text-slate-700 border-slate-100 rounded-2xl rounded-tl-none' 
                             : 'bg-slate-900 text-white rounded-2xl rounded-tr-none border-transparent'
                         }`}>
                           {msg.content}
                         </div>
                       </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-20">
                  <FileText size={32} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No transcript data available.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Agent Notes (Conditional) */}
          {log.notes && (
             <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-5 flex gap-4">
               <div className="mt-0.5 text-amber-500">
                 <Info size={20} />
               </div>
               <div>
                 <h3 className="font-bold text-amber-900 text-sm mb-1">System Note</h3>
                 <p className="text-sm text-amber-800 leading-relaxed">{log.notes}</p>
               </div>
             </div>
           )}
        </div>

        {/* Right Column: Meta Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
            
            {/* Call Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} className="text-slate-400" />
                    Call Metadata
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-50">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Date</span>
                          <span className="text-sm font-bold text-slate-900">{formattedDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Time</span>
                          <span className="text-sm font-bold text-slate-900">{formattedTime}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} /> Duration
                        </span>
                        <span className="text-sm font-bold text-slate-900 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {Math.floor((log.duration_seconds || 0) / 60)}m {(log.duration_seconds || 0) % 60}s
                        </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Status</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-lg ${
                          log.status === 'Completed' 
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' 
                            : 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                        }`}>{log.status}</span>
                    </div>
                    
                    {log.lead_score && (
                        <div className="space-y-2 pb-4 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Lead Score</span>
                              <span className="text-sm font-black text-blue-600">{log.lead_score}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                  style={{ width: `${log.lead_score}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {log.handled_by && (
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Handled By</span>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {log.handled_by.substring(0, 1).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-slate-900">{log.handled_by}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Follow Up Alert */}
            {log.follow_up_required && (
                <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm group hover:border-red-200 transition-all cursor-pointer">
                    <div className="p-4 bg-red-50 flex items-center justify-between border-b border-red-100">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-red-100 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
                                <Flag size={14} fill="currentColor" />
                            </div>
                            <h4 className="font-black text-red-800 text-[10px] uppercase tracking-widest">Action Req</h4>
                        </div>
                        <ArrowUpRight size={14} className="text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <div className="p-5">
                        <p className="text-xs text-red-600 leading-relaxed font-medium">
                            This interaction has been flagged for manual follow-up by the AI agent.
                        </p>
                        <button className="mt-4 w-full py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200">
                            Process Alert
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LogDetails;