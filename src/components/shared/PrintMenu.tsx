// مكوّن قائمة الطباعة

import { Subscriber, Operation } from '@/types';
import { printSubscriberPDF, downloadSubscriberPNG, createSubscriberVideo } from '@/lib/subscriber-export';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  X, ChevronDown, RefreshCw, Download, AlertTriangle, FileText, PrinterIcon, Film,
} from 'lucide-react';

export function PrintMenu({ found, subscriberOps, queryText }: {
  found: Subscriber;
  subscriberOps: Operation[];
  queryText: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoQuality, setVideoQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setShowMenu(v => !v)}
        className="gap-2 font-bold h-12 px-6 text-base"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 24px rgba(124,58,237,0.45)' }}>
        <PrinterIcon size={18} />
        خيارات الطباعة والتصدير
        <ChevronDown size={14} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 left-0 z-50 min-w-[260px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#1a1040', border: '1px solid rgba(124,58,237,0.45)' }}>
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => { printSubscriberPDF(found, subscriberOps); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                  <FileText size={17} className="text-red-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">طباعة PDF</p>
                  <p className="text-slate-500 text-xs">تصدير البيانات كمستند PDF</p>
                </div>
              </button>

              <button
                onClick={() => { downloadSubscriberPNG(found, subscriberOps); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <Download size={17} className="text-blue-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">تنزيل PNG</p>
                  <p className="text-slate-500 text-xs">صورة عالية الجودة للبيانات</p>
                </div>
              </button>

              <button
                onClick={() => { setShowVideoModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                  <Film size={17} className="text-purple-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">إنشاء فيديو استعلام</p>
                  <p className="text-slate-500 text-xs">فيديو متحرك يعرض بيانات المشترك</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال جودة الفيديو */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center p-4"
            onClick={() => !isGenerating && setShowVideoModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-md"
              style={{ background: '#130c30', border: '1px solid rgba(124,58,237,0.45)' }}
              onClick={e => e.stopPropagation()}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                    <Film size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-black">إنشاء فيديو الاستعلام</h3>
                    <p className="text-slate-500 text-xs mt-0.5">فيديو متحرك يعرض رحلة الاستعلام وبيانات المشترك</p>
                  </div>
                  {!isGenerating && (
                    <button onClick={() => setShowVideoModal(false)}
                      className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-bold mb-3">اختر جودة الفيديو</p>
                <div className="space-y-2 mb-5">
                  {([
                    { q: '480p', label: '480p — جودة عادية', sub: '854 × 480 | حجم ملف أصغر', color: '#64748b' },
                    { q: '720p', label: '720p — جودة عالية HD', sub: '1280 × 720 | متوازن (موصى به)', color: '#3b82f6' },
                    { q: '1080p', label: '1080p — Full HD', sub: '1920 × 1080 | أعلى جودة', color: '#8b5cf6' },
                  ] as const).map(({ q, label, sub, color }) => (
                    <button key={q} onClick={() => setVideoQuality(q)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                      style={{
                        borderColor: videoQuality === q ? `${color}80` : 'rgba(255,255,255,0.08)',
                        background: videoQuality === q ? `${color}15` : 'transparent',
                      }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: videoQuality === q ? color : '#475569' }}>
                        {videoQuality === q && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-slate-500 text-xs">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300">مدة إنشاء الفيديو حوالي 15 ثانية · يُنزَّل تلقائياً بصيغة WebM</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setIsGenerating(true);
                      createSubscriberVideo(found, subscriberOps, queryText, videoQuality, () => {
                        setIsGenerating(false);
                        setShowVideoModal(false);
                      });
                    }}
                    disabled={isGenerating}
                    className="flex-1 gap-2 font-bold h-11"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    {isGenerating ? (
                      <><RefreshCw size={15} className="animate-spin" />جارٍ إنشاء الفيديو...</>
                    ) : (
                      <><Film size={15} />إنشاء الفيديو</>
                    )}
                  </Button>
                  {!isGenerating && (
                    <Button variant="outline" onClick={() => setShowVideoModal(false)}
                      className="border-white/15 text-slate-300 hover:bg-white/10 h-11">
                      إلغاء
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
