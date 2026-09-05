// ── المشتركون المتقدمون ──

import { Subscriber, Operation } from '@/types';
import { SUBSCRIBER_STATUSES } from '@/constants/app';
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Users, TrendingUp, Wallet, Search, AlertCircle, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react';

export function AdvancedSubscribers({ subscribers, operations, onSubscribersChange }: { subscribers: Subscriber[]; operations: Operation[]; onSubscribersChange: (s: Subscriber[]) => void }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let subs = [...subscribers];
    if (filterStatus !== 'الكل') subs = subs.filter(s => s.subscriberStatus === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      subs = subs.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.iban.toLowerCase().includes(q) || s.platform.toLowerCase().includes(q));
    }
    return subs;
  }, [subscribers, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const doDelete = (id: string) => { onSubscribersChange(subscribers.filter(s => s.id !== id)); setDeleteId(null); };

  const totalSubscription = subscribers.reduce((a, s) => a + s.subscriptionAmount, 0);
  const totalProfits = subscribers.reduce((a, s) => a + s.profits, 0);
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);

  return (
    <>
      {/* ملخص مالي */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الاشتراكات', value: totalSubscription, color: '#3b82f6', icon: <Wallet size={18} /> },
          { label: 'إجمالي الأرباح', value: totalProfits, color: '#10b981', icon: <TrendingUp size={18} /> },
          { label: 'إجمالي الرسوم', value: totalFees, color: '#f59e0b', icon: <AlertCircle size={18} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">{item.label}</p>
              <p className="text-xl font-black text-white">{item.value.toLocaleString()} ر.س</p>
            </div>
          </div>
        ))}
      </div>

      {/* البحث والفلتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input placeholder="بحث بالاسم، الهاتف، الآيبان، المنصة..."
            className="pr-9 h-11 text-white placeholder:text-slate-500"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-48 h-11 text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الحالات</SelectItem>
            {SUBSCRIBER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* قائمة المشتركين */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {paged.map((sub, i) => {
            const subOpsCount = operations.filter(o => o.subscriberName === sub.name).length;
            const initials = sub.name.split(' ').map(w => w[0]).join('').slice(0, 2);
            const colorGradients = [
              'linear-gradient(135deg,#3b82f6,#06b6d4)',
              'linear-gradient(135deg,#8b5cf6,#a855f7)',
              'linear-gradient(135deg,#10b981,#14b8a6)',
              'linear-gradient(135deg,#f59e0b,#f97316)',
              'linear-gradient(135deg,#f43f5e,#ec4899)',
            ];
            const colorGrad = colorGradients[i % colorGradients.length];
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-lg"
                  style={{ background: colorGrad }}>
                  {initials || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-white">{sub.name || '(بدون اسم)'}</p>
                    {sub.subscriberStatus && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {sub.subscriberStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {sub.phone && <span className="text-xs text-slate-500">{sub.phone}</span>}
                    {sub.platform && <span className="text-xs text-purple-400">{sub.platform}</span>}
                    {sub.currency && <span className="text-xs text-blue-400 font-bold">{sub.currency}</span>}
                    <span className="text-xs text-slate-600">{subOpsCount} عملية</span>
                  </div>
                </div>
                <div className="text-left flex-shrink-0 hidden sm:block">
                  {sub.subscriptionAmount > 0 && (
                    <p className="text-sm font-black text-white">{sub.subscriptionAmount.toLocaleString()} ر.س</p>
                  )}
                  {sub.profits > 0 && (
                    <p className="text-xs text-emerald-400">+{sub.profits.toLocaleString()} ر.س</p>
                  )}
                </div>
                <button onClick={() => setDeleteId(sub.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
          {paged.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد مشتركون مطابقون</p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} مشترك</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={13} /> السابق
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                التالي <ChevronLeft size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" style={{ background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-white">تأكيد حذف المشترك</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-slate-400">سيتم حذف البيانات نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="border-white/15 text-slate-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف المشترك</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
