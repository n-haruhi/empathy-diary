import React, { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { DiaryForm } from './DiaryForm';
import { DiaryList } from './DiaryList';
import { DiaryDetail } from './DiaryDetail';
import { AIChat } from './AIChat';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { DiaryEntry } from '../../types';

export function MainLayout() {
  const [activeView, setActiveView] = useState<'diary' | 'chat'>('diary');
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quotedContent, setQuotedContent] = useState<string | undefined>();
  const { user, signOut } = useAuth();

  // 日記エントリを取得
  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return;
      }

      setEntries(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 日記を作成
  const handleCreateEntry = async (data: { title: string; content: string; emotions: string[] }) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            encrypted_title: data.title,
            encrypted_content: data.content,
            emotion_tags: data.emotions,
          },
        ]);

      if (error) {
        console.error('Error creating entry:', error);
        alert('日記の保存に失敗しました。もう一度お試しください。');
        return;
      }

      await fetchEntries();
      setShowDiaryForm(false);
    } catch (error) {
      console.error('Error:', error);
      alert('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  // 日記を編集
  const handleEditEntry = async (id: string, data: { title: string; content: string; emotions: string[] }) => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('diary_entries')
        .update({
          encrypted_title: data.title,
          encrypted_content: data.content,
          emotion_tags: data.emotions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating entry:', error);
        alert('日記の更新に失敗しました。もう一度お試しください。');
        return;
      }

      await fetchEntries();
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error:', error);
      alert('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  // 日記を削除
  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting entry:', error);
        alert('日記の削除に失敗しました。もう一度お試しください。');
        return;
      }

      // 削除成功後、リストから該当のエントリを即座に削除
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      // 詳細モーダルが開いている場合は閉じる
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('予期しないエラーが発生しました。');
    }
  };

  // 日記の内容を引用してAIチャットを開始
  const handleQuoteDiary = (entry: DiaryEntry) => {
    setQuotedContent(entry.encrypted_content);
    setActiveView('chat');
  };

  // 日記詳細からAIチャットを開始
  const handleStartChatFromDetail = (content: string) => {
    setQuotedContent(content);
    setActiveView('chat');
  };

  // 新しい日記作成
  const handleNewDiary = () => {
    setShowDiaryForm(true);
    setSelectedEntry(null);
  };

  // 新しいチャット開始
  const handleNewChat = () => {
    setQuotedContent(undefined);
    setActiveView('chat');
  };

  // 日記エントリをクリック
  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
  };

  // AI会話を日記として保存
  const handleSaveAsDiary = async (content: string) => {
    if (!user) return;

    try {
      const title = `AIとの会話から - ${new Date().toLocaleDateString('ja-JP')}`;

      const { error } = await supabase
        .from('diary_entries')
        .insert([
          {
            user_id: user.id,
            encrypted_title: title,
            encrypted_content: content,
            emotion_tags: ['ai-conversation'],
          },
        ]);

      if (error) {
        throw error;
      }

      alert('内容を日記として保存しました！');
      await fetchEntries();
    } catch (error) {
      console.error('Error saving as diary:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  // ログアウト
  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Empathy Diary
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                あなたの気持ちに寄り添う場所
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <User size={16} />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onNewDiary={handleNewDiary}
          onNewChat={handleNewChat}
          diaryEntries={entries}
          onQuoteDiary={handleQuoteDiary}
        />

        {/* メインエリア */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'diary' ? (
            <div className="flex-1 overflow-y-auto p-6">
              {showDiaryForm ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      新しい日記
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setShowDiaryForm(false)}
                      disabled={submitting}
                    >
                      キャンセル
                    </Button>
                  </div>
                  <DiaryForm
                    onSubmit={handleCreateEntry}
                    loading={submitting}
                  />
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    これまでの日記
                  </h2>
                  <DiaryList
                    entries={entries}
                    loading={loading}
                    onEntryClick={handleEntryClick}
                  />
                </div>
              )}
            </div>
          ) : (
            <AIChat
              quotedContent={quotedContent}
              onSaveAsDiary={handleSaveAsDiary}
            />
          )}
        </div>
      </div>

      {/* 日記詳細モーダル */}
      {selectedEntry && (
        <DiaryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onStartChat={handleStartChatFromDetail}
        />
      )}
    </div>
  );
}
