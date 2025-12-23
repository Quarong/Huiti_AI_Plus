
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  BrainCircuit,
  CheckCircle2,
  Settings as SettingsIcon,
  LayoutDashboard,
  MousePointer2,
  X
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onStepChange: (tab: string) => void;
}

// 定义引导步骤及其对应的高亮区域坐标（基于视口百分比或固定区域）
const steps = [
  {
    title: "学情中心",
    description: "这是您的学习大脑，AI 会根据您的历史数据，实时分析掌握程度和薄弱环节。",
    icon: <LayoutDashboard size={24} className="text-blue-600" />,
    tab: "dashboard",
    // 高亮右侧主区域
    spotlight: "inset(80px 0 0 288px round 40px)",
    cardPosition: "top-40 left-[320px]"
  },
  {
    title: "功能导航",
    description: "通过侧边栏快速切换功能。包含 AI 出题、自组试卷和沉浸式练习等核心模块。",
    icon: <BrainCircuit size={24} className="text-blue-600" />,
    tab: "dashboard",
    // 高亮左侧边栏
    spotlight: "inset(0 calc(100% - 288px) 0 0)",
    cardPosition: "top-1/4 left-80"
  },
  {
    title: "配置 AI 引擎",
    description: "【关键步骤】在此填写您的 API Key。我们将页面切换到了配置页，请确保在此授权以激活 AI 功能。",
    icon: <SettingsIcon size={24} className="text-orange-600" />,
    tab: "settings",
    // 高亮配置面板
    spotlight: "inset(80px 20px 20px 308px round 40px)",
    cardPosition: "top-60 left-[340px]"
  },
  {
    title: "控制中心",
    description: "点击此处可以管理本地数据库，导出全量备份或清空存储。您的数据 100% 存储在本地。",
    icon: <MousePointer2 size={24} className="text-emerald-600" />,
    tab: "dashboard",
    // 高亮右上角按钮
    spotlight: "inset(10px 40px calc(100% - 70px) calc(100% - 260px) round 20px)",
    cardPosition: "top-24 right-48"
  },
  {
    title: "开启智学之旅",
    description: "导览结束。现在，尝试上传一份文档，让 AI 为您生成第一套专属题目吧！",
    icon: <Sparkles size={24} className="text-purple-600" />,
    tab: "generator",
    spotlight: "inset(0 0 0 0)", // 全屏
    cardPosition: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    onStepChange(steps[currentStep].tab);
  }, [currentStep, onStepChange]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const step = steps[currentStep];

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* 聚光灯遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-700 ease-in-out"
        style={{ 
          clipPath: step.spotlight,
          WebkitClipPath: step.spotlight
        }}
      />
      
      {/* 实际点击阻断层（除了高亮区域外不可点击） */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent pointer-events-auto" style={{ cursor: 'default' }} />
      </div>

      {/* 悬浮引导卡片 */}
      <div 
        className={`absolute ${step.cardPosition} w-[380px] bg-white rounded-[32px] shadow-2xl p-8 transition-all duration-500 ease-out border border-blue-100 pointer-events-auto animate-in fade-in zoom-in-95`}
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
              {step.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-0.5">Step {currentStep + 1} of {steps.length}</p>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{step.title}</h3>
            </div>
          </div>

          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            {step.description}
          </p>

          <div className="flex items-center justify-between mt-4 pt-6 border-t border-gray-50">
            <button 
              onClick={prev}
              disabled={currentStep === 0}
              className={`text-sm font-bold flex items-center gap-1 transition-all ${currentStep === 0 ? 'opacity-0' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <ChevronLeft size={16} /> 上一步
            </button>

            <div className="flex items-center gap-4">
              {currentStep < steps.length - 1 && (
                <button 
                  onClick={onComplete}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  跳过
                </button>
              )}
              <button 
                onClick={next}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                {currentStep === steps.length - 1 ? '开始使用' : '继续导览'}
                {currentStep === steps.length - 1 ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 辅助视觉引导（呼吸圈） */}
      <div 
        className="absolute pointer-events-none transition-all duration-700"
        style={{
          // 这里的逻辑需要匹配 spotlight 坐标，为了简化，我们仅在聚光灯中心展示微光
          display: currentStep === steps.length - 1 ? 'none' : 'block'
        }}
      />
    </div>
  );
};

export default Onboarding;
