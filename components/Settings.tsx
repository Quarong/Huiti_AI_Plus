
import React, { useState, useEffect, useRef } from 'react';
import { AIProvider, ModelConfig, Question, Exam, AnswerRecord } from '../types';
import { 
  Settings as SettingsIcon, Shield, Server, Save, CheckCircle2, 
  AlertCircle, Key, RefreshCw, Globe, Sliders, Info, RotateCcw,
  Database, Download, Upload, Trash2, HelpCircle, ExternalLink, FileJson,
  ChevronRight
} from 'lucide-react';

interface Props {
  currentData?: {
    questions: Question[];
    exams: Exam[];
    history: AnswerRecord[];
  };
  onReset?: () => void;
  onImport?: (data: { questions?: Question[], exams?: Exam[], history?: AnswerRecord[] }) => void;
}

const Settings: React.FC<Props> = ({ currentData, onReset, onImport }) => {
  const [config, setConfig] = useState<ModelConfig>({
    provider: AIProvider.GEMINI,
    modelName: 'gemini-3-flash-preview',
    apiKey: '',
    baseUrl: '',
    temperature: 0.7,
    topP: 0.95
  });
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_model_config');
    if (saved) {
      setConfig(prev => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    let defaultModel = '';
    let defaultBaseUrl = '';

    switch (provider) {
      case AIProvider.GEMINI: defaultModel = 'gemini-3-flash-preview'; defaultBaseUrl = ''; break;
      case AIProvider.DEEPSEEK: defaultModel = 'deepseek-chat'; defaultBaseUrl = 'https://api.deepseek.com/v1'; break;
      case AIProvider.DOUBAO: defaultModel = ''; defaultBaseUrl = 'https://ark.cn-beijing.volces.com/api/v3'; break;
      case AIProvider.CHATGPT: defaultModel = 'gpt-4o'; defaultBaseUrl = 'https://api.openai.com/v1'; break;
    }

    setConfig({ ...config, provider, modelName: defaultModel, baseUrl: defaultBaseUrl });
  };

  const handleSave = () => {
    localStorage.setItem('ai_model_config', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenGeminiKey = async () => {
    if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
  };
  

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onImport) onImport(json);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (err) {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 增强版稳健导出
  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(currentData, null, 2)], {type: 'application/json'});
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
    } catch (err) {
      alert('导出备份失败，请尝试刷新页面。');
    }
  };

  const providers = [
    { id: AIProvider.GEMINI, name: 'Google Gemini', desc: '支持极速出题与多模态逻辑。', color: 'bg-blue-600' },
    { id: AIProvider.DOUBAO, name: '豆包 (Ark)', desc: '字节跳动模型，中文出题效果极佳。', color: 'bg-orange-500' },
    { id: AIProvider.DEEPSEEK, name: 'DeepSeek', desc: '国产最强开源模型，极高性价比。', color: 'bg-purple-600' },
    { id: AIProvider.CHATGPT, name: 'OpenAI ChatGPT', desc: '行业基准，逻辑严密稳定。', color: 'bg-emerald-600' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">模型与 API 配置</h2>
          <p className="text-gray-500 mt-1">配置 AI 引擎参数以获取最佳出题体验。</p>
        </div>
        {isSaved && <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full font-bold animate-bounce shadow-sm"><CheckCircle2 size={18} /> 配置已同步</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">服务提供商</h3>
          <div className="space-y-2">
            {providers.map(p => (
              <button key={p.id} onClick={() => handleProviderChange(p.id)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-1 ${config.provider === p.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white shadow-sm'}`}>
                <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${p.color}`}></div><span className={`font-bold ${config.provider === p.id ? 'text-blue-700' : 'text-gray-700'}`}>{p.name}</span></div>
                <span className="text-[10px] text-gray-400 leading-tight">{p.desc}</span>
              </button>
            ))}
          </div>

          <div className="pt-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
               <div className="flex items-center gap-3 mb-2"><Database size={20} className="text-gray-400" /><span className="font-bold text-gray-700">数据管理</span></div>
               <div className="space-y-2">
                 <button onClick={handleExport} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 text-sm font-bold transition-all border border-transparent hover:border-blue-100"><div className="flex items-center gap-2"><Download size={16} /> 导出备份</div><ChevronRight size={14} className="opacity-30" /></button>
                 <button onClick={handleImportClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 text-sm font-bold transition-all border border-transparent hover:border-emerald-100"><div className="flex items-center gap-2"><Upload size={16} /> 导入备份</div><input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} /><ChevronRight size={14} className="opacity-30" /></button>
                 <button onClick={() => { if(confirm('警告：此操作将永久清空本地所有题库、试卷和练习历史。确定继续？')) onReset?.(); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-sm font-bold transition-all"><div className="flex items-center gap-2"><Trash2 size={16} /> 清空题库</div></button>
               </div>
               {importStatus === 'success' && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2"><CheckCircle2 size={12} /> 数据恢复成功</div>}
               {importStatus === 'error' && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2"><AlertCircle size={12} /> 导入失败：格式错误</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50"><Server className="text-blue-600" size={20} /><h3 className="font-bold text-xl text-gray-800">连接参数</h3></div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2"><label className="block text-sm font-bold text-gray-700">API 密钥 (API Key)</label></div>
                <div className="relative"><Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="password" placeholder="请输入 API Key" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-mono text-gray-700" value={config.apiKey || ''} onChange={(e) => setConfig({ ...config, apiKey: e.target.value })} /></div>
              </div>
              {config.provider !== AIProvider.GEMINI && (
                <div><label className="block text-sm font-bold text-gray-700 mb-2">代理地址 (Base URL)</label><div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="例如: https://api.openai.com/v1" className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700" value={config.baseUrl || ''} onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })} /></div></div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2"><label className="text-sm font-bold text-gray-700">模型名称 / Endpoint ID</label></div>
                {config.provider === AIProvider.GEMINI ? (
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 font-medium" value={config.modelName} onChange={(e) => setConfig({ ...config, modelName: e.target.value })}><option value="gemini-3-flash-preview">Gemini 3 Flash</option><option value="gemini-3-pro-preview">Gemini 3 Pro</option></select>
                ) : (
                  <input type="text" placeholder="例如: deepseek-chat" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 font-medium" value={config.modelName || ''} onChange={(e) => setConfig({ ...config, modelName: e.target.value })} />
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 space-y-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Sliders className="text-purple-600" size={20} /><h3 className="font-bold text-xl text-gray-800">推理权重</h3></div><button onClick={() => setConfig({...config, temperature: 0.7, topP: 0.95})} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 font-bold"><RotateCcw size={14} /> 重置</button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Temperature</label><span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{config.temperature}</span></div>
                  <input type="range" min="0" max="2" step="0.1" className="w-full accent-purple-600" value={config.temperature} onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><label className="text-sm font-bold text-gray-700">Top P</label><span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{config.topP}</span></div>
                  <input type="range" min="0" max="1" step="0.05" className="w-full accent-blue-600" value={config.topP} onChange={(e) => setConfig({...config, topP: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl"><Save size={20} /> 保存配置</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
