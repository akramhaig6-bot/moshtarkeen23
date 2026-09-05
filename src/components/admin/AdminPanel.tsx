// ═══════════════════════════════════════════════════════════════
// نظام الاستعلام — Premium Fintech Console v2
// إعادة تصميم كاملة: Layout مؤسسي حديث، هوية كحلية/ذهبية فاخرة،
// تسلسل بصري واضح، مساحات مدروسة، وردود فعل ممتازة للهاتف والكمبيوتر.
// (نفس المنطق والوظائف والبيانات تماماً — تغيير بصري فقط)
// ═══════════════════════════════════════════════════════════════

import { Subscriber, Operation, SystemConfig } from '@/types';
import { resolveSubscriberExperience } from '@/config/system';
import { amountColor, statusBadge, subStatusBadge } from '@/components/shared/StatusBadges';
import { SubscriberQueryExperience } from '@/components/experience/SubscriberQueryExperience';
import { CMSExperience } from '@/components/cms/CMSExperience';
import { resolveCMS } from '@/data/cms-defaults';
import { OPS_PER_PAGE } from '@/constants/app';
import { AllOperationsLog } from '@/components/admin/AllOperationsLog';
import { PrintMenu } from '@/components/shared/PrintMenu';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, TrendingUp, Wallet, Search, CheckCircle2, AlertCircle, CreditCard, Phone, Shield, ClipboardList, X, Hash, Building2, ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff, AlertTriangle, Database, Calendar, Banknote, Globe, Cpu, LayoutGrid, Fingerprint, BadgeCheck, ArrowLeftRight, Lock, ExternalLink, Coins, ScanSearch, FileText,
} from 'lucide-react';

// ═══════════ عناصر عرض محلية (مستوى الوحدة — هوية ثابتة دون إعادة تركيب) ═══════════

/** عنوان قسم داخل النتيجة: أيقونة + عنوان + خط فاصل متدرج */
function SectionTitle({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center text-blue-700 flex-shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-black text-slate-800 leading-tight">{title}</h3>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{hint}</p>}
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-slate-200 via-slate-100 to-transparent min-w-[2rem]" />
    </div>
  );
}

