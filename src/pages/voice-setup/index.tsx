import { useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { 
  Plus, 
  Smartphone, 
  PlusCircle, 
  Search, 
  Link as LinkIcon, 
  Filter, 
  Download, 
  Settings2, 
  ArrowUpRight,
  X,
  Loader2,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { usePhoneNumbers } from '../../hooks/usePhoneNumbers';
import { env } from '../../config/env';

import type { PhoneNumber } from '../../types/voice';

const VoiceSetup = () => {
  const navigate = useNavigate();
  const { numbers, loading, refetch, updateLocalNumber, setNumbers } = usePhoneNumbers();
  
  const [editingNumber, setEditingNumber] = useState<PhoneNumber | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleEditClick = (num: PhoneNumber) => {
    setEditingNumber(num);
    setEditName(num.number || num.phone_number);
  };

  const handleSaveEdit = async () => {
    if (!editingNumber) return;
    
    setIsSaving(true);
    try {
      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${env.API_URL}/phone-numbers/${editingNumber.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendly_name: editName
        })
      });

      if (response.ok) {
        updateLocalNumber(editingNumber.id, { number: editName, friendly_name: editName });
        setEditingNumber(null);
      } else {
        console.error('Failed to update number');
      }
    } catch (e) {
      console.error('Error updating number', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    if (!id) return;
    
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setNumbers(prev => prev.map(n => {
        if (newStatus === 'active') {
            return {
                ...n,
                status: n.id === id ? 'active' : 'inactive',
                badge: n.id === id ? 'Active' : 'Inactive'
            };
        } else {
            return n.id === id ? { ...n, status: 'inactive', badge: 'Inactive' } : n;
        }
    }));

    try {
      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${env.API_URL}/phone-numbers/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        console.error('Failed to update status on server');
        refetch();
      }
    } catch (e) {
      console.error('Failed to update status', e);
      refetch();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Phone Numbers</h1>
          <p className="text-slate-500 font-medium">Manage your Twilio numbers and provision new lines.</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100 px-2 pt-2 shrink-0 bg-slate-50/30">
            <button className="flex items-center gap-3 px-6 py-4 text-sm font-bold border-b-2 border-indigo-600 bg-white text-indigo-700 shadow-sm rounded-t-lg transition-colors mb-[-1px]">
              <Smartphone className="w-4 h-4" />
              My Numbers
              <span className="ml-2 bg-indigo-50 text-indigo-600 text-xs py-0.5 px-2.5 rounded-full border border-indigo-100">{numbers.length}</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/voice-setup/setup-subaccount')}
              className="flex items-center gap-3 px-6 py-4 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-t-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Get New Number
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 bg-white">
            <div className="relative w-full xl:w-[400px] group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input 
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm" 
                placeholder="Search numbers..." 
                type="text"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => navigate('/dashboard/voice-setup/existing')}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all group"
              >
                <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                Add Existing
              </button>
              <div className="h-9 w-px bg-slate-200 hidden xl:block"></div>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 flex flex-col bg-white min-h-[400px]">
            
            {loading ? (
               <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-12 px-6 py-5 items-center rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                        <div className="flex flex-col gap-2.5">
                           <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                           <div className="h-3.5 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="col-span-3">
                         <div className="h-7 w-20 bg-slate-200 rounded-full animate-pulse" />
                      </div>
                      <div className="col-span-3 flex gap-2">
                         <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                         <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                      </div>
                      <div className="col-span-2" />
                    </div>
                  ))}
               </div>
            ) : numbers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {/* Header Row */}
                <div className="grid grid-cols-12 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  <div className="col-span-4">Number Details</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-3">Capabilities</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                
                {/* Items */}
                {numbers.map((num: PhoneNumber, idx) => (
                  <div key={idx} className="group grid grid-cols-12 px-6 py-5 items-center rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-white">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm font-mono">{num.phone_number || num.phoneNumber || '(415) 555-0123'}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-0.5">{num.number || 'Main Business Line'}</p>
                      </div>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <button
                        onClick={() => handleStatusChange(num.id, num.status || 'inactive')}
                        className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${num.status === 'active' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        style={{ width: '52px' }}
                        role="switch"
                        aria-checked={num.status === 'active'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${num.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                      <span className="ml-3 text-sm font-bold text-slate-900">
                        {num.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase border border-slate-200">Voice</span>
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase border border-slate-200">SMS</span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(num)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            
              <div className="flex flex-col items-center justify-center flex-1 h-full py-12 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-200">
                    <Smartphone className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">No Phone Numbers</h3>
                 <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
                    You haven't connected any phone numbers yet. Get started by provisioning a new line.
                 </p>
                 <button
                    onClick={() => navigate('/dashboard/voice-setup/setup-subaccount')}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5"
                 >
                    <Plus className="w-4 h-4" />
                    <span>Get New Number</span>
                 </button>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 shrink-0 bg-slate-50/30">
            <p className="text-xs text-slate-500 mb-4 sm:mb-0 font-medium">
              Showing <span className="font-bold text-slate-900">{numbers.length > 0 ? 1 : 0}</span> to <span className="font-bold text-slate-900">{numbers.length}</span> of <span className="font-bold text-slate-900">{numbers.length}</span> results
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button disabled className="flex-1 sm:flex-none px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-400 cursor-not-allowed font-bold">Previous</button>
              <button disabled className="flex-1 sm:flex-none px-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-400 cursor-not-allowed font-bold">Next</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      {editingNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Edit Details</h3>
              <button 
                onClick={() => setEditingNumber(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-mono text-sm font-medium">
                  {editingNumber.phone_number}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Friendly Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm font-bold text-slate-900 bg-white shadow-sm"
                  placeholder="e.g. Main Office Line"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingNumber(null)}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VoiceSetup;