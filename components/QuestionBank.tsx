
import React, { useState, useMemo } from 'react';
import { Question, QuestionType, Difficulty } from '../types';
import { 
  Trash2, Search, BookOpen, Clock, Lightbulb, ChevronDown, 
  ChevronUp, Filter, SortAsc, CheckSquare, Square, AlertCircle,
  MoreVertical, CheckCircle2
} from 'lucide-react';

interface Props {
  questions: Question[];
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
}

type SortOption = 'newest' | 'oldest' | 'difficulty-asc' | 'difficulty-desc' | 'type';

const QuestionBank: React.FC<Props> = ({ questions, onDelete, onBatchDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject))), [questions]);

  const difficultyOrder = { [Difficulty.EASY]: 1, [Difficulty.MEDIUM]: 2, [Difficulty.HARD]: 3 };

  const filteredAndSortedQuestions = useMemo(() => {
    let result = questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
      const matchesType = filterType === 'all' || q.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      return matchesSearch && matchesSubject && matchesType && matchesDifficulty;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'difficulty-asc': return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'difficulty-desc': return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        case 'type': return a.type.localeCompare(b.type);
        default: return 0;
      }
    });

    return result;
  }, [questions, searchTerm, filterSubject, filterType, filterDifficulty, sortBy]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedQuestions.map(q => q.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.size} 道题目吗？此操作不可撤销。`)) {
      if (onBatchDelete) {
        onBatchDelete(Array.from(selectedIds));
      } else {
        // 回退逻辑：循环调用单删
        selectedIds.forEach(id => onDelete(id));
      }
      setSelectedIds(new Set());
    }
  };

  const typeLabels = {
    [QuestionType.MULTIPLE_CHOICE]: '单选题',
    [QuestionType.TRUE_FALSE]: '判断题',
    [QuestionType.FILL_BLANK]: '填空题',
    [QuestionType.SHORT_ANSWER]: '简答题'
  };

  const difficultyLabels = {
    [Difficulty.EASY]: '简单',
    [Difficulty.MEDIUM]: '中等',
    [Difficulty.HARD]: '困难'
  };

  const formatAnswer = (answer: string, type: QuestionType) => {
    if (type === QuestionType.FILL_BLANK && (answer.includes('/') || answer.includes(';') || answer.includes('|'))) {
      const parts = answer.split(/\s*[\/;|]\s*/);
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {parts.map((p, i) => (
            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200 text-xs font-bold shadow-sm">
              <span className="opacity-50 mr-1">#{i + 1}</span> {p}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg border border-green-100">{answer}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">题库管理</h2>
          <p className="text-gray-500">浏览、搜索、筛选并批量管理您的 {questions.length} 道存量题目。</p>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 animate-in slide-in-from-right-4">
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              已选择 {selectedIds.size} 项
            </span>
            <button 
              onClick={handleBatchDelete}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-5 py-2 rounded-xl font-bold transition-all shadow-sm border border-red-100"
            >
              <Trash2 size={18} /> 批量删除
            </button>
          </div>
        )}
      </div>

      {/* 增强筛选与排序工具栏 */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索题目内容、知识点..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider px-2">
              <Filter size={14} /> 筛选
            </div>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="all">所有科目</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">所有题型</option>
              {Object.values(QuestionType).map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
            </select>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">所有难度</option>
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{difficultyLabels[d]}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
            >
              {selectedIds.size === filteredAndSortedQuestions.length && filteredAndSortedQuestions.length > 0 ? (
                <CheckSquare size={18} className="text-blue-600" />
              ) : (
                <Square size={18} />
              )}
              全选当前结果
            </button>
            <span className="text-xs text-gray-400">
              共找到 {filteredAndSortedQuestions.length} 道符合条件的题目
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
              <SortAsc size={14} /> 排序
            </div>
            <select 
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="newest">最新添加</option>
              <option value="oldest">最早添加</option>
              <option value="difficulty-asc">难度从低到高</option>
              <option value="difficulty-desc">难度从高到低</option>
              <option value="type">按题型分组</option>
            </select>
          </div>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-200">
              <BookOpen size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-700">暂无匹配题目</h3>
            <p className="text-gray-400 max-w-xs mt-2">请尝试调整筛选条件，或者使用 AI 智能出题功能生成新内容。</p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterSubject('all'); setFilterType('all'); setFilterDifficulty('all');}}
              className="mt-6 text-blue-600 font-bold hover:underline text-sm"
            >
              清除所有筛选条件
            </button>
          </div>
        ) : (
          filteredAndSortedQuestions.map(q => (
            <div 
              key={q.id} 
              className={`bg-white rounded-[24px] border transition-all overflow-hidden group relative ${
                selectedIds.has(q.id) 
                  ? 'border-blue-500 ring-1 ring-blue-500/10 shadow-md' 
                  : 'border-gray-100 hover:border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex">
                {/* 勾选区 */}
                <div 
                  onClick={() => toggleSelectOne(q.id)}
                  className={`w-12 flex items-center justify-center cursor-pointer transition-colors ${
                    selectedIds.has(q.id) ? 'bg-blue-50' : 'bg-transparent border-r border-gray-50'
                  }`}
                >
                  {selectedIds.has(q.id) ? (
                    <CheckCircle2 size={20} className="text-blue-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-gray-300"></div>
                  )}
                </div>

                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          {q.subject}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          {typeLabels[q.type]}
                        </span>
                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          q.difficulty === Difficulty.HARD ? 'bg-red-50 text-red-500' : 
                          q.difficulty === Difficulty.MEDIUM ? 'bg-orange-50 text-orange-500' : 
                          'bg-emerald-50 text-emerald-500'
                        }`}>
                          {difficultyLabels[q.difficulty]}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 pr-10">{q.question}</h4>
                      
                      {q.options?.map((opt, i) => (
                        <div key={i} className="text-sm text-gray-600 flex items-start gap-2 mb-2 ml-2 transition-transform hover:translate-x-1">
                          <span className="font-bold w-5 flex-shrink-0 text-blue-500">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6 pt-4 border-t border-gray-50">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle size={10} /> 参考答案
                          </span>
                          {formatAnswer(q.answer, q.type)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] ml-auto font-medium">
                          <Clock size={12} />
                          创建于 {new Date(q.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(q.id); }}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm bg-white border border-gray-100"
                        title="删除该题"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === q.id ? null : q.id); }}
                        className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                          expandedId === q.id 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-400 hover:text-blue-500 hover:bg-blue-50 border-gray-100'
                        }`}
                        title="显示解析"
                      >
                        {expandedId === q.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 解析区域 */}
              {expandedId === q.id && (
                <div className="bg-gray-50 p-8 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-4 text-blue-600">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lightbulb size={20} className="fill-blue-600/20" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block">题目深度解析</span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-tight">AI 辅助生成的解题逻辑与关键考点</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed bg-white p-6 rounded-2xl border border-blue-50 shadow-inner whitespace-pre-wrap relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Lightbulb size={64} />
                    </div>
                    {q.explanation || '该题目暂无详细解析内容。'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBank;
