import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { businessSetupAPI } from '../api/businessSetup';

// Import types directly inline to avoid module issues
interface BusinessDetails {
  business_name: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
}

interface BusinessHour {
  id?: string;
  day_of_week: string;
  open_time?: string;
  close_time?: string;
  enabled: boolean;
}

interface Service {
  id?: string;
  name: string;
  price?: number;
  description?: string;
}

interface UrgentCallRule {
  id?: string;
  condition_text: string;
  action: string;
  contact?: string;
}

interface BookingRequirement {
  id?: string;
  field_name: string;
  required: boolean;
  field_type: string;
}

interface BusinessSetupData {
  business: BusinessDetails;
  business_hours?: BusinessHour[];
  services?: Service[];
  urgent_call_rules?: UrgentCallRule[];
  booking_requirements?: BookingRequirement[];
}

interface BusinessSetupState {
  data: BusinessSetupData;
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  saving: boolean;
}

type BusinessSetupAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: BusinessSetupData }
  | { type: 'UPDATE_BUSINESS'; payload: Partial<BusinessDetails> }
  | { type: 'UPDATE_BUSINESS_HOURS'; payload: BusinessHour[] }
  | { type: 'UPDATE_SERVICES'; payload: Service[] }
  | { type: 'UPDATE_URGENT_CALL_RULES'; payload: UrgentCallRule[] }
  | { type: 'UPDATE_BOOKING_REQUIREMENTS'; payload: BookingRequirement[] }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean };

const initialState: BusinessSetupState = {
  data: {
    business: {
      business_name: '',
      category: '',
      phone: '',
      address: '',
      description: ''
    },
    business_hours: [],
    services: [],
    urgent_call_rules: [],
    booking_requirements: []
  },
  loading: false,
  error: null,
  isDirty: false,
  saving: false
};

function businessSetupReducer(state: BusinessSetupState, action: BusinessSetupAction): BusinessSetupState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_DATA':
      return { 
        ...state, 
        data: action.payload, 
        loading: false, 
        error: null, 
        isDirty: false 
      };
    case 'UPDATE_BUSINESS':
      return {
        ...state,
        data: {
          ...state.data,
          business: { ...state.data.business, ...action.payload }
        },
        isDirty: true
      };
    case 'UPDATE_BUSINESS_HOURS':
      return {
        ...state,
        data: { ...state.data, business_hours: action.payload },
        isDirty: true
      };
    case 'UPDATE_SERVICES':
      return {
        ...state,
        data: { ...state.data, services: action.payload },
        isDirty: true
      };
    case 'UPDATE_URGENT_CALL_RULES':
      return {
        ...state,
        data: { ...state.data, urgent_call_rules: action.payload },
        isDirty: true
      };
    case 'UPDATE_BOOKING_REQUIREMENTS':
      return {
        ...state,
        data: { ...state.data, booking_requirements: action.payload },
        isDirty: true
      };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
    default:
      return state;
  }
}

interface BusinessSetupContextType {
  state: BusinessSetupState;
  actions: {
    loadData: () => Promise<void>;
    saveData: (showToast?: (message: string, type?: any) => void) => Promise<boolean>;
    updateBusiness: (data: Partial<BusinessDetails>) => void;
    updateBusinessHours: (hours: BusinessHour[]) => void;
    updateServices: (services: Service[]) => void;
    updateUrgentCallRules: (rules: UrgentCallRule[]) => void;
    updateBookingRequirements: (requirements: BookingRequirement[]) => void;
    resetDirty: () => void;
  };
}

const BusinessSetupContext = createContext<BusinessSetupContextType | undefined>(undefined);

export const BusinessSetupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(businessSetupReducer, initialState);
  const stateRef = useRef(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await businessSetupAPI.getBusinessSetup();
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load data' });
    }
  }, []);

  const saveData = useCallback(async (showToast?: (message: string, type?: any) => void): Promise<boolean> => {
    const currentState = stateRef.current;
    
    if (!currentState.isDirty) {
      showToast?.('No changes to save', 'info');
      return true;
    }
    
    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      const apiResult = await businessSetupAPI.saveBusinessSetup(currentState.data);
      
      dispatch({ type: 'SET_DIRTY', payload: false });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      showToast?.('Changes saved successfully!', 'success');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      console.error('Save failed:', error);
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showToast?.(errorMessage, 'error');
      return false;
      
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, []);

  const updateBusiness = useCallback((data: Partial<BusinessDetails>) => {
    console.log('🔄 Updating business details:', data);
    dispatch({ type: 'UPDATE_BUSINESS', payload: data });
  }, []);

  const updateBusinessHours = useCallback((hours: BusinessHour[]) => {
    console.log('🔄 Updating business hours:', hours);
    dispatch({ type: 'UPDATE_BUSINESS_HOURS', payload: hours });
    console.log('✅ Business hours updated in state');
  }, []);

  const updateServices = useCallback((services: Service[]) => {
    console.log('🔄 Updating services:', services);
    dispatch({ type: 'UPDATE_SERVICES', payload: services });
    console.log('✅ Services updated in state');
  }, []);

  const updateUrgentCallRules = useCallback((rules: UrgentCallRule[]) => {
    console.log('🔄 Updating urgent call rules:', rules);
    dispatch({ type: 'UPDATE_URGENT_CALL_RULES', payload: rules });
    console.log('✅ Urgent call rules updated in state');
  }, []);

  const updateBookingRequirements = useCallback((requirements: BookingRequirement[]) => {
    console.log('🔄 Updating booking requirements:', requirements);
    dispatch({ type: 'UPDATE_BOOKING_REQUIREMENTS', payload: requirements });
    console.log('✅ Booking requirements updated in state');
  }, []);

  const resetDirty = useCallback(() => {
    dispatch({ type: 'SET_DIRTY', payload: false });
  }, []);

  // Load data on mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      if (isMounted) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          const data = await businessSetupAPI.getBusinessSetup();
          if (isMounted) {
            dispatch({ type: 'SET_DATA', payload: data });
          }
        } catch (error) {
          if (isMounted) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            console.error("Error loading business setup data:", error);
          }
        } finally {
          if (isMounted) {
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const actions = useMemo(() => ({
    loadData,
    saveData,
    updateBusiness,
    updateBusinessHours,
    updateServices,
    updateUrgentCallRules,
    updateBookingRequirements,
    resetDirty,
  }), [
    loadData,
    saveData,
    updateBusiness,
    updateBusinessHours,
    updateServices,
    updateUrgentCallRules,
    updateBookingRequirements,
    resetDirty
  ]);

  const value: BusinessSetupContextType = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <BusinessSetupContext.Provider value={value}>
      {children}
    </BusinessSetupContext.Provider>
  );
};

export const useBusinessSetup = () => {
  const context = useContext(BusinessSetupContext);
  if (context === undefined) {
    throw new Error('useBusinessSetup must be used within a BusinessSetupProvider');
  }
  return context;
};
