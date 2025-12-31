import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CallLog } from '../pages/dashboard/CallLogs/types';
import { withErrorHandling } from '../lib/validators';

export function useCallLog(callId?: string) {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<CallLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) {
      setLog(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;

    const fetchLog = async () => {
      setLoading(true);
      setError(null);

      try {
        await withErrorHandling(async () => {
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }

          const { data, error: dbError } = await supabase
            .from('calls')
            .select('*')
            .eq('id', callId)
            .single();

          if (dbError) throw dbError;

          if (mounted) {
            const mappedData = data ? {
              ...data,
              phone_number: (data as any).caller_phone || (data as any).phone_number
            } : null;
            setLog(mappedData as CallLog | null);
          }
        }, 'Error fetching call details');
      } catch (err: unknown) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setError(errorMessage);
          setLog(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLog();

    return () => {
      mounted = false;
    };
  }, [callId]);

  return { loading, log, error };
}
