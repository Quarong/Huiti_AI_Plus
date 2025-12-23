
import React, { useState } from 'react';
import { Upload, Sparkles, Loader2, CheckCircle2, AlertCircle, Lightbulb, FileText, File as FileIcon } from 'lucide-react';
import { generateQuestionsFromSource } from '../services/ai-factory';
import { Question, QuestionType, Difficulty } from '../types';

interface Props {
  onGenerated: (questions: Question[]) => void;
}

const QuestionGenerator: React.FC<Props> = ({ onGenerated }) => {
  const [sourceText, setSourceText] = useState('');
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Question[]>([]);

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(10);
    try {
      let text = '';
      if (file.name.endsWith('.pdf')) {
        text = await parsePDF(file);
      } else if (file.name.endsWith('.docx')) {
        text = await parseDocx(file);
      } else {
        text = await file.text();
      }
      setSourceText(text);
      if (!subject) setSubject(file.name.replace(/\.[^/.]+$/, ""));
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (err) {
      setError('文件解析失败，请确保文件格式正确且未加密。');
      setProgress(0);
    }
  };

  const handleGenerate = async () => {
    if (!sourceText || !subject) {
      setError('请输入参考内容和科目名称。');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setProgress(30);
    
    try {
      const questions = await generateQuestionsFromSource(sourceText, subject, count);
      setProgress(80);
      setPreview(questions);
      setProgress(100);
    } catch (err: any) {
      if (err.message === "AUTH_REQUIRED") {
        setError('API Key 无效或未设置，请前往“模型配置”完成授权。');
      } else {
        setError('出题失败：' + err.message);
      }
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleConfirm = () => {
    onGenerated(preview);
    setPreview([]);
    setSourceText('');
    setSubject('');
  };

  const formatAnswerDisplay = (answer: string, type: QuestionType) => {
    if (type === QuestionType.FILL_BLANK && answer.includes('/')) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {answer.split(/\s*\/\s*/).map((p, i) => (
            <span key={i} className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold">空{i+1}: {p}</span>
          ))}
        </div>
      );
    }
    return <span className="font-bold">{answer}</span>;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI 智能出题</h2>
          <p className="text-gray-500">支持 PDF、Word、TXT 资料一键出题，包含深度解析。</p>
        </div>
        {progress > 0 && (
          <div className="w-48 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-blue-600 uppercase">
              <span>{isGenerating ? 'AI 生成中' : '处理中'}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{width: `${progress}%`}}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 h-fit sticky top-24">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">科目名称</label>
            <input type="text" placeholder="例如：医学信息学" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">出题参考资料</label>
            <div className="relative group">
              <textarea rows={8} placeholder="在此输入文字或在下方上传文件..." className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 resize-none transition-all" value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <label className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors text-blue-600" title="上传 PDF/Word">
                   <FileText size={20} />
                   <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                 </label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">生成题量</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 10, 20].map(n => <option key={n} value={n}>{n} 道题</option>)}</select>
            </div>
            <button onClick={handleGenerate} disabled={isGenerating} className="mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all h-[52px]">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isGenerating ? '正在理解内容...' : '开始出题'}
            </button>
          </div>
          {error && <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in"><AlertCircle size={20} className="flex-shrink-0" /><p className="text-xs font-bold">{error}</p></div>}
        </div>

        <div className="bg-gray-50 rounded-[32px] p-8 border-2 border-dashed border-gray-200 flex flex-col min-h-[600px] overflow-hidden">
          {preview.length > 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-green-500" /> 出题预览</h3>
                <button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg">确认入库</button>
              </div>
              <div className="space-y-6 overflow-y-auto pr-2 max-h-[800px] flex-1">
                {preview.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{typeLabels[q.type]}</span>
                      <span className="text-[10px] font-bold text-gray-400"># {idx + 1}</span>
                    </div>
                    <p className="font-bold text-gray-800 leading-relaxed">{q.question}</p>
                    <div className="text-xs p-3 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-100">
                      <span className="font-bold mr-2">参考答案:</span>
                      {formatAnswerDisplay(q.answer, q.type)}
                    </div>
                    <div className="bg-blue-50/30 p-4 rounded-xl space-y-2">
                       <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[10px] uppercase">
                         <Lightbulb size={12} /> 详尽解析
                       </div>
                       <p className="text-[11px] text-gray-500 leading-relaxed italic">{q.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 text-blue-400">
                <Sparkles size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">待生成题目</h3>
              <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">上传文件或粘贴文本后，AI 将自动分析知识点并为您生成高质量题目。</p>
            </div>
          )}
        </div>
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

export default QuestionGenerator;
