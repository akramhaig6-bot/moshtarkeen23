// سجل جميع العمليات مع بحث وترقيم صفحات

import { Operation } from '@/types';
import { OPERATION_STATUSES } from '@/constants/app';
import { amountColor, statusBadge } from '@/components/shared/StatusBadges';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, User, ClipboardList, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';

export function AllOperationsLog({ operations }: { operations: Operation[] }) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [search, setSearch] = useState('');
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q));
    }
    return ops;
  }, [operations, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-800">سجل جميع العمليات</CardTitle>
            <CardDescription className="text-xs">{operations.length} عملية مسجّلة في النظام</CardDescription>
          </div>
          <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{filtered.length} عملية</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input placeholder="بحث في العمليات..." className="h-9 pr-9 border-slate-200 text-sm"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44 h-9 border-slate-200 text-sm">
              <Filter size={12} className="ml-1 text-slate-400" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الكل">جميع الحالات</SelectItem>
              {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                  <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((op, i) => (
                <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="text-slate-400 text-xs">{(page - 1) * PER_PAGE + i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User size={11} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{op.subscriberName || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{op.operation}</TableCell>
                  <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                  <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                  <TableCell>{statusBadge(op.status)}</TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    <ClipboardList size={26} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">لا توجد عمليات مطابقة</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">صفحة {page} من {totalPages}</span>
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
  );
}
