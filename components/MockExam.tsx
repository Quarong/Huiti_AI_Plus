
import React, { useState, useEffect } from 'react';
import { Exam, AnswerRecord, QuestionType, Question } from '../types';
import { Clock, CheckCircle, AlertCircle, PlayCircle, Check, X, Loader2, Sparkles, ChevronDown, ChevronUp, Lightbulb, Info } from 'lucide-react';
import { batchVerifyAnswersWithAI } from '../services/gemini';

interface Props {
  exams: Exam[];
  onRecordAnswer: (record: AnswerRecord) => void;
}

const MockExam: React.FC<Props> = ({ exams, onRecordAnswer }) => {
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<(AnswerRecord & { question: Question })[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let timer: number;
    if (activeExam && timeLeft > 0 && !isSubmitted) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && activeExam && !isSubmitted) {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [activeExam, timeLeft, isSubmitted]);

  // 增强版标准化工具
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

  const startExam = (exam: Exam) => {
    setActiveExam(exam);
    setTimeLeft(exam.duration * 60);
    setIsSubmitted(false);
    setIsGrading(false);
    setExamAnswers({});
    setResults([]);
  };

  const handleSubmit = async (isForced = false) => {
    if (!activeExam || isGrading) return;

    // 检查未完成题目
    const unansweredCount = activeExam.questions.filter(q => !examAnswers[q.id] || examAnswers[q.id].trim() === '').length;
    
    if (!isForced && unansweredCount > 0) {
      if (!confirm(`您还有 ${unansweredCount} 道题目未完成，确定要提交吗？`)) {
        return;
      }
    }

    setIsGrading(true);
    setGradingProgress(15);
    
    try {
      const finalResultsMap: Record<string, AnswerRecord & { question: Question }> = {};
      const subjectiveToGrade: { id: string; question: string; correctAnswer: string; userAnswer: string }[] = [];

      activeExam.questions.forEach(q => {
        const uRaw = examAnswers[q.id] || '';
        const uAns = normalize(uRaw);
        const cAns = normalize(q.answer);

        let isCorrect = false;

        // 如果答案为空，直接判定为错误
        if (uAns === '') {
          isCorrect = false;
        } else {
          if (q.type === QuestionType.MULTIPLE_CHOICE && q.options) {
            const selectedIdx = uRaw.toUpperCase().charCodeAt(0) - 65;
            const sText = normalize(q.options[selectedIdx] || '');
            // 匹配选项字母 (A) 或 选项文本 (2) 或 模糊匹配 (需要非空)
            isCorrect = uAns === cAns || sText === cAns;
          } else if (q.type === QuestionType.TRUE_FALSE) {
            isCorrect = uAns === cAns;
          } else if (uAns === cAns) {
            isCorrect = true;
          }
        }

        // 仅对非客观题且不完全匹配的情况使用 AI 判分
        const isObjective = q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.TRUE_FALSE;
        
        if (isCorrect || isObjective || uAns === '') {
          finalResultsMap[q.id] = {
            questionId: q.id, 
            subject: q.subject, 
            isCorrect: isCorrect, 
            userAnswer: uRaw, 
            timestamp: Date.now(), 
            question: q 
          };
        } else {
          // 只有填空和简答题在不完全匹配且用户有输入时才走 AI
          subjectiveToGrade.push({ id: q.id, question: q.question, correctAnswer: q.answer, userAnswer: uRaw });
        }
      });

      setGradingProgress(40);
      
      if (subjectiveToGrade.length > 0) {
        try {
          const aiResults = await batchVerifyAnswersWithAI(subjectiveToGrade);
          subjectiveToGrade.forEach(item => {
            const aiRes = aiResults[item.id] || { isCorrect: false, feedback: "阅卷结果缺失" };
            const q = activeExam.questions.find(foundQ => foundQ.id === item.id)!;
            finalResultsMap[item.id] = {
              questionId: item.id, 
              subject: q.subject, 
              isCorrect: aiRes.isCorrect,
              userAnswer: item.userAnswer, 
              feedback: aiRes.feedback, 
              timestamp: Date.now(), 
              question: q
            };
          });
        } catch (e) {
          subjectiveToGrade.forEach(item => {
            const q = activeExam.questions.find(foundQ => foundQ.id === item.id)!;
            finalResultsMap[item.id] = {
              questionId: item.id, 
              subject: q.subject, 
              isCorrect: false, 
              userAnswer: item.userAnswer, 
              feedback: "AI 服务暂时不可用，默认判定为错误", 
              timestamp: Date.now(), 
              question: q
            };
          });
        }
      }

      const finalArray = activeExam.questions.map(q => finalResultsMap[q.id]);
      setResults(finalArray);
      
      // 计算总分 (0-100)
      const correctCount = finalArray.filter(r => r.isCorrect).length;
      setScore(Math.round((correctCount / finalArray.length) * 100));
      
      // 记录到全局历史
      finalArray.forEach(res => { 
        if (res) {
          const { question, ...record } = res; 
          onRecordAnswer(record);
        }
      });
      
      setGradingProgress(100);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("提交失败，请检查题库状态后重试");
    } finally {
      setIsGrading(false);
    }
  };

  if (!activeExam) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">模拟考试</h2>
          <p className="text-gray-500 mt-1">从您自组的试卷列表中选择一份，开始全真考场模拟。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
               <PlayCircle size={48} className="opacity-10 mb-4" />
               <p>暂无可用试卷。请先前往“自组试卷”创建一份题目集。</p>
            </div>
          ) : exams.map(exam => (
            <div key={exam.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{exam.subject}</span>
              <h3 className="text-xl font-bold my-4 group-hover:text-blue-600 transition-colors">{exam.title}</h3>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">考试规格</span>
                   <span className="text-sm font-bold text-gray-700 flex items-center gap-1"><Clock size={14}/> {exam.duration} 分钟 / {exam.questions.length} 题</span>
                </div>
                <button 
                  onClick={() => startExam(exam)} 
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                >
                  <PlayCircle size={18}/> 立即开考
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isGrading) return (
    <div className="py-32 text-center animate-in zoom-in-95">
      <div className="inline-block relative w-32 h-32 mb-8">
        <Loader2 className="animate-spin text-blue-600 w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center font-black text-blue-600 text-xl">{gradingProgress}%</div>
      </div>
      <h3 className="text-3xl font-black text-gray-900 mb-2">AI 深度阅卷中</h3>
      <p className="text-gray-400 font-medium">正在对比知识库，分析您的作答逻辑...</p>
    </div>
  );

  if (isSubmitted) return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-in slide-in-from-bottom-8">
      <div className="bg-white p-12 rounded-[48px] text-center shadow-2xl border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
         <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-white text-4xl font-black mb-6 shadow-xl ${score >= 60 ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}>{score}</div>
         <h2 className="text-4xl font-black text-gray-900 mb-2">评测报告已就绪</h2>
         <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-10">{activeExam.title}</p>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
           {[
             { label: '正确题目', val: `${results.filter(r => r?.isCorrect).length} / ${results.length}`, color: 'text-emerald-600' },
             { label: '考试用时', val: `${activeExam.duration} MIN`, color: 'text-blue-600' },
             { label: '评估等级', val: score >= 90 ? '卓越' : score >= 80 ? '优秀' : score >= 60 ? '良好' : '需努力', color: score >= 60 ? 'text-blue-600' : 'text-rose-600' },
             { label: '最终结果', val: score >= 60 ? 'PASS' : 'FAIL', color: score >= 60 ? 'text-emerald-600' : 'text-rose-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-gray-50/80 p-5 rounded-3xl border border-gray-50">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`font-black text-lg ${stat.color}`}>{stat.val}</p>
             </div>
           ))}
         </div>

         <div className="flex flex-col sm:flex-row gap-4">
           <button onClick={() => setShowDetails(!showDetails)} className="flex-1 py-5 bg-gray-50 hover:bg-gray-100 rounded-2xl font-black text-gray-700 transition-all flex items-center justify-center gap-2">
             {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
             查看解析详情
           </button>
           <button onClick={() => setActiveExam(null)} className="flex-1 py-5 bg-gray-900 text-white hover:bg-black rounded-2xl font-black transition-all shadow-lg shadow-gray-200">
             回到试卷列表
           </button>
         </div>
      </div>

      {showDetails && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h3 className="text-xl font-bold text-gray-900 px-4">作答明细回顾</h3>
          {results.map((res, i) => res && (
            <div key={i} className={`p-8 bg-white rounded-[32px] border-l-8 ${res.isCorrect ? 'border-emerald-500' : 'border-rose-500'} shadow-sm space-y-4 transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white ${res.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>{i+1}</span>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{res.question.type}</span>
                </div>
                {res.isCorrect ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
              </div>
              <p className="text-lg font-bold text-gray-800 leading-relaxed">{res.question.question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 <div className={`p-4 rounded-2xl border ${res.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">您的回答</p>
                    <p className={`font-bold ${res.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{res.userAnswer || <span className="italic opacity-50">未作答</span>}</p>
                 </div>
                 <div className="p-4 rounded-2xl border bg-gray-50 border-gray-100">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">标准答案</p>
                    <p className="font-bold text-gray-800">{res.question.answer}</p>
                 </div>
              </div>

              {(res.feedback || res.question.explanation) && (
                <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100 space-y-3">
                   <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-wider">
                     <Lightbulb size={14} /> 解析与点评
                   </div>
                   {res.feedback && <p className="text-sm text-blue-700 font-bold italic leading-relaxed">“{res.feedback}”</p>}
                   <p className="text-sm text-gray-600 leading-relaxed">{res.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const answeredCount = Object.keys(examAnswers).filter(id => examAnswers[id].trim() !== '').length;

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8 animate-in fade-in">
      {/* 考试导航栏 */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-100 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4 px-2">
           <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100"><PlayCircle size={20} /></div>
           <div className="hidden sm:block">
              <h3 className="font-black text-gray-900 truncate max-w-[200px] leading-none mb-1">{activeExam.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">已完成: {answeredCount} / {activeExam.questions.length}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-xl">
            <Clock size={18} className={timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-blue-400'} />
            <span className="font-mono font-black text-lg">
              {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
            </span>
          </div>
          <button 
            onClick={() => handleSubmit(false)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            交卷
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeExam.questions.map((q, idx) => (
          <div key={idx} id={`q-${q.id}`} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-2 h-full transition-all ${examAnswers[q.id]?.trim() ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-sm font-black shadow-lg">{idx+1}</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{q.type}</span>
              </div>
              {examAnswers[q.id]?.trim() ? (
                <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                  <Check size={12} strokeWidth={3} /> 已作答
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-300 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                  未完成
                </div>
              )}
            </div>

            <p className="text-2xl font-bold text-gray-800 leading-relaxed">{q.question}</p>

            <div className="pt-4">
              {q.type === QuestionType.MULTIPLE_CHOICE ? (
                <div className="grid grid-cols-1 gap-3">
                  {q.options?.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setExamAnswers(prev => ({...prev, [q.id]: String.fromCharCode(65+i)}))} 
                      className={`group/opt p-5 rounded-[24px] border-2 text-left transition-all flex items-center gap-4 ${
                        examAnswers[q.id] === String.fromCharCode(65+i) 
                          ? 'border-blue-600 bg-blue-50 shadow-inner' 
                          : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                        examAnswers[q.id] === String.fromCharCode(65+i) 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                          : 'bg-gray-100 text-gray-400 group-hover/opt:bg-gray-200'
                      }`}>
                        {String.fromCharCode(65+i)}
                      </span>
                      <span className={`font-bold ${examAnswers[q.id] === String.fromCharCode(65+i) ? 'text-blue-700' : 'text-gray-600'}`}>{opt}</span>
                    </button>
                  ))}
                </div>
              ) : q.type === QuestionType.TRUE_FALSE ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {['正确', '错误'].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setExamAnswers(prev => ({...prev, [q.id]: v}))} 
                      className={`flex-1 p-8 rounded-[32px] border-2 font-black text-xl transition-all flex flex-col items-center gap-3 ${
                        examAnswers[q.id] === v 
                          ? 'border-blue-600 bg-blue-50 shadow-inner text-blue-700' 
                          : 'border-gray-50 hover:bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        examAnswers[q.id] === v 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                          : (v === '正确' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500')
                      }`}>
                        {v === '正确' ? <Check size={32} strokeWidth={3} /> : <X size={32} strokeWidth={3} />}
                      </div>
                      {v}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <textarea 
                    rows={4} 
                    className="w-full p-6 bg-gray-50/50 rounded-[32px] border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 font-medium placeholder:text-gray-300" 
                    placeholder="在此输入您的答案..."
                    value={examAnswers[q.id] || ''} 
                    onChange={(e) => setExamAnswers(prev => ({...prev, [q.id]: e.target.value}))} 
                  />
                  <div className="absolute top-4 right-6 pointer-events-none opacity-20">
                     <Info size={24} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 py-12">
        <div className="h-px w-24 bg-gray-100"></div>
        <button 
          onClick={() => handleSubmit(false)} 
          className="bg-gray-900 text-white px-12 py-5 rounded-[24px] font-black text-xl shadow-2xl hover:bg-black hover:scale-105 transition-all"
        >
          确认并提交试卷
        </button>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">请确保已检查所有题目</p>
      </div>
    </div>
  );
};

export default MockExam;
