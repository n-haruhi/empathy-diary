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
あなたは心理的な洞察力があり、温かく理解のある存在です。
相手の言葉の奥にある気持ちを感じ取り、寄り添うように応えてください。

日記内容:
${content}

応答の指針：
- 相手の感情や状況を深く理解する
- 単純な繰り返しではなく、気持ちを汲み取った言葉で応える
- 相手が頑張っていることを認識し、その人の強さも感じ取る
- 100文字以内で、温かく自然な言葉
- アドバイスではなく、理解と共感を示す
- 多様な表現を使い、ワンパターンを避ける

避けるべき表現：
- 単純なオウム返し
- 「〜ですね」の連発
- 上から目線や指導的な言葉
- 決まり文句の繰り返し

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
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 120,
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

    // ユーザーが明確にアドバイスを求めているかチェック
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const isAdviceRequested = /どうしたら|どうすれば|どう思う|アドバイス|意見|提案|教えて|方法|どうしよう/.test(lastUserMessage);

    const prompt = `
あなたは深い理解力と共感性を持つ、心の支えになる存在です。
相手の心の動きを感じ取り、その人らしさを大切にした会話をしてください。

会話履歴:
${conversationHistory}

応答の指針：
- 相手の感情の背景や文脈を理解する
- 表面的な言葉だけでなく、心の奥の気持ちに寄り添う
- その人の努力や強さを認識し、適切に言葉にする
- 多様で自然な表現を使い、決まり文句を避ける
- 相手の個性や状況に合わせた柔軟な応答
- 130文字以内で、深みのある温かい言葉

${isAdviceRequested ? 
`※アドバイスが求められています：
- 相手の価値観や状況を尊重した提案
- 複数の選択肢や視点を提供
- 決定権は相手にあることを明確に` : 
'※純粋な共感と理解に徹してください。'}

避けるべき：
- ワンパターンな相槌や決まり文句
- 表面的なオウム返し
- 上から目線の表現
- 感情を軽視した対応

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
          temperature: 0.9,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 160,
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
