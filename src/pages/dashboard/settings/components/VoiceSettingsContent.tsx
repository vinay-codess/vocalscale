import React from 'react';
import { Globe } from 'lucide-react';
import { Label, Textarea } from '../../components/SettingsComponents';
import type { VoiceSettingsProps } from '../../../../types/settings';

// Internal Component: Custom Toggle Switch
const CustomToggle: React.FC<{ active: boolean; onChange: () => void }> = ({ active, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ease-out focus:outline-none ${
      active ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-slate-200'
    }`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-out ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const VoiceSettingsContent: React.FC<VoiceSettingsProps> = ({
  settings,
  availableVoices,
  onChange,
}) => {
  return (
    <div className="space-y-10">
      
      {/* SECTION: Voice & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Voice Persona */}
        <div className="space-y-2">
          <Label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Voice Persona
          </Label>
          <div className="relative group">
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-900 text-[13px] font-bold py-3 px-4 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all cursor-pointer hover:border-slate-200 shadow-sm"
              value={settings.voice_id}
              onChange={(e) => onChange({ voice_id: e.target.value })}
            >
              <option value="" disabled>Select a persona</option>
              {availableVoices.map(voice => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} — {voice.accent} {voice.gender}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Language
          </Label>
          <div className="relative group">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-900 text-[13px] font-bold py-3 pl-10 pr-10 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all cursor-pointer hover:border-slate-200 shadow-sm"
              value={settings.language}
              onChange={(e) => onChange({ language: e.target.value })}
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Speaking Speed */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Speaking Speed
          </Label>
          <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
            {settings.speaking_speed}x
          </span>
        </div>
        
        <div className="relative w-full h-6 flex items-center group">
          <div className="absolute w-full h-1.5 bg-slate-100 rounded-full" />
          <div 
            className="absolute h-1.5 bg-indigo-600 rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${((settings.speaking_speed - 0.5) / 1.5) * 100}%` }}
          />
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={settings.speaking_speed}
            onChange={(e) => onChange({ speaking_speed: parseFloat(e.target.value) })}
            className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
          />
        </div>

        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
          <span>Slow</span>
          <span>Normal</span>
          <span>Fast</span>
        </div>
      </div>

      {/* SECTION: Conversation Tone */}
      <div className="space-y-4">
        <Label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Conversation Tone
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {['friendly', 'professional', 'casual'].map((tone) => {
            const isActive = settings.conversation_tone === tone;
            return (
              <button 
                key={tone}
                onClick={() => onChange({ conversation_tone: tone })}
                className={`
                  relative py-3 px-4 font-black text-[10px] uppercase tracking-widest transition-all duration-300
                  rounded-xl border flex items-center justify-center gap-2 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-sm'
                  }
                `}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION: Custom Greeting */}
      <div className="space-y-2">
        <Label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
          Custom Greeting
        </Label>
        <div className="relative group">
          <Textarea
            rows={4}
            placeholder="Hi! Thanks for calling [Business Name]. How can I help you today?"
            value={settings.custom_greeting}
            onChange={(e) => onChange({ custom_greeting: e.target.value })}
            className="w-full bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 p-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all resize-none font-medium text-[13px] leading-relaxed shadow-sm"
          />
        </div>
      </div>
      
      {/* SECTION: System Toggle */}
      <div className="pt-8 border-t border-slate-50">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all duration-300 hover:bg-white hover:border-indigo-100">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Enable AI Receptionist
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
              Allow the AI to autonomously handle incoming calls.
            </span>
          </div>
          <CustomToggle 
            active={settings.is_active} 
            onChange={() => onChange({ is_active: !settings.is_active })}
          />
        </div>
      </div>

    </div>
  );
};