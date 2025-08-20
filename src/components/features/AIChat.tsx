import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, RefreshCw } from 'lucide-react';
import { ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { generateChatResponse, type ChatMessage } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface AIChatProps {
  quotedContent?: string;
  onSaveAsDiary?: (content: string) => void;
}

export function AIChat({ quotedContent, onSaveAsDiary }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // メッセージ送信処理
  const handleSendMessage = async (content: string, existingMessages?: ChatMessage[]) => {
    const currentMessages = existingMessages || messages;
    
    if (!content && !existingMessages) return;

    setLoading(true);
    setError(null);

    try {
      let newMessages = currentMessages;
      
      if (content) {
        const userMessage: ChatMessage = {
          role: 'user',
          content,
          timestamp: new Date()
        };
        newMessages = [...currentMessages, userMessage];
        setMessages(newMessages);
      }

      const aiResponse = await generateChatResponse(newMessages);
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 引用コンテンツの初期化
  useEffect(() => {
    // 既に同じコンテンツで初期化中または完了している場合はスキップ
    if (initializingRef.current || currentQuotedRef.current === quotedContent) {
      return;
    }

    if (quotedContent) {
      initializingRef.current = true;
      currentQuotedRef.current = quotedContent;
      
      const quotedMessage: ChatMessage = {
        role: 'user',
        content: `以下の日記について話したいです：\n\n"${quotedContent}"`,
        timestamp: new Date()
      };
      
      setMessages([quotedMessage]);
      
      // AI応答を非同期で生成
      const generateInitialResponse = async () => {
        try {
          setLoading(true);
          const aiResponse = await generateChatResponse([quotedMessage]);
          
          const aiMessage: ChatMessage = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          };

          setMessages([quotedMessage, aiMessage]);
        } catch (err) {
          setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        } finally {
          setLoading(false);
          initializingRef.current = false;
        }
      };

      generateInitialResponse();
    } else if (!quotedContent && currentQuotedRef.current) {
      // quotedContentがクリアされた場合はリセット
      setMessages([]);
      currentQuotedRef.current = undefined;
      initializingRef.current = false;
    }
  }, [quotedContent]);

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
    initializingRef.current = false;
    currentQuotedRef.current = undefined;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-primary-500" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AIとの会話
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
