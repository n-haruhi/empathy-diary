import { useState, useEffect } from 'react';
import { Plus, LogOut, User } from 'lucide-react';
import { DiaryForm } from './DiaryForm';
import { DiaryList } from './DiaryList';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { DiaryEntry } from '../../types';

export function DiaryDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

      // 成功したらリストを更新してフォームを閉じる
      await fetchEntries();
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      alert('予期しないエラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  // 日記詳細表示（今後実装）
  const handleEntryClick = (entry: DiaryEntry) => {
    console.log('Entry clicked:', entry);
    // TODO: 詳細モーダルや詳細ページに遷移
  };

  // ログアウト
  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 新規作成ボタン */}
          {!showForm && (
            <div className="text-center">
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                className="flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                新しい日記を書く
              </Button>
            </div>
          )}

          {/* 日記作成フォーム */}
          {showForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  新しい日記
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
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
          )}

          {/* 日記一覧 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              これまでの日記
            </h2>
            <DiaryList
              entries={entries}
              loading={loading}
              onEntryClick={handleEntryClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
