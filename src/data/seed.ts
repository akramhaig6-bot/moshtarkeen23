// بيانات أولية (Seed) للمشتركين والعمليات + بيانات الرسم البياني

import { Subscriber, Operation } from '@/types';
import { SUBSCRIBER_STATUSES } from '@/constants/app';
import { ALL_BANKS_FLAT } from '@/data/banks';
import { FIRST_NAMES, LAST_NAMES, GULF_NAMES } from '@/data/names';
import { uid, randomFrom, randomInt, randomAmount, randomDate, randomPhone, randomIBAN } from '@/lib/random';

export function buildInitialSubscribers(count: number): Subscriber[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const sa = randomAmount(5000, 60000);
    const pr = randomAmount(500, 20000);
    const sf = Math.random() > 0.6 ? randomAmount(200, 3000) : 0;
    return {
      id: uid(),
      name: `${firstName} ${lastName}`,
      phone: randomPhone(),
      iban: randomIBAN(),
      subscriptionAmount: sa,
      profits: pr,
      systemFees: sf,
      systemAccount: `SYS-${String(1000 + i).padStart(6, '0')}`,
      walletAddress: Math.random() > 0.5
        ? `0x${Array.from({ length: 40 }, () => '0123456789abcdef'[randomInt(0, 15)]).join('')}`
        : '',
      bankName: randomFrom(ALL_BANKS_FLAT),
      joinDate: randomDate(2020, 2024),
      subscriberStatus: randomFrom(SUBSCRIBER_STATUSES),
      notes: '',
      withdrawalText: '',
      currency: randomFrom(['SAR', 'AED', 'USD', 'KWD', 'QAR']),
      platform: randomFrom(['Binance', 'Bybit', 'MetaTrader 4', 'MetaTrader 5', 'Exness', 'OKX']),
    };
  });
}

export const INITIAL_SUBSCRIBERS: Subscriber[] = buildInitialSubscribers(80);

// قاعدة المبالغ: جميع العمليات من 43,000 إلى 300,000 ر.س (متباينة)
// — ما عدا "تنشيط النظام": من 10,000 إلى 18,000 ر.س
export function operationAmount(status: string): string {
  const n = status === 'تنشيط النظام'
    ? randomAmount(10_000, 18_000)
    : randomAmount(43_000, 300_000);
  return `${n.toLocaleString('en-US')} ر.س`;
}

// توزيع متباين للحالات: مكتمل · قيد المعالجة · اشتراك جديد · تنشيط النظام
function variedStatus(): string {
  const r = Math.random() * 100;
  if (r < 38) return 'مكتمل';
  if (r < 58) return 'قيد المعالجة';
  if (r < 78) return 'اشتراك جديد';
  return 'تنشيط النظام';
}

export function buildGulfNameOperations(): Operation[] {
  const typeByStatus: Record<string, string[]> = {
    'مكتمل': ['توزيع ارباح', 'سحب ارباح', 'تحويل', 'اشتراك جديد'],
    'قيد المعالجة': ['تحويل', 'سحب ارباح', 'توزيع ارباح'],
    'اشتراك جديد': ['اشتراك جديد', 'تحويل'],
    'تنشيط النظام': ['تنشيط النظام'],
  };
  const today = new Date();
  return GULF_NAMES.map((name, i) => {
    // خلط متباين: مكتمل وتنشيط النظام واشتراك جديد وقيد المعالجة
    const status = variedStatus();
    const types = typeByStatus[status];
    const amount = operationAmount(status);
    const d = new Date(today);
    d.setDate(d.getDate() - (i % 60)); // موزعة على آخر 60 يوم
    return {
      id: uid(),
      subscriberName: name,
      operation: types[i % types.length],
      amount,
      date: d.toISOString().split('T')[0],
      status,
    };
  });
}

export const INITIAL_OPERATIONS: Operation[] = [
  ...buildGulfNameOperations(),
  ...Array.from({ length: 60 }, (): Operation => {
    const status = variedStatus();
    const typeByStatus: Record<string, string[]> = {
      'مكتمل': ['توزيع ارباح', 'سحب ارباح', 'تحويل', 'اشتراك جديد'],
      'قيد المعالجة': ['تحويل', 'سحب ارباح', 'توزيع ارباح'],
      'اشتراك جديد': ['اشتراك جديد', 'تحويل'],
      'تنشيط النظام': ['تنشيط النظام'],
    };
    return {
      id: uid(),
      subscriberName: randomFrom(INITIAL_SUBSCRIBERS.slice(0, 40)).name,
      operation: randomFrom(typeByStatus[status]),
      amount: operationAmount(status),
      date: randomDate(2024, 2025),
      status,
    };
  }),
];

export const CHART_DATA = [
  { name: 'يناير', value: 420000, target: 400000 },
  { name: 'فبراير', value: 380000, target: 420000 },
  { name: 'مارس', value: 510000, target: 450000 },
  { name: 'إبريل', value: 467000, target: 470000 },
  { name: 'مايو', value: 590000, target: 500000 },
  { name: 'يونيو', value: 648000, target: 540000 },
  { name: 'يوليو', value: 712000, target: 580000 },
];
