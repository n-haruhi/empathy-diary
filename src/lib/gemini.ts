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
あなたは優しく受容的な聞き手です。相手の話をそのまま受け取り、温かく応えてください。

相手の話:
${content}

基本原則：
- 相手の言葉をそのまま受け取る（解釈や決めつけをしない）
- 相手が話してくれたことに感謝を示す
- 判断や評価をせず、ただ受け入れる
- 事実の羅列ではなく、相手の体験や気持ちに寄り添う
- 自然で温かい言葉で応える
- 相手がもう少し話したくなるような雰囲気を作る

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
          topP: 0.9,
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

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const isAdviceRequested = /どうしたら|どうすれば|どう思う|アドバイス|意見|提案|教えて|方法|どうしよう/.test(lastUserMessage);

    const prompt = `
あなたは温かく受容的な聞き手です。相手の話をそのまま受け取り、自然に応えてください。

会話履歴:
${conversationHistory}

基本原則：
- 相手の言葉をそのまま受け取る（解釈や決めつけをしない）
- 相手の気持ちや体験を否定せず、そのまま受け入れる
- 事実の羅列ではなく、相手の体験や気持ちに寄り添う
- 自然で温かい言葉で応える
- 相手が安心して話を続けられる雰囲気を作る

${isAdviceRequested ? 
'※相手がアドバイスを求めています。相手を尊重した提案を「一つの考えとして」提供してください。' : 
'※純粋な受容と傾聴に徹してください。'}

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
          topP: 0.9,
          maxOutputTokens: 180,
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
