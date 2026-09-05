// تبويب إضافة/إدارة المشتركين بنموذجه التفصيلي الكامل

import { Subscriber, Operation, SystemConfig } from '@/types';
import { WORLD_CURRENCIES } from '@/data/currencies';
import { TRADING_PLATFORMS } from '@/data/platforms';
import { OPERATION_TYPES, OPERATION_STATUSES, SUBSCRIBER_STATUSES, EMPTY_SUB, SUBS_PER_PAGE } from '@/constants/app';
import { ALL_BANKS_FLAT, ARAB_BANKS_DATABASE } from '@/data/banks';
import { PHONE_COUNTRIES, CRYPTO_CURRENCIES, WALLET_TYPES, BLOCKCHAIN_NETWORKS } from '@/data/geo';
import { LogoAvatar } from '@/components/shared/LogoAvatar';
import { SubRow } from '@/components/shared/SubRow';
import { FField } from '@/components/shared/FField';
import { PlatformItem } from '@/components/shared/PlatformItem';
import { resolveSubscriberExperience } from '@/config/system';
import { uid, todayStr } from '@/lib/random';
import { SubscriberExperienceBuilder } from '@/components/experience/SubscriberExperienceBuilder';
import { CMSBuilder } from '@/components/cms/CMSBuilder';
import { DEFAULT_CMS, resolveCMS } from '@/data/cms-defaults';
import { buildAkramDemo } from '@/data/akram-demo';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Users, TrendingUp, Wallet, Search, CheckCircle2, AlertCircle, CreditCard, Phone, User, ClipboardList, Plus, Pencil, X, Save, ChevronDown, Hash, Building2, UserPlus, ChevronLeft, ChevronRight, Eye, EyeOff, AlertTriangle, Database, Calendar, FileText, Banknote, Star, Globe, Cpu, FileDown, Monitor, ExternalLink, Play, FlaskConical,
} from 'lucide-react';

