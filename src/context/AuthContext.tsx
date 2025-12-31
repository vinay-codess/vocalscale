import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { validateSession as validateSessionUtil } from '../utils/sessionUtils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
  validateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null, 
  loading: true, 
  signOut: async () => {},
  isConfigured: false,
  refreshSession: async () => {},
  validateSession: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured] = useState(!!supabase);
  const mounted = useRef(true);

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error } = await supabase!.auth.getSession();
      if (error) throw error;

      if (mounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      if (mounted.current) {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (!supabase) {
      console.warn("Supabase is not configured. AuthProvider will be disabled.");
      setLoading(false);
      return;
    }

    let isInitialLoad = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        
        if (error) throw error;

        if (mounted.current) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted.current) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted.current && isInitialLoad) {
          setLoading(false);
          isInitialLoad = false;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted.current) {
          setLoading(false);
        }
      }

      if (event === 'SIGNED_OUT') {
        if (mounted.current) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    });

    const sessionCheckInterval = setInterval(async () => {
      if (mounted.current && session && supabase) {
        try {
          const { data: { session: currentSession }, error } = await supabase!.auth.getSession();
          
          if (error || !currentSession) {
            console.warn('Session check failed or no session');
            if (mounted.current) {
              setSession(null);
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error during session check:', error);
        }
      }
    }, 30000);

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  const signOut = async () => {
    if (!supabase) return;

    try {
      const { error } = await supabase!.auth.signOut();
      if (error) throw error;

      if (mounted.current) {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      if (mounted.current) {
        setSession(null);
        setUser(null);
      }
    }
  };

  const validateSession = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { isValid, session: validatedSession } = await validateSessionUtil();
      
      if (mounted.current) {
        if (!isValid || !validatedSession) {
          setSession(null);
          setUser(null);
        } else {
          setSession(validatedSession);
          setUser(validatedSession.user ?? null);
        }
      }
    } catch (error) {
      console.error('Error validating session:', error);
      if (mounted.current) {
        setSession(null);
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, isConfigured, refreshSession, validateSession }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use this context easily
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
