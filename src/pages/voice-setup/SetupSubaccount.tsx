import { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { env } from '../../config/env';

import type { Subaccount } from '../../types/voice';

const SetupSubaccount = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingSubaccount, setExistingSubaccount] = useState<Subaccount | null>(null);

  useEffect(() => {
    checkExistingSubaccount();
  }, []);

  const checkExistingSubaccount = async () => {
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
        if (data.has_subaccount) {
          setExistingSubaccount(data.subaccount);
          setBusinessName(data.subaccount.friendly_name);
          setSuccess(true);
        }
      }
    } catch (err) {
      console.error('Error checking subaccount:', err);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!businessName.trim()) {
      setError('Please enter a business name');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiUrl = env.API_URL;

      let token = '';
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || '';
      }

      const response = await fetch(`${apiUrl}/subaccounts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          friendly_name: businessName.trim()
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create subaccount');
      }

      const result = await response.json();
      setExistingSubaccount(result);
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard/voice-setup/buy');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create subaccount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToNumbers = () => {
    navigate('/dashboard/voice-setup/buy');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Business Account</h1>
            <p className="text-gray-600">
              Create a dedicated Twilio subaccount for your business. This keeps your communications secure and organized.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-sm mb-1">Why do I need a subaccount?</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Isolated billing and usage tracking</li>
                  <li>• Enhanced security and separation</li>
                  <li>• Easier management for multiple businesses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Subaccount Status */}
          {existingSubaccount && !success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">Subaccount Already Set Up</h3>
                  <p className="text-sm text-green-700">Your business account is ready to use</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Business Name</p>
                    <p className="font-semibold text-gray-900">{existingSubaccount.friendly_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">Subaccount Created Successfully!</h3>
                  <p className="text-sm text-green-700">Redirecting to number selection...</p>
                </div>
              </div>
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          ) : null}

          {/* Setup Form */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </h2>

            {!existingSubaccount && !success ? (
              <>
                <div className="mb-6">
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This will be used as the friendly name for your Twilio subaccount
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCreateSubaccount}
                  disabled={loading || !businessName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg transition-all shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Subaccount...
                    </>
                  ) : (
                    <>
                      Create Business Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleProceedToNumbers}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-sm"
                >
                  Proceed to Get a Phone Number
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your subaccount information is stored securely and will be used to manage all your Twilio services.
            </p>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default SetupSubaccount;
