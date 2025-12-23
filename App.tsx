
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  BookOpen, 
  FileText, 
  Search,
  ChevronRight,
  GraduationCap,
  ClipboardCheck,
  Settings as SettingsIcon,
  ChevronDown,
  Database,
  Download,
  Activity,
  LogOut,
  AlertCircle,
  Info,
  Monitor,
  Award,
  CheckCircle2,
  HelpCircle,
  Scale
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuestionGenerator from './components/QuestionGenerator';
import QuestionBank from './components/QuestionBank';
import ExamBuilder from './components/ExamBuilder';
import Practice from './components/Practice';
import MockExam from './components/MockExam';
import Settings from './components/Settings';
import About from './components/About';
import Onboarding from './components/Onboarding';
import Logo from './components/Logo';
import { Question, Exam, AnswerRecord } from './types';

const App: React.FC = () => {
  const [isTauri, setIsTauri] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // 检测是否在 Tauri 环境中运行
    if (window && (window as any).__TAURI_INTERNALS__) {
      setIsTauri(true);
    }

    // 检测新手引导完成状态
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (!onboardingCompleted) {
      // 稍微延迟开启，确保 UI 已渲染
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('questions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('exams');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [history, setHistory] = useState<AnswerRecord[]>(() => {
    try {
      const saved = localStorage.getItem('practice_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'bank' | 'builder' | 'practice' | 'exam' | 'settings' | 'about'>('dashboard');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  // 计算今日进度逻辑优化
  const dailyProgress = useMemo(() => {
    const dailyGoal = 20;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayRecords = history.filter(record => record.timestamp >= startOfToday.getTime());
    const count = todayRecords.length;
    const percentage = Math.min((count / dailyGoal) * 100, 100);
    const isGoalReached = count >= dailyGoal;

    return { count, dailyGoal, percentage, isGoalReached };
  }, [history]);

  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('practice_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
    setActiveTab('dashboard'); // 引导结束后回到仪表盘
  };

  const addQuestions = (newQuestions: Question[]) => {
    setQuestions(prev => {
      const existingTexts = new Set(prev.map(q => q.question));
      const filtered = newQuestions.filter(q => !existingTexts.has(q.question));
      return [...prev, ...filtered];
    });
  };

  const recordAnswer = (record: AnswerRecord) => {
    setHistory(prev => [...prev, record]);
  };

  const handleSaveExam = (exam: Exam) => {
    setExams(prev => [...prev, exam]);
  };

  const clearAllData = () => {
    localStorage.removeItem('questions');
    localStorage.removeItem('exams');
    localStorage.removeItem('practice_history');
    localStorage.removeItem('onboarding_completed');
    setQuestions([]);
    setExams([]);
    setHistory([]);
    window.location.reload();
  };

  const importData = (data: { questions?: Question[], exams?: Exam[], history?: AnswerRecord[] }) => {
    if (data.questions) setQuestions(data.questions);
    if (data.exams) setExams(data.exams);
    if (data.history) setHistory(data.history);
  };

  const quickExport = () => {
    try {
      const data = { questions, exams, history };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `慧题AI+备份_${timestamp}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
      setIsAdminOpen(false);
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出备份失败，请检查应用存储权限。');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard questions={questions} exams={exams} history={history} />;
      case 'generator': return <QuestionGenerator onGenerated={addQuestions} />;
      case 'bank': return <QuestionBank questions={questions} onDelete={(id) => setQuestions(prev => prev.filter(q => q.id !== id))} onBatchDelete={(ids) => setQuestions(prev => prev.filter(q => !ids.includes(q.id)))} />;
      case 'builder': return <ExamBuilder questions={questions} onSave={handleSaveExam} />;
      case 'practice': return <Practice questions={questions} onRecordAnswer={recordAnswer} />;
      case 'exam': return <MockExam exams={exams} onRecordAnswer={recordAnswer} />;
      case 'settings': return <Settings currentData={{ questions, exams, history }} onReset={clearAllData} onImport={importData} />;
      case 'about': return <About />;
      default: return <Dashboard questions={questions} exams={exams} history={history} />;
    }
  };

  const tabLabels = {
    dashboard: '系统概览', generator: 'AI 智能出题', bank: '题库管理',
    builder: '自组试卷', practice: '智能练习', exam: '模拟考试', settings: '模型配置', about: '关于系统'
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-gray-900 overflow-hidden font-sans relative">
      {/* 引导层放在最上层，采用聚光灯模式不会阻挡点击 */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleCompleteOnboarding} 
          onStepChange={(tab) => setActiveTab(tab as any)} 
        />
      )}
      
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-20 shadow-sm">
        {/* 再次优化后的品牌头部区域：更平衡的比例与居中对齐 */}
        <div className="p-8 pb-4 flex items-center gap-3.5">
          <Logo size={80} />
          <div className="flex flex-col justify-center">
            <h1 className="font-black text-2xl tracking-tighter text-gray-900 leading-[0.9]">慧题AI+</h1>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.25em] mt-1.5 opacity-80">Intelligent LMS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <LayoutDashboard size={20} /> 仪表盘
          </button>
          <div className="pt-8 pb-4 px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">内容智造</div>
          <button onClick={() => setActiveTab('generator')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'generator' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <FilePlus size={20} /> AI 智能出题
          </button>
          <button onClick={() => setActiveTab('bank')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'bank' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <BookOpen size={20} /> 题库管理
          </button>
          <button onClick={() => setActiveTab('builder')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'builder' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <FileText size={20} /> 自组试卷
          </button>
          <div className="pt-8 pb-4 px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">实战突破</div>
          <button onClick={() => setActiveTab('practice')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'practice' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <GraduationCap size={20} /> 智能练习
          </button>
          <button onClick={() => setActiveTab('exam')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'exam' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <ClipboardCheck size={20} /> 模拟考试
          </button>
          <div className="pt-8 pb-4 px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">辅助</div>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <SettingsIcon size={20} /> 模型配置
          </button>
          <button onClick={() => setActiveTab('about')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'about' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
            <Info size={20} /> 关于系统
          </button>
        </nav>

        <div className="p-6">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className={`cursor-pointer group relative overflow-hidden rounded-[32px] p-6 text-white shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] ${
              dailyProgress.isGoalReached 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-200' 
              : 'bg-gradient-to-br from-gray-900 to-gray-800'
            }`}
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">今日练习进度</p>
              {dailyProgress.isGoalReached && <Award size={14} className="text-emerald-300 animate-pulse" />}
            </div>

            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="text-4xl font-black tabular-nums tracking-tighter">{dailyProgress.count}</span>
              <span className="text-sm font-bold text-white/40 tracking-tight">/ {dailyProgress.dailyGoal} 题</span>
            </div>

            <div className="relative h-2 w-full bg-black/20 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  dailyProgress.isGoalReached ? 'bg-white' : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                }`} 
                style={{width: `${dailyProgress.percentage}%`}}
              ></div>
            </div>

            <p className="text-[10px] font-bold text-white/40 flex items-center gap-1.5">
              {dailyProgress.isGoalReached ? (
                <>
                  <CheckCircle2 size={10} className="text-emerald-300" />
                  目标达成！
                </>
              ) : (
                <>
                  <Activity size={10} className="text-blue-400" />
                  还差 {Math.max(0, dailyProgress.dailyGoal - dailyProgress.count)} 题
                </>
              )}
            </p>
          </div>
          
          {/* License Badge in Sidebar Footer */}
          <div className="mt-6 flex flex-col items-center gap-1 text-[10px] font-black text-gray-300 uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity cursor-default">
             <div className="flex items-center gap-1.5">
               <Scale size={10} />
               <span>GNU GPL v3</span>
             </div>
             <span>Open Source Project</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex items-center text-sm font-bold text-gray-300">
            {isTauri && (
              <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mr-4 shadow-lg shadow-blue-100">
                <Monitor size={10} /> Desktop Pro
              </div>
            )}
            <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => setActiveTab('dashboard')}>学情中心</span>
            <ChevronRight size={14} className="mx-3 opacity-50" />
            <span className="text-gray-900">{tabLabels[activeTab]}</span>
          </div>
          
          <div className="relative" ref={adminRef}>
            <button onClick={() => setIsAdminOpen(!isAdminOpen)} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100">AI</div>
              <span className="text-sm font-bold text-gray-700">控制中心</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isAdminOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAdminOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 p-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-5 border-b border-gray-50 bg-gray-50/50 rounded-2xl mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">数据本地化状态</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Database size={16} className="text-blue-500" /><span className="text-xs font-bold text-gray-700">Local Storage</span></div>
                    <span className="text-[10px] font-black text-gray-400">{Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.min((JSON.stringify(localStorage).length / 5120000) * 100, 100)}%`}}></div>
                  </div>
                </div>
                <div className="py-2 space-y-1">
                  <button onClick={() => {setShowOnboarding(true); setIsAdminOpen(false);}} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-600 hover:bg-gray-50 rounded-[20px] transition-all font-bold"><HelpCircle size={18} className="text-blue-500" /> 重温新手导览</button>
                  <button onClick={quickExport} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-600 hover:bg-gray-50 rounded-[20px] transition-all font-bold"><Download size={18} className="text-emerald-500" /> 全量快照备份</button>
                  <button onClick={() => {setActiveTab('settings'); setIsAdminOpen(false);}} className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-gray-600 hover:bg-gray-50 rounded-[20px] transition-all font-bold"><SettingsIcon size={18} className="text-blue-500" /> 模型高级配置</button>
                </div>
                <div className="p-2">
                  <button onClick={() => { if(confirm('⚠️ 危险：该操作将永久删除所有题库和历史，无法找回。')) { clearAllData(); setIsAdminOpen(false); } }} className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black text-red-500 hover:bg-red-50 rounded-[20px] transition-all"><LogOut size={16} /> 格式化所有数据</button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
