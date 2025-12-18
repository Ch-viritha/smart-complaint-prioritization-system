export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type ComplaintCategory =
  | 'infrastructure'
  | 'public_safety'
  | 'utilities'
  | 'sanitation'
  | 'transportation'
  | 'health'
  | 'education'
  | 'other';

export interface Complaint {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  location?: string;
  citizen_name: string;
  citizen_email: string;
  citizen_phone?: string;
  predicted_resolution_days: number;
  sentiment_score?: number;
  ai_urgency_reason?: string;
  ai_suggested_department?: string;
  ai_keywords?: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionTime: number;
  byUrgency: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<ComplaintCategory, number>;
}

export interface SubmitComplaintData {
  title: string;
  description: string;
  category: ComplaintCategory;
  location?: string;
  citizen_name: string;
  citizen_email: string;
  citizen_phone?: string;
}
