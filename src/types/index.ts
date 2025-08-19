export interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  encrypted_title: string;
  encrypted_content: string;
  emotion_tags: string[];
  ai_response_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AIResponse {
  id: string;
  user_id: string;
  encrypted_response: string;
  response_type: 'empathetic' | 'supportive' | 'encouraging';
  created_at: string;
}

export interface EmotionTag {
  id: string;
  name: string;
  color: string;
  emoji: string;
}
