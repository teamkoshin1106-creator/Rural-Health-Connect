export type SyncStatus = 'draft' | 'pending' | 'synced';

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  village: string;
  district?: string;
  taluk?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  locationResolutionStatus: 'resolved' | 'pending' | 'failed' | 'none';
  lastLocationUpdate?: number;
  bloodGroup: string;
  emergencyContact: string;
  onboarded: boolean;
  demoMode?: boolean;
  syncStatus: SyncStatus;
  updatedAt: number;
}

export interface ChronicCondition {
  id: string;
  name: string;
  isOther?: boolean;
  otherText?: string;
  selectedAt: number;
  syncStatus: SyncStatus;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: ('morning' | 'afternoon' | 'evening' | 'night')[];
  duration: string;
  startDate: string;
  refillReminder: boolean;
  syncStatus: SyncStatus;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  status: 'upcoming' | 'overdue' | 'missed' | 'completed';
  takenAt?: number;
  syncStatus: SyncStatus;
}

export interface SymptomAnalysis {
  id: string;
  timestamp: number;
  symptoms: string;
  audioTranscript?: string;
  imageUrls?: string[];
  analysis?: AIAnalysisResult;
  syncStatus: SyncStatus;
}

export interface AIAnalysisResult {
  conditionHypotheses: string[];
  differentials: { condition: string; confidence: number; reason: string }[];
  riskLevel: 'normal' | 'moderate' | 'high' | 'emergency';
  whenToWorry: string;
  likelySpecialist: string;
  nextRecommendedAction: string;
  emergencyEscalation?: string;
  doctorHandoffSummary: string; // This will now be the SOAP summary
  soapSummary: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  medicationInteraction?: {
    warning: string;
    severity: 'low' | 'medium' | 'high';
    details: string;
  };
  imageAnalysis?: {
    severity: string;
    infectionRisk: string;
    findings: string[];
  };
  followUpQuestions?: string[];
  auditTrail: {
    sources: string[];
    reasoning: string;
  };
  suggestions: {
    otcMedicines: string[];
    diagnostics: string[];
    nearestFacilities: string[];
  };
  confidence: number;
  disclaimer: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  languages: string[];
  distance: number;
  rating: number;
  earliestSlot: string;
  consultationModes: ('chat' | 'audio' | 'video')[];
  matchReason: string;
  urgencyFit: 'high' | 'medium' | 'low';
  experience: number;
  photoUrl: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  distance: number;
  isOpen: boolean;
  hasMedicine: boolean;
  genericAlternatives: boolean;
  deliveryAvailable: boolean;
  location: { lat: number; lng: number };
}

export interface MedicalFacility {
  id: string;
  name: string;
  type: 'PHC' | 'Lab' | 'Hospital' | 'Trauma Center';
  distance: number;
  services: string[];
  isOpen: boolean;
  urgencyLevel: 'emergency' | 'standard';
  location: { lat: number; lng: number };
}

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  status: 'pending' | 'active' | 'completed';
  mode: 'chat' | 'audio' | 'video';
  soapPackage: AIAnalysisResult;
  createdAt: number;
  syncStatus: SyncStatus;
}

export interface FollowUpTask {
  id: string;
  title: string;
  description: string;
  dueAt: number;
  type: 'medication' | 'recheck' | 'doctor' | 'lab';
  status: 'pending' | 'completed';
}

export interface MedicalMemory {
  profile: UserProfile | null;
  conditions: ChronicCondition[];
  medications: Medication[];
  reminders: Reminder[];
}
