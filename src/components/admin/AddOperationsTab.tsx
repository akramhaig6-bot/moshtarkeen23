// تبويب سجل العمليات — إضافة وتعديل وحذف العمليات

import { Operation } from '@/types';
import { OPERATION_TYPES, OPERATION_STATUSES, ADMIN_OPS_PER_PAGE, EMPTY_OP } from '@/constants/app';
import { uid, todayStr } from '@/lib/random';
import { amountColor, statusBadge } from '@/components/shared/StatusBadges';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Search, User, ClipboardList, Plus, Pencil, Trash2, X, Save, ChevronLeft, ChevronRight, Filter, Calendar, Banknote, FileDown,
} from 'lucide-react';

export function AddOperationsTab({ operations, onOperationsChange, subscriberNames, sectionName }: {
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
  subscriberNames: string[];
  sectionName: string;
}) {
  const [form, setForm] = useState<Omit<Operation, 'id'>>({ ...EMPTY_OP });
  const [editId, setEditId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [searchOp, setSearchOp] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (searchOp.trim()) {
      const q = searchOp.toLowerCase();
      ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q));
    }
    return ops;
  }, [operations, filterStatus, searchOp]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_OPS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ADMIN_OPS_PER_PAGE, page * ADMIN_OPS_PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_OP, date: todayStr() }); setEditId(null); setIsOpen(true); };
  const openEdit = (op: Operation) => { const { id, ...rest } = op; setForm(rest); setEditId(id); setIsOpen(true); };

  const handleSave = () => {
    if (editId) {
      onOperationsChange(operations.map(o => o.id === editId ? { id: editId, ...form } : o));
      toast.success('تم تحديث العملية بنجاح');
    } else {
      onOperationsChange([{ id: uid(), ...form }, ...operations]);
      toast.success('تمت إضافة العملية بنجاح');
    }
    setIsOpen(false);
    setPage(1);
  };

  const doDelete = (id: string) => {
    onOperationsChange(operations.filter(o => o.id !== id));
    setDeleteId(null);
    toast.error('تم حذف العملية');
  };

  const exportCSV = () => {
    const header = ['الاسم', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'];
    const rows = filtered.map(o => [o.subscriberName, o.operation, o.amount, o.date, o.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `العمليات_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير العمليات بنجاح');
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{operations.length} عملية مسجّلة في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 h-9">
            <FileDown size={14} /> تصدير CSV
          </Button>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm">
            <Plus size={16} /> إضافة عملية
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input placeholder="بحث في العمليات..." className="h-10 pr-9 border-slate-200" value={searchOp}
              onChange={e => { setSearchOp(e.target.value); setPage(1); }} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48 h-10 border-slate-200">
              <Filter size={13} className="ml-1.5 text-slate-400" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الكل">جميع الحالات</SelectItem>
              {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((op, i) => (
                  <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-slate-400 text-xs">{(page - 1) * ADMIN_OPS_PER_PAGE + i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-slate-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{op.subscriberName || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm text-slate-600">{op.operation}</span></TableCell>
                    <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                    <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                    <TableCell>{statusBadge(op.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(op.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <ClipboardList size={30} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-medium text-sm">لا توجد عمليات مطابقة</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">صفحة {page} من {totalPages} · {filtered.length} عملية</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight size={13} /> السابق
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                  disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  التالي <ChevronLeft size={13} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-slate-800">{editId ? 'تعديل عملية' : 'إضافة عملية جديدة'}</h3>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><User size={11} />اسم المشترك</label>
                    <Input list="sub-list" value={form.subscriberName} onChange={e => setForm(f => ({ ...f, subscriberName: e.target.value }))}
                      placeholder="اكتب أو اختر اسم المشترك" className="h-10 border-slate-200" />
                    <datalist id="sub-list">
                      {subscriberNames.map(n => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">نوع العملية</label>
                      <Select value={form.operation} onValueChange={v => setForm(f => ({ ...f, operation: v }))}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">الحالة</label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Banknote size={11} />المبلغ</label>
                      <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="1,500 ر.س" className="h-10 border-slate-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={11} />التاريخ</label>
                      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10 border-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="border-slate-200">إلغاء</Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-1.5 px-5">
                    <Save size={13} /> {editId ? 'حفظ التعديل' : 'إضافة'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
