import { storage } from "../lib/storage";
import { AIAnalysisResult, MedicalMemory } from "../types";

export const offlineTriage = {
  analyze: (symptoms: string, memory: MedicalMemory): AIAnalysisResult => {
    const lowerSymptoms = symptoms.toLowerCase();
    const cache = storage.getKnowledgeCache();
    
    // Check cache for similar symptoms (simple keyword matching)
    const cachedEntry = Object.values(cache).find((entry: any) => 
      entry.data.conditionHypotheses.some((h: string) => lowerSymptoms.includes(h.toLowerCase()))
    ) as any;

    if (cachedEntry) {
      return {
        ...cachedEntry.data,
        disclaimer: "OFFLINE: Using cached knowledge from previous analysis. Please confirm when online."
      };
    }

    // Basic Red Flag Detection
    const emergencyKeywords = [
      'chest pain', 'breathless', 'unconscious', 'severe bleeding', 
      'stroke', 'cannot breathe', 'heart attack', 'poison'
    ];
    
    const isEmergency = emergencyKeywords.some(k => lowerSymptoms.includes(k));
    
    if (isEmergency) {
      return {
        conditionHypotheses: ["Potential Emergency Condition"],
        differentials: [],
        riskLevel: 'emergency',
        whenToWorry: "IMMEDIATE: These symptoms require emergency care.",
        likelySpecialist: "Emergency Medicine / PHC Doctor",
        nextRecommendedAction: "Call an ambulance or go to the nearest PHC immediately.",
        emergencyEscalation: "High risk of life-threatening condition.",
        doctorHandoffSummary: `EMERGENCY TRIAGE: Patient reported critical symptoms: ${symptoms}. Immediate intervention required.`,
        soapSummary: {
          subjective: symptoms,
          objective: "Offline - no image analysis",
          assessment: "Potential Emergency",
          plan: "Immediate referral"
        },
        auditTrail: {
          sources: ["Offline Rule Engine"],
          reasoning: "Emergency keyword detection."
        },
        suggestions: {
          otcMedicines: [],
          diagnostics: [],
          nearestFacilities: ["PHC", "District Hospital"]
        },
        confidence: 0.5,
        disclaimer: "OFFLINE: Running basic triage. Deep AI analysis will run when online."
      };
    }

    // Chronic Disease Risk Boost
    const hasChronic = memory.conditions.length > 0;
    const riskLevel = hasChronic ? 'moderate' : 'normal';

    return {
      conditionHypotheses: ["Awaiting deep AI analysis"],
      differentials: [],
      riskLevel: riskLevel,
      whenToWorry: "Monitor symptoms closely. If they worsen, seek care.",
      likelySpecialist: "General Physician",
      nextRecommendedAction: "Keep a log of symptoms and wait for network to sync for deep analysis.",
      doctorHandoffSummary: `OFFLINE TRIAGE: Patient reported: ${symptoms}. Chronic conditions: ${memory.conditions.map(c => c.name).join(', ')}.`,
      soapSummary: {
        subjective: symptoms,
        objective: "Offline",
        assessment: "Stable",
        plan: "Monitor and sync"
      },
      auditTrail: {
        sources: ["Offline Rule Engine"],
        reasoning: "Basic triage based on chronic history."
      },
      suggestions: {
        otcMedicines: [],
        diagnostics: [],
        nearestFacilities: ["PHC"]
      },
      confidence: 0.3,
      disclaimer: "OFFLINE: Running basic triage. Deep AI analysis will run when online."
    };
  }
};
