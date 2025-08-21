import { supabase } from './supabase';
import type { ChatMessage } from './gemini';

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  last_message: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface StoredChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// 新しい会話セッションを作成
export async function createChatSession(userId: string, firstMessage?: string): Promise<ChatSession | null> {
  try {
    const title = firstMessage 
      ? `${firstMessage.slice(0, 30)}${firstMessage.length > 30 ? '...' : ''}`
      : '新しい会話';

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{
        user_id: userId,
        title,
        last_message: firstMessage || null,
        message_count: firstMessage ? 1 : 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// ユーザーの会話履歴を取得
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// 特定の会話のメッセージを取得
export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    // StoredChatMessage を ChatMessage に変換
    return (data || []).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at)
    }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// メッセージを会話に保存
export async function saveChatMessage(
  sessionId: string, 
  role: 'user' | 'assistant', 
  content: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role,
        content
      }]);

    if (error) {
      console.error('Error saving chat message:', error);
      return false;
    }

    // セッションの最終メッセージとカウントを更新
    await updateChatSession(sessionId, content);
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// 会話セッションの情報を更新
async function updateChatSession(sessionId: string, lastMessage: string): Promise<void> {
  try {
    // メッセージ数を取得
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    // セッション情報を更新
    await supabase
      .from('chat_sessions')
      .update({
        last_message: lastMessage.slice(0, 100), // 100文字に制限
        message_count: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  } catch (error) {
    console.error('Error updating chat session:', error);
  }
}

// 会話セッションを削除
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// 会話のタイトルを更新
export async function updateChatSessionTitle(sessionId: string, title: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ title })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating chat session title:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
