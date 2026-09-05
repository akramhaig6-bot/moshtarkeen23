// العرض الأمامي لتجربة المشترك فوق نتيجة الاستعلام

import { ExperiencePlacement, CustomQueryButton, SubscriberExperience } from '@/types';
import { useState, useEffect, useRef } from 'react';
import {
  Building2, RefreshCw, Zap,
} from 'lucide-react';

const TONE_CLASSES: Record<CustomQueryButton['tone'], string> = {
  emerald: 'from-emerald-500 to-green-600 shadow-emerald-500/20',
  blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
  amber: 'from-amber-400 to-orange-500 shadow-amber-500/20',
  violet: 'from-violet-500 to-fuchsia-500 shadow-violet-500/20',
};

export function SubscriberQueryExperience({ experience, subscriberName }: { experience: SubscriberExperience; subscriberName: string }) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [running, setRunning] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sections = experience.sections.filter(section => section.visible !== false && section.title.trim());
  const buttons = experience.buttons.filter(button => button.visible !== false && button.label.trim());

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startButton = (button: CustomQueryButton) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(button.id);
    setProgress(prev => ({ ...prev, [button.id]: 0 }));
    const step = 100 / Math.max(1, button.duration * 10);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(100, (prev[button.id] || 0) + step);
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunning(null);
        }
        return { ...prev, [button.id]: next };
      });
    }, 100);
  };

  const renderSections = (placement: ExperiencePlacement) => sections.filter(section => section.placement === placement).map(section => (
    <div key={section.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1" style={{ background: section.accent || '#0f766e' }} />
      <div className="p-4">
        <p className="text-sm font-black text-slate-800">{section.title}</p>
        {section.content && <p className="text-sm text-slate-600 leading-7 whitespace-pre-line mt-2">{section.content}</p>}
      </div>
    </div>
  ));

  const renderButtons = (placement: ExperiencePlacement) => buttons.filter(button => button.placement === placement).map(button => {
    const value = Math.round(progress[button.id] || 0);
    const done = value >= 100;
    return (
      <div key={button.id} className="rounded-2xl bg-white border border-slate-200 p-3 shadow-sm">
        <button type="button" onClick={() => startButton(button)} className={`w-full h-11 rounded-xl bg-gradient-to-l ${TONE_CLASSES[button.tone]} text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all`}>
          {running === button.id ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
          {button.label}
        </button>
        {button.helperText && <p className="text-[11px] text-slate-400 text-center mt-2">{button.helperText}</p>}
        {value > 0 && !done && <div className="mt-2"><div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500 transition-all" style={{ width: `${value}%` }} /></div><p className="text-[10px] text-slate-400 text-center mt-1">جارٍ تنفيذ الطلب… {value}%</p></div>}
        {done && button.content && <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 whitespace-pre-line">{button.content}</div>}
      </div>
    );
  });

  if (!experience.companyName && sections.length === 0 && buttons.length === 0) return null;
  return (
    <div className="space-y-4 mt-5">
      <div className="rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-indigo-900 text-white p-5 shadow-xl">
        <div className="flex items-center gap-3">
          {experience.companyLogo ? <img src={experience.companyLogo} alt={experience.companyName} className="w-12 h-12 rounded-xl bg-white object-contain p-1" /> : <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Building2 size={22} /></div>}
          <div><p className="text-xs text-indigo-200 font-bold">{experience.companyName}</p><p className="text-lg font-black mt-0.5">{experience.welcomeTitle}</p></div>
        </div>
        {experience.welcomeText && <p className="text-sm text-slate-300 leading-7 mt-3 whitespace-pre-line">{experience.welcomeText.replace('{name}', subscriberName)}</p>}
      </div>
      {renderSections('top')}
      {renderButtons('top')}
      {renderSections('summary')}
      {renderButtons('summary')}
      {renderSections('bottom')}
      {renderButtons('bottom')}
    </div>
  );
}
