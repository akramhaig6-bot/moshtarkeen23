// ── الاستعلام المتقدم ──

import { Subscriber, Operation } from '@/types';
import { statusBadge } from '@/components/shared/StatusBadges';
import { PrintMenu } from '@/components/shared/PrintMenu';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingUp, Wallet, Search, CheckCircle2, AlertCircle, CreditCard, Phone, ClipboardList, X, Building2, Eye, EyeOff, AlertTriangle, Database, Banknote, Globe, Cpu,
} from 'lucide-react';

export function AdvancedAdminPanel({ subscribers, operations }: { subscribers: Subscriber[]; operations: Operation[] }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  // تسلسل السحب: سحب الأرباح ← تأكيد سحب الأرباح ← عرض النص المحفوظ للمشترك.
  const [withdrawalStage, setWithdrawalStage] = useState<'idle' | 'confirm' | 'completed'>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSearch = () => {
    if (!query.trim()) return;
    setSearched(false); setFound(null); setIsSearching(true); setProgress(0); setShowWallet(false); setWithdrawalStage('idle');
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100; setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          const q = query.trim().toLowerCase();
          const res = subscribers.find(s =>
            s.name.toLowerCase().includes(q) || s.iban.toLowerCase().includes(q) ||
            s.phone.includes(q) || s.systemAccount.toLowerCase().includes(q) || s.walletAddress.toLowerCase().includes(q)
          );
          setFound(res ?? null); setSearched(true); setIsSearching(false); setProgress(0);
        }, 400);
      } else { setProgress(p); }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const subscriberOps = useMemo(() => found ? operations.filter(op => op.subscriberName === found.name) : [], [found, operations]);

  const clear = () => { setQuery(''); setFound(null); setSearched(false); setIsSearching(false); setProgress(0); setWithdrawalStage('idle'); if (intervalRef.current) clearInterval(intervalRef.current); };

  return (
    <>
      {/* صندوق البحث المتقدم */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              <Search size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">الاستعلام عن المشترك</h3>
              <p className="text-slate-400 text-xs mt-0.5">ابحث بالاسم · الآيبان · رقم الهاتف · عنوان المحفظة · حساب النظام</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input placeholder="أدخل الاسم، IBAN، رقم الهاتف..."
                className="pr-11 text-sm rounded-xl h-12 text-white placeholder:text-slate-500"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                disabled={isSearching} />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            </div>
            <Button onClick={runSearch} disabled={isSearching}
              className="h-12 px-6 font-bold rounded-xl transition-all whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
              {isSearching ? 'جارٍ البحث...' : 'استعلام الآن'}
            </Button>
            {(searched || isSearching) && (
              <Button variant="outline" onClick={clear} className="h-12 rounded-xl px-3 border-white/20 text-white hover:bg-white/10">
                <X size={17} />
              </Button>
            )}
          </div>

          {/* شريط التقدم */}
          <AnimatePresence>
            {isSearching && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">جارٍ البحث...</span>
                  <span className="text-sm font-black text-emerald-400">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div className="absolute inset-y-0 right-0 rounded-full"
                    style={{ width: `${progress}%`, left: 'auto', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* نتائج البحث */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-1">لم يُعثر على مشترك</h4>
            <p className="text-slate-500 text-sm">لا توجد نتائج مطابقة لـ "{query}"</p>
          </motion.div>
        )}

        {found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* بطاقة المشترك */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg text-xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    {found.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white">{found.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {found.subscriberStatus && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                          {found.subscriberStatus}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{found.joinDate && `عضو منذ ${found.joinDate}`}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'الجوال', value: found.phone, icon: <Phone size={12} /> },
                    { label: 'الآيبان', value: found.iban, icon: <CreditCard size={12} />, mono: true },
                    { label: 'البنك', value: found.bankName, icon: <Building2 size={12} /> },
                    { label: 'حساب النظام', value: found.systemAccount, icon: <Database size={12} />, mono: true },
                    { label: 'العملة', value: found.currency, icon: <Globe size={12} /> },
                    { label: 'المنصة', value: found.platform, icon: <Cpu size={12} /> },
                  ].filter(f => f.value).map((field, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-1 text-slate-400 mb-1">{field.icon}<span className="text-xs">{field.label}</span></div>
                      <p className={`text-sm font-bold text-white break-all ${field.mono ? 'font-mono text-xs' : ''}`}>{field.value}</p>
                    </div>
                  ))}
                </div>

                {/* المالية */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, color: '#3b82f6', icon: <Wallet size={16} /> },
                    { label: 'الأرباح', value: found.profits, color: '#10b981', icon: <TrendingUp size={16} /> },
                    { label: 'رسوم النظام', value: found.systemFees, color: '#f59e0b', icon: <AlertCircle size={16} /> },
                  ].filter(f => f.value > 0).map((fin, i) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                      style={{ background: `${fin.color}15`, border: `1px solid ${fin.color}30` }}>
                      <div className="flex items-center justify-center gap-1 mb-1" style={{ color: fin.color }}>{fin.icon}</div>
                      <p className="text-slate-400 text-xs mb-1">{fin.label}</p>
                      <p className="font-black text-lg" style={{ color: fin.color }}>{fin.value.toLocaleString()} ر.س</p>
                    </div>
                  ))}
                  {found.walletAddress && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <p className="text-slate-400 text-xs mb-1">المحفظة الرقمية</p>
                      <p className="font-mono text-xs text-purple-300 break-all leading-tight">
                        {showWallet ? found.walletAddress : `${found.walletAddress.slice(0, 16)}…`}
                      </p>
                      <button onClick={() => setShowWallet(v => !v)} className="text-xs text-purple-400 mt-1 hover:text-purple-300 flex items-center gap-1">
                        {showWallet ? <EyeOff size={10} /> : <Eye size={10} />}{showWallet ? 'إخفاء' : 'عرض الكامل'}
                      </button>
                    </div>
                  )}
                </div>

                {found.notes && (
                  <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{found.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* عمليات المشترك */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-white font-black">سجل عمليات المشترك</h4>
                <span className="text-xs text-slate-400">{subscriberOps.length} عملية</span>
              </div>
              {subscriberOps.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات مسجّلة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                          <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriberOps.slice(0, 8).map((op, i) => (
                        <tr key={op.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 text-slate-300 text-sm">{op.operation}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>{op.amount}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{op.date}</td>
                          <td className="px-4 py-3">{statusBadge(op.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* إجراءات سحب الأرباح — تظهر فوق خيارات الطباعة مباشرة */}
            <div className="flex justify-center pt-1">
              <AnimatePresence mode="wait">
                {withdrawalStage === 'idle' && (
                  <motion.div key="withdraw" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Button onClick={() => setWithdrawalStage('confirm')}
                      className="h-11 px-7 rounded-xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
                      <Banknote size={18} className="ml-2" />سحب الأرباح
                    </Button>
                  </motion.div>
                )}
                {withdrawalStage === 'confirm' && (
                  <motion.div key="confirm-withdraw" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                    <Button onClick={() => setWithdrawalStage('completed')}
                      className="h-11 px-7 rounded-xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                      <CheckCircle2 size={18} className="ml-2" />تأكيد سحب الأرباح
                    </Button>
                  </motion.div>
                )}
                {withdrawalStage === 'completed' && (
                  <motion.div key="withdrawal-text" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="w-full max-w-2xl rounded-xl px-5 py-4 text-center"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
                    <div className="flex items-center justify-center gap-2 text-emerald-400 mb-1"><CheckCircle2 size={17} /><span className="text-xs font-black">تم تأكيد سحب الأرباح</span></div>
                    <p className="text-sm font-bold text-white whitespace-pre-wrap">{found.withdrawalText?.trim() || 'لا يوجد نص سحب مُدخل لهذا المشترك.'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* زر خيارات الطباعة والتصدير */}
            <div className="flex justify-center pt-2 pb-1">
              <PrintMenu found={found} subscriberOps={subscriberOps} queryText={query} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
