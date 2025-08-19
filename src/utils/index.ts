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
  }).format(new Date(date));
}

// 感情タグの色を取得
export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: 'bg-yellow-100 text-yellow-800',
    sad: 'bg-blue-100 text-blue-800',
    angry: 'bg-red-100 text-red-800',
    anxious: 'bg-purple-100 text-purple-800',
    excited: 'bg-pink-100 text-pink-800',
    calm: 'bg-green-100 text-green-800',
  };
  return colors[emotion] || 'bg-gray-100 text-gray-800';
}
