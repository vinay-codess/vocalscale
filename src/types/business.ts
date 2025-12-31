// Business Setup Types
export interface BusinessDetails {
  business_name: string;
  category?: string;
  phone?: string;
  address?: string;
  description?: string;
  email?: string;
}

export interface BusinessHour {
  id?: string;
  day_of_week: string; // 'monday', 'tuesday', etc.
  open_time?: string; // HH:MM format
  close_time?: string; // HH:MM format
  enabled: boolean;
}

export interface Service {
  id?: string;
  name: string;
  price?: number;
  description?: string;
}

export interface UrgentCallRule {
  id?: string;
  condition_text: string;
  action: string;
  contact?: string;
}


export interface BusinessSetupData {
  business: BusinessDetails;
  business_hours?: BusinessHour[];
  services?: Service[];
  urgent_call_rules?: UrgentCallRule[];

}