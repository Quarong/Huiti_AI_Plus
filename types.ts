
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
  SHORT_ANSWER = 'short_answer'
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum AIProvider {
  GEMINI = 'gemini',
  DOUBAO = 'doubao',
  DEEPSEEK = 'deepseek',
  CHATGPT = 'chatgpt',
  MIMO = 'mimo'
}


export interface ModelConfig {
  provider: AIProvider;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  topP?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: Difficulty;
  subject: string;
  createdAt: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  duration: number; // 分钟
  createdAt: number;
}

export interface AnswerRecord {
  questionId: string;
  subject: string;
  isCorrect: boolean;
  userAnswer: string;
  feedback?: string;
  timestamp: number;
}

export interface MasteryData {
  subject: string;
  correctRate: number;
  coverage: number; // 已练习题目占该科目总题目的比例
  masteryScore: number; // 综合评分 0-100
}

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
    };
  }
}

export {};