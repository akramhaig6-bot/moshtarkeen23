// تحويل بيانات المشترك إلى بيانات تشغيل لمحرّك تطبيق العميل
import { Operation, Subscriber } from '@/types';
import { DEMO_DATA, RuntimeData } from '@/lib/app-builder';

export function subscriberRuntimeData(sub: Subscriber | null, operations: Operation[]): RuntimeData {
  if (!sub) return { ...DEMO_DATA, vars: { __ops: JSON.stringify([]) } };
  const ops = operations.filter(o => o.subscriberName === sub.name);
  const currency = sub.profitsCurrencySymbol || sub.profitsCurrency || sub.currency || 'ر.س';
  return {
    name: sub.name,
    phone: sub.phone,
    balance: (sub.subscriptionAmount + sub.profits).toLocaleString(),
    profits: sub.profits.toLocaleString(),
    subscription: sub.subscriptionAmount.toLocaleString(),
    fees: sub.systemFees.toLocaleString(),
    currency,
    date: sub.joinDate || new Date().toLocaleDateString('ar-SA'),
    status: sub.subscriberStatus,
    vars: { __ops: JSON.stringify(ops) },
  };
}

/** المشاريع المرتبطة بمشترك معيّن + القوالب العامة */
export function projectsForSubscriber<T extends { subscriberId: string | null; isTemplate: boolean; published: boolean }>(
  projects: T[], subscriberId: string,
): T[] {
  return projects.filter(p => p.subscriberId === subscriberId || (p.isTemplate && p.published));
}
