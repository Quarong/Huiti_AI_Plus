
import React, { useState } from 'react';
import { Question, Exam, QuestionType, Difficulty } from '../types';
import { Plus, Minus, Download, Save, FileText, CheckCircle2, AlertCircle, Printer } from 'lucide-react';

interface Props {
  questions: Question[];
  onSave: (exam: Exam) => void;
}

const ExamBuilder: React.FC<Props> = ({ questions, onSave }) => {
  const [examTitle, setExamTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subjects = Array.from(new Set(questions.map(q => q.subject)));
  const availableQuestions = questions.filter(q => q.subject === selectedSubject && !selectedQuestions.find(sq => sq.id === q.id));

  const toggleQuestion = (q: Question) => {
    if (selectedQuestions.find(sq => sq.id === q.id)) {
      setSelectedQuestions(prev => prev.filter(sq => sq.id !== q.id));
    } else {
      setSelectedQuestions(prev => [...prev, q]);
    }
    setError(null);
  };

  const handleSave = () => {
    if (!examTitle.trim()) {
      setError('请输入试卷名称。');
      return;
    }
    if (selectedQuestions.length === 0) {
      setError('请至少选择一道题目。');
      return;
    }

    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      title: examTitle.trim(),
      subject: selectedSubject || '综合试卷',
      questions: selectedQuestions,
      duration: selectedQuestions.length * 2,
      createdAt: Date.now()
    };

    try {
      onSave(newExam);
      setIsSaved(true);
      setError(null);
      setTimeout(() => {
        setIsSaved(false);
        setExamTitle('');
        setSelectedQuestions([]);
      }, 2500);
    } catch (e) {
      setError('保存失败，请检查题库状态。');
    }
  };

  const handleExportPDF = () => {
    if (selectedQuestions.length === 0) {
      setError('请先添加题目后再导出。');
      return;
    }

    // 按题型对题目进行分组显示
    const grouped = {
      [QuestionType.MULTIPLE_CHOICE]: selectedQuestions.filter(q => q.type === QuestionType.MULTIPLE_CHOICE),
      [QuestionType.TRUE_FALSE]: selectedQuestions.filter(q => q.type === QuestionType.TRUE_FALSE),
      [QuestionType.FILL_BLANK]: selectedQuestions.filter(q => q.type === QuestionType.FILL_BLANK),
      [QuestionType.SHORT_ANSWER]: selectedQuestions.filter(q => q.type === QuestionType.SHORT_ANSWER),
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${examTitle || '慧题AI+试卷'}</title>
          <style>
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 0; }
            }
            @page { size: A4; margin: 15mm 20mm; }
            body { 
              font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; 
              color: #1a1a1a; 
              line-height: 1.5;
              background: #fff;
            }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #333; padding-bottom: 20px; }
            .header h1 { font-size: 26px; margin: 0 0 10px 0; letter-spacing: 2px; }
            .header .meta { font-size: 14px; color: #555; font-weight: 500; }
            
            .section-title { font-size: 18px; font-weight: 800; margin: 30px 0 15px 0; padding: 5px 10px; background: #f4f4f4; border-left: 5px solid #333; }
            .question-item { margin-bottom: 25px; page-break-inside: avoid; }
            .question-text { font-weight: 600; font-size: 16px; margin-bottom: 12px; }
            
            .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-left: 25px; margin-bottom: 15px; }
            .option-item { font-size: 15px; }
            
            .answer-line { margin: 15px 0 15px 25px; border-bottom: 1px solid #ddd; height: 30px; width: 80%; }
            .answer-box { margin: 15px 0 15px 25px; border: 1px solid #ccc; height: 120px; width: 90%; border-radius: 4px; }
            
            .page-break { page-break-after: always; }
            
            .answer-key-section { margin-top: 50px; }
            .answer-key-item { margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
            .key-title { font-weight: bold; color: #444; margin-right: 10px; }
            .key-content { color: #000; font-weight: 600; }
            .key-exp { font-size: 12px; color: #666; font-style: italic; margin-top: 5px; }
            
            .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #aaa; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${examTitle || '全真模拟试卷'}</h1>
            <div class="meta">科目：${selectedSubject || '综合'} | 总题量：${selectedQuestions.length} | 考试时长：${selectedQuestions.length * 2} 分钟 | 姓名：__________</div>
          </div>

          ${Object.entries(grouped).map(([type, list]) => {
            if (list.length === 0) return '';
            const typeName = typeLabels[type as QuestionType];
            return `
              <div class="section">
                <div class="section-title">${typeName}（共 ${list.length} 题）</div>
                ${list.map((q, i) => `
                  <div class="question-item">
                    <div class="question-text">${i + 1}. ${q.question}</div>
                    ${type === QuestionType.MULTIPLE_CHOICE ? `
                      <div class="options-grid">
                        ${q.options?.map((opt, oi) => `<div class="option-item">${String.fromCharCode(65 + oi)}. ${opt}</div>`).join('')}
                      </div>
                    ` : type === QuestionType.TRUE_FALSE ? `
                      <div class="options-grid">
                        <div class="option-item">( &nbsp; ) 正确</div>
                        <div class="option-item">( &nbsp; ) 错误</div>
                      </div>
                    ` : type === QuestionType.FILL_BLANK ? `
                      <div class="answer-line"></div>
                    ` : `
                      <div class="answer-box"></div>
                    `}
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}

          <div class="page-break"></div>

          <div class="header">
            <h1>参考答案及解析</h1>
            <div class="meta">试卷：${examTitle || '未命名'}</div>
          </div>
          
          <div class="answer-key-section">
            ${selectedQuestions.map((q, i) => `
              <div class="answer-key-item">
                <div>
                  <span class="key-title">第 ${i + 1} 题 [${typeLabels[q.type]}] 答案:</span>
                  <span class="key-content">${q.answer}</span>
                </div>
                <div class="key-exp">解析：${q.explanation}</div>
              </div>
            `).join('')}
          </div>

          <div class="footer">由 慧题AI+ 系统生成 • 仅供个人辅助教学与自测使用</div>
        </body>
      </html>
    `;

    // 采用 srcdoc 注入方式，完美解决 Tauri/Browser 拦截 blob URL 的安全策略问题
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    // 写入内容
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      // 监听图片及资源加载完毕
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
      };
    }
  };

  const typeLabels = {
    [QuestionType.MULTIPLE_CHOICE]: '一、单项选择题',
    [QuestionType.TRUE_FALSE]: '二、判断题',
    [QuestionType.FILL_BLANK]: '三、填空题',
    [QuestionType.SHORT_ANSWER]: '四、简答题'
  };

  const typeShortLabels = {
    [QuestionType.MULTIPLE_CHOICE]: '单选',
    [QuestionType.TRUE_FALSE]: '判断',
    [QuestionType.FILL_BLANK]: '填空',
    [QuestionType.SHORT_ANSWER]: '简答'
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">自组试卷</h2>
          <p className="text-gray-500">挑选您的专属题目集，支持导出包含标准解析的专业 PDF 试卷。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">试卷标题</label>
                <input type="text" placeholder="输入试卷名称..." className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">筛选科目</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">选择题库科目</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-4">备选题目 ({availableQuestions.length})</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {!selectedSubject ? (
                <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center gap-2">
                  <FileText className="opacity-20" size={48} />
                  请先选择科目以载入题库
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">该科目暂无更多备选题目</div>
              ) : (
                availableQuestions.map(q => (
                  <div key={q.id} onClick={() => toggleQuestion(q)} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-500 hover:shadow-md cursor-pointer flex items-center justify-between group transition-all">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700 truncate pr-4">{q.question}</p>
                      <div className="flex gap-2 mt-1">
                         <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{typeShortLabels[q.type]}</span>
                         <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">{q.difficulty}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Plus size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><FileText className="text-blue-600" /> <h3 className="text-xl font-bold">试卷预览</h3></div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{selectedQuestions.length} 题</span>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
             {selectedQuestions.map((q, i) => (
               <div key={q.id} className="group flex items-center justify-between text-xs bg-gray-50/80 p-3 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50/30 transition-all">
                 <div className="truncate flex-1">
                   <span className="font-bold mr-2 text-gray-400">{i+1}.</span>
                   <span className="text-gray-700">{q.question}</span>
                 </div>
                 <button onClick={() => toggleQuestion(q)} className="ml-2 text-gray-300 hover:text-red-500 transition-colors"><Minus size={16} /></button>
               </div>
             ))}
             {selectedQuestions.length === 0 && (
               <div className="flex flex-col items-center justify-center py-12 text-gray-300 gap-2">
                 <Plus size={32} className="opacity-10" />
                 <p className="text-sm italic">暂未选择题目</p>
               </div>
             )}
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-3">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold flex items-center gap-2 animate-shake"><AlertCircle size={14} /> {error}</div>}
            
            <button 
              onClick={handleExportPDF} 
              className="w-full py-4 rounded-2xl font-black bg-gray-900 text-white hover:bg-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-200 active:scale-[0.98]"
            >
              <Printer size={18} /> 打印/导出 PDF 试卷
            </button>
            
            <button 
              onClick={handleSave} 
              disabled={isSaved} 
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
               {isSaved ? <><CheckCircle2 size={18} /> 试卷已入库</> : <><Save size={18} /> 保存试卷到列表</>}
            </button>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-[10px] uppercase mb-1">
              <AlertCircle size={12} /> 打印提示
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed font-medium">
              在导出的 PDF 预览界面，请勾选“背景图形”以保留试卷的排版色块。建议使用 A4 纸张进行纵向打印。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamBuilder;
