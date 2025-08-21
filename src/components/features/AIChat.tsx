import { useState, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, RefreshCw } from 'lucide-react';
import { ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { generateChatResponse, type ChatMessage } from '../../lib/gemini';
import { 
  createChatSession, 
  saveChatMessage, 
  getChatMessages,
  type ChatSession 
} from '../../lib/chatHistory';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface AIChatProps {
  quotedContent?: string;
  onSaveAsDiary?: (content: string) => void;
  selectedSession?: ChatSession | null;
  onSessionChange?: (session: ChatSession | null) => void;
}

export function AIChat({ quotedContent, onSaveAsDiary, selectedSession, onSessionChange }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializingRef = useRef(false);
  const currentQuotedRef = useRef<string | undefined>(undefined);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 選択されたセッションが変更された時の処理
  useEffect(() => {
    if (selectedSession && selectedSession.id !== currentSession?.id) {
      loadChatSession(selectedSession);
    }
  }, [selectedSession]);

  // 会話セッションを読み込み
  const loadChatSession = async (session: ChatSession) => {
    try {
      setCurrentSession(session);
      setLoading(true);
      
      const sessionMessages = await getChatMessages(session.id);
      setMessages(sessionMessages);
      
      // クリア状態をリセット
      currentQuotedRef.current = undefined;
      initializingRef.current = false;
    } catch (error) {
      console.error('Error loading chat session:', error);
      setError('会話の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メッセージ送信処理
  const handleSendMessage = async (content: string, existingMessages?: ChatMessage[]) => {
    const currentMessages = existingMessages || messages;
    
    if (!content && !existingMessages) return;
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let newMessages = currentMessages;
      let sessionToUse = currentSession;

      // 新しいユーザーメッセージを追加
      if (content) {
        const userMessage: ChatMessage = {
          role: 'user',
          content,
          timestamp: new Date()
        };
        newMessages = [...currentMessages, userMessage];
        setMessages(newMessages);

        // セッションがない場合は新規作成
        if (!sessionToUse) {
          sessionToUse = await createChatSession(user.id, content);
          if (sessionToUse) {
            setCurrentSession(sessionToUse);
            onSessionChange?.(sessionToUse);
          }
        }

        // メッセージをデータベースに保存
        if (sessionToUse) {
          await saveChatMessage(sessionToUse.id, 'user', content);
        }
      }

      // AI応答を生成
      const aiResponse = await generateChatResponse(newMessages);
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // AI応答もデータベースに保存
      if (sessionToUse) {
        await saveChatMessage(sessionToUse.id, 'assistant', aiResponse);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 引用コンテンツの初期化
  useEffect(() => {
    if (initializingRef.current || currentQuotedRef.current === quotedContent) {
      return;
    }

    if (quotedContent && user) {
      initializingRef.current = true;
      currentQuotedRef.current = quotedContent;
      
      // 既存のセッションをクリア
      setCurrentSession(null);
      onSessionChange?.(null);
      
      const quotedMessage: ChatMessage = {
        role: 'user',
        content: `以下の日記について話したいです：\n\n"${quotedContent}"`,
        timestamp: new Date()
      };
      
      setMessages([quotedMessage]);
      
      // 引用会話の初期化
      const initializeQuotedConversation = async () => {
        try {
          setLoading(true);
          
          // 先にセッションを作成
          const newSession = await createChatSession(user.id, quotedMessage.content);
          if (!newSession) {
            throw new Error('セッション作成に失敗しました');
          }
          
          setCurrentSession(newSession);
          onSessionChange?.(newSession);
          
          // ユーザーメッセージを先に保存
          await saveChatMessage(newSession.id, 'user', quotedMessage.content);
          
          // AI応答を生成
          const aiResponse = await generateChatResponse([quotedMessage]);
          
          const aiMessage: ChatMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          };

          setMessages([quotedMessage, aiMessage]);

          // AI応答を保存
          await saveChatMessage(newSession.id, 'assistant', aiResponse);
          
        } catch (err) {
          setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        } finally {
          setLoading(false);
          initializingRef.current = false;
        }
      };

      initializeQuotedConversation();
    } else if (!quotedContent && currentQuotedRef.current) {
      // quotedContentがクリアされた場合はリセット
      setMessages([]);
      setCurrentSession(null);
      onSessionChange?.(null);
      currentQuotedRef.current = undefined;
      initializingRef.current = false;
    }
  }, [quotedContent, user, onSessionChange]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSaveConversationAsDiary = async () => {
    if (!user || messages.length === 0) return;

    try {
      const conversationText = messages
        .map(msg => `${msg.role === 'user' ? 'あなた' : 'AI'}: ${msg.content}`)
        .join('\n\n');

      const title = `AIとの会話 - ${new Date().toLocaleDateString('ja-JP')}`;

      const { error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            encrypted_title: title,
            encrypted_content: conversationText,
            emotion_tags: ['conversation'],
          },
        ]);

      if (error) {
        throw error;
      }

      alert('会話を日記として保存しました！');
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setError(null);
    setCurrentSession(null);
    onSessionChange?.(null);
    initializingRef.current = false;
    currentQuotedRef.current = undefined;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-primary-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentSession?.title || 'AIとの会話'}
          </h2>
        </div>
        
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleSaveConversationAsDiary}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                       hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 
                       dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BookOpen size={16} />
              会話を日記として保存
            </button>
          )}
          
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                     hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 
                     dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            新しい会話
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                AIと会話してみましょう
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                今日の気持ちや悩みを話してみてください。<br />
                AIがあなたの気持ちに寄り添います。
              </p>
            </div>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <ChatMessageComponent
                key={index}
                message={message}
                onCopy={() => handleCopyMessage(message.content)}
                onSaveAsDiary={() => onSaveAsDiary?.(message.content)}
              />
            ))}
          </div>
        )}
        
        {error && (
          <div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        loading={loading}
        placeholder={quotedContent ? "この日記についてAIと話してみましょう..." : "メッセージを入力..."}
      />
    </div>
  );
}
