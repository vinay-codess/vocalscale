
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { withErrorHandling } from '../lib/validators';

export interface NotificationCall {
  id: string;
  caller_name: string;
  caller_phone: string;
  created_at: string;
  summary: string;
  category: string;
  notes?: string;
}

export function useNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationCall[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('calls')
        .select('id, caller_name, caller_phone, created_at, summary, category, notes')
        .eq('is_urgent', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = async (id: string) => {
    try {
      if (!supabase) return;
      
      // Update local state immediately for responsiveness
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));

      const { error } = await supabase
        .from('calls')
        .update({ 
            is_urgent: false,
            status: 'Handled' // Also mark as handled when dismissed? Or just remove urgency?
            // User requirement: "automatically removed ... when users click 'Okay'"
            // Removing urgency fits this.
        })
        .eq('id', id);

      if (error) {
        // Revert on error
        fetchNotifications();
        throw error;
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('notifications_channel')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (insert, update)
            schema: 'public',
            table: 'calls',
            filter: 'is_urgent=eq.true' // Only care if it becomes urgent
          },
          () => {
            fetchNotifications();
          }
        )
        // Also listen for when is_urgent becomes false (to remove from list if updated elsewhere)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'calls',
            },
            (payload) => {
                // If an update happened, just refetch to be safe/simple
                fetchNotifications();
            }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return {
    loading,
    notifications,
    unreadCount,
    dismissNotification,
    refresh: fetchNotifications
  };
}
