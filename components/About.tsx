
import React from 'react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  Layout,
  Globe,
  Terminal,
  CheckCircle2,
  Zap,
  BookOpen,
  FileCode,
  ShieldAlert,
  Heart,
  QrCode,
  Scale,
  Github,
  Copyright
} from 'lucide-react';
import Logo from './Logo';

const About: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -m-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-20 w-60 h-60 bg-blue-400/20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="bg-white/20 p-8 rounded-[48px] backdrop-blur-md mb-2 shadow-2xl">
            <Logo size={100} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight">慧题AI+ 系统</h1>
          <p className="text-lg lg:text-xl text-blue-100 max-w-2xl font-medium leading-relaxed">
            AI 驱动的下一代学习题库管理方案。集智能生成、专项练习、组卷测试与学情分析于一体，
            旨在为学生与教育工作者提供最高效的知识闭环体验。
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <span className="bg-white/10 px-6 py-2 rounded-full text-sm font-bold border border-white/20">Version 1.0.0</span>
            <span className="bg-emerald-400/20 px-6 py-2 rounded-full text-sm font-bold border border-emerald-400/30 text-emerald-100 flex items-center gap-2">
              <Zap size={14} className="fill-emerald-400" /> AI Core Online
            </span>
          </div>
        </div>
      </section>

      {/* Support / Donation Section */}
      <section className="bg-white p-10 lg:p-16 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
          <Heart size={240} className="text-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Heart size={14} className="fill-red-600" /> Support The Project
            </div>
            <h3 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
              觉得好用？<br />请作者喝杯咖啡 ☕
            </h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              慧题AI+ 是一个完全免费且开源的个人项目。您的支持是我持续更新 AI 模型算法、优化桌面端体验以及开发更多提效工具的最大动力。
            </p>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900">n+</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active Users</span>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900">n+</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Questions Generated</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[40px] p-8 lg:p-10 flex flex-col md:flex-row gap-8 justify-center items-center">
            {/* WeChat Pay */}
            <div className="space-y-4 text-center">
              <div className="relative group/qr">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden p-2 group-hover/qr:shadow-xl transition-all duration-300">
                  <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                    <img
                      src="../qr-codes/wechat.png"
                      alt="微信支付二维码"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    <span className="text-[8px] font-bold mt-2">WECHAT PAY</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">微信支付</div>
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-tighter pt-2">扫码通过微信支持</p>
            </div>

            <div className="hidden md:block w-px h-24 bg-gray-200"></div>

            {/* AliPay */}
            <div className="space-y-4 text-center">
              <div className="relative group/qr">
                <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden p-2 group-hover/qr:shadow-xl transition-all duration-300">
                  <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                    <img
                      src="../qr-codes/alipay.jpg"
                      alt="支付宝二维码"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    <span className="text-[8px] font-bold mt-2">ALIPAY</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">支付宝</div>
              </div>
              <p className="text-xs font-bold text-gray-400 tracking-tighter pt-2">扫码通过支付宝支持</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
            <Sparkles size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">AI 智能智造</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            深度集成顶级语言模型。仅需提供参考文档，即可自动解析知识点，生成包含深度解析的学术级题目。
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
            <ShieldCheck size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">数据完全私有</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            所有业务数据均存储在您浏览器的 LocalStorage 中。我们不设后端，不抓取数据，保护您的隐私。
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
            <Zap size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">极致极速体验</h3>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">
            全站采用无刷新 SPA 架构。支持多种格式导出，无论是在线模拟考试还是纸质打印，都能秒级响应。
          </p>
        </div>
      </section>

      {/* Technical Stack & Guide */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="text-gray-900" />
            <h3 className="text-2xl font-bold">底层驱动技术栈</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'React 19', sub: 'UI Logic Framework', icon: Layout },
              { label: 'Tailwind CSS', sub: 'Utility-First Styling', icon: Globe },
              { label: 'LAIM', sub: 'Core AI Engine', icon: Cpu },
              { label: 'TypeScript', sub: 'Static Type Safety', icon: FileCode },
              { label: 'Lucide Icons', sub: 'Vector Icon System', icon: Sparkles },
              { label: 'Mammoth.js', sub: 'DOCX Processing', icon: BookOpen }
            ].map((tech, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                  <tech.icon size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-black text-gray-900">{tech.label}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{tech.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap size={120} />
          </div>
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="text-blue-400" />
            <h3 className="text-2xl font-bold">使用注意事项</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="mt-1 flex-shrink-0"><CheckCircle2 className="text-blue-400" size={18} /></div>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                <span className="text-white font-bold">定期备份：</span>
                清理浏览器历史或重装系统会导致数据丢失，请务必定期导出备份。
              </p>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 flex-shrink-0"><CheckCircle2 className="text-blue-400" size={18} /></div>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                <span className="text-white font-bold">API 配额：</span>
                如遇报错，请检查您的 API Key 是否过期或额度是否充足。
              </p>
            </li>
            <li className="flex gap-4">
              <div className="mt-1 flex-shrink-0"><CheckCircle2 className="text-blue-400" size={18} /></div>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">
                <span className="text-white font-bold">PDF 打印：</span>
                建议在打印对话框中勾选“背景图形”，以获得最佳显示效果。
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer Acknowledgements */}
      <section className="text-center pt-8 border-t border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1"><Copyright size={10} /> 2025 慧题AI+</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <span className="text-blue-500">GNU GPL v3 Licensed</span>
          </div>
          <div className="text-gray-400 text-sm font-medium">
            Made with <span className="text-red-500">❤️</span> by Academic Intelligence Team
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
