import { BookOpen, MessageSquare, Plus, Calendar, Clock } from 'lucide-react';
import { cn } from '../../utils';
import type { DiaryEntry } from '../../types';
import type { ChatSession } from '../../lib/chatHistory';

interface SidebarProps {
  activeView: 'diary' | 'chat';
  onViewChange: (view: 'diary' | 'chat') => void;
  onNewDiary: () => void;
  onNewChat: () => void;
  diaryEntries: DiaryEntry[];
  onQuoteDiary: (entry: DiaryEntry) => void;
  chatSessions: ChatSession[];
  onSelectChatSession: (sessionId: string) => void;
  activeChatSessionId?: string;
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  onNewDiary, 
  onNewChat, 
  diaryEntries,
  onQuoteDiary,
  chatSessions,
  onSelectChatSession,
  activeChatSessionId
}: SidebarProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* ナビゲーション */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewChange('diary')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'diary'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <BookOpen size={16} />
            日記
          </button>
          
          <button
            onClick={() => onViewChange('chat')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'chat'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <MessageSquare size={16} />
            AIチャット
          </button>
        </div>
      </div>

      {/* 新規作成ボタン */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {activeView === 'diary' ? (
          <button
            onClick={onNewDiary}
            className="w-full flex items-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 
                     text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            新しい日記を書く
          </button>
        ) : (
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 
                     text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            新しい会話を始める
          </button>
        )}
      </div>

      {/* 日記一覧（日記モードの時のみ） */}
      {activeView === 'diary' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar size={16} />
              最近の日記
            </h3>
            
            {diaryEntries.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                まだ日記がありません
              </p>
            ) : (
              <div className="space-y-2">
                {diaryEntries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="group p-3 rounded-lg border border-gray-200 dark:border-gray-600 
                             hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {entry.encrypted_title || '無題の日記'}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {new Date(entry.created_at).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {entry.encrypted_content}
                    </p>
                    
                    <button
                      onClick={() => onQuoteDiary(entry)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 
                               dark:hover:text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      この内容でAIと話す →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AIチャット履歴（チャットモードの時のみ） */}
      {activeView === 'chat' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock size={16} />
              会話履歴
            </h3>
            
            {chatSessions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                まだ会話がありません
              </p>
            ) : (
              <div className="space-y-2">
                {chatSessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectChatSession(session.id)}
                    className={cn(
                      'group p-3 rounded-lg border cursor-pointer transition-colors',
                      activeChatSessionId === session.id
                        ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {session.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {new Date(session.updated_at).toLocaleDateString('ja-JP', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    {session.last_message && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {session.last_message}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session.message_count} メッセージ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
