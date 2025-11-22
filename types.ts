export interface Clip {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  viralScore: number;
  reasoning: string;
  transcript: string;
}

export interface VideoProject {
  id: string;
  sourceUrl?: string;
  sourceFile?: File;
  title: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  clips: Clip[];
  duration?: string;
  thumbnail?: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
}

// Gemini API Response Types
export interface GeminiClipSchema {
  title: string;
  startTime: string;
  endTime: string;
  viralScore: number;
  reasoning: string;
  transcriptSummary: string;
}