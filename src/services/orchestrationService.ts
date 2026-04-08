import { Doctor, Pharmacy, MedicalFacility, AIAnalysisResult, FollowUpTask } from "../types";

export const orchestrationService = {
  getMatchingDoctors: (analysis: AIAnalysisResult, language: string): Doctor[] => {
    // Mock doctor database
    const doctors: Doctor[] = [
      {
        id: 'd1',
        name: 'Dr. Ramesh Kumar',
        specialization: 'General Physician',
        languages: ['en', 'hi', 'kn'],
        distance: 2.5,
        rating: 4.8,
        earliestSlot: '10:30 AM Today',
        consultationModes: ['chat', 'audio'],
        matchReason: 'Nearest available doctor speaking your language.',
        urgencyFit: 'high',
        experience: 15,
        photoUrl: 'https://picsum.photos/seed/doc1/200/200'
      },
      {
        id: 'd2',
        name: 'Dr. Priya Singh',
        specialization: analysis.likelySpecialist || 'Internal Medicine',
        languages: ['en', 'hi'],
        distance: 5.2,
        rating: 4.9,
        earliestSlot: '11:00 AM Today',
        consultationModes: ['chat', 'audio', 'video'],
        matchReason: 'Specialist match for your symptoms.',
        urgencyFit: 'medium',
        experience: 10,
        photoUrl: 'https://picsum.photos/seed/doc2/200/200'
      },
      {
        id: 'd3',
        name: 'Dr. Anjali Murthy',
        specialization: 'Cardiologist',
        languages: ['en', 'kn', 'ta'],
        distance: 8.1,
        rating: 4.7,
        earliestSlot: '02:00 PM Today',
        consultationModes: ['audio', 'video'],
        matchReason: 'Expert in chronic condition management.',
        urgencyFit: 'low',
        experience: 20,
        photoUrl: 'https://picsum.photos/seed/doc3/200/200'
      }
    ];

    // Simple ranking logic
    return doctors.sort((a, b) => {
      const aLangMatch = a.languages.includes(language) ? 1 : 0;
      const bLangMatch = b.languages.includes(language) ? 1 : 0;
      if (aLangMatch !== bLangMatch) return bLangMatch - aLangMatch;
      return a.distance - b.distance;
    });
  },

  getNearbyPharmacies: (lat: number, lng: number): Pharmacy[] => {
    const safeLat = lat || 13.0698;
    const safeLng = lng || 77.7982;
    return [
      {
        id: 'p1',
        name: 'Rural Health Pharmacy',
        distance: 0.8,
        isOpen: true,
        hasMedicine: true,
        genericAlternatives: true,
        deliveryAvailable: true,
        location: { lat: safeLat + 0.001, lng: safeLng + 0.001 }
      },
      {
        id: 'p2',
        name: 'Jan Aushadhi Kendra',
        distance: 1.5,
        isOpen: true,
        hasMedicine: true,
        genericAlternatives: true,
        deliveryAvailable: false,
        location: { lat: safeLat - 0.002, lng: safeLng + 0.002 }
      }
    ];
  },

  getNearbyFacilities: (lat: number, lng: number, type?: string): MedicalFacility[] => {
    const safeLat = lat || 13.0698;
    const safeLng = lng || 77.7982;
    return [
      {
        id: 'f1',
        name: 'Community Health Centre (CHC)',
        type: 'PHC',
        distance: 3.2,
        services: ['General Checkup', 'Blood Test', 'X-Ray'],
        isOpen: true,
        urgencyLevel: 'standard',
        location: { lat: safeLat + 0.01, lng: safeLng - 0.01 }
      },
      {
        id: 'f2',
        name: 'District Trauma Centre',
        type: 'Trauma Center',
        distance: 12.5,
        services: ['Emergency', 'Surgery', 'ICU'],
        isOpen: true,
        urgencyLevel: 'emergency',
        location: { lat: safeLat + 0.05, lng: safeLng + 0.05 }
      }
    ];
  },

  generateFollowUpTasks: (analysis: AIAnalysisResult): FollowUpTask[] => {
    const tasks: FollowUpTask[] = [
      {
        id: 't1',
        title: 'Symptom Recheck',
        description: 'Check if fever or pain has reduced.',
        dueAt: Date.now() + 6 * 60 * 60 * 1000, // 6 hours
        type: 'recheck',
        status: 'pending'
      }
    ];

    if (analysis.riskLevel === 'moderate' || analysis.riskLevel === 'high') {
      tasks.push({
        id: 't2',
        title: 'Doctor Follow-up',
        description: 'Schedule a formal visit if symptoms persist.',
        dueAt: Date.now() + 48 * 60 * 60 * 1000, // 2 days
        type: 'doctor',
        status: 'pending'
      });
    }

    return tasks;
  }
};
