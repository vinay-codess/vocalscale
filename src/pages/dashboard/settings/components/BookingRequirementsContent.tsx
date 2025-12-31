import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, AlertCircle, Trash2 } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { api } from '../../../../lib/api';
import type { BookingRequirement } from '../../../../types/settings';

export const BookingRequirementsContent: React.FC = () => {
   const [requirements, setRequirements] = useState<BookingRequirement[]>([]);
   const [loading, setLoading] = useState(true);
   const [hasChanges, setHasChanges] = useState(false);

   const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.getBookingRequirements();
      if (resp?.data) {
        setRequirements(resp.data);
      }
    } catch (error) {
      console.error('Failed to load booking requirements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const notifyChanges = useCallback((changed: boolean) => {
    setHasChanges(changed);
    window.dispatchEvent(new CustomEvent('booking-requirements-changes', {
      detail: { hasChanges: changed }
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await api.updateBookingRequirements(requirements);
      await loadData();
      notifyChanges(false);
      return { success: true };
    } catch (error) {
      console.error('Failed to save booking requirements:', error);
      throw error;
    }
  }, [requirements, loadData, notifyChanges]);

  useEffect(() => {
    const handleGlobalSave = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.registerPromise) {
        customEvent.detail.registerPromise(handleSave());
      }
    };

    window.addEventListener('booking-requirements-save', handleGlobalSave);
    return () => {
      window.removeEventListener('booking-requirements-save', handleGlobalSave);
    };
  }, [handleSave]);

  const isDefaultRequirement = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    return name === 'customer name' || name === 'phone number';
  };

  const handleToggleStatus = (index: number) => {
    const next = [...requirements];
    next[index] = { ...next[index], required: !next[index].required };
    setRequirements(next);
    notifyChanges(true);
  };

   const handleRemove = (index: number) => {
     if (isDefaultRequirement(requirements[index].field_name)) return;
     const next = requirements.filter((_, i) => i !== index);
     setRequirements(next);
     notifyChanges(true);
   };

   const handleAdd = () => {
     const field_name = prompt('Enter field name (e.g., Email, Address):');
     if (!field_name) return;
     
     const next = [...requirements, { field_name, required: false, field_type: 'text' }];
     setRequirements(next);
     notifyChanges(true);
   };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute w-full h-full border-2 border-slate-50 rounded-full" />
          <div className="absolute w-full h-full border-2 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">Loading Requirements</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasChanges && (
        <div className="flex items-center gap-3 text-amber-600 bg-amber-50/50 px-4 py-3 rounded-2xl border border-amber-100 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Unsaved Changes in Requirements
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {requirements.map((req, idx) => (
            <m.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="group relative bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:bg-white hover:border-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-slate-900 text-[13px] tracking-tight">{req.field_name}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-1 block ${
                    req.required ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {req.required ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
                
                <button
                  onClick={() => handleRemove(idx)}
                  className={`p-2 rounded-lg transition-all ${
                    isDefaultRequirement(req.field_name) 
                      ? 'invisible' 
                      : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </div>

              <button
                onClick={() => handleToggleStatus(idx)}
                className={`
                  w-full py-2.5 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all duration-300
                  flex items-center justify-center gap-2
                  ${req.required
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
                  }
                `}
              >
                {req.required ? (
                  <>
                    <Check size={12} strokeWidth={3.5} />
                    Required
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full border-2 border-current" />
                    Optional
                  </>
                )}
              </button>
            </m.div>
          ))}
        </AnimatePresence>

        <m.button
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleAdd}
          className="relative bg-white border-2 border-dashed border-slate-100 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 group min-h-[160px] hover:shadow-xl hover:shadow-indigo-50/50"
        >
          <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
            <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="font-black text-[9px] uppercase tracking-widest">Add Field</span>
        </m.button>
      </div>

      <div className="bg-slate-900 p-5 rounded-2xl flex gap-4 items-start shadow-xl shadow-slate-200">
        <div className="p-2 bg-white/10 rounded-lg">
          <AlertCircle size={18} className="text-white shrink-0" />
        </div>
        <div className="space-y-1">
          <p className="text-[13px] font-black text-white tracking-tight">
            Data Collection Policy
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed">
            Fields marked as <span className="text-white">Required</span> must be collected before the AI confirms any appointment.
          </p>
        </div>
      </div>

    </div>
  );
};