import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 型安全性のためのヘルパー
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          updated_at?: string;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          encrypted_title: string | null;
          encrypted_content: string;
          emotion_tags: string[];
          ai_response_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          encrypted_title?: string | null;
          encrypted_content: string;
          emotion_tags?: string[];
          ai_response_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          encrypted_title?: string | null;
          encrypted_content?: string;
          emotion_tags?: string[];
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          last_message: string | null;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          last_message?: string | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          last_message?: string | null;
          message_count?: number;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
    };
  };
};
