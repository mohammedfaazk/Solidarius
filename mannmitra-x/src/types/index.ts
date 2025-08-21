export interface User {
  uid: string;
  createdAt: string;
  locale: string;
  deviceCaps: {
    webgpu: boolean;
    stt: boolean;
    tts: boolean;
  };
  consents: {
    analytics: boolean;
    storeJournal: boolean;
    community: boolean;
    shareCounselor: boolean;
  };
}

export interface JournalEntry {
  id: string;
  uid: string;
  type: 'mood' | 'thought_record' | 'note';
  moodScore?: number; // 1-5
  tags?: string[];
  note_redacted?: string;
  timestamp: string;
  thoughtRecord?: {
    situation: string;
    automaticThought: string;
    emotionIntensity: number;
    evidenceFor: string;
    evidenceAgainst: string;
    balancedThought: string;
    action: string;
  };
}

export interface CommunityPost {
  id: string;
  topicId: string;
  uidPseudo: string;
  text_redacted: string;
  toxicity: number;
  status: 'published' | 'held';
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ModerationResult {
  toxicity: number;
  self_harm: number;
  action: 'allow' | 'hold' | 'crisis';
}