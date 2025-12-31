export interface CallLog {
  id: string;
  caller_name: string;
  phone_number: string;
  created_at: string; // ISO string
  duration_seconds: number; // in seconds
  category: 'Booking' | 'Inquiry' | 'Urgent' | 'General' | string;
  summary: string;
  transcript?: string;
  status: 'Completed' | 'Missed' | 'Action Req' | 'Handled' | string;
  is_urgent: boolean;
  recording_url?: string;
  lead_score?: number;
  tags?: string[];
  notes?: string;
  follow_up_required?: boolean;
  handled_by?: string;
}

export interface CallLogFilters {
  search: string;
  status: string;
  type: string;
  dateRange: string;
}