/** خانة بيانات المشترك: أيقونة في شارة + تسمية + قيمة */
function DataItem({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50/70 ring-1 ring-slate-100 p-3.5 hover:ring-slate-200 hover:bg-white transition-colors">
      <span className="w-9 h-9 rounded-xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center text-slate-500 flex-shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-400 mb-1">{label}</p>
        <p
          className={`text-sm font-black text-slate-800 break-all leading-snug ${mono ? 'font-mono text-xs tracking-tight' : ''}`}
          dir={mono ? 'ltr' : undefined}
          style={mono ? { textAlign: 'right' } : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/** بطاقة مالية Premium: شريط لوني علوي + شارة أيقونة + رقم كبير */
const FIN_TONES = {
  blue: { chip: 'bg-blue-50 text-blue-600', bar: 'from-blue-500 to-indigo-500', text: 'text-blue-700' },
  teal: { chip: 'bg-cyan-50 text-cyan-700', bar: 'from-cyan-500 to-teal-500', text: 'text-cyan-800' },
  amber: { chip: 'bg-amber-50 text-amber-600', bar: 'from-amber-400 to-orange-500', text: 'text-amber-700' },
  violet: { chip: 'bg-violet-50 text-violet-600', bar: 'from-violet-500 to-fuchsia-500', text: 'text-violet-700' },
} as const;

function FinTile({ icon, label, value, tone, extra }: {
  icon: React.ReactNode; label: string; value: string;
  tone: keyof typeof FIN_TONES; extra?: React.ReactNode;
}) {
  const t = FIN_TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.05)] p-4 hover:shadow-[0_10px_28px_-14px_rgba(30,64,175,0.28)] transition-shadow">
      <span className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l ${t.bar}`} />
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`w-9 h-9 rounded-xl ${t.chip} flex items-center justify-center flex-shrink-0`}>{icon}</span>
        <span className="text-xs font-bold text-slate-500">{label}</span>
      </div>
      <p className={`text-xl font-black tabular-nums break-all leading-snug ${t.text}`}>{value}</p>
      {extra}
    </div>
  );
}

/** مؤشر KPI زجاجي داخل واجهة البحث الداكنة */
function HeroKpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm p-4">
      <span className="absolute top-0 inset-x-3 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent" />
      <div className="flex items-center gap-2 text-slate-300/90 text-[11px] font-bold mb-1.5">
        <span className="text-cyan-300/80">{icon}</span>{label}
      </div>
      <p className="text-2xl font-black text-white tabular-nums">{value}</p>
    </div>
  );
}

/** شارة مفتاح بحث (تلميح داخل واجهة البحث) */
function SearchKeyChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300/80 bg-white/[0.05] ring-1 ring-white/10 rounded-full px-2.5 py-1">
      <span className="text-cyan-300/70">{icon}</span>{label}
    </span>
  );
}

// ═══════════════════════════ اللوحة الرئيسية ═══════════════════════════

export function AdminPanel({ subscribers, operations, sectionName, systemConfig }: {
  subscribers: Subscriber[];
  operations: Operation[];
  sectionName: string;
  systemConfig: SystemConfig;
}) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);
  const [opsPage, setOpsPage] = useState(1);
  const [showWallet, setShowWallet] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [withdrawalStage, setWithdrawalStage] = useState<'idle' | 'confirm' | 'processing' | 'completed'>('idle');
  const [withdrawalProgress, setWithdrawalProgress] = useState(0);
  const [showCMSExperience, setShowCMSExperience] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CMS المشترك المحلول مرة واحدة فقط — resolveCMS يُنشئ كائناً جديداً في كل مرة،
  // وتمريره كائن جديد كل tick كان يعيد تركيب داشبورد العميل من الجذر (رفة/اهتزاز).
  const foundCms = useMemo(() => (found?.cms ? resolveCMS(found.cms) : null), [found]);

  const runSearch = () => {
    if (!query.trim()) return;
    // reset
    setSearched(false);
    setFound(null);
    setIsSearching(true);
    setProgress(0);
    setOpsPage(1);
    setShowWallet(false);
    setWithdrawalStage('idle');
    setWithdrawalProgress(0);
    setShowCMSExperience(false);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          const q = query.trim().toLowerCase();
          const res = subscribers.find(s =>
            s.name.toLowerCase().includes(q) ||
            s.iban.toLowerCase().includes(q) ||
            (s.accountNumber||'').toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            (s.phoneCountryCode||'').includes(q) ||
            s.systemAccount.toLowerCase().includes(q) ||
            (s.systemAccountValue||'').toLowerCase().includes(q) ||
            s.walletAddress.toLowerCase().includes(q) ||
            (s.walletAddressValue||'').toLowerCase().includes(q) ||
            (s.walletPlatform||'').toLowerCase().includes(q) ||
            (s.bankName||'').toLowerCase().includes(q)
          );
          setFound(res ?? null);
          setSearched(true);
          setIsSearching(false);
          setProgress(0);
        }, 400);
      } else {
        setProgress(p);
      }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // منطق شريط تقدم السحب — 20 ثانية (100 خطوة × 200ms)
  useEffect(() => {
    if (withdrawalStage === 'processing') {
      setWithdrawalProgress(0);
      const iv = setInterval(() => {
        setWithdrawalProgress(p => {
          const next = Math.min(100, p + 1);
          if (next >= 100) {
            clearInterval(iv);
            setWithdrawalStage('completed');
          }
          return next;
        });
      }, 200);
      return () => clearInterval(iv);
    }
  }, [withdrawalStage]);

  const subscriberOps = useMemo(() => {
    if (!found) return [];
    return operations.filter(op => op.subscriberName === found.name);
  }, [found, operations]);

  const totalOpsPages = Math.max(1, Math.ceil(subscriberOps.length / OPS_PER_PAGE));
  const pagedOps = subscriberOps.slice((opsPage - 1) * OPS_PER_PAGE, opsPage * OPS_PER_PAGE);

  const clear = () => {
    setQuery(''); setFound(null); setSearched(false); setOpsPage(1);
    setIsSearching(false); setProgress(0); setWithdrawalProgress(0); setWithdrawalStage('idle');
    setShowCMSExperience(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const queryExperience = resolveSubscriberExperience(systemConfig.subscriberExperience);

  // الأحرف الأولى من اسم المشترك (للأفاتار)
  const initials = found ? found.name.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join(' ') : '';
  const hasFinancial = !!(found && (found.subscriptionAmount > 0 || found.profits > 0 || found.systemFees > 0 || found.walletAddress));

  return (
    <>
      {/* ═══════════ ترويسة الوحدة ═══════════ */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center text-blue-700">
            <ScanSearch size={20} />
          </span>
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">{sectionName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">وحدة الاستعلام المؤسسية — بحث موحّد وعرض ملف المشترك الكامل</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-slate-500 font-bold flex items-center gap-1.5">
            <Database size={12} className="text-blue-600" /> {subscribers.length} مشترك
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-slate-500 font-bold flex items-center gap-1.5">
            <Lock size={12} className="text-blue-600" /> قناة محلية مؤمّنة
          </span>
        </div>
      </div>

      {/* ═══════════ واجهة البحث — لوحة القيادة الداكنة ═══════════ */}
      <div className="qx-hero rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-900/40">
        <div className="relative z-10 p-5 sm:p-7 lg:p-10">
          {/* هوية الشركة */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-7 lg:mb-9">
            <div className="flex items-center gap-4 min-w-0">
              {queryExperience.companyLogo ? (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 ring-1 ring-white/40 shadow-xl flex items-center justify-center p-2 flex-shrink-0">
                  <img src={queryExperience.companyLogo} alt={queryExperience.companyName} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 ring-1 ring-white/25 shadow-xl flex items-center justify-center flex-shrink-0">
                  <Search size={22} className="text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-black text-cyan-300/90 mb-1">{queryExperience.companyName}</p>
                <h3 className="text-xl sm:text-2xl lg:text-[2rem] font-black text-white leading-tight">
                  {queryExperience.welcomeTitle || 'الاستعلام عن المشترك'}
                </h3>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-200/90 bg-white/[0.06] ring-1 ring-white/10 rounded-full px-3 py-1.5">
                <Shield size={12} /> قناة استعلام مؤمّنة
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300/80 bg-white/[0.06] ring-1 ring-white/10 rounded-full px-3 py-1.5">
                <Fingerprint size={12} /> بحث موحّد متعدد الحقول
              </span>
            </div>
          </div>

          {/* حقل البحث الرئيسي */}
          <div className="max-w-3xl">
            <label className="block text-xs font-bold text-slate-300/80 mb-2.5">حدّد هوية المشترك للبدء</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 rounded-2xl bg-white/[0.07] ring-1 ring-white/15 backdrop-blur-sm transition-all focus-within:ring-cyan-300/50 focus-within:bg-white/[0.10]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="أدخل الاسم، IBAN، رقم الهاتف، المحفظة أو حساب النظام..."
                  className="bg-transparent border-0 h-12 lg:h-14 pr-12 pl-4 text-sm lg:text-base font-bold text-white placeholder:text-slate-500 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runSearch()}
                  disabled={isSearching}
                />
              </div>
              <div className="flex gap-2.5">
                <Button onClick={runSearch} disabled={isSearching}
                  className="h-12 lg:h-14 flex-1 sm:flex-none px-7 rounded-2xl bg-gradient-to-l from-blue-600 via-indigo-600 to-indigo-700 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-indigo-950/50 transition-all whitespace-nowrap disabled:opacity-70">
                  {isSearching ? 'جارٍ البحث…' : <span className="flex items-center gap-2"><ScanSearch size={17} /> استعلام الآن</span>}
                </Button>
                {(searched || isSearching) && (
                  <Button variant="outline" onClick={clear}
                    className="h-12 lg:h-14 w-12 rounded-2xl bg-transparent border-white/20 border text-white hover:bg-white/10 hover:text-white px-0"
                    title="بحث جديد">
                    <X size={17} />
                  </Button>
                )}
              </div>
            </div>

            {/* مفاتيح البحث المدعومة */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5">
              <span className="text-[10px] font-bold text-slate-400 ml-1">مفاتيح البحث:</span>
              <SearchKeyChip icon={<Shield size={10} />} label="الاسم" />
              <SearchKeyChip icon={<CreditCard size={10} />} label="الآيبان IBAN" />
              <SearchKeyChip icon={<Phone size={10} />} label="رقم الهاتف" />
              <SearchKeyChip icon={<Wallet size={10} />} label="عنوان المحفظة" />
              <SearchKeyChip icon={<Database size={10} />} label="حساب النظام" />
              <SearchKeyChip icon={<Hash size={10} />} label="رقم الحساب" />
            </div>
          </div>

          {/* حالة البحث الجارية */}
          <AnimatePresence>
            {isSearching && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 max-w-3xl rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2.5 text-xs text-slate-200 font-bold">
                    <span className="relative flex w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-cyan-300" />
                    </span>
                    جارٍ الفحص عبر قاعدة بيانات المشتركين…
                  </span>
                  <span className="text-sm font-black text-cyan-300 tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-cyan-400 via-sky-400 to-indigo-500"
                    style={{ width: `${progress}%`, left: 'auto' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                  <div className="qx-sweep" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 tabular-nums">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* مؤشرات سريعة */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-7 lg:mt-9 max-w-3xl">
            <HeroKpi icon={<Users size={13} />} label="إجمالي المشتركين"
              value={systemConfig.queryCardOverrides?.totalSubscribers || String(subscribers.length)} />
            <HeroKpi icon={<CheckCircle2 size={13} />} label="نشطون"
              value={systemConfig.queryCardOverrides?.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length)} />
            <HeroKpi icon={<AlertCircle size={13} />} label="رسوم مستحقة"
              value={systemConfig.queryCardOverrides?.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length)} />
          </div>
        </div>
      </div>

      {/* ═══════════ النتائج ═══════════ */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardContent className="py-14 px-6 flex flex-col items-center gap-4 text-center">
                <div className="relative w-16 h-16 rounded-2xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center">
                  <Search size={26} className="text-slate-300" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center shadow-sm">
                    <X size={12} className="text-slate-400" />
                  </span>
                </div>
                <div>
                  <p className="text-base font-black text-slate-700">لم يُعثر على مشترك مطابق</p>
                  <p className="text-sm text-slate-400 mt-1 leading-6">تحقق من البيانات المُدخلة وحاول مرة أخرى — يدعم البحث بالاسم أو الآيبان أو الهاتف أو المحفظة أو حساب النظام</p>
                </div>
                <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 px-4 py-2 text-xs text-slate-500 font-mono" dir="ltr">"{query}"</div>
                <Button variant="outline" onClick={clear} className="gap-2 border-slate-200 rounded-xl h-10">
                  <RefreshCw size={14} /> بحث جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {searched && found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* ── 1) بطاقة الملف الشخصي — شريط هوية داكن + شبكة بيانات ── */}
            <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
              <div className="qx-band relative">
                <div className="relative z-10 p-5 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 flex items-center justify-center ring-4 ring-white/10 shadow-xl text-white text-xl lg:text-2xl font-black">
                        {initials}
                      </div>
                      <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-[#0b1220] flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl lg:text-2xl font-black text-white">{found.name}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-cyan-200 bg-white/10 ring-1 ring-white/15 rounded-full px-2.5 py-1">
                          <BadgeCheck size={11} /> موثّق
                        </span>
                        {found.subscriberStatus && subStatusBadge(found.subscriberStatus)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[11px] sm:text-xs text-slate-300/80">
                        {found.joinDate && (
                          <span className="flex items-center gap-1.5"><Calendar size={12} className="text-cyan-300/70" /> عضو منذ {found.joinDate}</span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Fingerprint size={12} className="text-cyan-300/70" />
                          نتيجة مطابقة لـ <span className="font-mono text-cyan-200" dir="ltr">"{query}"</span>
                        </span>
                      </div>
                    </div>
                    <div className="sm:text-left flex-shrink-0">
                      <div className="rounded-2xl bg-white/[0.07] ring-1 ring-white/10 px-4 py-3 text-center min-w-[6rem]">
                        <p className="text-[10px] text-slate-300/70 font-bold mb-0.5">العمليات المسجّلة</p>
                        <p className="text-2xl font-black text-white tabular-nums">{subscriberOps.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-5 lg:p-6 space-y-5">
                <SectionTitle icon={<Fingerprint size={15} />} title="بيانات المشترك" hint="الحقول الظاهرة حسب إعدادات الخصوصية المعتمدة" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {found.phone && (found.phoneVisible!==false) && <DataItem icon={<Phone size={14} />} label="الجوال" value={found.phoneCountryCode ? `${found.phoneCountryCode} ${found.phone}` : found.phone} mono />}
                  {found.iban && (found.ibanVisible!==false) && <DataItem icon={<CreditCard size={14} />} label="الآيبان" value={found.iban} mono />}
                  {found.accountNumber && (found.accountNumberVisible!==false) && <DataItem icon={<Hash size={14} />} label="رقم الحساب" value={found.accountNumber} mono />}
                  {found.bankName && <DataItem icon={<Building2 size={14} />} label="البنك" value={found.bankName} />}
                  {found.systemAccount && <DataItem icon={<Database size={14} />} label="حساب النظام" value={found.systemAccountValue||found.systemAccount} mono />}
                  {found.currency && <DataItem icon={<Globe size={14} />} label="العملة" value={`${found.currency} ${found.subscriptionCurrencySymbol||''}`} />}
                  {found.platform && <DataItem icon={<Cpu size={14} />} label="المنصة" value={found.platform} />}
                  {found.walletPlatform && <DataItem icon={<Cpu size={14} />} label="منصة المحفظة" value={`${found.walletPlatform} ${found.walletCurrency||''}`} />}
                  {found.bankCountry && <DataItem icon={<Globe size={14} />} label="دولة البنك" value={found.bankCountry} />}
                </div>

                {found.notes && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 ring-1 ring-amber-200/70">
                    <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-amber-700 mb-1">ملاحظات إدارية</p>
                      <p className="text-sm text-slate-700 leading-6">{found.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── 2) الملخص المالي — بطاقات Premium ── */}
            {hasFinancial && (
              <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-5 lg:p-6 space-y-5">
                  <SectionTitle icon={<Coins size={15} />} title="الملخص المالي" hint="الأرصدة المعتمدة بعملاتها الأصلية" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {found.subscriptionAmount > 0 && (
                      <FinTile tone="blue" icon={<Wallet size={16} />} label="مبلغ الاشتراك"
                        value={`${found.subscriptionAmount.toLocaleString()} ${found.subscriptionCurrencySymbol||found.subscriptionCurrency||'ر.س'}`} />
                    )}
                    {found.profits > 0 && (
                      <FinTile tone="teal" icon={<TrendingUp size={16} />} label="الأرباح"
                        value={`${found.profits.toLocaleString()} ${found.profitsCurrencySymbol||found.profitsCurrency||'ر.س'}`} />
                    )}
                    {found.systemFees > 0 && (
                      <FinTile tone="amber" icon={<AlertCircle size={16} />} label="رسوم النظام"
                        value={`${found.systemFees.toLocaleString()} ${found.systemFeesCurrencySymbol||found.systemFeesCurrency||'ر.س'}`} />
                    )}
                    {found.walletAddress && (
                      <FinTile tone="violet" icon={<Hash size={16} />} label="المحفظة الرقمية"
                        value={showWallet ? found.walletAddress : `${found.walletAddress.slice(0, 12)}…`}
                        extra={
                          <button onClick={() => setShowWallet(v => !v)}
                            className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-violet-600 hover:text-violet-800 font-black transition-colors">
                            {showWallet ? <EyeOff size={11} /> : <Eye size={11} />}
                            {showWallet ? 'إخفاء العنوان' : 'عرض العنوان الكامل'}
                          </button>
                        } />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* تجربة بوابة المشترك المخصصة — تظهر مباشرة بعد الملخص المالي */}
            <SubscriberQueryExperience experience={queryExperience} subscriberName={found.name} />

            {/* ── 3) مُطلِق تطبيق العميل (CMS) — تجربة مستقلة بملء الشاشة ── */}
            {foundCms && (
              <Card className="border-none shadow-lg ring-1 ring-violet-200/80 overflow-hidden">
                <div className="relative bg-gradient-to-l from-violet-50/90 via-white to-white p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-5">
                  <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-l from-violet-500 via-fuchsia-500 to-indigo-500" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0 ring-1 ring-white/50">
                    <LayoutGrid size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-slate-800">تطبيق العميل — تجربة CMS مستقلة</h3>
                      <Badge className="bg-violet-100 text-violet-700 border border-violet-200 text-[10px] font-black">منفصلة بالكامل</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-6">
                      يُفتح في واجهة مستقلة بملء الشاشة بتصفّحها الخاص، ويعرض حصرياً مكوّنات ومحتوى هذا المشترك من إعدادات CMS — دون أي مزج مع بطاقات نظام الاستعلام.
                    </p>
                  </div>
                  <Button onClick={() => setShowCMSExperience(true)}
                    className="h-12 px-6 rounded-2xl gap-2 bg-gradient-to-l from-violet-600 to-indigo-600 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-violet-500/30 whitespace-nowrap flex-shrink-0">
                    <ExternalLink size={16} /> فتح التطبيق
                  </Button>
                </div>
              </Card>
            )}

            {/* ── 4) سجل عمليات المشترك ── */}
            {subscriberOps.length > 0 && (
              <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <CardContent className="p-5 lg:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <SectionTitle icon={<ClipboardList size={15} />} title="سجل عمليات المشترك" hint="جميع العمليات المرتبطة بهذا الملف" />
                    <Badge className="bg-slate-100 text-slate-600 border-none text-xs font-bold tabular-nums flex-shrink-0">{subscriberOps.length} عملية</Badge>
                  </div>
                  <div className="rounded-2xl ring-1 ring-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/90 hover:bg-slate-50/90 border-slate-100">
                            <TableHead className="text-[11px] font-black text-slate-500 w-10 text-center">#</TableHead>
                            {['العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                              <TableHead key={h} className="text-[11px] font-black text-slate-500">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedOps.map((op, i) => (
                            <TableRow key={op.id} className="border-slate-50 hover:bg-blue-50/40 transition-colors">
                              <TableCell className="text-xs text-slate-400 tabular-nums font-bold text-center">{(opsPage - 1) * OPS_PER_PAGE + i + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <span className="w-7 h-7 rounded-lg bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                    <ArrowLeftRight size={12} />
                                  </span>
                                  <span className="text-sm font-bold text-slate-700">{op.operation}</span>
                                </div>
                              </TableCell>
                              <TableCell className={`text-sm font-black tabular-nums ${amountColor(op.status)}`}>{op.amount}</TableCell>
                              <TableCell className="text-xs text-slate-500 tabular-nums">{op.date}</TableCell>
                              <TableCell>{statusBadge(op.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {totalOpsPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
                        <span className="text-xs text-slate-400 font-bold">صفحة <span className="text-slate-700 tabular-nums">{opsPage}</span> من {totalOpsPages}</span>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs rounded-lg"
                            disabled={opsPage === 1} onClick={() => setOpsPage(p => p - 1)}>
                            <ChevronRight size={13} /> السابق
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs rounded-lg"
                            disabled={opsPage === totalOpsPages} onClick={() => setOpsPage(p => p + 1)}>
                            التالي <ChevronLeft size={13} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── 5) خدمة سحب الأرباح ── */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardContent className="p-5 lg:p-6 space-y-4">
                <SectionTitle icon={<Banknote size={15} />} title="خدمة سحب الأرباح" hint="طلب سحب مرتبط بهذا الملف" />
                <div className="flex flex-col items-center gap-3 pt-1">
                  {withdrawalStage === 'idle' && (
                    <div className="flex flex-col items-center gap-2.5">
                      <Button onClick={() => setWithdrawalStage('confirm')}
                        className="gap-2.5 h-12 px-8 text-base font-black rounded-2xl bg-gradient-to-l from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-all">
                        <Banknote size={18} /> سحب الأرباح
                      </Button>
                      <p className="text-[11px] text-slate-400">اضغط لبدء طلب سحب أرباح المشترك</p>
                    </div>
                  )}
                  {withdrawalStage === 'confirm' && (
                    <div className="w-full max-w-md rounded-2xl bg-blue-50/60 ring-1 ring-blue-100 p-5 flex flex-col items-center gap-4 text-center">
                      <span className="w-11 h-11 rounded-2xl bg-white ring-1 ring-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                        <Banknote size={20} />
                      </span>
                      <p className="text-sm font-black text-slate-700">هل تريد تأكيد طلب سحب الأرباح؟</p>
                      <div className="flex flex-wrap justify-center gap-2.5">
                        <Button onClick={() => setWithdrawalStage('processing')}
                          className="gap-2 h-11 px-6 rounded-2xl bg-gradient-to-l from-blue-600 to-indigo-600 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-blue-500/25">
                          <CheckCircle2 size={16} /> تأكيد سحب الأرباح
                        </Button>
                        <Button variant="outline" onClick={() => setWithdrawalStage('idle')}
                          className="h-11 px-5 rounded-2xl border-slate-200 text-slate-500 font-bold text-sm">
                          رجوع
                        </Button>
                      </div>
                    </div>
                  )}
                  {withdrawalStage === 'processing' && (
                    <div className="w-full max-w-md text-center">
                      <p className="text-sm font-black text-slate-700 mb-3 flex items-center justify-center gap-2">
                        <RefreshCw size={15} className="animate-spin text-cyan-500" />
                        جارٍ فحص طلبك
                      </p>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden ring-1 ring-slate-200/60">
                        <motion.div
                          className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-red-500"
                          style={{ width: `${withdrawalProgress}%` }}
                          animate={{ width: `${withdrawalProgress}%` }}
                          transition={{ duration: 0.2, ease: 'linear' }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 tabular-nums items-center">
                        <span>0%</span>
                        <span className="text-base font-black text-slate-700 tabular-nums">{withdrawalProgress}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                  {withdrawalStage === 'completed' && (
                    <div className="w-full max-w-lg rounded-2xl bg-gradient-to-l from-rose-50 to-red-50 ring-1 ring-red-200 p-5 text-center shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={22} className="text-red-600" />
                      </div>
                      <p className="text-base font-black text-red-700 mb-2">لم يتم تأكيد السحب من قبل النظام</p>
                      <p className={found?.withdrawalText ? 'text-sm font-bold text-slate-800 leading-7' : 'text-sm font-black text-red-500'}>
                        {found?.withdrawalText || 'لا يوجد نص سحب مُدخل لهذا المشترك.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── 6) الطباعة والتصدير ── */}
            <div className="flex flex-col items-center gap-2.5 pt-1">
              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <FileText size={11} /> طباعة وتصدير ملف المشترك
              </p>
              <PrintMenu found={found} subscriberOps={subscriberOps} queryText={query} />
            </div>

            {/* ── 7) سجل جميع العمليات ── */}
            <AllOperationsLog operations={operations} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ تجربة تطبيق العميل المستقلة (CMS) — ملء الشاشة ═══════════ */}
      <AnimatePresence>
        {showCMSExperience && found && foundCms && (
          <CMSExperience
            key="cms-experience"
            subscriber={found}
            operations={operations}
            cms={foundCms}
            onClose={() => setShowCMSExperience(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
