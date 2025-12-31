export interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name?: string;
  status: 'active' | 'inactive';
  capabilities?: {
    voice: boolean;
    sms: boolean;
    mms?: boolean;
    fax?: boolean;
  };
  voice_url?: string;
  sms_url?: string;
  is_beta?: boolean;
  
  // Local/UI properties
  number?: string; // Often used as a friendly label or formatted number
  phoneNumber?: string; // Alternative key for phone number
  badge?: string;
  location?: string;
  monthly_cost?: number;
  iso_country?: string;
  postal_code?: string;
  region?: string;
}

export interface Subaccount {
  sid: string;
  friendly_name: string;
  status: string;
  date_created?: string;
  date_updated?: string;
  auth_token?: string;
}
