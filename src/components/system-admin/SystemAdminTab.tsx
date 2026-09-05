// تبويب إدارة النظام — تخصيص النصوص والبطاقات ووضع الآيفون

import { SystemConfig, Operation } from '@/types';
import { todayStr } from '@/lib/random';
import { IPhoneLauncherSettings } from '@/components/system-admin/IPhoneLauncherSettings';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Users, TrendingUp, CheckCircle2, AlertCircle, Shield, X, Save, RefreshCw, CheckCheck, BarChart3, Edit3, Type, CalendarClock,
} from 'lucide-react';

export function SystemAdminTab({ systemConfig, onConfigChange, subscribersCount, sectionName, operations, onOperationsChange }: {
  systemConfig: SystemConfig;
  onConfigChange: (partial: Partial<SystemConfig>) => void;
  subscribersCount: number;
  sectionName: string;
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
}) {
  const [dateInput, setDateInput] = useState(systemConfig.systemDate);
  const [co, setCo] = useState({ ...systemConfig.cardOverrides });
  const [qco, setQco] = useState({ ...(systemConfig.queryCardOverrides ?? { totalSubscribers: '', activeCount: '', pendingFees: '' }) });
  const [sn, setSn] = useState({ ...systemConfig.sectionNames });
  const [instText, setInstText] = useState(systemConfig.institutionalText);
  const [saved, setSaved] = useState<string | null>(null);

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  const saveDate = () => {
    onConfigChange({ systemDate: dateInput });
    // تحديث تواريخ جميع العمليات إلى تاريخ اليوم
    const today = todayStr();
    onOperationsChange(operations.map(op => ({ ...op, date: today })));
    flash('تم تحديث تاريخ النظام وجميع العمليات');
    toast.success('تم تحديث التاريخ وجميع العمليات');
  };

  const saveQueryCards = () => {
    onConfigChange({ queryCardOverrides: qco });
    flash('تم حفظ تعديلات البطاقات الثلاث');
    toast.success('تم حفظ تعديلات البطاقات الثلاث');
  };

  const saveCards = () => {
    onConfigChange({ cardOverrides: co });
    flash('تم حفظ تعديلات البطاقات');
    toast.success('تم حفظ تعديلات البطاقات');
  };

  const saveNames = () => {
    onConfigChange({ sectionNames: sn });
    flash('تم تحديث أسماء الأقسام');
    toast.success('تم تحديث أسماء الأقسام');
  };

  const saveText = () => {
    onConfigChange({ institutionalText: instText });
    flash('تم حفظ النص المؤسسي');
    toast.success('تم حفظ النص المؤسسي');
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">إدارة ديناميكية كاملة للنظام</p>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg">
              <CheckCircle2 size={16} />{saved}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 1. تحديث تاريخ النظام ── */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <CalendarClock size={18} className="text-blue-500" /> تحديث تاريخ النظام
            </CardTitle>
            <CardDescription className="text-xs">يظهر في شريط الرأس العلوي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">التاريخ (نص حر أو تاريخ بالتقويم)</label>
              <Input value={dateInput} onChange={e => setDateInput(e.target.value)}
                placeholder="مثال: الأحد 15 يناير 2025" className="h-10 border-slate-200" />
              <p className="text-xs text-slate-400 mt-1">اتركه فارغاً لعرض التاريخ الحالي تلقائياً</p>
            </div>
            <Button onClick={saveDate} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              <RefreshCw size={14} /> تحديث التاريخ
            </Button>
          </CardContent>
        </Card>

        {/* ── 5. تعديل أسماء الأقسام ── */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Type size={18} className="text-violet-500" /> تعديل أسماء الأقسام
            </CardTitle>
            <CardDescription className="text-xs">يتم تحديثها فوراً في الشريط الجانبي والواجهة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              { key: 'dashboard' as const, label: 'النظام الإداري (الرئيسي)' },
              { key: 'systemAdmin' as const, label: 'لوحة إدارة النظام' },
              { key: 'admin' as const, label: 'نظام الإستعلام عن الأرباح' },
              { key: 'addOperations' as const, label: 'سجل العمليات' },
              { key: 'addSubscriber' as const, label: 'إضافة مشترك' },
            ]).map(item => (
              <div key={item.key}>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{item.label}</label>
                <Input value={sn[item.key]} onChange={e => setSn(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="h-9 border-slate-200 text-sm" />
              </div>
            ))}
            <Button onClick={saveNames} className="bg-violet-600 hover:bg-violet-700 gap-1.5 w-full mt-1">
              <Save size={14} /> حفظ أسماء الأقسام
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. إدارة البطاقات الأربع ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-500" /> إدارة البطاقات الأربع الرئيسية
          </CardTitle>
          <CardDescription className="text-xs">
            تعديلاتك تنعكس مباشرة داخل {systemConfig.sectionNames.dashboard} · اتركها فارغة للحساب التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-blue-50 ring-1 ring-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <span className="text-sm font-black text-blue-700">إجمالي المشتركين</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">إجمالي المشتركين</label>
                <Input value={co.totalSubscribers} onChange={e => setCo(p => ({ ...p, totalSubscribers: e.target.value }))}
                  placeholder={`${subscribersCount} (تلقائي)`} className="h-9 border-blue-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد النشطين</label>
                <Input value={co.activeCount} onChange={e => setCo(p => ({ ...p, activeCount: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-blue-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-black text-emerald-700">إجمالي الأرباح</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">إجمالي الأرباح (نص حر)</label>
                <Input value={co.totalProfits} onChange={e => setCo(p => ({ ...p, totalProfits: e.target.value }))}
                  placeholder="مثال: ١٬٢٨٤٬٥٠٠ ر.س" className="h-9 border-emerald-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد العمليات المكتملة</label>
                <Input value={co.completedOps} onChange={e => setCo(p => ({ ...p, completedOps: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-emerald-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-purple-50 ring-1 ring-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCheck size={16} className="text-purple-600" />
                </div>
                <span className="text-sm font-black text-purple-700">الاشتراكات النشطة</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد الاشتراكات النشطة</label>
                <Input value={co.activeSubscriptions} onChange={e => setCo(p => ({ ...p, activeSubscriptions: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-purple-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">من إجمالي المشتركين</label>
                <Input value={co.totalSubsCount} onChange={e => setCo(p => ({ ...p, totalSubsCount: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-purple-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-orange-50 ring-1 ring-orange-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertCircle size={16} className="text-orange-500" />
                </div>
                <span className="text-sm font-black text-orange-600">رسوم مستحقة</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد الرسوم المستحقة</label>
                <Input value={co.pendingFees} onChange={e => setCo(p => ({ ...p, pendingFees: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-orange-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد عمليات التنشيط</label>
                <Input value={co.activationOps} onChange={e => setCo(p => ({ ...p, activationOps: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-orange-200 bg-white text-sm" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveCards} className="bg-blue-600 hover:bg-blue-700 gap-1.5 px-6">
              <Save size={14} /> حفظ تعديلات البطاقات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. إدارة البطاقات الثلاث في الاستعلام ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-400" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-cyan-500" /> إدارة البطاقات الثلاث في نظام الاستعلام
          </CardTitle>
          <CardDescription className="text-xs">
            البطاقات الثلاث التي تظهر تحت حقل الاستعلام عن الأرباح · اتركها فارغة للحساب التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users size={15} className="text-slate-600" />
                <span className="text-sm font-black text-slate-700">إجمالي المشتركين</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.totalSubscribers} onChange={e => setQco(p => ({ ...p, totalSubscribers: e.target.value }))}
                placeholder={`${subscribersCount} (تلقائي)`} className="h-9 border-slate-200 bg-white text-sm" />
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span className="text-sm font-black text-slate-700">نشطون</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.activeCount} onChange={e => setQco(p => ({ ...p, activeCount: e.target.value }))}
                placeholder="تلقائي" className="h-9 border-slate-200 bg-white text-sm" />
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={15} className="text-orange-500" />
                <span className="text-sm font-black text-slate-700">رسوم مستحقة</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.pendingFees} onChange={e => setQco(p => ({ ...p, pendingFees: e.target.value }))}
                placeholder="تلقائي" className="h-9 border-slate-200 bg-white text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveQueryCards} className="bg-cyan-600 hover:bg-cyan-700 gap-1.5 px-6">
              <Save size={14} /> حفظ تعديلات البطاقات الثلاث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. النص المؤسسي ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Edit3 size={18} className="text-amber-500" /> النص المؤسسي الكبير
          </CardTitle>
          <CardDescription className="text-xs">
            يظهر بشكل بارز أسفل البطاقات الأربع في {systemConfig.sectionNames.dashboard}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={instText}
            onChange={e => setInstText(e.target.value)}
            rows={4}
            placeholder="أدخل نصاً مؤسسياً احترافياً يظهر أسفل البطاقات الرئيسية..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">النص يدعم الأسطر المتعددة</p>
            <div className="flex gap-2">
              {instText && (
                <Button variant="outline" onClick={() => { setInstText(''); onConfigChange({ institutionalText: '' }); }}
                  className="border-slate-200 text-slate-500 gap-1.5">
                  <X size={13} /> مسح النص
                </Button>
              )}
              <Button onClick={saveText} className="bg-amber-500 hover:bg-amber-600 gap-1.5 px-6">
                <Save size={14} /> حفظ النص
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── iPhone 17 Pro Max Launcher ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden col-span-full">
        <div className="h-1 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-300" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <span style={{ fontSize: 18 }}>📱</span> محاكي iPhone 17 Pro Max
          </CardTitle>
          <CardDescription className="text-xs">يعرض الموقع نفسه بحواف شاشة آيفون منحنية — بدون هيكل الجهاز الخارجي</CardDescription>
        </CardHeader>
        <CardContent>
          <IPhoneLauncherSettings systemConfig={systemConfig} onConfigChange={onConfigChange} />
        </CardContent>
      </Card>
    </>
  );
}
