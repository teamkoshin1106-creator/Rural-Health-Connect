import { MedicalMemory, SyncStatus, UserProfile, ChronicCondition, Medication, Reminder, Consultation, FollowUpTask } from '../types';

const STORAGE_KEY = 'rhc_medical_memory';
const CACHE_KEY = 'rhc_knowledge_cache';

const initialMemory: MedicalMemory = {
  profile: null,
  conditions: [],
  medications: [],
  reminders: [],
};

export const storage = {
  getMemory: (): MedicalMemory => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialMemory;
  },

  saveMemory: (memory: MedicalMemory) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  },

  // Knowledge Cache for Low Bandwidth
  getKnowledgeCache: () => {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveKnowledge: (key: string, value: any) => {
    const cache = storage.getKnowledgeCache();
    cache[key] = {
      data: value,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  },

  updateProfile: (profile: Partial<UserProfile>) => {
    const memory = storage.getMemory();
    const updatedProfile = {
      ...(memory.profile || {
        id: crypto.randomUUID(),
        fullName: '',
        phoneNumber: '',
        age: 0,
        gender: 'other',
        village: '',
        district: '',
        taluk: '',
        state: '',
        locationResolutionStatus: 'none',
        bloodGroup: '',
        emergencyContact: '',
        onboarded: false,
        syncStatus: 'draft',
        updatedAt: Date.now(),
      }),
      ...profile,
      updatedAt: Date.now(),
      syncStatus: (profile.syncStatus || 'pending') as SyncStatus,
    } as UserProfile;
    
    storage.saveMemory({ ...memory, profile: updatedProfile });
    return updatedProfile;
  },

  setConditions: (conditions: ChronicCondition[]) => {
    const memory = storage.getMemory();
    storage.saveMemory({ ...memory, conditions });
  },

  addMedication: (medication: Omit<Medication, 'id' | 'syncStatus' | 'updatedAt'>) => {
    const memory = storage.getMemory();
    const newMed: Medication = {
      ...medication,
      id: crypto.randomUUID(),
      syncStatus: 'pending',
      updatedAt: Date.now(),
    };
    storage.saveMemory({
      ...memory,
      medications: [...memory.medications, newMed],
    });
    return newMed;
  },

  updateMedication: (id: string, updates: Partial<Medication>) => {
    const memory = storage.getMemory();
    const medications = memory.medications.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: Date.now(), syncStatus: 'pending' as SyncStatus } : m
    );
    storage.saveMemory({ ...memory, medications });
  },

  getReminders: () => {
    return storage.getMemory().reminders;
  },

  updateReminderStatus: (id: string, status: Reminder['status']) => {
    const memory = storage.getMemory();
    const reminders = memory.reminders.map(r => 
      r.id === id ? { ...r, status, takenAt: status === 'completed' ? Date.now() : undefined, syncStatus: 'pending' as SyncStatus } : r
    );
    storage.saveMemory({ ...memory, reminders });
  },

  // Care Orchestration Storage
  saveConsultation: (consultation: Consultation) => {
    const key = 'rhc_consultations';
    const data = localStorage.getItem(key);
    const consultations = data ? JSON.parse(data) : [];
    localStorage.setItem(key, JSON.stringify([...consultations, consultation]));
  },

  getConsultations: (): Consultation[] => {
    const key = 'rhc_consultations';
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  saveFollowUp: (task: FollowUpTask) => {
    const key = 'rhc_follow_ups';
    const data = localStorage.getItem(key);
    const tasks = data ? JSON.parse(data) : [];
    localStorage.setItem(key, JSON.stringify([...tasks, task]));
  },

  getFollowUps: (): FollowUpTask[] => {
    const key = 'rhc_follow_ups';
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  setDemoMode: (enabled: boolean) => {
    const memory = storage.getMemory();
    if (enabled) {
      const demoProfile: UserProfile = {
        id: 'demo-user',
        fullName: 'Rajesh Kumar',
        phoneNumber: '+91 98765 43210',
        age: 45,
        gender: 'male',
        village: 'Hoskote',
        district: 'Bangalore Rural',
        taluk: 'Hoskote',
        state: 'Karnataka',
        latitude: 13.0698,
        longitude: 77.7982,
        locationResolutionStatus: 'resolved',
        bloodGroup: 'O+',
        emergencyContact: '+91 99999 88888',
        onboarded: true,
        demoMode: true,
        syncStatus: 'synced',
        updatedAt: Date.now()
      };

      const demoConditions: ChronicCondition[] = [
        { id: 'c1', name: 'Diabetes', selectedAt: Date.now(), syncStatus: 'synced' },
        { id: 'c2', name: 'Hypertension', selectedAt: Date.now(), syncStatus: 'synced' }
      ];

      const demoMedications: Medication[] = [
        { 
          id: 'm1', 
          name: 'Metformin', 
          dosage: '500mg', 
          frequency: 'twice-daily', 
          timing: ['morning', 'night'], 
          startDate: '2023-01-01', 
          duration: 'ongoing',
          refillReminder: true,
          syncStatus: 'synced',
          updatedAt: Date.now()
        },
        { 
          id: 'm2', 
          name: 'Amlodipine', 
          dosage: '5mg', 
          frequency: 'daily', 
          timing: ['morning'], 
          startDate: '2023-05-15', 
          duration: 'ongoing',
          refillReminder: true,
          syncStatus: 'synced',
          updatedAt: Date.now()
        }
      ];

      const demoReminders: Reminder[] = [
        { id: 'r1', medicationId: 'm1', medicationName: 'Metformin', time: '08:00', status: 'completed', takenAt: Date.now() - 3600000, syncStatus: 'synced' },
        { id: 'r2', medicationId: 'm2', medicationName: 'Amlodipine', time: '08:00', status: 'completed', takenAt: Date.now() - 3600000, syncStatus: 'synced' },
        { id: 'r3', medicationId: 'm1', medicationName: 'Metformin', time: '20:00', status: 'upcoming', syncStatus: 'synced' }
      ];

      storage.saveMemory({
        profile: demoProfile,
        conditions: demoConditions,
        medications: demoMedications,
        reminders: demoReminders
      });
    } else {
      // Reset to a clean state or just disable demo flag
      if (memory.profile) {
        storage.saveMemory({
          ...memory,
          profile: { ...memory.profile, demoMode: false }
        });
      }
    }
  }
};
