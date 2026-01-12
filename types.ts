
export enum AppView {
  CHAT = 'chat',
  MEDIA = 'media',
  LIVE = 'live',
  TTS = 'tts',
  TIKTOK = 'tiktok',
  DASHBOARD = 'dashboard'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: GroundingSource[];
  timestamp: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: Date;
}
