import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { CallLog, CallLogFilters } from '../pages/dashboard/CallLogs/types';
import { withErrorHandling } from '../lib/validators';

export function useCallLogs(filters: CallLogFilters & { customDate?: string }) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        await withErrorHandling(async () => {
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }

          let query = supabase
            .from('calls')
            .select('*')
            .order('created_at', { ascending: false });

          // Apply filters
          if (filters.status && filters.status !== 'All') {
            query = query.eq('status', filters.status);
          }
          
          if (filters.type && filters.type !== 'All') {
            query = query.eq('category', filters.type);
          }

          // Date range filtering
          if (filters.dateRange === 'Custom' && filters.customDate) {
            const startOfDay = new Date(filters.customDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.customDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            query = query
              .gte('created_at', startOfDay.toISOString())
              .lte('created_at', endOfDay.toISOString());
          } else if (filters.dateRange && filters.dateRange !== 'All' && filters.dateRange !== 'Custom') {
            const now = new Date();
            let startDate: Date | null = null;
            
            if (filters.dateRange === '24h') {
              startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            } else if (filters.dateRange === '7d') {
              startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            } else if (filters.dateRange === '30d') {
              startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            }
            
            if (startDate) {
              query = query.gte('created_at', startDate.toISOString());
            }
          }

          if (filters.search) {
            // Sanitize search input
            const cleanSearch = filters.search.trim().replace(/[()]/g, ''); 
            if (cleanSearch) {
              // Search in multiple fields: name, phone, category, summary, transcript, status
              // For tags (array), we'd need a different approach, but these cover most bases
              query = query.or(`caller_name.ilike.%${cleanSearch}%,caller_phone.ilike.%${cleanSearch}%,category.ilike.%${cleanSearch}%,summary.ilike.%${cleanSearch}%,transcript.ilike.%${cleanSearch}%,status.ilike.%${cleanSearch}%`);
            }
          }

          const { data, error: dbError } = await query;
          
          if (dbError) throw dbError;
          
          if (mounted) {
            // Map caller_phone to phone_number for frontend compatibility
            const mappedData = (data || []).map((item: any) => ({
                ...item,
                phone_number: item.caller_phone || item.phone_number
            }));
            setLogs(mappedData as CallLog[]);
          }
        }, 'Error fetching logs');

      } catch (err: unknown) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setError(errorMessage);
          setLogs([]); 
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    // Set up real-time subscription
    if (supabase) {
      const channel = supabase
        .channel('calls_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls'
          },
          (payload) => {
            // Optimistic update or simple refetch
            // For now, we'll refetch to ensure filters are respected and data is consistent
            console.log('Realtime change received:', payload);
            fetchLogs();
          }
        )
        .subscribe();

      return () => {
        mounted = false;
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }

    return () => {
      mounted = false;
    };
  }, [
    filters.search,
    filters.status,
    filters.type,
    filters.dateRange,
    filters.customDate,
    refreshTrigger
  ]);

  return { loading, logs, error, refetch };
}
