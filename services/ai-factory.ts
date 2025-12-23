
import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, ModelConfig, Question, QuestionType, Difficulty } from "../types";

const DEFAULT_CONFIG: ModelConfig = {
  provider: AIProvider.GEMINI,
  modelName: 'gemini-3-flash-preview',
  temperature: 0.7,
  topP: 0.95
};

const getStoredConfig = (): ModelConfig => {
  const saved = localStorage.getItem('ai_model_config');
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export async function callAI(params: {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: any;
  temperature?: number;
}): Promise<string> {
  const config = getStoredConfig();

  try {
    if (config.provider === AIProvider.GEMINI) {
      const apiKey = config.apiKey || process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY_MISSING");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: config.modelName || 'gemini-3-flash-preview',
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseSchema ? "application/json" : "text/plain",
          responseSchema: params.responseSchema,
          temperature: params.temperature ?? config.temperature ?? 0.7,
        },
      });
      return response.text || "";
    }

    // OpenAI/Doubao 兼容逻辑
    const baseUrl = config.baseUrl || "";
    const apiKey = config.apiKey || "";
    const model = config.modelName || "";

    if (!apiKey) throw new Error("API_KEY_MISSING");

    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(params.systemInstruction ? [{ role: 'system', content: params.systemInstruction }] : []),
          { role: 'user', content: params.prompt }
        ],
        temperature: params.temperature ?? config.temperature ?? 0.7,
        response_format: params.responseSchema ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";
    return content;

  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found") || error.message === "API_KEY_MISSING") {
      throw new Error("AUTH_REQUIRED");
    }
    throw error;
  }
}

export async function generateQuestionsFromSource(
  sourceText: string,
  subject: string,
  count: number = 5
): Promise<Question[]> {
  const prompt = `你是一个专业的教育专家。请根据以下参考内容生成 ${count} 道关于 "${subject}" 的题目。
  
  **核心要求：**
  1. **语言：所有题目、选项、解析必须全部使用中文撰写**（除非该科目本身是外语学习科目）。
  2. 题型：multiple_choice (单选), true_false (判断), fill_blank (填空), short_answer (简答)。
  3. 填空题：如果是多个空格，答案必须用 ' / ' (空格斜杠空格) 分隔。
  4. 解析：explanation 字段必须详细，且不少于 50 字。
  
  参考内容：
  ${sourceText.substring(0, 10000)}`;

  const responseText = await callAI({
    prompt,
    systemInstruction: "你是一个专业的教育专家。你必须输出 JSON 数组格式的题目。**所有内容必须使用中文**。JSON 包含 type, question, options (Array), answer, explanation, difficulty (easy/medium/hard)。",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          difficulty: { type: Type.STRING },
        },
        required: ["type", "question", "answer", "explanation", "difficulty"],
      }
    }
  });

  return JSON.parse(responseText).map((q: any) => ({
    ...q,
    id: Math.random().toString(36).substr(2, 9),
    subject,
    createdAt: Date.now()
  }));
}

export async function batchVerifyAnswersWithAI(
  inputs: { id: string; question: string; correctAnswer: string; userAnswer: string }[]
): Promise<Record<string, { isCorrect: boolean; feedback: string }>> {
  if (inputs.length === 0) return {};
  
  const prompt = `判分数据：${JSON.stringify(inputs)}`;
  const responseText = await callAI({
    prompt,
    systemInstruction: "你是一个判分专家。请用**中文**给出反馈。语义相近即正确。输出 JSON 对象，Key 为题目 ID，Value 为 {isCorrect: boolean, feedback: string}。",
    responseSchema: {
      type: Type.OBJECT,
      properties: inputs.reduce((acc: any, curr) => {
        acc[curr.id] = {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isCorrect", "feedback"]
        };
        return acc;
      }, {})
    }
  });

  return JSON.parse(responseText);
}

export async function verifyAnswerWithAI(q: string, a: string, u: string) {
  const res = await batchVerifyAnswersWithAI([{ id: '1', question: q, correctAnswer: a, userAnswer: u }]);
  return res['1'];
}
