export type UrgencyLevel = 'critical' | 'medium' | 'safe';
export type CategoryType = 'rescue' | 'medical' | 'food' | 'shelter' | 'other';

export interface Incident {
  id: string;
  description: string;
  urgency: UrgencyLevel;
  category: CategoryType;
  summary: string;
  resources: string[];
  confidence: number;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  userId: string;
}

export interface AIAnalysisResult {
  urgency: UrgencyLevel;
  category: CategoryType;
  summary: string;
  resources: string[];
  confidence: number;
}
