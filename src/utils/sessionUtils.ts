import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  error?: string;
}

export const validateSession = async (): Promise<SessionValidationResult> => {
  if (!supabase) {
    return {
      isValid: false,
      session: null,
      error: 'Supabase not configured'
    };
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session validation error:', error);
      return {
        isValid: false,
        session: null,
        error: error.message
      };
    }

    if (!session) {
      return {
        isValid: false,
        session: null,
        error: 'No active session'
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && now >= expiresAt) {
      console.warn('Session expired, attempting refresh...');
      
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error('Session refresh failed:', refreshError);
        return {
          isValid: false,
          session: null,
          error: refreshError.message
        };
      }

      if (!refreshedSession) {
        return {
          isValid: false,
          session: null,
          error: 'Session refresh returned no session'
        };
      }

      return {
        isValid: true,
        session: refreshedSession
      };
    }

    return {
      isValid: true,
      session
    };

  } catch (error) {
    console.error('Unexpected error validating session:', error);
    return {
      isValid: false,
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const isSessionExpired = (session: Session | null): boolean => {
  if (!session || !session.expires_at) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= session.expires_at;
};

export const getSessionTimeRemaining = (session: Session | null): number => {
  if (!session || !session.expires_at) return 0;
  const now = Math.floor(Date.now() / 1000);
  const remaining = session.expires_at - now;
  return Math.max(0, remaining);
};

export const formatSessionTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
};
