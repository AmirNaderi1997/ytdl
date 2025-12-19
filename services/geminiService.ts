import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    optimizedTitle: {
      type: Type.STRING,
      description: "A catchy, SEO-optimized title for the video.",
    },
    summary: {
      type: Type.STRING,
      description: "A concise 2-sentence summary of what the video is likely about.",
    },
    seoTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-7 high-ranking SEO tags.",
    },
    viralScore: {
      type: Type.NUMBER,
      description: "A predicted viral score from 0 to 100.",
    },
    contentSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 suggestions to improve the video description or metadata.",
    },
  },
  required: ["optimizedTitle", "summary", "seoTags", "viralScore", "contentSuggestions"],
};

export const analyzeVideoMetadata = async (
  videoTitle: string,
  context: string = ""
): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      Analyze the following video topic/title and context to generate optimized metadata.
      
      Video Title: "${videoTitle}"
      Additional Context: "${context}"
      
      Provide a viral-worthy title, a short summary, effective tags, and a viral potential score.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert YouTube content strategist and SEO specialist.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};