
import React, { useMemo } from 'react';
import { Question, Exam, AnswerRecord, QuestionType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { 
  Brain, Target, ShieldCheck, BookMarked, Zap, Calendar, 
  ArrowUpRight, AlertTriangle, TrendingUp, Award, 
  Sparkles, Flame, Timer, Ghost 
} from 'lucide-react';

interface Props {
  questions: Question[];
  exams: Exam[];
  history: AnswerRecord[];
}

const Dashboard: React.FC<Props> = ({ questions, history }) => {
  const subjects = useMemo(() => Array.from(new Set(questions.map(q => q.subject || '未分类'))), [questions]);
  
  // 核心统计指标计算
  const stats = useMemo(() => {
    const total = history.length;
    const correct = history.filter(h => h.isCorrect).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    // 连续打卡计算（简单实现：按天去重统计）
    const dates = new Set(history.map(h => new Date(h.timestamp).toLocaleDateString()));
    const streak = dates.size;
    
    // 学习动力值（算法：练习量 * 正确率权重 * 勤奋度）
    const powerValue = Math.min(100, Math.round((total / 50) * 40 + (rate / 100) * 40 + (streak / 7) * 20));

    return { total, rate, streak, powerValue, subjectCount: subjects.length };
  }, [history, subjects]);

  // 掌握度雷达图数据
  const masteryData = useMemo(() => {
    return subjects.map(subject => {
      const qs = questions.filter(q => q.subject === subject);
      const hs = history.filter(h => h.subject === subject);
      const cr = hs.length > 0 ? (hs.filter(h => h.isCorrect).length / hs.length) * 100 : 0;
      const ua = new Set(hs.map(h => h.questionId)).size;
      const cv = qs.length > 0 ? (ua / qs.length) * 100 : 0;
      return { 
        subject: subject.length > 5 ? subject.substring(0, 4) + '..' : subject, 
        '正确率': Math.round(cr), 
        '覆盖率': Math.round(cv), 
        '综合': Math.round(cr * 0.6 + cv * 0.4) 
      };
    }).sort((a, b) => b.综合 - a.综合).slice(0, 6);
  }, [subjects, questions, history]);

  // 学习趋势图数据
  const trendData = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const ds = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      const dayH = history.filter(h => new Date(h.timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) === ds);
      return { name: ds, '数量': dayH.length, '正确率': dayH.length > 0 ? Math.round((dayH.filter(h => h.isCorrect).length / dayH.length) * 100) : 0 };
    });
  }, [history]);

  // 薄弱项分析
  const weakPoints = useMemo(() => {
    return subjects
      .map(s => {
        const hs = history.filter(h => h.subject === s);
        const rate = hs.length > 0 ? (hs.filter(h => h.isCorrect).length / hs.length) : 1;
        return { subject: s, rate: Math.round(rate * 100), count: hs.length };
      })
      .filter(s => s.count > 3 && s.rate < 70)
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);
  }, [subjects, history]);

  // 题型分布
  const typeData = useMemo(() => {
    const types = [
      { name: '单选题', key: QuestionType.MULTIPLE_CHOICE, color: '#3B82F6' },
      { name: '判断题', key: QuestionType.TRUE_FALSE, color: '#10B981' },
      { name: '填空题', key: QuestionType.FILL_BLANK, color: '#F59E0B' },
      { name: '简答题', key: QuestionType.SHORT_ANSWER, color: '#8B5CF6' }
    ];
    return types.map(t => ({
      name: t.name,
      value: history.filter(h => {
        const q = questions.find(q => q.id === h.questionId);
        return q?.type === t.key;
      }).length,
      color: t.color
    })).filter(t => t.value > 0);
  }, [history, questions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* 顶部标题与快速洞察 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Sparkles size={14} /> AI 驱动的实时学情报告
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">智能学情中心</h2>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={18} />
            连续打卡 <span className="text-gray-900">{stats.streak}</span> 天
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-500" size={18} />
            学情动力 <span className="text-gray-900">{stats.powerValue}</span>
          </div>
        </div>
      </div>

      {/* 第一排：核心指标卡片 (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '总练习量', value: stats.total, sub: '道题目', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
          { label: '平均正确率', value: `${stats.rate}%`, sub: '全科目汇总', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '稳定' },
          { label: '覆盖学科', value: stats.subjectCount, sub: '个核心门类', icon: BookMarked, color: 'text-purple-600', bg: 'bg-purple-50', trend: '持续增加' },
          { label: '最近评估', value: stats.rate >= 80 ? '卓越' : stats.rate >= 60 ? '良好' : '进取', sub: '学习状态', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50', trend: '实时更新' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <stat.icon size={80} />
            </div>
            <div className={`${stat.bg} p-3 rounded-2xl w-fit mb-4`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-3xl font-black text-gray-800">{stat.value}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 第二排：趋势与雷达 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 学习趋势 - 占2列 */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800">学习趋势洞察</h3>
              <p className="text-xs text-gray-400 mt-1">近两周练习强度与质量波动曲线</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 正确率</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-100"></div> 练习量</div>
            </div>
          </div>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Bar dataKey="数量" fill="#DBEAFE" radius={[4, 4, 0, 0]} barSize={20} />
                <Area type="monotone" dataKey="正确率" stroke="#3B82F6" strokeWidth={4} fill="url(#colorRate)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 能力评估雷达 */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">全维能力模型</h3>
            <p className="text-xs text-gray-400 mt-1">基于正确率与覆盖率的学科深度画像</p>
          </div>
          <div className="flex-1 min-h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={masteryData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                <Radar 
                  name="综合掌握度" 
                  dataKey="综合" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6} 
                  animationDuration={2000}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 第三排：薄弱预警与题型分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 薄弱科目预警 */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-rose-500" size={20} />
            <h3 className="text-xl font-bold text-gray-800">薄弱环节预警</h3>
          </div>
          <div className="space-y-4">
            {weakPoints.length > 0 ? weakPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/50 border border-rose-100 group hover:bg-rose-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-rose-500 font-black shadow-sm">
                  {point.rate}%
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{point.subject}</h4>
                  <p className="text-xs text-gray-400">已练习 {point.count} 次，正确率远低于平均值</p>
                </div>
                <div className="text-rose-600 text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
                  急需巩固
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                  <Award size={32} />
                </div>
                <p className="text-sm font-bold text-gray-800">暂无薄弱学科</p>
                <p className="text-xs text-gray-400 mt-1">继续保持，您的知识体系非常稳固！</p>
              </div>
            )}
          </div>
        </div>

        {/* 题型分布与建议 */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-6">练习题型构成</h3>
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800">{stats.total}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
               {typeData.map((t, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: t.color}}></div>
                    {t.name}
                 </div>
               ))}
            </div>
          </div>
          <div className="flex-1 bg-blue-50/50 rounded-3xl p-6 border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Sparkles size={18} /> AI 智能建议
            </div>
            <div className="space-y-4">
              <p className="text-xs text-blue-800 leading-relaxed italic">
                “根据您的最近表现，我们在 {subjects[0] || '题库'} 中发现了您的潜力。建议增加填空题的练习比例以强化记忆细节。”
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 bg-white px-3 py-2 rounded-xl shadow-sm">
                  <Timer size={14} /> 最佳学习时段：14:00 - 16:00
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 bg-white px-3 py-2 rounded-xl shadow-sm">
                  <TrendingUp size={14} /> 下一阶段目标：正确率 85%+
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
