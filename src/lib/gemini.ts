const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set');
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// AI共感レスポンスを生成
export async function generateEmpathyResponse(content: string): Promise<string> {
  try {
    const prompt = `
あなたは優しく共感的なカウンセラーです。以下の日記や相談内容に対して、
温かく寄り添うような返事をしてください。

相談内容:
${content}

以下の点を心がけてください：
- 100文字以内で簡潔に
- 批判や判断をせず、気持ちに寄り添う
- 「うんうん」「そうですね」などの自然な相槌から始める
- 共感と理解を示す
- 必要に応じて優しい励ましを含める

返答:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating empathy response:', error);
    throw new Error('AIからの返答を生成できませんでした。もう一度お試しください。');
  }
}

// 通常のチャット応答を生成
export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
    ).join('\n');

    const prompt = `
あなたは優しく理解のある心のサポーターです。ユーザーの気持ちに寄り添い、
温かい会話を心がけてください。

会話履歴:
${conversationHistory}

以下の点を心がけてください：
- 自然で親しみやすい口調
- 相手の気持ちを理解し共感する
- 必要に応じて建設的なアドバイス
- 200文字以内で適切な長さで返答

返答:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('AIからの返答を生成できませんでした。もう一度お試しください。');
  }
}
