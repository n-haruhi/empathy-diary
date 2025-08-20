import React, { useState } from 'react';
import { AuthForm } from './components/features/AuthForm';
import { DiaryDashboard } from './components/features/DiaryDashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ログイン済みの場合は日記ダッシュボードを表示
  if (user) {
    return <DiaryDashboard />;
  }

  // 未ログインの場合は認証画面を表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Empathy Diary
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            あなたの気持ちに寄り添う日記アプリ
          </p>
        </div>
        
        <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
      </div>
    </div>
  );
}

export default App;
