import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, loading, placeholder = "メッセージを入力..." }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    onSend(message.trim());
    setMessage('');
    
    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 自動高さ調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     resize-none max-h-32 overflow-y-auto"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="flex items-center justify-center w-10 h-10 bg-primary-500 hover:bg-primary-600 
                   disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg 
                   transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
}
