import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind クラスをマージするユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 日付フォーマット用
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// 感情タグの色を取得
export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    angry: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    anxious: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    excited: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    calm: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };
  return colors[emotion] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

// 日記の内容をプレビュー用に短縮
export function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}

// 感情タグを文字列から配列に変換（JSONBから）
export function parseEmotionTags(tags: any): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  }
  return [];
}
