import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';
import { startOfDay, endOfDay, subDays, format, addDays } from 'date-fns';
import { withErrorHandling } from '../lib/validators';
import { useMemoryCache } from './useCache';

interface Call {
  id: number;
  created_at: string;
  is_urgent: boolean;
  status: string;
  caller_name: string;
  category: string;
  summary: string;
}

interface Appointment {
  id: number;
  scheduled_time: string;
  customer_name: string;
  service_type: string;
}

interface ChartDataPoint {
  day: string;
  calls: number;
  active: boolean;
}

export const useDashboardData = (selectedDate: Date, days: number = 7) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, urgent: 0, handled: 0, minutesSaved: 0 });
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Use memory cache for dashboard data (1 minute TTL)
  const { get: getCachedDashboard, set: setCachedDashboard } = useMemoryCache<any>(60000);
  // Use memory cache for total duration (5 minute TTL)
  const { get: getCachedDuration, set: setCachedDuration } = useMemoryCache<number>(300000);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);

      // 1. Check if we have cached dashboard data for this date and range
      const cacheKey = `dashboard_${selectedDate.toISOString().split('T')[0]}_${days}`;
      const cachedData = getCachedDashboard(cacheKey);

      if (cachedData) {
        console.log(`Dashboard: Using cached data for ${cacheKey}`);
        setStats(cachedData.stats);
        setRecentCalls(cachedData.recentCalls);
        setAppointments(cachedData.appointments);
        setChartData(cachedData.chartData);
        setLoading(false);
        return;
      }

      // Check cache first for total duration (5 minute cache)
      const cachedTotalDuration = getCachedDuration('total_duration');

      // OPTIMIZATION: Try to fetch from Redis-cached API first with timeout
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          if (token) {
            // Add a timeout to the API fetch to avoid long waits
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200); // Increased timeout for 30d data

            const response = await fetch(`${env.API_URL}/dashboard/stats?date=${selectedDate.toISOString()}&days=${days}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              console.log("DASHBOARD HOOK: Received API data", data);
              if (mounted) {
                setStats(data.stats);
                // Apply limits even if data comes from API
                setRecentCalls((data.recentCalls as Call[]).slice(0, 6));
                setAppointments((data.appointments as Appointment[]).slice(0, 8));
                setChartData(data.chartData);
                setLoading(false);
                // Cache the successful result
                setCachedDashboard(cacheKey, {
                  ...data,
                  recentCalls: data.recentCalls.slice(0, 6),
                  appointments: data.appointments.slice(0, 8)
                });
              }
              return;
            } else {
              console.warn("DASHBOARD HOOK: API returned error", response.status);
            }
          }
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.warn("DASHBOARD HOOK: API request timed out, falling back");
        } else {
          console.warn("Cached API unavailable, falling back to direct Supabase connection", e);
        }
      }

      try {
        await withErrorHandling(async () => {
          // 0. Check if Supabase is configured
          if (!supabase) {
            throw new Error('Supabase client is not initialized');
          }

          // 1. Define Time Range (Start of day to End of day)
          const start = startOfDay(selectedDate).toISOString();
          const end = endOfDay(selectedDate).toISOString();
          const endOfWeek = endOfDay(addDays(selectedDate, 7)).toISOString();

          // 2. Fetch all data in parallel
          const [callsResponse, apptsResponse, chartDataResult, durationResult] = await Promise.all([
            // Daily calls
            supabase
              .from('calls')
              .select('*')
              .gte('created_at', start)
              .lte('created_at', end)
              .order('created_at', { ascending: false }),

            // Appointments for the week
            supabase
              .from('appointments')
              .select('*')
              .gte('scheduled_time', start)
              .lte('scheduled_time', endOfWeek)
              .order('scheduled_time', { ascending: true }),

            // Chart data
            fetchChartData(selectedDate),

            // Total duration (only if not cached)
            cachedTotalDuration !== null 
              ? Promise.resolve({ data: null, isCached: true, value: cachedTotalDuration })
              : supabase
                  .from('calls')
                  .select('duration_seconds')
                  .then(res => ({ ...res, isCached: false }))
          ]);

          if (callsResponse.error) throw callsResponse.error;
          if (apptsResponse.error) throw apptsResponse.error;

          const calls = callsResponse.data || [];
          const appts = apptsResponse.data || [];

          // 3. Handle duration calculation
          let totalDurationSeconds = 0;
          if ('isCached' in durationResult && durationResult.isCached) {
            totalDurationSeconds = (durationResult as any).value;
          } else {
            const res = durationResult as { data: { duration_seconds: number }[] | null };
            totalDurationSeconds = res.data?.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) || 0;
            setCachedDuration('total_duration', totalDurationSeconds);
          }
          const minutesSaved = Math.round(totalDurationSeconds / 60 * 10) / 10;

          // 4. Calculate Stats on the fly
          const total = calls.length;
          const urgent = calls.filter(c => c.is_urgent).length;
          const handled = calls.filter(c => c.status === 'Handled').length;

          if (mounted) {
            const finalData = { total, urgent, handled, minutesSaved };
            setStats(finalData);
            // Limit calls to 6 and appointments to 8
            setRecentCalls((calls as Call[]).slice(0, 6));
            setAppointments((appts as Appointment[]).slice(0, 8));
            setChartData(chartDataResult);
            setLoading(false);

            // Cache the successful result
            setCachedDashboard(cacheKey, {
              stats: finalData,
              recentCalls: calls.slice(0, 6),
              appointments: appts.slice(0, 8),
              chartData: chartDataResult
            });
          }
        }, 'Error fetching dashboard data');
      } catch {
        // withErrorHandling logs the error, so we just handle UI state here if needed
        if (mounted) {
           // Could set error state here if the hook supported it
           setLoading(false);
           setStats({ total: 0, urgent: 0, handled: 0, minutesSaved: 0 });
           setRecentCalls([]);
           setAppointments([]);
           setChartData([]);
        }
      }
    };

    fetchData();

    // Set up real-time subscription for calls
    // Using explicit null check for TS
    let channel: any = null;
    
    if (supabase) {
      channel = supabase
        .channel('dashboard_calls_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calls'
          },
          () => {
            console.log('Realtime change received in dashboard, refetching...');
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      mounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedDate, days]);

  return { loading, stats, recentCalls, appointments, chartData };
};

// Helper to get 7-day volume
async function fetchChartData(date: Date) {
  if (!supabase) return [];
  const sevenDaysAgo = subDays(date, 6).toISOString();
  const { data } = await supabase
    .from('calls')
    .select('created_at')
    .gte('created_at', sevenDaysAgo)
    .lte('created_at', endOfDay(date).toISOString());

  if (!data) return [];

  // Group by Day (Optimized single-pass)
  const countsByDay: Record<string, number> = {};
  data.forEach((c: { created_at: string }) => {
    const dayKey = new Date(c.created_at).toDateString();
    countsByDay[dayKey] = (countsByDay[dayKey] || 0) + 1;
  });

  const days = [6, 5, 4, 3, 2, 1, 0].map(d => {
    const dDate = subDays(date, d);
    const dayStr = format(dDate, 'EEE');
    const dayKey = dDate.toDateString();
    return { 
      day: dayStr, 
      calls: countsByDay[dayKey] || 0, 
      active: d === 0 
    };
  });
  
  return days;
}
