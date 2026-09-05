// نظام الإستعلام عن الأرباح (لوحة الإدارة)

import { Subscriber, Operation, SystemConfig } from '@/types';
import { resolveSubscriberExperience } from '@/config/system';
import { amountColor, statusBadge, subStatusBadge } from '@/components/shared/StatusBadges';
import { SubscriberQueryExperience } from '@/components/experience/SubscriberQueryExperience';
import { SubscriberDashboard } from '@/components/cms/SubscriberDashboard';
import { resolveCMS } from '@/data/cms-defaults';
import { OPS_PER_PAGE } from '@/constants/app';
import { AllOperationsLog } from '@/components/admin/AllOperationsLog';
import { MiniInfo } from '@/components/shared/MiniInfo';
import { FinBox } from '@/components/shared/FinBox';
import { PrintMenu } from '@/components/shared/PrintMenu';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, TrendingUp, Wallet, Search, CheckCircle2, AlertCircle, CreditCard, Phone, User, Shield, ClipboardList, X, Hash, Building2, ChevronLeft, ChevronRight, RefreshCw, Eye, EyeOff, AlertTriangle, Database, Calendar, Banknote, Globe, Cpu, Layout,
} from 'lucide-react';

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
  const [showCMSDashboard, setShowCMSDashboard] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // CMS المشترك المحلول مرة واحدة فقط — resolveCMS يُنشئ كائناً جديداً في كل مرة،
  //وتمريره كائن جديد كل tick كان يعيد تركيب داشبورد العميل من الجذر (رفة/اهتزاز).
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
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const queryExperience = resolveSubscriberExperience(systemConfig.subscriberExperience);

  return (
    <>
      <div>
        <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
        <p className="text-sm text-slate-400 mt-0.5">البحث عن مشترك وعرض تفاصيله الكاملة</p>
      </div>

      {/* Search Card */}
      <div className="rounded-2xl overflow-hidden shadow-xl">
        <div className="query-hero relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full -ml-28 -mb-28 blur-3xl pointer-events-none" />
          <div className="relative z-10 p-6 lg:p-8">
            <div className="flex items-start gap-4 mb-6">
              {queryExperience.companyLogo ? (
                <img src={queryExperience.companyLogo} alt={queryExperience.companyName} className="w-12 h-12 rounded-2xl bg-white object-contain p-1 shadow-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 ring-1 ring-cyan-300/30 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Search size={22} className="text-cyan-200" />
                </div>
              )}
              <div>
                <p className="text-xs text-cyan-200 font-bold mb-0.5">{queryExperience.companyName}</p>
                <h3 className="text-xl font-black text-white">{queryExperience.welcomeTitle || 'الاستعلام عن المشترك'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ابحث بالاسم · الآيبان · رقم الهاتف · عنوان المحفظة · حساب النظام</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="أدخل الاسم، IBAN، رقم الهاتف..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 pr-11 text-sm rounded-xl focus:bg-white/15 focus:border-blue-400 transition-all h-12"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runSearch()}
                  disabled={isSearching}
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              </div>
              <Button onClick={runSearch} disabled={isSearching}
                className="h-12 w-full sm:w-auto px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap disabled:opacity-70">
                {isSearching ? 'جاري البحث...' : 'استعلام الآن'}
              </Button>
              {(searched || isSearching) && (
                <Button variant="outline" onClick={clear}
                  className="h-12 w-full sm:w-12 border-white/20 text-white hover:bg-white/10 rounded-xl px-3">
                  <X size={17} />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isSearching && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">جارٍ البحث في قاعدة البيانات...</span>
                    <span className="text-sm font-black text-emerald-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${progress}%`, left: 'auto' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent rounded-full pointer-events-none" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span><span>100%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              {[
                { label: 'إجمالي المشتركين', value: systemConfig.queryCardOverrides?.totalSubscribers || String(subscribers.length), icon: <Users size={13} /> },
                { label: 'نشطون', value: systemConfig.queryCardOverrides?.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length), icon: <CheckCircle2 size={13} /> },
                { label: 'رسوم مستحقة', value: systemConfig.queryCardOverrides?.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length), icon: <AlertCircle size={13} /> },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">{item.icon}{item.label}</div>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardContent className="py-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={26} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-slate-700">لم يُعثر على مشترك</p>
                  <p className="text-sm text-slate-400 mt-1">تحقق من البيانات المُدخلة وحاول مرة أخرى</p>
                </div>
                <Button variant="outline" onClick={clear} className="gap-2 border-slate-200">
                  <RefreshCw size={14} /> بحث جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {searched && found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Profile Card */}
            <Card className="border-none shadow-md ring-1 ring-slate-200 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <User size={36} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-slate-800">{found.name}</h3>
                      {found.subscriberStatus && subStatusBadge(found.subscriberStatus)}
                      <Badge className="bg-slate-100 text-slate-500 border-none text-xs gap-1"><Shield size={10} />موثّق</Badge>
                    </div>
                    {found.joinDate && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                        <Calendar size={11} /> عضو منذ {found.joinDate}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {found.phone && (found.phoneVisible!==false) && <MiniInfo icon={<Phone size={13} />} label="الجوال" value={found.phoneCountryCode ? `${found.phoneCountryCode} ${found.phone}` : found.phone} />}
                      {found.iban && (found.ibanVisible!==false) && <MiniInfo icon={<CreditCard size={13} />} label="الآيبان" value={found.iban} mono />}
                      {found.accountNumber && (found.accountNumberVisible!==false) && <MiniInfo icon={<Hash size={13} />} label="رقم الحساب" value={found.accountNumber} mono />}
                      {found.bankName && <MiniInfo icon={<Building2 size={13} />} label="البنك" value={found.bankName} />}
                      {found.systemAccount && <MiniInfo icon={<Database size={13} />} label="حساب النظام" value={found.systemAccountValue||found.systemAccount} mono />}
                      {found.currency && <MiniInfo icon={<Globe size={13} />} label="العملة" value={`${found.currency} ${found.subscriptionCurrencySymbol||''}`} />}
                      {found.platform && <MiniInfo icon={<Cpu size={13} />} label="المنصة" value={found.platform} />}
                      {found.walletPlatform && <MiniInfo icon={<Cpu size={13} />} label="منصة المحفظة" value={`${found.walletPlatform} ${found.walletCurrency||''}`} />}
                      {found.bankCountry && <MiniInfo icon={<Globe size={13} />} label="دولة البنك" value={found.bankCountry} />}
                    </div>
                  </div>
                </div>

                {/* Financial - مع عملات اختيارية وشعارات */}
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {found.subscriptionAmount > 0 && (
                    <FinBox icon={<Wallet size={17} className="text-blue-500" />} label="مبلغ الاشتراك"
                      value={`${found.subscriptionAmount.toLocaleString()} ${found.subscriptionCurrencySymbol||found.subscriptionCurrency||'ر.س'}`} bg="bg-blue-50" ring="ring-blue-200" color="text-blue-700" />
                  )}
                  {found.profits > 0 && (
                    <FinBox icon={<TrendingUp size={17} className="text-emerald-500" />} label="الأرباح"
                      value={`${found.profits.toLocaleString()} ${found.profitsCurrencySymbol||found.profitsCurrency||'ر.س'}`} bg="bg-emerald-50" ring="ring-emerald-200" color="text-emerald-700" />
                  )}
                  {found.systemFees > 0 && (
                    <FinBox icon={<AlertCircle size={17} className="text-orange-500" />} label="رسوم النظام"
                      value={`${found.systemFees.toLocaleString()} ${found.systemFeesCurrencySymbol||found.systemFeesCurrency||'ر.س'}`} bg="bg-orange-50" ring="ring-orange-200" color="text-orange-600" />
                  )}
                  {found.walletAddress && (
                    <FinBox icon={<Hash size={17} className="text-purple-500" />} label="المحفظة الرقمية"
                      value={showWallet ? found.walletAddress : `${found.walletAddress.slice(0, 12)}…`}
                      bg="bg-purple-50" ring="ring-purple-200" color="text-purple-700"
                      extra={
                        <button onClick={() => setShowWallet(v => !v)}
                          className="mt-1 flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors">
                          {showWallet ? <EyeOff size={11} /> : <Eye size={11} />}
                          {showWallet ? 'إخفاء' : 'عرض الكامل'}
                        </button>
                      }
                    />
                  )}
                </div>

                {found.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-yellow-50 ring-1 ring-yellow-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{found.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* تجربة بوابة المشترك المخصصة — تظهر مباشرة بعد الملف الشخصي */}
            <SubscriberQueryExperience experience={queryExperience} subscriberName={found.name} />

            {/* ══════ عرض تطبيق العميل المخصص (CMS) ══════ */}
            {foundCms && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Button variant={showCMSDashboard ? 'default' : 'outline'} size="sm" className={`gap-1.5 text-xs ${showCMSDashboard ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                    onClick={() => setShowCMSDashboard(!showCMSDashboard)}>
                    <Layout size={13} /> {showCMSDashboard ? 'إخفاء تطبيق العميل' : 'عرض تطبيق العميل (CMS)'}
                  </Button>
                  {showCMSDashboard && <Badge className="bg-violet-50 text-violet-700 border-violet-200">معاينة التطبيق المخصص</Badge>}
                </div>
                {showCMSDashboard && (
                  <div className="rounded-2xl border-2 border-violet-200 overflow-hidden shadow-xl">
                    <SubscriberDashboard subscriber={found} operations={operations} cms={foundCms} />
                  </div>
                )}
              </div>
            )}

            {/* Operations for this subscriber - تظهر فقط عند وجود عمليات */}
            {subscriberOps.length > 0 && (
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black text-slate-800">سجل عمليات المشترك</CardTitle>
                  <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{subscriberOps.length} عملية</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {subscriberOps.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <ClipboardList size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">لا توجد عمليات مسجّلة لهذا المشترك</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            {['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                              <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedOps.map((op, i) => (
                            <TableRow key={op.id} className="hover:bg-slate-50/80">
                              <TableCell className="text-slate-400 text-xs">{(opsPage - 1) * OPS_PER_PAGE + i + 1}</TableCell>
                              <TableCell className="text-sm text-slate-600">{op.operation}</TableCell>
                              <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                              <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                              <TableCell>{statusBadge(op.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {totalOpsPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">صفحة {opsPage} من {totalOpsPages}</span>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                            disabled={opsPage === 1} onClick={() => setOpsPage(p => p - 1)}>
                            <ChevronRight size={13} /> السابق
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                            disabled={opsPage === totalOpsPages} onClick={() => setOpsPage(p => p + 1)}>
                            التالي <ChevronLeft size={13} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            )}

            {/* سحب الأرباح */}
            <div className="flex justify-center pt-2 pb-1">
              {withdrawalStage === 'idle' && (
                <Button onClick={() => setWithdrawalStage('confirm')}
                  className="gap-2 h-11 px-6 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-amber-400/25 transition-all text-base">
                  <Banknote size={18} /> سحب الأرباح
                </Button>
              )}
              {withdrawalStage === 'confirm' && (
                <Button onClick={() => setWithdrawalStage('processing')}
                  className="gap-2 h-11 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-base">
                  <CheckCircle2 size={18} /> تأكيد سحب الأرباح
                </Button>
              )}
              {withdrawalStage === 'processing' && (
                <div className="w-full max-w-md mx-auto text-center">
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-emerald-500" />
                    جارٍ فحص طلبك
                  </p>
                  <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-amber-400 to-red-500 rounded-full"
                      style={{ width: `${withdrawalProgress}%` }}
                      animate={{ width: `${withdrawalProgress}%` }}
                      transition={{ duration: 0.2, ease: 'linear' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1.5 items-center">
                    <span>0%</span>
                    <span className="text-base font-black text-slate-700 tabular-nums">{withdrawalProgress}%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              {withdrawalStage === 'completed' && (
                <div className="w-full max-w-lg mx-auto">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 ring-1 ring-red-200 text-center shadow-sm">
                    <AlertCircle size={22} className="mx-auto mb-2 text-red-600" />
                    <p className="text-base font-black text-red-700 mb-2">لم يتم تأكيد السحب من قبل النظام</p>
                    <p className={found?.withdrawalText ? "text-sm font-medium text-slate-800 leading-relaxed" : "text-sm font-bold text-red-500"}>
                      {found?.withdrawalText || 'لا يوجد نص سحب مُدخل لهذا المشترك.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* زر الطباعة والتصدير */}
            <div className="flex justify-center pt-2 pb-1">
              <PrintMenu found={found} subscriberOps={subscriberOps} queryText={query} />
            </div>

            {/* All Operations Log */}
            <AllOperationsLog operations={operations} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
