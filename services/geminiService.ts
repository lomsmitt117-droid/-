import { GoogleGenAI, Type } from "@google/genai";
import { GeminiClipSchema } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeVideoForClips = async (videoFile: File): Promise<GeminiClipSchema[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const videoPart = await fileToGenerativePart(videoFile);

    const prompt = `
      Analyze this video content. I want to create viral "Shorts" (vertical short videos) from this long-form content.
      Identify 3-5 specific segments that are most likely to go viral on TikTok or YouTube Shorts.
      
      For each segment:
      1. Provide a catchy title.
      2. Accurate start and end timestamps (format MM:SS).
      3. A viral score from 0-100 based on hook potential, emotional impact, or information density.
      4. A brief reasoning why this segment is good.
      5. A short transcript summary of what is said/happens.

      Output strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [videoPart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              viralScore: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              transcriptSummary: { type: Type.STRING },
            },
            required: ["title", "startTime", "endTime", "viralScore", "reasoning", "transcriptSummary"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiClipSchema[];
    }
    return [];
  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    throw error;
  }
};

// Mock function to simulate YouTube URL processing (since we can't download YT client-side)
export const mockAnalyzeYoutubeUrl = async (url: string): Promise<GeminiClipSchema[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          title: "The Secret to Productivity",
          startTime: "00:45",
          endTime: "01:30",
          viralScore: 95,
          reasoning: "High energy intro with a contrarian statement that hooks viewers.",
          transcriptSummary: "Speaker discusses why todo lists fail and introduces timeboxing."
        },
        {
          title: "Why Most People Fail",
          startTime: "03:15",
          endTime: "04:00",
          viralScore: 88,
          reasoning: "Emotional resonance and relatable failure story.",
          transcriptSummary: "A personal story about burnout and the realization that changed everything."
        },
        {
          title: "The 2-Minute Rule",
          startTime: "08:20",
          endTime: "09:10",
          viralScore: 92,
          reasoning: "Actionable advice that viewers can try immediately.",
          transcriptSummary: "Explanation of the 2-minute rule for habits."
        }
      ]);
    }, 2500);
  });
};