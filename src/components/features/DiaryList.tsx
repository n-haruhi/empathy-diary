import React from 'react';
import { Smile, Frown, Zap, CloudRain, Sparkles, Leaf, ChevronRight, BookOpen } from 'lucide-react';
import { formatDate, getEmotionColor } from '../../utils';
import type { DiaryEntry } from '../../types';

interface DiaryListProps {
  entries: DiaryEntry[];
  loading?: boolean;
  onEntryClick?: (entry: DiaryEntry) => void;
}

export function DiaryList({ entries, loading, onEntryClick }: DiaryListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
        <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          まだ日記がありません
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          最初の日記を書いて、あなたの気持ちを記録してみましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onEntryClick?.(entry)}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg 
                   transition-all duration-200 cursor-pointer border border-transparent 
                   hover:border-primary-200 dark:hover:border-primary-800 hover:scale-[1.02]"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {entry.encrypted_title || '無題の日記'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
              {formatDate(entry.created_at)}
            </span>
          </div>

          <div className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            {entry.encrypted_content}
          </div>

          {entry.emotion_tags && entry.emotion_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {entry.emotion_tags.map((emotion, index) => {
                const { icon: IconComponent, label } = getEmotionIconAndLabel(emotion);
                return (
                  <span
                    key={index}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEmotionColor(emotion)}`}
                  >
                    <IconComponent size={12} />
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>クリックして詳細を見る</span>
            <ChevronRight size={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

// 感情のアイコンとラベルを取得するヘルパー関数
function getEmotionIconAndLabel(emotion: string): { icon: React.ComponentType<{ size: number }>, label: string } {
  const emotions: Record<string, { icon: React.ComponentType<{ size: number }>, label: string }> = {
    happy: { icon: Smile, label: 'うれしい' },
    sad: { icon: Frown, label: 'かなしい' },
    angry: { icon: Zap, label: 'いらいら' },
    anxious: { icon: CloudRain, label: '不安' },
    excited: { icon: Sparkles, label: 'わくわく' },
    calm: { icon: Leaf, label: 'おだやか' },
  };
  return emotions[emotion] || { icon: Smile, label: emotion };
}
