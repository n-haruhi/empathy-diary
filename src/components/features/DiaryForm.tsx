import React, { useState } from 'react';
import { Smile, Frown, Zap, CloudRain, Sparkles, Leaf } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DiaryFormProps {
  onSubmit: (data: { title: string; content: string; emotions: string[] }) => void;
  loading?: boolean;
}

export function DiaryForm({ onSubmit, loading }: DiaryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const emotions = [
    { id: 'happy', label: 'うれしい', icon: Smile, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { id: 'sad', label: 'かなしい', icon: Frown, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { id: 'angry', label: 'いらいら', icon: Zap, color: 'bg-red-100 text-red-800 hover:bg-red-200' },
    { id: 'anxious', label: '不安', icon: CloudRain, color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { id: 'excited', label: 'わくわく', icon: Sparkles, color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
    { id: 'calm', label: 'おだやか', icon: Leaf, color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onSubmit({
      title: title.trim() || '無題の日記',
      content: content.trim(),
      emotions: selectedEmotions
    });

    // フォームリセット
    setTitle('');
    setContent('');
    setSelectedEmotions([]);
  };

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        今日の気持ちを書いてみよう
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="タイトル（任意）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="今日のできごと、気持ちなど"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容 *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     resize-none"
            placeholder="今日はどんな日でしたか？どんな気持ちでしょうか。まとまっていなくても大丈夫。何でも自由に書いてください"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            今の気持ち
          </label>
          <div className="flex flex-wrap gap-3">
            {emotions.map((emotion) => {
              const IconComponent = emotion.icon;
              const isSelected = selectedEmotions.includes(emotion.id);
              
              return (
                <button
                  key={emotion.id}
                  type="button"
                  onClick={() => toggleEmotion(emotion.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
                           transition-all duration-200 ${
                    isSelected
                      ? emotion.color + ' ring-2 ring-primary-500 scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <IconComponent size={16} />
                  {emotion.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || !content.trim()}
        >
          {loading ? '保存中...' : '記録する'}
        </Button>
      </form>
    </div>
  );
}
