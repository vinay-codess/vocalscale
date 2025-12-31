import React, { useState, useEffect } from 'react';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export const LivePreview = () => {
  const { state } = useBusinessSetup();
  const [messages, setMessages] = useState<Message[]>([]);

  const businessName = state.data.business.business_name || "Your Business";

  useEffect(() => {
    setMessages([
      { role: 'ai', text: `Hi, thanks for calling ${businessName}. How can I assist you today?` }
    ]);
  }, [businessName]);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header - Minimized */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview</h3>
        <div className="flex items-center gap-1.5">
          <span className="flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-bold text-green-400 uppercase">Live</span>
        </div>
      </div>

      {/* Main Card - Compact Height */}
      <div className="relative bg-slate-900 rounded-xl shadow-inner border border-slate-800 flex flex-col flex-1 overflow-hidden">
        
        {/* Subtle Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full pointer-events-none"></div>

        {/* AI Identity - Compact */}
        <div className="flex items-center gap-3 p-3 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-xs font-semibold truncate">{businessName}</h3>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-indigo-300">AI Assistant</span>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-600"></span>
              <span className="text-[10px] text-slate-500">Online</span>
            </div>
          </div>
        </div>

        {/* Conversation - Tighter Spacing */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-slate-900 scrollbar-hide">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`max-w-[90%] text-[11px] leading-snug px-3 py-2 ${
                msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-lg rounded-tr-sm shadow-sm'
                : 'bg-slate-800 text-slate-300 border border-slate-700/50 rounded-lg rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};