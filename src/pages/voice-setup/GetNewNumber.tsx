import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Check, 
  Grid, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { env } from '../../config/env';

interface PhoneNumber {
  phone_number: string;
  number: string;
  location: string;
  monthly_cost: number;
  badge?: string;
}

const GetNewNumber = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter] = useState('local'); // 'local', 'tollfree', 'vanity'
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingSubaccount, setCheckingSubaccount] = useState(true);
  
  // Check if user has subaccount on mount
  useEffect(() => {
    checkSubaccountStatus();
  }, []);

  const checkSubaccountStatus = async () => {
    try {
      const apiUrl = env.API_URL;

      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${apiUrl}/subaccounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.has_subaccount) {
          navigate('/dashboard/voice-setup/setup-subaccount');
          return;
        }
      } else {
        console.log('Subaccount check failed, allowing to proceed');
      }
    } catch (err) {
      console.error('Error checking subaccount:', err);
      console.log('Allowing to proceed despite error');
    } finally {
      setCheckingSubaccount(false);
    }
  };

  if (checkingSubaccount) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">Checking your account status...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const searchNumbers = async () => {
    if (!searchQuery.trim()) {
        setError("Please enter a location");
        return;
    }
    setSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      const apiUrl = env.API_URL;

      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${apiUrl}/phone-numbers/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          location: searchQuery,
          type_filter: typeFilter === 'toll-free' ? 'tollfree' : typeFilter, // Map 'toll-free' to 'tollfree'
          limit: 8
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to fetch numbers');
      }

      const data = await response.json();
      setNumbers(data.numbers || []);
      
      // Select the first number (Best Match) by default if available
      if (data.numbers && data.numbers.length > 0) {
        setSelectedNumber(data.numbers[0]);
      } else {
        setSelectedNumber(null);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to find numbers. Please try a different location.");
        setNumbers([]);
    } finally {
      setSearching(false);
    }
  };

  // Search on mount and when filter changes
  // useEffect(() => {
  //   searchNumbers();
  // }, [typeFilter]);

  const handleSearch = () => {
    searchNumbers();
  };

  const handleActivate = async () => {
    if (!selectedNumber) return;
    
    setLoading(true);
    try {
      const apiUrl = env.API_URL;

      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${apiUrl}/phone-numbers/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          phone_number: selectedNumber.phone_number
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase number');
      }

      const result = await response.json();
      if (result.success) {
        navigate('/dashboard/voice-setup');
      } else {
        throw new Error(result.error || 'Failed to purchase number');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to activate number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 font-sans text-gray-900 overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto px-6 pt-2 pb-24">
          
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Get a New Number</h1>
            <p className="text-gray-500 mt-1">Establish a local presence or go toll-free. Your AI receptionist is ready immediately.</p>
          </div>

          {/* Search and Filters Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" 
                        placeholder="Search City, State, or ZIP (e.g. 90210)" 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 min-w-[120px]"
                >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-blue-600" />
              Available Numbers
            </h3>
            <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">
                {numbers.length} found
            </span>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {searching ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-gray-500 font-medium">Finding available numbers...</p>
                </div>
            ) : numbers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {numbers.map((item) => {
                    const isSelected = selectedNumber?.phone_number === item.phone_number;
                    return (
                    <div 
                        key={item.phone_number}
                        onClick={() => setSelectedNumber(item)}
                        className={`group relative flex flex-col rounded-xl p-5 cursor-pointer transition-all border ${
                        isSelected 
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                    >
                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected 
                            ? 'bg-blue-600' 
                            : 'border border-gray-300 group-hover:border-blue-400'
                        }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        <div className="flex flex-col gap-1 mb-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                            {item.badge || (isSelected ? 'Selected' : 'Standard')}
                        </span>
                        <h4 className={`text-xl font-bold tracking-tight ${
                            isSelected ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                            {item.number}
                        </h4>
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                            {item.location}
                        </p>
                        </div>

                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        {item.badge ? (
                            <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100">
                            {item.badge}
                            </span>
                        ) : (
                            <span className="text-[10px] text-gray-400">Monthly</span>
                        )}
                        <span className="text-sm font-bold text-gray-900">${item.monthly_cost.toFixed(2)}</span>
                        </div>
                    </div>
                    );
                })}
            </div>
          ) : (!error && hasSearched) ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <p className="text-gray-500 font-medium">No numbers found. Try a different location.</p>
            </div>
          ) : null}

          </div>
        </div>

        {/* Fixed Footer Bar */}
        <div className="shrink-0 bg-white border-t border-gray-200 p-4 z-50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              {selectedNumber ? (
                  <div className="flex items-center gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Selected</p>
                        <p className="text-lg font-bold text-blue-600">{selectedNumber.number}</p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                    <div className="hidden sm:block">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                        <p className="text-lg font-bold text-gray-900">${selectedNumber.monthly_cost.toFixed(2)}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
                    </div>
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm">Select a number to continue</p>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => navigate('/dashboard/voice-setup')}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors w-full md:w-auto"
              >
                Cancel
              </button>
              <button 
                onClick={handleActivate}
                disabled={!selectedNumber || loading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-sm shadow-sm transition-all w-full md:w-auto flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    Activate Number
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GetNewNumber;
