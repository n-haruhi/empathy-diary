import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'login' ? 'ログイン' : '新規登録'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {mode === 'login' 
            ? 'アカウントにサインインしてください' 
            : '新しいアカウントを作成してください'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          error={error && error.includes('email') ? error : ''}
        />
        
        <Input
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? '8文字以上で入力してください' : 'パスワードを入力'}
          required
          error={error && error.includes('password') ? error : ''}
        />

        {error && !error.includes('email') && !error.includes('password') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading 
            ? '処理中...' 
            : mode === 'login' ? 'ログイン' : '新規登録'
          }
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {mode === 'login' 
            ? 'アカウントをお持ちでない方はこちら' 
            : '既にアカウントをお持ちの方はこちら'
          }
        </button>
      </div>
    </div>
  );
}
