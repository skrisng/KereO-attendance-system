
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, RecognitionResult } from "../types";

const cleanBase64 = (data: string) => data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

export const recognizeFace = async (
  targetImage: string,
  knownUsers: UserProfile[]
): Promise<RecognitionResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [
    { text: "System: You are a high-security facial recognition engine. Compare the TARGET image against these REFERENCE students. Return JSON ONLY." }
  ];

  knownUsers.forEach(u => {
    parts.push({ text: `REF: ${u.name} (ID: ${u.id})` });
    parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64(u.photoBase64) } });
  });

  parts.push({ text: "Now analyze this TARGET image:" });
  parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64(targetImage) } });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { role: "user", parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isHuman: { type: Type.BOOLEAN },
            match: { type: Type.BOOLEAN },
            userId: { type: Type.STRING },
            name: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["match", "confidence", "isHuman"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as RecognitionResult;
  } catch (err) {
    console.error("Gemini Error:", err);
    return { match: false, isHuman: true, confidence: 0, reasoning: "System connection error" };
  }
};
