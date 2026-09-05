// ── العمليات المتقدمة ──

import { Operation } from '@/types';
import { OPERATION_TYPES, OPERATION_STATUSES, EMPTY_OP } from '@/constants/app';
import { uid, todayStr } from '@/lib/random';
import { statusBadge } from '@/components/shared/StatusBadges';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Search, CheckCircle2, ClipboardList, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, Clock, Zap,
} from 'lucide-react';

export function AdvancedOperations({ operations, onOperationsChange, subscriberNames }: { operations: Operation[]; onOperationsChange: (o: Operation[]) => void; subscriberNames: string[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Operation, 'id'>>({ ...EMPTY_OP });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (search.trim()) { const q = search.toLowerCase(); ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q)); }
    return ops;
  }, [operations, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_OP, date: todayStr() }); setEditId(null); setIsOpen(true); };
  const openEdit = (op: Operation) => { const { id, ...rest } = op; setForm(rest); setEditId(id); setIsOpen(true); };
  const handleSave = () => {
    if (editId) { onOperationsChange(operations.map(o => o.id === editId ? { id: editId, ...form } : o)); }
    else { onOperationsChange([{ id: uid(), ...form }, ...operations]); }
    setIsOpen(false); setPage(1);
  };
  const doDelete = (id: string) => { onOperationsChange(operations.filter(o => o.id !== id)); setDeleteId(null); };

  const statusCounts = useMemo(() => ({
    completed: operations.filter(o => o.status === 'مكتمل').length,
    pending: operations.filter(o => o.status === 'قيد المعالجة').length,
    activation: operations.filter(o => o.status === 'تنشيط النظام').length,
  }), [operations]);

  return (
    <>
      {/* إحصائيات العمليات */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'مكتملة', value: statusCounts.completed, color: '#10b981', icon: <CheckCircle2 size={18} /> },
          { label: 'قيد المعالجة', value: statusCounts.pending, color: '#3b82f6', icon: <Clock size={18} /> },
          { label: 'تنشيط', value: statusCounts.activation, color: '#ef4444', icon: <Zap size={18} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">{item.label}</p>
              <p className="text-2xl font-black text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* شريط البحث والفلتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input placeholder="بحث في العمليات..."
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
            {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="h-11 px-5 gap-2 font-bold"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
          <Plus size={16} /> إضافة عملية
        </Button>
      </div>

      {/* الجدول */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة', ''].map(h => (
                  <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((op, i) => (
                <motion.tr key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        {(op.subscriberName || '?').charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{op.subscriberName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-sm">{op.operation}</td>
                  <td className={`px-4 py-3.5 text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>{op.amount}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{op.date}</td>
                  <td className="px-4 py-3.5">{statusBadge(op.status)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/20 text-blue-400"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(op.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات مطابقة</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} عملية</span>
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

      {/* مودال الإضافة/التعديل */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-white">{editId ? 'تعديل عملية' : 'إضافة عملية جديدة'}</h3>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">اسم المشترك</label>
                    <Input list="adv-sub-list" value={form.subscriberName} onChange={e => setForm(f => ({ ...f, subscriberName: e.target.value }))}
                      placeholder="اكتب أو اختر" className="h-10 text-white placeholder:text-slate-500"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <datalist id="adv-sub-list">{subscriberNames.map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">نوع العملية</label>
                      <Select value={form.operation} onValueChange={v => setForm(f => ({ ...f, operation: v }))}>
                        <SelectTrigger className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">الحالة</label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">المبلغ</label>
                      <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="مثال: 5,000 ر.س" className="h-10 text-white placeholder:text-slate-500"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">التاريخ</label>
                      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSave} className="flex-1 gap-1.5 font-bold"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                    <Save size={14} />{editId ? 'حفظ التعديل' : 'إضافة العملية'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/15 text-slate-300 hover:bg-white/10">إلغاء</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" style={{ background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-white">تأكيد حذف العملية</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-slate-400">سيتم حذف العملية نهائياً ولا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="border-white/15 text-slate-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
