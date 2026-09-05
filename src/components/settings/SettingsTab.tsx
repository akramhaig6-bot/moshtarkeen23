// تبويب الإعدادات — المظهر والنسخ الاحتياطي والتخزين

import { Subscriber, Operation, SystemConfig } from '@/types';
import React, { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle, Database, Moon, FileDown, Upload, RotateCcw, HardDrive,
} from 'lucide-react';

export function SettingsTab({ isDark, onDarkToggle, subscribers, operations, systemConfig, onSubscribersChange, onOperationsChange, onConfigChange }: {
  isDark: boolean;
  onDarkToggle: () => void;
  subscribers: Subscriber[];
  operations: Operation[];
  systemConfig: SystemConfig;
  onSubscribersChange: (s: Subscriber[]) => void;
  onOperationsChange: (o: Operation[]) => void;
  onConfigChange: (p: Partial<SystemConfig>) => void;
}) {
  const storageSize = useMemo(() => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    return (total / 1024).toFixed(1);
  }, []);

  const exportBackup = () => {
    const data = { subscribers, operations, systemConfig, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `backup_moshtarikeen_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير النسخة الاحتياطية');
  };

  const importRef = useRef<HTMLInputElement>(null);

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.subscribers) onSubscribersChange(data.subscribers);
        if (data.operations) onOperationsChange(data.operations);
        if (data.systemConfig) onConfigChange(data.systemConfig);
        toast.success('تم استيراد النسخة الاحتياطية بنجاح');
      } catch {
        toast.error('ملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (!confirm('تحذير: سيتم حذف جميع البيانات وإعادة تعيين النظام. هل أنت متأكد؟')) return;
    localStorage.removeItem('msub_v2');
    localStorage.removeItem('mops_v3');
    localStorage.removeItem('msys_config_v2');
    toast.success('تم إعادة تعيين النظام — سيتم تحديث الصفحة');
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-black text-slate-800">الإعدادات</h2>
        <p className="text-sm text-slate-400 mt-0.5">تخصيص النظام والبيانات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Moon size={18} className="text-slate-600" /> المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">الوضع الليلي</p>
                <p className="text-xs text-slate-400 mt-0.5">تغيير مظهر النظام إلى الوضع الداكن</p>
              </div>
              <button onClick={onDarkToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">اختصارات لوحة المفاتيح</p>
                <p className="text-xs text-slate-400 mt-0.5">اضغط ⌘K للبحث السريع</p>
              </div>
              <div className="flex gap-1">
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘K</kbd>
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘N</kbd>
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘O</kbd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <HardDrive size={18} className="text-blue-500" /> التخزين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'المشتركون', value: subscribers.length, unit: 'مشترك', color: 'text-emerald-600' },
              { label: 'العمليات', value: operations.length, unit: 'عملية', color: 'text-blue-600' },
              { label: 'حجم البيانات', value: storageSize, unit: 'كيلوبايت', color: 'text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`text-sm font-black ${item.color}`}>{item.value} {item.unit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Database size={18} className="text-emerald-500" /> النسخ الاحتياطي والاستعادة
            </CardTitle>
            <CardDescription className="text-xs">تصدير كامل البيانات أو استيرادها من ملف JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={exportBackup} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
              <FileDown size={16} /> تصدير نسخة احتياطية (JSON)
            </Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importBackup} />
            <Button onClick={() => importRef.current?.click()} variant="outline" className="w-full gap-2 border-slate-200 text-slate-600">
              <Upload size={16} /> استيراد من ملف JSON
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => {
                const header = ['الاسم','الهاتف','IBAN','الاشتراك','الأرباح','الرسوم','الحالة','التاريخ'];
                const rows = subscribers.map(s => [s.name,s.phone,s.iban,s.subscriptionAmount,s.profits,s.systemFees,s.subscriberStatus,s.joinDate]);
                const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download='المشتركين.csv'; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير المشتركين');
              }} variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600 text-xs">
                <FileDown size={12} /> مشتركون CSV
              </Button>
              <Button onClick={() => {
                const header = ['الاسم','العملية','المبلغ','التاريخ','الحالة'];
                const rows = operations.map(o => [o.subscriberName,o.operation,o.amount,o.date,o.status]);
                const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download='العمليات.csv'; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير العمليات');
              }} variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600 text-xs">
                <FileDown size={12} /> عمليات CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-none shadow-sm ring-1 ring-red-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" /> منطقة الخطر
            </CardTitle>
            <CardDescription className="text-xs text-red-500">هذه الإجراءات لا يمكن التراجع عنها</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={resetAll} variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <RotateCcw size={16} /> إعادة تعيين النظام بالكامل
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
