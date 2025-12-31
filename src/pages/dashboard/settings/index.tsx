import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, Volume2, Bell, AlertTriangle, CheckCircle, ChevronRight, Zap
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { api } from '../../../lib/api';
import { SectionCard } from './components/SectionCard';
import { BookingRequirementsContent } from './components/BookingRequirementsContent';
import { VoiceSettingsContent } from './components/VoiceSettingsContent';
import { NotificationSettingsContent } from './components/NotificationSettingsContent';
import type { NotificationSettings, Voice, VoiceSettings } from '../../../types/settings';

// Global state for tracking unsaved changes
let globalHasUnsavedChanges = {
  voiceSettings: false,
  notifications: false,
  bookingRequirements: false
};

const Settings = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationSettings>({
    urgent_call_alerts: true,
    booking_confirmations: true,
    daily_summary: false,
    missed_call_alerts: true
  });
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice_id: '',
    speaking_speed: 1.0,
    conversation_tone: 'friendly',
    custom_greeting: '',
    after_hours_greeting: '',
    language: 'en-US',
    is_active: true
  });

  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('voice');

  useEffect(() => {
    const anyChanges = globalHasUnsavedChanges.voiceSettings || 
                       globalHasUnsavedChanges.notifications ||
                       globalHasUnsavedChanges.bookingRequirements;
    setHasUnsavedChanges(anyChanges);
  }, [voiceSettings, notifications]);

  useEffect(() => {
    const handleBookingChanges = (e: Event) => {
      const customEvent = e as CustomEvent;
      globalHasUnsavedChanges.bookingRequirements = customEvent.detail?.hasChanges || false;
      setHasUnsavedChanges(
        globalHasUnsavedChanges.voiceSettings || 
        globalHasUnsavedChanges.notifications ||
        globalHasUnsavedChanges.bookingRequirements
      );
    };

    window.addEventListener('booking-requirements-changes', handleBookingChanges);
    return () => {
      window.removeEventListener('booking-requirements-changes', handleBookingChanges);
    };
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const voicesResp = await api.getVoices().catch(e => console.warn("Voices load failed", e));
      if (voicesResp?.data) setAvailableVoices(voicesResp.data);

      const voiceSettingsResp = await api.getVoiceSettings().catch(e => console.warn("Voice settings load failed", e));
      if (voiceSettingsResp) {
        setVoiceSettings({
          id: voiceSettingsResp.id,
          voice_id: voiceSettingsResp.voice_id || '',
          speaking_speed: voiceSettingsResp.speaking_speed || 1.0,
          conversation_tone: voiceSettingsResp.conversation_tone || 'friendly',
          custom_greeting: voiceSettingsResp.custom_greeting || '',
          after_hours_greeting: voiceSettingsResp.after_hours_greeting || '',
          language: voiceSettingsResp.language || 'en-US',
          is_active: voiceSettingsResp.is_active !== undefined ? voiceSettingsResp.is_active : true
        });
      }

      const savedNotifications = localStorage.getItem('notification_settings');
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceChange = (updates: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...updates }));
    globalHasUnsavedChanges.voiceSettings = true;
    setHasUnsavedChanges(true);
  };

  const handleNotificationChange = (updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
    globalHasUnsavedChanges.notifications = true;
    setHasUnsavedChanges(true);
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    setMessage(null);
    try {
      if (globalHasUnsavedChanges.voiceSettings) {
        const voiceUpdates = {
          voice_id: voiceSettings.voice_id,
          speaking_speed: voiceSettings.speaking_speed,
          conversation_tone: voiceSettings.conversation_tone,
          custom_greeting: voiceSettings.custom_greeting,
          after_hours_greeting: voiceSettings.after_hours_greeting,
          language: voiceSettings.language,
          is_active: voiceSettings.is_active
        };
        await api.updateVoiceSettings(voiceUpdates);
      }

      if (globalHasUnsavedChanges.notifications) {
        localStorage.setItem('notification_settings', JSON.stringify(notifications));
      }

      if (globalHasUnsavedChanges.bookingRequirements) {
        console.log('[Settings] Triggering booking requirements save...');
        const promises: Promise<any>[] = [];
        window.dispatchEvent(new CustomEvent('booking-requirements-save', {
          detail: { registerPromise: (p: Promise<any>) => promises.push(p) }
        }));
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      }

      globalHasUnsavedChanges = {
        voiceSettings: false,
        notifications: false,
        bookingRequirements: false
      };
      setHasUnsavedChanges(false);

      setMessage({ type: 'success', text: 'All settings saved successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving all settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSavingAll(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">Loading Configuration</span>
        </div>
      </DashboardLayout>
    );
  }

  const sections = [
    { id: 'voice', label: 'AI Voice', icon: Volume2, description: 'Sound & Persona' },
    { id: 'booking', label: 'Booking', icon: Zap, description: 'Rules & Requirements' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'System Notifications' },
  ];

  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
        
        {/* --- Sidebar / Tabs --- */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-100 bg-white flex flex-col shrink-0">
          <div className="p-4 lg:p-6 pb-2 lg:pb-4">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] mt-0.5">Configuration</p>
          </div>

          {/* Scrollable Tabs Area */}
          <div className="flex-1 overflow-x-auto lg:overflow-y-auto px-3 py-2 lg:py-1 flex lg:flex-col gap-1 custom-scrollbar scrollbar-hide lg:scrollbar-default">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-3 p-2.5 lg:p-3 rounded-xl transition-all duration-300 group ${
                  activeSection === section.id
                    ? 'bg-indigo-50/80 text-indigo-900 lg:border lg:border-indigo-100/50 shadow-sm shadow-indigo-100/20'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  activeSection === section.id 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600'
                }`}>
                  <section.icon size={14} />
                </div>
                <div className="text-left">
                  <p className={`text-[12px] font-black tracking-tight transition-colors ${
                    activeSection === section.id ? 'text-slate-900' : 'text-slate-500'
                  }`}>{section.label}</p>
                  <p className="hidden lg:block text-[9px] font-bold text-slate-400 uppercase tracking-wider">{section.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop Save Button Area */}
          <div className="hidden lg:block p-5 mt-auto border-t border-slate-50">
            <button
              onClick={handleSaveAll}
              disabled={savingAll || !hasUnsavedChanges}
              className={`
                w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                ${savingAll || !hasUnsavedChanges
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {savingAll ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {savingAll ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header / Alerts */}
            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm animate-in fade-in slide-in-from-top-2 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                  : 'bg-rose-50 text-rose-800 border-rose-100'
              }`}>
                <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                </div>
                <span className="font-bold text-[10px] uppercase tracking-wider">{message.text}</span>
              </div>
            )}

            {/* Content Sections */}
            <div className="space-y-6">
              {activeSection === 'voice' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">AI Voice Setup</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sound & Persona Configuration</p>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/voice-model/method')}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      Advanced <ChevronRight size={12} />
                    </button>
                  </div>
                  
                  <div className="bg-white p-5 lg:p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <VoiceSettingsContent 
                      settings={voiceSettings}
                      availableVoices={availableVoices}
                      onChange={handleVoiceChange}
                      onNavigateToAdvanced={() => navigate('/dashboard/voice-model/method')}
                    />
                  </div>
                </div>
              )}

              {activeSection === 'booking' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Booking Requirements</h2>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Appointment Rule Definition</p>
                    </div>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('booking-requirements-add-trigger'));
                      }}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      Add Field
                    </button>
                  </div>
                  <div className="bg-white p-5 lg:p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <BookingRequirementsContent />
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Notification Alerts</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">System Alert Preferences</p>
                  </div>
                  <div className="bg-white p-5 lg:p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                    <NotificationSettingsContent 
                      settings={notifications}
                      onChange={handleNotificationChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Save Button Area (Sticky at bottom) */}
            <div className="lg:hidden sticky bottom-0 pt-4 pb-2 bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 mt-8">
              <button
                onClick={handleSaveAll}
                disabled={savingAll || !hasUnsavedChanges}
                className={`
                  w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
                  ${savingAll || !hasUnsavedChanges
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
                  }
                `}
              >
                {savingAll ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {savingAll ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0; /* Slate-200 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1; /* Slate-300 */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Settings;