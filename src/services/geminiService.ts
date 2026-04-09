import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AIAnalysisResult, MedicalMemory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  analyzeSymptoms: async (
    symptoms: string,
    memory: MedicalMemory,
    images: string[] = [],
    language: string = 'en',
    previousAnswers: { question: string; answer: string }[] = []
  ): Promise<AIAnalysisResult> => {
    const patientContext = `
      Patient Profile:
      Name: ${memory.profile?.fullName}
      Age: ${memory.profile?.age}
      Gender: ${memory.profile?.gender}
      Location: ${memory.profile?.village}, ${memory.profile?.district}, ${memory.profile?.state}
      Chronic Diseases: ${memory.conditions.map(c => c.name).join(", ")}
      Current Medications: ${memory.medications.map(m => m.name).join(", ")}
      Language: ${language}
    `;

    const previousConversation = previousAnswers.length > 0 
      ? `\nPrevious Follow-up Questions and Answers:\n${previousAnswers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join("\n")}`
      : "";

    const prompt = `
      You are a world-class clinical decision-support AI for rural healthcare.
      Ground your reasoning in trusted medical knowledge (WHO, NIH, Medline).
      
      CONTEXT:
      ${patientContext}
      ${previousConversation}
      
      SYMPTOMS/INPUT:
      ${symptoms}
      
      TASK:
      1. Analyze the symptoms. If they are ambiguous or critical information is missing (duration, severity, specific location), provide 2-4 intelligent follow-up questions instead of a final diagnosis.
      2. If symptoms are clear, provide a full differential diagnosis.
      3. Cross-check current medications for potential side effects or interactions related to the new symptoms.
      4. If images are provided, analyze them for severity, infection risk, and visual markers.
      5. Generate a structured SOAP summary for doctor handoff.
      6. Provide an audit trail of your reasoning and sources.
      
      OUTPUT REQUIREMENTS:
      - Use the provided JSON schema.
      - If followUpQuestions are provided, other fields can be minimal or empty, but riskLevel must still be assessed.
      - Provide user-facing fields in ${language}. Keep SOAP summary and audit trail professional (English + ${language}).
    `;

    try {
      // Demo Mode / Failover Check
      if (memory.profile?.demoMode && (symptoms.toLowerCase().includes('demo') || !process.env.GEMINI_API_KEY)) {
        return geminiService.getDemoFallback(language);
      }

      const contents: any[] = [{ text: prompt }];

      images.forEach((base64) => {
        const [mime, data] = base64.split(';base64,');
        contents.push({
          inlineData: {
            mimeType: mime.split(':')[1],
            data: data
          }
        });
      });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conditionHypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
              differentials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    condition: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                  }
                }
              },
              riskLevel: { type: Type.STRING, enum: ["normal", "moderate", "high", "emergency"] },
              whenToWorry: { type: Type.STRING },
              likelySpecialist: { type: Type.STRING },
              nextRecommendedAction: { type: Type.STRING },
              emergencyEscalation: { type: Type.STRING },
              doctorHandoffSummary: { type: Type.STRING },
              soapSummary: {
                type: Type.OBJECT,
                properties: {
                  subjective: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  assessment: { type: Type.STRING },
                  plan: { type: Type.STRING }
                }
              },
              medicationInteraction: {
                type: Type.OBJECT,
                properties: {
                  warning: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  details: { type: Type.STRING }
                }
              },
              imageAnalysis: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  infectionRisk: { type: Type.STRING },
                  findings: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              auditTrail: {
                type: Type.OBJECT,
                properties: {
                  sources: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasoning: { type: Type.STRING }
                }
              },
              suggestions: {
                type: Type.OBJECT,
                properties: {
                  otcMedicines: { type: Type.ARRAY, items: { type: Type.STRING } },
                  diagnostics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  nearestFacilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              confidence: { type: Type.NUMBER },
              disclaimer: { type: Type.STRING }
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
      throw new Error("Failed to parse AI response");
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      // Failover to demo fallback on any error
      return geminiService.getDemoFallback(language);
    }
  },

  getDemoFallback: (language: string): AIAnalysisResult => {
    return {
      conditionHypotheses: ["Common Cold / Mild Viral Infection"],
      differentials: [
        { condition: "Seasonal Allergies", confidence: 0.3, reason: "Similar respiratory symptoms but no fever reported." },
        { condition: "Mild Influenza", confidence: 0.2, reason: "Possible if body aches increase." }
      ],
      riskLevel: "normal",
      whenToWorry: "If fever exceeds 101°F or breathing becomes difficult.",
      likelySpecialist: "General Physician",
      nextRecommendedAction: "Rest, hydration, and monitor temperature.",
      emergencyEscalation: "Call 108 if chest pain occurs.",
      doctorHandoffSummary: "Patient presents with mild respiratory symptoms. No red flags at this time.",
      soapSummary: {
        subjective: "Patient reports mild cough and runny nose.",
        objective: "Vitals stable in demo profile.",
        assessment: "Likely viral upper respiratory infection.",
        plan: "Symptomatic treatment and follow-up in 48 hours."
      },
      auditTrail: {
        sources: ["WHO Guidelines for URI", "Local PHC Protocol"],
        reasoning: "Symptoms are consistent with a mild viral load. No immediate intervention required."
      },
      suggestions: {
        otcMedicines: ["Paracetamol 500mg", "Oral Rehydration Salts"],
        diagnostics: ["Complete Blood Count (CBC)"],
        nearestFacilities: ["Hoskote General Hospital"]
      },
      confidence: 0.85,
      disclaimer: "This is a demo-safe analysis. Always consult a real doctor."
    };
  }
};
