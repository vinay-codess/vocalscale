import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { addHours, parseISO } from 'date-fns';
import { withErrorHandling } from '../lib/validators';

export interface Appointment {
  id: string;
  title: string;
  customer_name: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: 'Confirmed' | 'Pending' | 'Canceled' | 'Completed' | 'Scheduled';
  type: 'Consultation' | 'Internal' | 'Follow-up' | 'Review' | 'Demo' | string;
  location?: string;
  phone?: string;
  notes?: string;
  user_id?: string;
}


// Simple in-memory cache to prevent reloading on tab switches
let appointmentsCache: {
  data: Appointment[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAppointments() {
  const [loading, setLoading] = useState(() => {
    // If we have fresh cache, don't show loading state
    if (appointmentsCache && Date.now() - appointmentsCache.timestamp < CACHE_DURATION) {
      return false;
    }
    return true;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => appointmentsCache?.data || []);
  const [error, setError] = useState<string | null>(null);

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error } = await supabase
        .from('appointments')
        .update({
          ...(updates.start_time && { scheduled_time: updates.start_time }),
          ...(updates.customer_name && { customer_name: updates.customer_name }),
          ...(updates.type && { service_type: updates.type }),
          ...(updates.status && { status: updates.status }),
          ...(updates.user_id && { user_id: updates.user_id }),
          ...(updates.notes && { notes: updates.notes }),
        })
        .eq('id', id);

      if (error) throw error;

      const newAppointments = appointments.map(appt => 
        appt.id === id ? { ...appt, ...updates } : appt
      );
      
      setAppointments(newAppointments);
      
      // Update cache
      if (appointmentsCache) {
        appointmentsCache.data = newAppointments;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          scheduled_time: appointment.start_time,
          customer_name: appointment.customer_name,
          service_type: appointment.type,
          status: appointment.status,
          user_id: appointment.user_id,
          notes: appointment.notes,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newAppt: Appointment = {
          id: data.id,
          customer_name: data.customer_name,
          title: data.service_type || 'Appointment',
          type: data.service_type || 'Consultation',
          status: data.status || 'Pending',
          start_time: data.scheduled_time,
          end_time: addHours(parseISO(data.scheduled_time), 1).toISOString(),
          location: 'Online',
          user_id: data.user_id,
          notes: data.notes,
        };
        
        const newAppointments = [...appointments, newAppt];
        setAppointments(newAppointments);
        
        // Update cache
        if (appointmentsCache) {
          appointmentsCache.data = newAppointments;
        }
      }

      return true;
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Skip fetch if cache is valid
    if (appointmentsCache && Date.now() - appointmentsCache.timestamp < CACHE_DURATION) {
      // Just ensure state is synced (though useState initializer should handle it)
      if (mounted && appointments.length === 0 && appointmentsCache.data.length > 0) {
        setAppointments(appointmentsCache.data);
      }
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      
      try {
        // Create a timeout promise to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        await Promise.race([
          withErrorHandling(async () => {
            if (!supabase) {
              throw new Error('Supabase client not initialized');
            }

            const { data, error: dbError } = await supabase
              .from('appointments')
              .select('*')
              .order('scheduled_time', { ascending: true });

            if (dbError) throw dbError;

            if (mounted && data) {
              const mappedAppointments: Appointment[] = data
                .filter(item => item.scheduled_time) // Filter out items with no scheduled_time
                .map(item => {
                  const startTime = item.scheduled_time;
                  // Default to 1 hour duration if no end time exists
                  const endTime = addHours(parseISO(startTime), 1).toISOString();
                
                return {
                  id: item.id,
                  customer_name: item.customer_name,
                  title: item.service_type || 'Appointment',
                  type: item.service_type || 'Consultation',
                  status: item.status || 'Pending',
                  start_time: startTime,
                  end_time: endTime,
                  location: item.location,
                  user_id: item.user_id,
                  notes: item.notes,
                };
              });
              
              setAppointments(mappedAppointments);
              
              // Update cache
              appointmentsCache = {
                data: mappedAppointments,
                timestamp: Date.now()
              };
            }
          }, 'Error fetching appointments'),
          timeoutPromise
        ]);
      } catch (err: unknown) {
        if (mounted) {
          console.error('Error in useAppointments:', err);
          // Use a generic error message for the user, but keep the original error logged internally via withErrorHandling
          setError(err instanceof Error ? err.message : 'Failed to load appointments');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAppointments();

    return () => {
      mounted = false;
    };
  }, []);

  return { loading, appointments, error, updateAppointment, createAppointment };
}
