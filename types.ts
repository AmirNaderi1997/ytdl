export enum AppMode {
  DOWNLOADER = 'DOWNLOADER',
  AI_OPTIMIZER = 'AI_OPTIMIZER'
}

export interface VideoFormat {
  id: string;
  resolution: string;
  format: string;
  size: string;
  hasAudio: boolean;
  type: 'video' | 'audio';
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  duration: string;
  author: string;
}

export interface AIAnalysisResult {
  optimizedTitle: string;
  summary: string;
  seoTags: string[];
  viralScore: number;
  contentSuggestions: string[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}