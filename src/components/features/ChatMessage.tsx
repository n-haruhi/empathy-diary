import { User, Bot, Copy, BookOpen } from 'lucide-react';
import { formatDate } from '../../utils';
import type { ChatMessage } from '../../lib/gemini';

interface ChatMessageProps {
  message: ChatMessage;
  onSaveAsDiary?: () => void;
  onCopy?: () => void;
}

export function ChatMessageComponent({ message, onSaveAsDiary, onCopy }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
      {/* アバター */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-500 text-white' 
          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* メッセージ内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isUser ? 'あなた' : 'AI'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(message.timestamp)}
          </span>
        </div>

        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* アクションボタン */}
        {!isUser && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 
                       dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 
                       dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Copy size={12} />
              コピー
            </button>
            <button
              onClick={onSaveAsDiary}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 
                       dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 
                       dark:hover:bg-gray-700 rounded transition-colors"
            >
              <BookOpen size={12} />
              日記として保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
