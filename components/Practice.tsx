
import React, { useState, useMemo } from 'react';
import { Question, AnswerRecord, QuestionType } from '../types';
import { ChevronRight, CheckCircle2, XCircle, Shuffle, ArrowRight, Check, X, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { verifyAnswerWithAI } from '../services/gemini';

interface Props {
  questions: Question[];
  onRecordAnswer: (record: AnswerRecord) => void;
}

const Practice: React.FC<Props> = ({ questions, onRecordAnswer }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLastCorrect, setIsLastCorrect] = useState(false);

  const subjects = useMemo(() => Array.from(new Set(questions.map(q => String(q.subject || '')))), [questions]);
  
  const filteredQuestions = useMemo(() => {
    const qs = selectedSubject ? questions.filter(q => String(q.subject || '') === selectedSubject) : [];
    return [...qs].sort(() => Math.random() - 0.5);
  }, [questions, selectedSubject]);

  const currentQuestion = filteredQuestions[currentIdx];

  // 增强版标准化工具：彻底避免 trim 报错
  const normalize = (val: any) => {
    const str = typeof val === 'string' ? val : String(val || '');
    return str.trim()
      .replace(/\s+/g, '')
      .toUpperCase()
      .replace(/[。，！？、；：“”（）]/g, (m) => ({
        '。': '.', '，': ',', '！': '!', '？': '?', '、': ',', '；': ';', '：': ':', '“': '"', '”': '"', '（': '(', '）': ')'
      }[m] || m))
      .replace(/^对$/, '正确')
      .replace(/^错$/, '错误')
      .replace(/^TRUE$/, '正确')
      .replace(/^FALSE$/, '错误');
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !userAnswer || showResult || isGrading) return;
    
    let isCorrect = false;
    let feedback = null;

    const uAns = normalize(userAnswer);
    const cAns = normalize(currentQuestion.answer);

    try {
      if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options) {
        const isIndexMatch = uAns === cAns;
        const selectedIndex = userAnswer.toUpperCase().charCodeAt(0) - 65;
        const selectedText = normalize(currentQuestion.options[selectedIndex] || '');
        const isTextMatch = selectedText === cAns;
        const isStartsWith = cAns.startsWith(uAns);
        isCorrect = isIndexMatch || isTextMatch || isStartsWith;
      } else if (currentQuestion.type === QuestionType.TRUE_FALSE) {
        isCorrect = uAns === cAns;
      } else {
        if (uAns === cAns) {
          isCorrect = true;
        } else {
          setIsGrading(true);
          const result = await verifyAnswerWithAI(currentQuestion.question, currentQuestion.answer, userAnswer);
          isCorrect = result.isCorrect;
          feedback = result.feedback;
        }
      }
    } catch (err) {
      console.error("Grading Error:", err);
      isCorrect = uAns.includes(cAns) || cAns.includes(uAns);
    } finally {
      setIsGrading(false);
    }
    
    onRecordAnswer({
      questionId: currentQuestion.id,
      subject: currentQuestion.subject,
      isCorrect,
      userAnswer,
      timestamp: Date.now()
    });

    setIsLastCorrect(isCorrect);
    setAiFeedback(feedback);
    if (isCorrect) setScore(s => ({ ...s, correct: s.correct + 1 }));
    setScore(s => ({ ...s, total: s.total + 1 }));
    setShowResult(true);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setUserAnswer('');
    setAiFeedback(null);
    if (currentIdx < filteredQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setSelectedSubject(null);
      setCurrentIdx(0);
    }
  };

  const formatText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded font-mono text-[0.9em] mx-0.5 border border-gray-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  if (!selectedSubject) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">智能练习</h2>
          <p className="text-gray-500">选择一个科目开启沉浸式专项练习。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div key={sub} onClick={() => setSelectedSubject(sub)} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group">
              <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Shuffle className="text-blue-600 group-hover:text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-1">{sub}</h3>
              <p className="text-gray-400 text-sm">{questions.filter(q => String(q.subject || '') === sub).length} 道题目</p>
              <div className="mt-6 flex items-center text-blue-600 font-bold text-sm gap-1 opacity-0 group-hover:opacity-100 transition-opacity">开始练习 <ArrowRight size={16} /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setSelectedSubject(null)} className="text-sm font-medium text-gray-400 hover:text-gray-600">退出练习</button>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">进度: {currentIdx + 1} / {filteredQuestions.length}</div>
          <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">得分: {score.correct}</div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        <div className="space-y-4">
           <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{typeLabels[currentQuestion.type] || '题目'}</span>
           <h3 className="text-2xl font-bold text-gray-800 leading-relaxed">{formatText(currentQuestion.question)}</h3>
        </div>

        {!showResult ? (
          <div className="space-y-6">
            {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options ? (
               <div className="grid grid-cols-1 gap-3">
                 {currentQuestion.options.map((opt, i) => (
                   <button key={i} onClick={() => setUserAnswer(String.fromCharCode(65 + i))} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${userAnswer === String.fromCharCode(65 + i) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${userAnswer === String.fromCharCode(65 + i) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{String.fromCharCode(65 + i)}</span>
                     <span>{formatText(opt)}</span>
                   </button>
                 ))}
               </div>
            ) : currentQuestion.type === QuestionType.TRUE_FALSE ? (
               <div className="grid grid-cols-2 gap-4">
                 {['正确', '错误'].map(val => (
                   <button key={val} onClick={() => setUserAnswer(val)} className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 font-bold text-xl ${userAnswer === val ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${val === '正确' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{val === '正确' ? <Check size={28} /> : <X size={28} />}</div>
                     {val}
                   </button>
                 ))}
               </div>
            ) : (
               <textarea rows={4} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="在此输入您的回答..." className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-500 outline-none resize-none bg-gray-50 font-mono" />
            )}
            <button onClick={handleSubmit} disabled={!userAnswer || isGrading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3">
              {isGrading ? <Loader2 className="animate-spin" size={24} /> : '提交答案'}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
            <div className={`p-6 rounded-2xl flex items-center gap-4 ${isLastCorrect ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {isLastCorrect ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
              <div>
                <p className="font-bold">判分结果：{isLastCorrect ? '正确' : '错误'}</p>
                <p className="text-sm opacity-80">您的回答: {userAnswer}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <p className="text-xs font-bold text-gray-400 uppercase mb-2">标准答案</p>
               <p className="text-lg font-bold text-gray-900">{currentQuestion.answer}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
               <p className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2"><Lightbulb size={14} /> 深度解析</p>
               <p className="text-sm text-blue-700 leading-relaxed">{formatText(currentQuestion.explanation)}</p>
            </div>
            <button onClick={nextQuestion} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2">下一题 <ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

const typeLabels = {
  [QuestionType.MULTIPLE_CHOICE]: '单选题',
  [QuestionType.TRUE_FALSE]: '判断题',
  [QuestionType.FILL_BLANK]: '填空题',
  [QuestionType.SHORT_ANSWER]: '简答题'
};

export default Practice;
