export interface Voice {
  id: string;
  name: string;
  gender: string;
  accent: string;
  provider: string;
  sample_audio_url?: string;
}

export interface VoiceSettings {
  id?: string;
  voice_id: string;
  speaking_speed: number;
  conversation_tone: string;
  custom_greeting: string;
  after_hours_greeting: string;
  language: string;
  is_active: boolean;
}

export interface NotificationSettings {
  urgent_call_alerts: boolean;
  booking_confirmations: boolean;
  daily_summary: boolean;
  missed_call_alerts: boolean;
}

export interface BookingRequirement {
  id?: string;
  field_name: string;
  required: boolean;
  field_type: string;
  status?: 'optional' | 'recommended' | 'required';
}

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export interface VoiceSettingsProps {
  settings: VoiceSettings;
  availableVoices: Voice[];
  onChange: (updates: Partial<VoiceSettings>) => void;
  onNavigateToAdvanced: () => void;
}

export interface NotificationSettingsProps {
  settings: NotificationSettings;
  onChange: (updates: Partial<NotificationSettings>) => void;
}