export function AddSubscriberTab({ subscribers, onSubscribersChange, sectionName, operations, onOperationsChange, systemConfig, onConfigChange }: {
  subscribers: Subscriber[];
  onSubscribersChange: (s: Subscriber[]) => void;
  sectionName: string;
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
  systemConfig: SystemConfig;
  onConfigChange: (partial: Partial<SystemConfig>) => void;
}) {
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>({ ...EMPTY_SUB });
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingOps, setPendingOps] = useState<{ operation: string; amount: string; date: string; status: string }[]>([]);
  const [showAddOps, setShowAddOps] = useState(false);
  const [tempOp, setTempOp] = useState({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' });
  const [page, setPage] = useState(1);
  const [searchSub, setSearchSub] = useState('');
  const [customBank, setCustomBank] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  // --- إضافات جراحية ---
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankCountryFilter, setBankCountryFilter] = useState<string>('الكل');
  const [bankOpen, setBankOpen] = useState(false);
  const [showIbanConfirm, setShowIbanConfirm] = useState(false);
  const [showAccountConfirm, setShowAccountConfirm] = useState(false);
  const [pendingIbanSave, setPendingIbanSave] = useState(false);
  const [pendingAccountSave, setPendingAccountSave] = useState(false);
  const [subCurrencyOpen, setSubCurrencyOpen] = useState(false);
  const [profitsCurrencyOpen, setProfitsCurrencyOpen] = useState(false);
  const [feesCurrencyOpen, setFeesCurrencyOpen] = useState(false);
  const [subCurrencySearch, setSubCurrencySearch] = useState('');
  const [profitsCurrencySearch, setProfitsCurrencySearch] = useState('');
  const [feesCurrencySearch, setFeesCurrencySearch] = useState('');
  const [sysAccTypeOpen, setSysAccTypeOpen] = useState(false);
  const [sysAccWalletTypeOpen, setSysAccWalletTypeOpen] = useState(false);
  const [sysAccNetworkOpen, setSysAccNetworkOpen] = useState(false);
  const [walletStep, setWalletStep] = useState<1|2|3>(1);
  const [duplicateWarning, setDuplicateWarning] = useState<{name:string, phone:string}|null>(null);
  const [oldNameForOpsUpdate, setOldNameForOpsUpdate] = useState<string>('');
  const [cmsData, setCmsData] = useState(() => resolveCMS(undefined));
  // المعاينة الحية + البيانات التجريبية
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<375 | 768 | 1280>(375);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  // لقطة مؤجلة (debounce 500ms) تُكتب للمعاينة الحية (iframe /preview)
  const [previewTick, setPreviewTick] = useState(0);
  useEffect(() => {
    if (!showPreview) return;
    const t = setTimeout(() => {
      try {
        const liveOps: Operation[] = pendingOps.map((op, i) => ({ id: 'pv' + i, subscriberName: form.name || 'عميل', ...op }));
        sessionStorage.setItem('msub_preview', JSON.stringify({ subscriber: buildPreviewSub(form), operations: liveOps, cms: cmsData }));
      } catch { /* تجاهل */ }
      setPreviewTick(x => x + 1);
    }, 500);
    return () => clearTimeout(t);
  }, [form, cmsData, pendingOps, showPreview]);
  const phoneCountryRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const subCurrencyRef = useRef<HTMLDivElement>(null);
  const profitsCurrencyRef = useRef<HTMLDivElement>(null);
  const feesCurrencyRef = useRef<HTMLDivElement>(null);

  // إغلاق dropdowns عند النقر خارجها
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) setPlatformOpen(false);
      if (phoneCountryRef.current && !phoneCountryRef.current.contains(e.target as Node)) setPhoneCountryOpen(false);
      if (bankRef.current && !bankRef.current.contains(e.target as Node)) setBankOpen(false);
      if (subCurrencyRef.current && !subCurrencyRef.current.contains(e.target as Node)) setSubCurrencyOpen(false);
      if (profitsCurrencyRef.current && !profitsCurrencyRef.current.contains(e.target as Node)) setProfitsCurrencyOpen(false);
      if (feesCurrencyRef.current && !feesCurrencyRef.current.contains(e.target as Node)) setFeesCurrencyOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // فلترة العملات الرئيسية (قديمة) + كريبتو
  const allCurrenciesForAmount = useMemo(() => {
    // دمج WORLD + CRYPTO
    const fiat = WORLD_CURRENCIES.map(c => ({ code: c.code, symbol: c.symbol, nameAr: c.nameAr, nameEn: c.nameEn, countryAr: c.countryAr, type: 'fiat' as const, logoUrl: '' }));
    const crypto = CRYPTO_CURRENCIES.map(c => ({ code: c.code, symbol: c.symbol, nameAr: c.nameAr, nameEn: c.nameEn, countryAr: 'عملة رقمية', type: 'crypto' as const, logoUrl: c.logoUrl }));
    return [...fiat, ...crypto];
  }, []);

  const filteredCurrenciesMain = useMemo(() => {
    if (!currencySearch.trim()) return WORLD_CURRENCIES;
    const q = currencySearch.toLowerCase();
    return WORLD_CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.countryAr.includes(q) ||
      c.countryEn.toLowerCase().includes(q) ||
      c.symbol.includes(q)
    );
  }, [currencySearch]);

  const filteredPlatforms = useMemo(() => {
    if (!platformSearch.trim()) return TRADING_PLATFORMS;
    const q = platformSearch.toLowerCase();
    return TRADING_PLATFORMS.filter(p => p.name.toLowerCase().includes(q) || p.type.includes(q));
  }, [platformSearch]);

  const cryptoPlatforms = filteredPlatforms.filter(p => p.type === 'crypto');
  const forexPlatforms = filteredPlatforms.filter(p => p.type === 'forex');

  const filteredPhoneCountries = useMemo(() => {
    if (!phoneCountrySearch.trim()) return PHONE_COUNTRIES;
    const q = phoneCountrySearch.toLowerCase();
    return PHONE_COUNTRIES.filter(c =>
      c.nameAr.includes(phoneCountrySearch) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  }, [phoneCountrySearch]);

  const priorityPhoneCountries = filteredPhoneCountries.filter(c => c.priority);
  const otherPhoneCountries = filteredPhoneCountries.filter(c => !c.priority);

  const filteredArabBanks = useMemo(() => {
    let banks = ARAB_BANKS_DATABASE;
    if (bankCountryFilter !== 'الكل') {
      banks = banks.filter(b => b.countryAr === bankCountryFilter || b.country === bankCountryFilter);
    }
    if (!bankSearch.trim()) return banks;
    const q = bankSearch.toLowerCase();
    return banks.filter(b =>
      b.nameAr.includes(bankSearch) ||
      b.nameEn.toLowerCase().includes(q) ||
      b.countryAr.includes(bankSearch) ||
      b.country.toLowerCase().includes(q)
    );
  }, [bankSearch, bankCountryFilter]);

  const bankCountriesList = useMemo(() => {
    const set = new Set(ARAB_BANKS_DATABASE.map(b => b.countryAr));
    return ['الكل', ...Array.from(set)];
  }, []);

  const selectedCurrency = WORLD_CURRENCIES.find(c => c.code === form.currency);
  const selectedPlatform = TRADING_PLATFORMS.find(p => p.name === form.platform);
  const selectedPhoneCountry = PHONE_COUNTRIES.find(c => c.iso === form.phoneCountryIso) || PHONE_COUNTRIES.find(c => c.dialCode === form.phoneCountryCode) || PHONE_COUNTRIES[0];

  const filtered = useMemo(() => {
    if (!searchSub.trim()) return subscribers;
    const q = searchSub.toLowerCase();
    return subscribers.filter(s =>
      s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.iban.toLowerCase().includes(q)
    );
  }, [subscribers, searchSub]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SUBS_PER_PAGE));
  const paged = filtered.slice((page - 1) * SUBS_PER_PAGE, page * SUBS_PER_PAGE);

  const set = (key: keyof Omit<Subscriber, 'id'>, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // تحسين: فلترة عملات المبلغ
  const filterCurrencyForAmount = (search: string) => {
    if (!search.trim()) return allCurrenciesForAmount;
    const q = search.toLowerCase();
    return allCurrenciesForAmount.filter(c => c.code.toLowerCase().includes(q) || c.nameAr.includes(search) || c.nameEn.toLowerCase().includes(q));
  };

  const handleSave = () => {
    const subName = form.name.trim();
    // إصلاح مشكلة التكرار
    if (!editId) {
      const duplicate = subscribers.find(s => (s.phone && form.phone && s.phone === form.phone) || (s.iban && form.iban && s.iban === form.iban));
      if (duplicate && !duplicateWarning) {
        setDuplicateWarning({ name: duplicate.name, phone: duplicate.phone });
        return;
      }
    }

    // منطق حفظ IBAN/حساب بعد تأكيد popup
    let finalForm = { ...form };
    if (!pendingIbanSave && form.iban) {
      // إذا لم يتم تأكيد الحفظ وهناك IBAN، نظهر popup
      setShowIbanConfirm(true);
      return;
    }
    if (!pendingAccountSave && form.accountNumber) {
      setShowAccountConfirm(true);
      return;
    }

    // دمج رقم الهاتف مع بادئة الدولة
    if (form.phone && selectedPhoneCountry) {
      const cleanNumber = form.phone.replace(selectedPhoneCountry.dialCode, '').trim();
      finalForm.phone = `${selectedPhoneCountry.dialCode}${cleanNumber}`;
      finalForm.phoneCountryCode = selectedPhoneCountry.dialCode;
      finalForm.phoneCountryIso = selectedPhoneCountry.iso;
    }

    // تنظيم العملات: إذا المبلغ 0 لا نحفظ العملة
    if (!finalForm.subscriptionAmount) {
      finalForm.subscriptionCurrency = '';
      finalForm.subscriptionCurrencySymbol = '';
    }
    if (!finalForm.profits) {
      finalForm.profitsCurrency = '';
      finalForm.profitsCurrencySymbol = '';
    }
    if (!finalForm.systemFees) {
      finalForm.systemFeesCurrency = '';
      finalForm.systemFeesCurrencySymbol = '';
    }

    // حساب النظام: حسب النوع
    if (finalForm.systemAccountType === 'manual') {
      finalForm.systemAccount = finalForm.systemAccountValue || finalForm.systemAccount;
    } else if (finalForm.systemAccountType === 'wallet_id') {
      finalForm.systemAccount = `${finalForm.systemAccountWalletType}:${finalForm.systemAccountValue}`;
    } else if (finalForm.systemAccountType === 'wallet_address') {
      finalForm.systemAccount = `${finalForm.systemAccountNetwork}:${finalForm.systemAccountValue}`;
    }

    // عنوان المحفظة ثلاث خطوات
    if (finalForm.walletPlatform && finalForm.walletCurrency && finalForm.walletAddressValue) {
      finalForm.walletAddress = `${finalForm.walletPlatform}|${finalForm.walletCurrency}|${finalForm.walletNetwork}|${finalForm.walletAddressValue}`;
    }

    // إصلاح مشكلة ربط العمليات بالاسم النصي: عند التعديل حدث العمليات القديمة
    if (editId && oldNameForOpsUpdate && oldNameForOpsUpdate !== subName) {
      const updatedOps = operations.map(op => op.subscriberName === oldNameForOpsUpdate ? { ...op, subscriberName: subName } : op);
      onOperationsChange(updatedOps);
    }

    if (editId) {
      onSubscribersChange(subscribers.map(s => s.id === editId ? { id: editId, ...finalForm, cms: cmsData } : s));
      toast.success('تم تحديث بيانات المشترك');
    } else {
      onSubscribersChange([...subscribers, { id: uid(), ...finalForm, cms: cmsData }]);
      toast.success('تمت إضافة المشترك بنجاح');
    }
    // حفظ العمليات المعلّقة
    if (pendingOps.length > 0 && subName) {
      const newOps: Operation[] = pendingOps.map(op => ({
        id: uid(),
        subscriberName: subName,
        operation: op.operation,
        amount: op.amount,
        date: op.date,
        status: op.status,
      }));
      onOperationsChange([...operations, ...newOps]);
    }

    // Reset كامل لجميع الحالات الجديدة
    setForm({ ...EMPTY_SUB });
    setEditId(null);
    setCustomBank(false);
    setPendingOps([]);
    setShowAddOps(false);
    setTempOp({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' });
    setSaved(true);
    setPhoneCountryOpen(false);
    setBankOpen(false);
    setSubCurrencyOpen(false);
    setProfitsCurrencyOpen(false);
    setFeesCurrencyOpen(false);
    setWalletStep(1);
    setPendingIbanSave(false);
    setPendingAccountSave(false);
    setDuplicateWarning(null);
    setOldNameForOpsUpdate('');
    setPhoneCountrySearch('');
    setBankSearch('');
    setBankCountryFilter('الكل');
    setSubCurrencySearch('');
    setProfitsCurrencySearch('');
    setFeesCurrencySearch('');
    setCmsData(resolveCMS(undefined));
    setTimeout(() => setSaved(false), 3000);
    // حفظ آخر اختيارات في localStorage
    try {
      if (finalForm.bankName) localStorage.setItem('lastSelectedBank', finalForm.bankName);
      if (finalForm.bankCountry) localStorage.setItem('lastSelectedCountry', finalForm.bankCountry);
    } catch {}
  };

  const startEdit = (sub: Subscriber) => {
    const { id, cms: subCms, ...rest } = sub;
    setForm({ ...EMPTY_SUB, ...rest });
    setEditId(id);
    setOldNameForOpsUpdate(sub.name);
    setCmsData(resolveCMS(subCms));
    setCustomBank(!ALL_BANKS_FLAT.includes(rest.bankName) && !ARAB_BANKS_DATABASE.some(b=>b.nameAr===rest.bankName) && rest.bankName !== '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // استعادة خطوات المحفظة
    if (rest.walletPlatform) setWalletStep(3);
    else if (rest.walletCurrency) setWalletStep(2);
    else setWalletStep(1);
  };

  const exportSubscribersCSV = () => {
    const header = ['الاسم', 'الهاتف', 'IBAN', 'مبلغ الاشتراك', 'الأرباح', 'الرسوم', 'الحالة', 'تاريخ الانضمام', 'البنك', 'العملة', 'المنصة'];
    const rows = subscribers.map(s => [s.name, s.phone, s.iban, s.subscriptionAmount, s.profits, s.systemFees, s.subscriberStatus, s.joinDate, s.bankName, s.currency, s.platform]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `المشتركين_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير بيانات المشتركين');
  };

  const doDelete = (id: string) => {
    onSubscribersChange(subscribers.filter(s => s.id !== id));
    setDeleteId(null);
    setExpandedId(null);
    toast.error('تم حذف المشترك');
  };

  const cancelEdit = () => {
    setForm({ ...EMPTY_SUB });
    setEditId(null);
    setCustomBank(false);
    setSearchSub('');
    setPage(1);
    setPhoneCountryOpen(false);
    setBankOpen(false);
    setWalletStep(1);
    setPendingIbanSave(false);
    setPendingAccountSave(false);
    setDuplicateWarning(null);
    setOldNameForOpsUpdate('');
    setCmsData(resolveCMS(undefined));
  };

  // ══════════ تحميل البيانات التجريبية الكاملة (أكرم هيج) ══════════
  const loadDemoData = () => {
    const demo = buildAkramDemo();
    onSubscribersChange([...subscribers, demo.subscriber]);
    onOperationsChange([...operations, ...demo.operations.map(op => ({ ...op, id: uid() }))]);
    setShowDemoConfirm(false);
    toast.success('تمت إضافة المشترك التجريبي "أكرم هيج" بكل بياناته وتصميم CMS الكامل', { duration: 4000 });
  };

  // ══════════ بناء مشترك للمعاينة الحية (نفس منطق الحفظ بدون آثار جانبية) ══════════
  const buildPreviewSub = (src: Omit<Subscriber, 'id'>): Subscriber => {
    const pc = PHONE_COUNTRIES.find(c => c.iso === src.phoneCountryIso) || PHONE_COUNTRIES.find(c => c.dialCode === src.phoneCountryCode) || PHONE_COUNTRIES[0];
    const out: Omit<Subscriber, 'id'> = { ...src };
    if (out.phone && pc) out.phone = `${pc.dialCode}${out.phone.replace(pc.dialCode, '').trim()}`;
    if (out.systemAccountType === 'wallet_id' && out.systemAccountValue) out.systemAccount = `${out.systemAccountWalletType}:${out.systemAccountValue}`;
    else if (out.systemAccountType === 'wallet_address' && out.systemAccountValue) out.systemAccount = `${out.systemAccountNetwork}:${out.systemAccountValue}`;
    else if (out.systemAccountType === 'manual' && out.systemAccountValue) out.systemAccount = out.systemAccountValue;
    if (out.walletPlatform && out.walletCurrency && out.walletAddressValue) out.walletAddress = `${out.walletPlatform}|${out.walletCurrency}|${out.walletNetwork}|${out.walletAddressValue}`;
    return { id: 'preview', ...out };
  };
  // فتح المعاينة في نافذة جديدة
  const writePreviewSnapshot = () => {
    const liveOps: Operation[] = pendingOps.map((op, i) => ({ id: 'pv' + i, subscriberName: form.name || 'عميل', ...op }));
    sessionStorage.setItem('msub_preview', JSON.stringify({ subscriber: buildPreviewSub(form), operations: liveOps, cms: cmsData }));
  };
  const openPreviewInTab = () => {
    try {
      writePreviewSnapshot();
      window.open(`${window.location.origin}/preview`, '_blank');
    } catch { toast.error('تعذر فتح المعاينة'); }
  };
  // كتابة فورية أول مرة تُفتح المعاينة
  useEffect(() => { if (showPreview) { try { writePreviewSnapshot(); } catch { /* تجاهل */ } setPreviewTick(x => x + 1); } /* eslint-disable react-hooks/exhaustive-deps */ }, [showPreview]);

  const f = form;
  const subscriberExperience = resolveSubscriberExperience(systemConfig.subscriberExperience);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editId ? 'تعديل مشترك' : sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{subscribers.length} مشترك مسجّل</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowDemoConfirm(true)} variant="outline" size="sm" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 h-9">
            <FlaskConical size={14} /> تحميل بيانات تجريبية
          </Button>
          <Button onClick={exportSubscribersCSV} variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 h-9">
            <FileDown size={14} /> تصدير CSV
          </Button>
          {editId && (
            <Button variant="outline" onClick={cancelEdit} className="gap-1.5 border-slate-200 text-slate-600">
              <X size={14} /> إلغاء التعديل
            </Button>
          )}
        </div>
      </div>

      <SubscriberExperienceBuilder
        value={subscriberExperience}
        onChange={subscriberExperience => onConfigChange({ subscriberExperience })}
      />

      {/* Form */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className={`h-1 ${editId ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            {editId ? <><Pencil size={15} className="text-blue-500" />تعديل بيانات المشترك</> : <><UserPlus size={15} className="text-emerald-500" />بيانات المشترك الجديد</>}
          </CardTitle>
          <CardDescription className="text-xs">جميع الحقول اختيارية — تظهر فقط البيانات المُدخَلة وغير المخفية عند الاستعلام</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* الصف: الاسم + الهاتف مع بادئة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FField label="اسم المشترك" icon={<User size={12} />} value={f.name} onChange={v => set('name', v)} placeholder="الاسم الكامل" />
            <div ref={phoneCountryRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Phone size={11} />رقم الهاتف مع بادئة الدولة</label>
              <div className="flex gap-2">
                <div className="relative w-[130px] flex-shrink-0">
                  <button type="button" onClick={() => setPhoneCountryOpen(v=>!v)}
                    className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center gap-1.5 text-xs hover:border-slate-300 transition-colors">
                    {selectedPhoneCountry && (
                      <>
                        <img src={selectedPhoneCountry.flagUrl} alt={selectedPhoneCountry.iso} className="w-5 h-4 object-cover rounded-sm flex-shrink-0" loading="lazy" />
                        <span className="font-bold text-[11px]">{selectedPhoneCountry.dialCode}</span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${phoneCountryOpen?'rotate-180':''}`} />
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {phoneCountryOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 sm:w-[320px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <div className="relative">
                            <Input value={phoneCountrySearch} onChange={e=>setPhoneCountrySearch(e.target.value)} placeholder="بحث باسم الدولة أو الرمز..." className="h-9 pr-8 border-slate-200 text-sm" />
                            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                          </div>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {priorityPhoneCountries.length>0 && !phoneCountrySearch && (
                            <>
                              <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-100"><span className="text-xs font-black text-amber-700">⭐ الدول العربية المميزة</span></div>
                              {priorityPhoneCountries.map(c=>(
                                <button key={c.iso} type="button" onClick={()=>{ set('phoneCountryCode', c.dialCode); set('phoneCountryIso', c.iso); setPhoneCountryOpen(false); setPhoneCountrySearch(''); try{localStorage.setItem('lastSelectedCountry', c.iso);}catch{}} }
                                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right ${f.phoneCountryIso===c.iso?'bg-emerald-50':''}`}>
                                  <img src={c.flagUrl} alt={c.iso} className="w-6 h-4 object-cover rounded-sm" loading="lazy" />
                                  <span className="text-xs font-bold">{c.dialCode}</span>
                                  <span className="text-xs flex-1 text-right">{c.nameAr}</span>
                                  <span className="text-[10px] text-slate-400">{c.nameEn}</span>
                                </button>
                              ))}
                              <div className="h-px bg-slate-100" />
                            </>
                          )}
                          <div className="px-3 py-1 text-[10px] font-black text-slate-400 bg-slate-50">{phoneCountrySearch ? `نتائج البحث (${filteredPhoneCountries.length})` : 'جميع الدول'}</div>
                          {filteredPhoneCountries.slice(0, 60).map(c=>(
                            <button key={c.iso+'_'+c.dialCode} type="button" onClick={()=>{ set('phoneCountryCode', c.dialCode); set('phoneCountryIso', c.iso); setPhoneCountryOpen(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right ${f.phoneCountryIso===c.iso?'bg-emerald-50':''}`}>
                              <img src={c.flagUrl} alt={c.iso} className="w-5 h-3 object-cover rounded-sm" loading="lazy" />
                              <span className="text-xs font-bold w-12 text-left">{c.dialCode}</span>
                              <span className="text-xs flex-1 text-right truncate">{c.nameAr}</span>
                            </button>
                          ))}
                          {filteredPhoneCountries.length===0 && <div className="py-6 text-center text-slate-400 text-sm">لا توجد نتائج</div>}
                          {filteredPhoneCountries.length>60 && <div className="p-2 text-xs text-slate-400 text-center">... و {filteredPhoneCountries.length-60} دولة أخرى، استخدم البحث</div>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 relative">
                  <Input value={f.phone} onChange={e=>set('phone', e.target.value)} placeholder="05xxxxxxxx" className="h-10 border-slate-200 pr-16" />
                  <div className="absolute left-1 top-1 bottom-1 flex items-center gap-1">
                    <button type="button" onClick={()=>set('phoneVisible', !f.phoneVisible)} className={`p-1.5 rounded-md transition-colors ${f.phoneVisible?'text-slate-400 hover:text-slate-600':'text-red-400 bg-red-50'}`} title={f.phoneVisible?'إخفاء في الاستعلام':'مخفي'}>
                      {f.phoneVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    {f.phone && <button type="button" onClick={()=>set('phone','')} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={12} /></button>}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{f.phoneVisible ? 'سيظهر في الاستعلام' : 'مخفي في الاستعلام'}</p>
            </div>
          </div>

          {/* IBAN + رقم الحساب */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><CreditCard size={11} />رقم الآيبان (IBAN)</label>
              <div className="relative">
                <Input value={f.iban} onChange={e=>set('iban', e.target.value)} placeholder="SAxx xxxx xxxx xxxx xxxx xxxx xx" className="h-10 border-slate-200 font-mono text-xs pr-20" />
                <div className="absolute left-1 top-1 bottom-1 flex items-center gap-1">
                  <button type="button" onClick={()=>set('ibanVisible', !f.ibanVisible)} className={`p-1.5 rounded-md ${f.ibanVisible?'text-slate-400 hover:text-slate-600':'text-red-400 bg-red-50'}`} title="إخفاء">
                    {f.ibanVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {f.iban && <button type="button" onClick={()=>set('iban','')} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={12} /></button>}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Hash size={11} />رقم الحساب البنكي</label>
              <div className="relative">
                <Input value={f.accountNumber||''} onChange={e=>set('accountNumber', e.target.value)} placeholder="رقم الحساب البنكي" className="h-10 border-slate-200 font-mono text-xs pr-20" />
                <div className="absolute left-1 top-1 bottom-1 flex items-center gap-1">
                  <button type="button" onClick={()=>set('accountNumberVisible', !f.accountNumberVisible)} className={`p-1.5 rounded-md ${f.accountNumberVisible?'text-slate-400':'text-red-400 bg-red-50'}`}>
                    {f.accountNumberVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  {f.accountNumber && <button type="button" onClick={()=>set('accountNumber','')} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={12} /></button>}
                </div>
              </div>
            </div>
          </div>

          {/* مبلغ الاشتراك + الأرباح + رسوم مع عملة */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            {/* اشتراك */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div ref={subCurrencyRef} className="relative">
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Wallet size={11} />مبلغ الاشتراك</label>
                <div className="flex gap-2">
                  <div className="relative w-[110px] flex-shrink-0">
                    <button type="button" onClick={()=>setSubCurrencyOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs hover:border-slate-300">
                      <span className="flex items-center gap-1">
                        {(() => { const c = allCurrenciesForAmount.find(x=>x.code===f.subscriptionCurrency); return c ? <><LogoAvatar name={c.code} src={c.logoUrl} size={18} /><span className="font-bold text-[11px]">{c.code}</span></> : <span className="text-slate-400">العملة</span>; })()}
                      </span>
                      <ChevronDown size={12} className={`text-slate-400 ${subCurrencyOpen?'rotate-180':''}`} />
                    </button>
                    <AnimatePresence>
                      {subCurrencyOpen && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 sm:w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-2 border-b"><Input value={subCurrencySearch} onChange={e=>setSubCurrencySearch(e.target.value)} placeholder="بحث عملة..." className="h-8 text-xs" /></div>
                          <div className="max-h-60 overflow-y-auto">
                            {filterCurrencyForAmount(subCurrencySearch).slice(0,50).map(c=>(
                              <button key={c.code} type="button" onClick={()=>{ set('subscriptionCurrency', c.code); set('subscriptionCurrencySymbol', c.symbol); setSubCurrencyOpen(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right ${f.subscriptionCurrency===c.code?'bg-emerald-50':''}`}>
                                <LogoAvatar name={c.code} src={c.logoUrl} size={22} />
                                <span className="text-xs font-black">{c.code}</span>
                                <span className="text-xs text-slate-600 truncate">{c.nameAr}</span>
                                <span className="text-[10px] text-slate-400 mr-auto">{c.type==='crypto'?'🪙 رقمية':'💵'}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Input type="number" value={f.subscriptionAmount===0?'':String(f.subscriptionAmount)} onChange={e=>set('subscriptionAmount', Number(e.target.value))} placeholder="0" className="flex-1 h-10 border-slate-200" />
                </div>
              </div>
              <div ref={profitsCurrencyRef} className="relative">
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><TrendingUp size={11} />الأرباح</label>
                <div className="flex gap-2">
                  <div className="relative w-[110px] flex-shrink-0">
                    <button type="button" onClick={()=>setProfitsCurrencyOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        {(() => { const c = allCurrenciesForAmount.find(x=>x.code===f.profitsCurrency); return c ? <><LogoAvatar name={c.code} src={c.logoUrl} size={18} /><span className="font-bold text-[11px]">{c.code}</span></> : <span className="text-slate-400">العملة</span>; })()}
                      </span>
                      <ChevronDown size={12} className="text-slate-400" />
                    </button>
                    <AnimatePresence>
                      {profitsCurrencyOpen && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 sm:w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-2 border-b"><Input value={profitsCurrencySearch} onChange={e=>setProfitsCurrencySearch(e.target.value)} placeholder="بحث..." className="h-8 text-xs" /></div>
                          <div className="max-h-60 overflow-y-auto">
                            {filterCurrencyForAmount(profitsCurrencySearch).slice(0,50).map(c=>(
                              <button key={c.code} type="button" onClick={()=>{ set('profitsCurrency', c.code); set('profitsCurrencySymbol', c.symbol); setProfitsCurrencyOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right">
                                <LogoAvatar name={c.code} src={c.logoUrl} size={22} />
                                <span className="text-xs font-black">{c.code}</span>
                                <span className="text-xs truncate">{c.nameAr}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <Input type="number" value={f.profits===0?'':String(f.profits)} onChange={e=>set('profits', Number(e.target.value))} placeholder="0" className="flex-1 h-10 border-slate-200" />
                </div>
              </div>
            </div>
            <div ref={feesCurrencyRef} className="relative sm:w-1/2">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><AlertCircle size={11} />رسوم النظام</label>
              <div className="flex gap-2">
                <div className="relative w-[110px] flex-shrink-0">
                  <button type="button" onClick={()=>setFeesCurrencyOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs">
                    <span>{(() => { const c = allCurrenciesForAmount.find(x=>x.code===f.systemFeesCurrency); return c ? c.code : 'العملة'; })()}</span>
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {feesCurrencyOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 sm:w-[280px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b"><Input value={feesCurrencySearch} onChange={e=>setFeesCurrencySearch(e.target.value)} placeholder="بحث..." className="h-8 text-xs" /></div>
                        <div className="max-h-60 overflow-y-auto">
                          {filterCurrencyForAmount(feesCurrencySearch).slice(0,50).map(c=>(
                            <button key={c.code} type="button" onClick={()=>{ set('systemFeesCurrency', c.code); set('systemFeesCurrencySymbol', c.symbol); setFeesCurrencyOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right">
                              <span className="text-xs font-black">{c.code}</span><span className="text-xs">{c.nameAr}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Input type="number" value={f.systemFees===0?'':String(f.systemFees)} onChange={e=>set('systemFees', Number(e.target.value))} placeholder="0" className="flex-1 h-10 border-slate-200" />
              </div>
            </div>
          </div>

          {/* حساب النظام متعدد الأنواع */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Database size={11} />حساب النظام</label>
              <div className="flex gap-2">
                <div className="relative w-[130px] flex-shrink-0">
                  <button type="button" onClick={()=>setSysAccTypeOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs">
                    <span>{f.systemAccountType==='wallet_id'?'آيدي محفظة': f.systemAccountType==='wallet_address'?'عنوان محفظة':'يدوي'}</span>
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {sysAccTypeOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
                        {[
                          { id: 'manual', label: 'يدوي' },
                          { id: 'wallet_id', label: 'آيدي محفظة' },
                          { id: 'wallet_address', label: 'عنوان محفظة' },
                        ].map(opt=>(
                          <button key={opt.id} type="button" onClick={()=>{ set('systemAccountType', opt.id); setSysAccTypeOpen(false); }} className={`w-full text-right px-3 py-2 text-xs hover:bg-slate-50 ${f.systemAccountType===opt.id?'bg-emerald-50':''}`}>{opt.label}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 flex gap-2">
                  {f.systemAccountType==='wallet_id' && (
                    <div className="relative w-[120px] flex-shrink-0">
                      <button type="button" onClick={()=>setSysAccWalletTypeOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">{f.systemAccountWalletType ? <><LogoAvatar name={f.systemAccountWalletType} src={WALLET_TYPES.find(w=>w.name===f.systemAccountWalletType)?.logoUrl} size={16} /><span className="truncate text-[10px]">{f.systemAccountWalletType}</span></> : 'نوع المحفظة'}</span>
                        <ChevronDown size={10} />
                      </button>
                      <AnimatePresence>
                        {sysAccWalletTypeOpen && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 sm:w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {WALLET_TYPES.map(w=>(
                              <button key={w.id} type="button" onClick={()=>{ set('systemAccountWalletType', w.name); setSysAccWalletTypeOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right">
                                <LogoAvatar name={w.name} src={w.logoUrl} size={20} />
                                <span className="text-xs">{w.name}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  {f.systemAccountType==='wallet_address' && (
                    <div className="relative w-[120px] flex-shrink-0">
                      <button type="button" onClick={()=>setSysAccNetworkOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">{f.systemAccountNetwork ? <><LogoAvatar name={f.systemAccountNetwork} src={BLOCKCHAIN_NETWORKS.find(n=>n.id===f.systemAccountNetwork||n.symbol===f.systemAccountNetwork)?.logoUrl} size={16} /><span className="text-[10px]">{f.systemAccountNetwork}</span></> : 'الشبكة'}</span>
                        <ChevronDown size={10} />
                      </button>
                      <AnimatePresence>
                        {sysAccNetworkOpen && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 sm:w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                            {BLOCKCHAIN_NETWORKS.map(net=>(
                              <button key={net.id} type="button" onClick={()=>{ set('systemAccountNetwork', net.id); setSysAccNetworkOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right">
                                <LogoAvatar name={net.name} src={net.logoUrl} size={20} />
                                <span className="text-xs">{net.name}</span><span className="text-[10px] text-slate-400">{net.symbol}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <Input value={f.systemAccountValue||f.systemAccount} onChange={e=>set('systemAccountValue', e.target.value)} placeholder={f.systemAccountType==='manual'?'SYS-000000': f.systemAccountType==='wallet_id'?'آيدي المحفظة':'عنوان المحفظة'} className="flex-1 h-10 border-slate-200 font-mono text-xs" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={11} />تاريخ الانضمام</label>
              <div className="relative">
                <Input type="date" value={f.joinDate} onChange={e=>set('joinDate', e.target.value)} className="h-10 border-slate-200 pr-10" />
                {f.joinDate && <button type="button" onClick={()=>set('joinDate','')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400"><X size={12} /></button>}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">يظهر فقط إذا مملوء</p>
            </div>
          </div>

          {/* عنوان المحفظة ثلاث خطوات */}
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Hash size={11} />عنوان المحفظة (ثلاث خطوات)</label>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${walletStep>=1?'bg-emerald-500 text-white':'bg-slate-200'}`}>1</span> المنصة
                <span className="flex-1 h-px bg-slate-200" />
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${walletStep>=2?'bg-emerald-500 text-white':'bg-slate-200'}`}>2</span> العملة
                <span className="flex-1 h-px bg-slate-200" />
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${walletStep>=3?'bg-emerald-500 text-white':'bg-slate-200'}`}>3</span> العنوان
              </div>
              {walletStep===1 && (
                <div ref={platformRef} className="relative">
                  <button type="button" onClick={()=>setPlatformOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm">
                    {f.walletPlatform ? <span className="flex items-center gap-2"><LogoAvatar name={f.walletPlatform} src={`https://logo.clearbit.com/${f.walletPlatform.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`} size={20} />{f.walletPlatform}</span> : <span className="text-slate-400">اختر المنصة</span>}
                    <ChevronDown size={14} />
                  </button>
                  <AnimatePresence>
                    {platformOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b"><Input value={platformSearch} onChange={e=>setPlatformSearch(e.target.value)} placeholder="بحث منصة..." className="h-8 text-xs" /></div>
                        <div className="max-h-60 overflow-y-auto">
                          {cryptoPlatforms.length>0 && <><div className="px-3 py-1.5 bg-yellow-50 text-[10px] font-black text-yellow-700">🔷 كريبتو ({cryptoPlatforms.length})</div>{cryptoPlatforms.slice(0,20).map(p=>(<button key={p.name} type="button" onClick={()=>{ set('walletPlatform', p.name); setPlatformOpen(false); setWalletStep(2); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right"><LogoAvatar name={p.name} src={`https://logo.clearbit.com/${p.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`} size={20} />{p.name}</button>))}</>}
                          {forexPlatforms.length>0 && <><div className="px-3 py-1.5 bg-blue-50 text-[10px] font-black text-blue-700">📊 فوركس ({forexPlatforms.length})</div>{forexPlatforms.slice(0,20).map(p=>(<button key={p.name} type="button" onClick={()=>{ set('walletPlatform', p.name); setPlatformOpen(false); setWalletStep(2); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-right"><LogoAvatar name={p.name} src={`https://logo.clearbit.com/${p.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`} size={20} />{p.name}</button>))}</>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {walletStep===2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs text-slate-600">المنصة: {f.walletPlatform}</span><button type="button" onClick={()=>setWalletStep(1)} className="text-xs text-blue-500">تغيير</button></div>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {CRYPTO_CURRENCIES.slice(0,24).map(c=>(
                      <button key={c.code} type="button" onClick={()=>{ set('walletCurrency', c.code); setWalletStep(3); }} className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 hover:bg-white ${f.walletCurrency===c.code?'border-emerald-300 bg-emerald-50':'border-slate-200 bg-white'}`}>
                        <LogoAvatar name={c.code} src={c.logoUrl} size={24} />
                        <span className="font-bold text-[10px]">{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {walletStep===3 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs">المنصة: {f.walletPlatform} | العملة: {f.walletCurrency}</span><button type="button" onClick={()=>setWalletStep(2)} className="text-xs text-blue-500">تغيير</button></div>
                  <div className="relative">
                    <Input value={f.walletAddressValue||''} onChange={e=>set('walletAddressValue', e.target.value)} placeholder={f.walletCurrency==='BTC'?'عنوان BTC...' : '0x... أو TRC20...'} className="h-10 border-slate-200 font-mono text-xs pr-10" />
                    {f.walletAddressValue && <button type="button" onClick={()=>{ set('walletAddressValue',''); setWalletStep(1); set('walletPlatform',''); set('walletCurrency',''); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 text-slate-400"><X size={12} /></button>}
                  </div>
                  <button type="button" onClick={()=>{ set('walletPlatform',''); set('walletCurrency',''); set('walletAddressValue',''); set('walletNetwork',''); setWalletStep(1); }} className="text-xs text-red-500 hover:text-red-600">مسح كل الخطوات</button>
                </div>
              )}
            </div>
          </div>

          {/* حالة + بنك */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Star size={11} />حالة المشترك</label>
              <Select value={f.subscriberStatus} onValueChange={v => set('subscriberStatus', v)}>
                <SelectTrigger className="h-10 border-slate-200 bg-white"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                <SelectContent>{SUBSCRIBER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div ref={bankRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Building2 size={11} />البنك — بحث بالدولة أو البنك</label>
              {customBank ? (
                <div className="flex gap-2">
                  <Input value={f.bankName} onChange={e => set('bankName', e.target.value)} placeholder="اكتب اسم البنك" className="h-10 border-slate-200 flex-1" />
                  <Button variant="outline" size="sm" className="h-10 border-slate-200 text-xs px-3" onClick={() => { setCustomBank(false); set('bankName', ''); }}>قائمة</Button>
                </div>
              ) : (
                <>
                  <button type="button" onClick={()=>setBankOpen(v=>!v)} className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm hover:border-slate-300">
                    {f.bankName ? <span className="flex items-center gap-2 truncate"><LogoAvatar name={f.bankName} src={f.bankLogoUrl || `https://logo.clearbit.com/${(f.bankDomain||f.bankName.toLowerCase().replace(/[^a-z0-9]/g,''))}.com`} size={20} /><span className="truncate text-xs">{f.bankName}</span></span> : <span className="text-slate-400">اختر البنك</span>}
                    <ChevronDown size={14} className={`${bankOpen?'rotate-180':''} transition-transform`} />
                  </button>
                  <AnimatePresence>
                    {bankOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 sm:w-[380px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b space-y-2">
                          <div className="relative">
                            <Input value={bankSearch} onChange={e=>setBankSearch(e.target.value)} placeholder="ابحث باسم الدولة أو البنك..." className="h-9 pr-8 text-sm" />
                            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {bankCountriesList.slice(0,8).map(c=>(
                              <button key={c} type="button" onClick={()=>setBankCountryFilter(c)} className={`px-2 py-1 rounded-full text-[10px] border ${bankCountryFilter===c?'bg-emerald-500 text-white border-emerald-500':'bg-slate-50 text-slate-600 border-slate-200'}`}>{c}</button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            {['🇸🇦','🇦🇪','🇰🇼','🇶🇦','🇧🇭','🇴🇲'].map((flag,i)=>{
                              const iso = ['SA','AE','KW','QA','BH','OM'][i];
                              const countryAr = ['السعودية','الإمارات','الكويت','قطر','البحرين','عُمان'][i];
                              return <button key={iso} type="button" onClick={()=>setBankCountryFilter(countryAr)} className="text-sm p-1 rounded hover:bg-slate-100" title={countryAr}>{flag}</button>
                            })}
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {filteredArabBanks.slice(0,40).map(b=>(
                            <button key={b.id} type="button" onClick={()=>{
                              set('bankName', b.nameAr); set('bankCountry', b.countryAr); set('bankType', b.type); set('bankLogoUrl', b.logoUrl); set('bankDomain', b.domain); set('bankSwift', b.swiftCode||'');
                              setBankOpen(false); toast.success(`تم اختيار ${b.nameAr}`, { duration: 1000 });
                              try{ localStorage.setItem('lastSelectedBank', b.nameAr); localStorage.setItem('lastSelectedCountry', b.countryAr);}catch{}
                            }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-right">
                              <LogoAvatar name={b.nameAr} src={b.logoUrl} size={28} />
                              <div className="flex-1 min-w-0 text-right">
                                <p className="text-xs font-bold truncate">{b.nameAr}</p>
                                <p className="text-[10px] text-slate-400 truncate">{b.nameEn} · {b.countryAr}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className={`text-[9px] px-1.5 py-0 ${b.type==='islamic'?'bg-emerald-50 text-emerald-700 border-emerald-200': b.type==='digital'?'bg-purple-50 text-purple-700': b.type==='government'?'bg-blue-50 text-blue-700':'bg-slate-50 text-slate-600'} border`}>{b.type==='commercial'?'تجاري': b.type==='islamic'?'إسلامي': b.type==='digital'?'رقمي': b.type==='government'?'حكومي': b.type}</Badge>
                                {b.swiftCode && <span className="text-[9px] font-mono text-slate-400">{b.swiftCode}</span>}
                              </div>
                            </button>
                          ))}
                          {filteredArabBanks.length===0 && <div className="py-8 text-center text-slate-400 text-sm">لا توجد نتائج</div>}
                          {filteredArabBanks.length>40 && <div className="p-2 text-xs text-slate-400 text-center">... و {filteredArabBanks.length-40} بنك آخر، استخدم البحث</div>}
                        </div>
                        <div className="p-2 border-t bg-slate-50">
                          <button type="button" onClick={()=>{ setCustomBank(true); setBankOpen(false); set('bankName',''); }} className="w-full text-xs text-emerald-600 font-bold hover:text-emerald-700 py-1">+ أدخل اسم البنك يدوياً</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          {/* العملة الرئيسية + المنصة القديمة (للتوافق) + ملاحظات */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div ref={currencyRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Globe size={11} />العملة الرئيسية (للتوافق)</label>
              <button type="button" onClick={() => { setCurrencyOpen(v => !v); setPlatformOpen(false); }}
                className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm hover:border-slate-300 transition-colors">
                {selectedCurrency ? (
                  <span className="flex items-center gap-2">
                    <span className="text-base font-bold text-emerald-600">{selectedCurrency.symbol}</span>
                    <span className="font-medium">{selectedCurrency.code}</span>
                    <span className="text-slate-400 text-xs">— {selectedCurrency.nameAr}</span>
                  </span>
                ) : <span className="text-slate-400">اختر العملة</span>}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} placeholder="بحث بالاسم أو الرمز أو الكود..." className="h-9 pr-8 border-slate-200 text-sm" />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCurrenciesMain.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                      ) : filteredCurrenciesMain.slice(0,50).map(c => (
                        <button key={c.code} type="button" onClick={() => { set('currency', c.code); setCurrencyOpen(false); setCurrencySearch(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-right ${f.currency === c.code ? 'bg-emerald-50' : ''}`}>
                          <span className="text-lg font-bold text-emerald-600 w-8 text-center flex-shrink-0">{c.symbol}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2"><span className="text-sm font-black text-slate-800">{c.code}</span><span className="text-sm text-slate-600">{c.nameAr}</span></div>
                            <p className="text-xs text-slate-400">{c.countryAr}</p>
                          </div>
                          {f.currency === c.code && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={platformRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Cpu size={11} />المنصة (شعارات حقيقية)</label>
              <button type="button" onClick={() => { setPlatformOpen(v => !v); setCurrencyOpen(false); }}
                className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm hover:border-slate-300 transition-colors">
                {selectedPlatform ? (
                  <span className="flex items-center gap-2">
                    <LogoAvatar name={selectedPlatform.name} src={`https://logo.clearbit.com/${selectedPlatform.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`} size={20} />
                    <span className="font-medium">{selectedPlatform.name}</span>
                    <Badge className={`text-xs border-none ${selectedPlatform.type === 'crypto' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{selectedPlatform.type === 'crypto' ? 'كريبتو' : 'فوركس'}</Badge>
                  </span>
                ) : <span className="text-slate-400">اختر المنصة</span>}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {platformOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Input value={platformSearch} onChange={e => setPlatformSearch(e.target.value)} placeholder="بحث في المنصات..." className="h-9 pr-8 border-slate-200 text-sm" />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {cryptoPlatforms.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-yellow-50 border-b border-yellow-100"><span className="text-xs font-black text-yellow-700">🔷 منصات الكريبتو ({cryptoPlatforms.length})</span></div>
                          {cryptoPlatforms.slice(0,20).map(p => (<PlatformItem key={p.name} platform={p} selected={f.platform === p.name} onClick={() => { set('platform', p.name); setPlatformOpen(false); setPlatformSearch(''); }} />))}
                        </>
                      )}
                      {forexPlatforms.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 border-t"><span className="text-xs font-black text-blue-700">📊 منصات الفوركس ({forexPlatforms.length})</span></div>
                          {forexPlatforms.slice(0,20).map(p => (<PlatformItem key={p.name} platform={p} selected={f.platform === p.name} onClick={() => { set('platform', p.name); setPlatformOpen(false); setPlatformSearch(''); }} />))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><FileText size={11} />ملاحظات (اختياري)</label>
              <textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات إضافية..." rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Banknote size={11} />نص السحب</label>
              <textarea value={f.withdrawalText} onChange={e => set('withdrawalText', e.target.value)} placeholder="أدخل النص الذي سيظهر بعد تأكيد سحب الأرباح..." rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all" />
              <p className="text-[10px] text-slate-400 mt-1">يظهر هذا النص للمشترك في شاشة الاستعلام بعد تأكيد السحب.</p>
            </div>
          </div>

          {/* Subscriber Operations Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><ClipboardList size={11} />سجل عمليات للمشترك (اختياري)</label>
              <button type="button" onClick={() => setShowAddOps(v => !v)} className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors">
                {showAddOps ? <><X size={12} /> إغلاق</> : <><Plus size={12} /> إضافة عملية</>}
              </button>
            </div>
            {pendingOps.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {pendingOps.map((op, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="font-bold text-emerald-700">{op.operation}</span>
                      {op.amount && <span className="text-slate-500">· {op.amount}</span>}
                      <span className="text-slate-400">· {op.date}</span>
                      <Badge className="text-[10px] px-1.5 py-0 bg-white border border-emerald-200 text-emerald-700">{op.status}</Badge>
                    </div>
                    <button type="button" onClick={() => setPendingOps(p => p.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            {showAddOps && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">نوع العملية</label>
                    <Select value={tempOp.operation} onValueChange={v => setTempOp(p => ({ ...p, operation: v }))}>
                      <SelectTrigger className="h-9 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">الحالة</label>
                    <Select value={tempOp.status} onValueChange={v => setTempOp(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="h-9 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">المبلغ (اختياري)</label>
                    <Input value={tempOp.amount} onChange={e => setTempOp(p => ({ ...p, amount: e.target.value }))} placeholder="1,500 ر.س" className="h-9 border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">التاريخ</label>
                    <Input type="date" value={tempOp.date} onChange={e => setTempOp(p => ({ ...p, date: e.target.value }))} className="h-9 border-slate-200 text-sm" />
                  </div>
                </div>
                <Button type="button" size="sm" onClick={() => { setPendingOps(p => [...p, { ...tempOp }]); setTempOp({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' }); }} className="bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs h-8 px-4">
                  <Plus size={12} /> إضافة للقائمة
                </Button>
              </div>
            )}
          </div>

          {/* ══════════ استوديو تصميم تطبيق العميل (CMS) ══════════ */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <CMSBuilder cms={cmsData} onChange={setCmsData} subscribers={subscribers} />
          </div>

          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <Button onClick={handleSave} className={`gap-1.5 px-6 ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Save size={14} /> {editId ? 'حفظ التعديل' : 'إضافة المشترك'}
            </Button>
            <Button onClick={() => setShowPreview(true)} variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
              <Eye size={14} /> معاينة حية
            </Button>
            {editId && <Button variant="outline" onClick={cancelEdit} className="border-slate-200 text-slate-600">إلغاء</Button>}
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> {editId ? 'تم التعديل' : 'تم الحفظ بنجاح'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* ══════════ المعاينة الحية ══════════ */}
      <AnimatePresence>
        {showPreview && (
          <motion.div key="preview-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div key="preview-box" initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ width: '90%', maxWidth: '94vw', height: '90vh' }}>
              {/* شريط أدوات المعاينة */}
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-700 mr-1">المعاينة الحية</span>
                  <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-[9px]">تحديث تلقائي</Badge>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
                  {([375, 768, 1280] as const).map((d, i) => (
                    <button key={d} onClick={() => setPreviewDevice(d)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-colors ${previewDevice === d ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {[<Phone size={11} key="p" />, <Monitor size={11} key="t" />, <Monitor size={11} key="m" />][i]}
                      {d === 375 ? 'جوال' : d === 768 ? 'تابلت' : 'ديسكتوب'}
                      <span className="opacity-60">{d}px</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-[11px] border-slate-200" onClick={openPreviewInTab}>
                    <ExternalLink size={12} /> فتح في نافذة جديدة
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200" onClick={() => setShowPreview(false)}>
                    <X size={14} />
                  </Button>
                </div>
              </div>
              {/* جسم المعاينة — iframe مستقل: الشريط الثابت يتصرف كما في الجهاز الحقيقي */}
              <div className="flex-1 overflow-auto bg-slate-200/60 p-4">
                <div className="mx-auto bg-white shadow-xl overflow-hidden rounded-xl transition-all duration-300"
                  style={{ width: previewDevice, maxWidth: '100%', height: '100%' }}>
                  <iframe key={previewTick} src={`/preview?t=${previewTick}`} title="المعاينة الحية" className="w-full h-full border-0 bg-white" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تأكيد البيانات التجريبية */}
      <AlertDialog open={showDemoConfirm} onOpenChange={setShowDemoConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right flex items-center gap-2"><FlaskConical size={16} className="text-violet-500" />هل تريد إضافة بيانات تجريبية؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم إضافة مشترك جديد باسم <b>أكرم هيج</b> مع بياناته الكاملة (اشتراك 15,000 USDT، أرباح 4,200، 5 عمليات) وتصميم CMS كامل بكل الأقسام الـ 28.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={loadDemoData} className="bg-violet-600 hover:bg-violet-700">نعم، أضف البيانات</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* تأكيد IBAN */}
      <AlertDialog open={showIbanConfirm} onOpenChange={setShowIbanConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حفظ رقم الآيبان؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">هل تريد حفظ رقم الآيبان مع بيانات المشترك؟ إذا اخترت لا سيتم مسحه قبل الحفظ.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={()=>{ setPendingIbanSave(true); setShowIbanConfirm(false); setTimeout(()=>handleSave(),100); }} className="bg-blue-600 hover:bg-blue-700">نعم، احفظ</AlertDialogAction>
            <AlertDialogCancel onClick={()=>{ set('iban',''); setPendingIbanSave(true); setShowIbanConfirm(false); setTimeout(()=>handleSave(),100); }}>لا، امسح</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showAccountConfirm} onOpenChange={setShowAccountConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حفظ رقم الحساب؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">هل تريد حفظ رقم الحساب البنكي؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={()=>{ setPendingAccountSave(true); setShowAccountConfirm(false); setTimeout(()=>handleSave(),100); }} className="bg-blue-600 hover:bg-blue-700">نعم</AlertDialogAction>
            <AlertDialogCancel onClick={()=>{ set('accountNumber',''); setPendingAccountSave(true); setShowAccountConfirm(false); setTimeout(()=>handleSave(),100); }}>لا</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* تحذير تكرار */}
      <AlertDialog open={!!duplicateWarning} onOpenChange={()=>setDuplicateWarning(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" />يوجد مشترك بنفس البيانات</AlertDialogTitle>
            <AlertDialogDescription className="text-right">يوجد مشترك باسم {duplicateWarning?.name} بنفس الهاتف أو الآيبان. هل تريد الإضافة على أي حال؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={()=>{ setDuplicateWarning(null); setTimeout(()=>{ setPendingIbanSave(true); setPendingAccountSave(true); handleSave(); },100); }} className="bg-amber-600 hover:bg-amber-700">إضافة على أي حال</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* قائمة المشتركين */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden mt-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2"><Users size={16} />قائمة المشتركين</CardTitle>
            <div className="relative">
              <Input placeholder="بحث في المشتركين..." className="h-9 pr-8 border-slate-200 text-sm" value={searchSub} onChange={e => { setSearchSub(e.target.value); setPage(1); }} />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {paged.map(sub => (
              <SubRow key={sub.id} sub={sub} expanded={expandedId === sub.id} onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)} onEdit={() => startEdit(sub)} onDelete={() => setDeleteId(sub.id)} />
            ))}
            {paged.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-sm">لا يوجد مشتركون</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">صفحة {page} من {totalPages} · {filtered.length} مشترك</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight size={13} /> السابق
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page + i - 2;
                  if (pg > totalPages) return null;
                  return (
                    <Button key={pg} size="sm" className={`h-8 w-8 p-0 text-xs ${pg === page ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} onClick={() => setPage(pg)}>{pg}</Button>
                  );
                })}
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  التالي <ChevronLeft size={13} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف المشترك</AlertDialogTitle>
            <AlertDialogDescription className="text-right">سيتم حذف البيانات نهائياً ولا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">ح��ف المشترك</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
