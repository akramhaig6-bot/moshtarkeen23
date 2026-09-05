// شارات الحالات وألوان المبالغ المشتركة بين الجداول

import React from 'react';
import { Badge } from '@/components/ui/badge';

export function amountColor(status: string): string {
  if (status === 'تنشيط النظام') return 'text-red-600 font-bold';
  if (status === 'اشتراك جديد') return 'text-yellow-600 font-bold';
  if (status === 'قيد المعالجة') return 'text-blue-600 font-bold';
  return 'text-emerald-600 font-bold';
}

export function statusBadge(status: string): React.ReactNode {
  const map: Record<string, string> = {
    'تنشيط النظام': 'bg-red-100 text-red-700 border-red-200',
    'اشتراك جديد': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'قيد المعالجة': 'bg-blue-100 text-blue-700 border-blue-200',
    'مكتمل': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const dotColor: Record<string, string> = {
    'تنشيط النظام': 'bg-red-500',
    'اشتراك جديد': 'bg-yellow-500',
    'قيد المعالجة': 'bg-blue-500',
    'مكتمل': 'bg-emerald-500',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const dot = dotColor[status] ?? 'bg-gray-400';
  return (
    <Badge className={`${cls} border text-xs gap-1 hover:opacity-90`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
      {status}
    </Badge>
  );
}

export function subStatusBadge(status: string): React.ReactNode {
  const map: Record<string, string> = {
    'نشط': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'مشترك جديد': 'bg-blue-100 text-blue-700 border-blue-200',
    'رسوم مستحقة': 'bg-orange-100 text-orange-700 border-orange-200',
    'توزيع أرباح': 'bg-purple-100 text-purple-700 border-purple-200',
    'معلق': 'bg-gray-100 text-gray-600 border-gray-200',
    'موقوف': 'bg-red-100 text-red-700 border-red-200',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return <Badge className={`${cls} border text-xs hover:opacity-90`}>{status}</Badge>;
}
