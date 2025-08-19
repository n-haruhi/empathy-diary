import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Empathy Diary
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            あなたの気持ちに寄り添う日記アプリ
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <Input 
              label="ユーザー名" 
              placeholder="あなたの名前を入力してください"
            />
            <Input 
              label="メールアドレス" 
              type="email"
              placeholder="email@example.com"
            />
            <div className="flex space-x-3">
              <Button variant="primary">ログイン</Button>
              <Button variant="outline">新規登録</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
