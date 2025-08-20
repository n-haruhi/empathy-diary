import React, { useState } from 'react';
import { X, Edit3, Trash2, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConfirmModal } from '../ui/ConfirmModal';
import { formatDate, getEmotionColor, parseEmotionTags } from '../../utils';
import type { DiaryEntry } from '../../types';

interface DiaryDetailProps {
  entry: DiaryEntry;
  onClose: () => void;
  onEdit: (id: string, data: { title: string; content: string; emotions: string[] }) => void;
  onDelete: (id: string) => void;
  onStartChat: (content: string) => void;
}

export function DiaryDetail({ entry, onClose, onEdit, onDelete, onStartChat }: DiaryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.encrypted_title || '');
  const [editContent, setEditContent] = useState(entry.encrypted_content);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    parseEmotionTags(entry.emotion_tags)
  );

  const emotions = [
    { id: 'happy', label: 'うれしい', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { id: 'sad', label: 'かなしい', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { id: 'angry', label: 'いらいら', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
    { id: 'anxious', label: '不安', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { id: 'excited', label: 'わくわく', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
    { id: 'calm', label: 'おだやか', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  ];

  const handleSave = () => {
    onEdit(entry.id, {
      title: editTitle.trim() || '無題の日記',
      content: editContent.trim(),
      emotions: selectedEmotions
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(entry.encrypted_title || '');
    setEditContent(entry.encrypted_content);
    setSelectedEmotions(parseEmotionTags(entry.emotion_tags));
    setIsEditing(false);
  };

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleDeleteConfirm = () => {
    onDelete(entry.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleStartChat = () => {
    onStartChat(entry.encrypted_content);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? '日記を編集' : '日記の詳細'}
            </h2>
            
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleStartChat}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    AIと話す
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    削除
                  </Button>
                </>
              )}
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isEditing ? (
              /* 編集モード */
              <div className="space-y-6">
                <Input
                  label="タイトル"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="日記のタイトル（任意）"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    内容 *
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             resize-none"
                    placeholder="日記の内容を入力してください..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    気持ち
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.id}
                        type="button"
                        onClick={() => toggleEmotion(emotion.id)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedEmotions.includes(emotion.id)
                            ? emotion.color + ' ring-2 ring-primary-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {emotion.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={!editContent.trim()}
                    className="flex-1"
                  >
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              /* 表示モード */
              <div className="space-y-6">
                {/* メタ情報 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(entry.created_at)}
                  </div>
                  {entry.created_at !== entry.updated_at && (
                    <span>（編集済み）</span>
                  )}
                </div>

                {/* タイトル */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {entry.encrypted_title || '無題の日記'}
                </h1>

                {/* 感情タグ */}
                {entry.emotion_tags && entry.emotion_tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <div className="flex flex-wrap gap-2">
                      {parseEmotionTags(entry.emotion_tags).map((emotion, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(emotion)}`}
                        >
                          {emotions.find(e => e.id === emotion)?.label || emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 内容 */}
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {entry.encrypted_content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="日記を削除"
        message="この日記を完全に削除しますか？この操作は取り消すことができません。"
        confirmText="削除する"
        cancelText="キャンセル"
        variant="danger"
      />
    </>
  );
}
