// اختبار قواعد مبالغ سجل العمليات (تشمل الجميع):
// — اشتراك جديد: 500 – 10,000 ر.س
// — تنشيط النظام: 5,000 – 18,000 ر.س
// — أرباح (توزيع/سحب): 50,000 – 400,000 ر.س
// — باقي العمليات: 43,000 – 300,000 ر.س
import { describe, it, expect } from 'vitest';
import { INITIAL_OPERATIONS, buildGulfNameOperations } from '@/data/seed';
import { GULF_NAMES, GULF_NAMES_EXTRA } from '@/data/names';

const parseAmount = (s: string) => Number(s.replace(/[^\d]/g, ''));

function expectedRange(op: { operation: string; status: string }): [number, number] {
  const key = op.operation || op.status;
  if (key === 'اشتراك جديد') return [500, 10_000];
  if (key === 'تنشيط النظام') return [5_000, 18_000];
  if (key.includes('ارباح')) return [50_000, 400_000];
  return [43_000, 300_000];
}

describe('قواعد مبالغ سجل العمليات', () => {
  const ops = INITIAL_OPERATIONS;

  it('كل عملية ضمن نطاقها حسب النوع', () => {
    for (const o of ops) {
      const [min, max] = expectedRange(o);
      const n = parseAmount(o.amount);
      expect(n, `المبلغ ${o.amount} للعملية "${o.operation}" خارج النطاق`).toBeGreaterThanOrEqual(min);
      expect(n, `المبلغ ${o.amount} للعملية "${o.operation}" خارج النطاق`).toBeLessThanOrEqual(max);
    }
  });

  it('عمليات اشتراك جديد ضمن 500 – 10,000 ر.س', () => {
    const sub = ops.filter(o => o.operation === 'اشتراك جديد');
    expect(sub.length).toBeGreaterThan(0);
    for (const o of sub) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(500);
      expect(n).toBeLessThanOrEqual(10_000);
    }
  });

  it('عمليات تنشيط النظام ضمن 5,000 – 18,000 ر.س', () => {
    const act = ops.filter(o => o.operation === 'تنشيط النظام');
    expect(act.length).toBeGreaterThan(0);
    for (const o of act) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(5_000);
      expect(n).toBeLessThanOrEqual(18_000);
    }
  });

  it('عمليات الأرباح ضمن 50,000 – 400,000 ر.س', () => {
    const profits = ops.filter(o => o.operation.includes('ارباح'));
    expect(profits.length).toBeGreaterThan(0);
    for (const o of profits) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(50_000);
      expect(n).toBeLessThanOrEqual(400_000);
    }
  });

  it('المبالغ متباينة (أكثر من 50 قيمة فريدة)', () => {
    expect(new Set(ops.map(o => o.amount)).size).toBeGreaterThan(50);
  });

  it('الحالات مختلطة: مكتمل · قيد المعالجة · اشتراك جديد · تنشيط النظام', () => {
    const statuses = new Set(ops.map(o => o.status));
    for (const s of ['مكتمل', 'قيد المعالجة', 'اشتراك جديد', 'تنشيط النظام']) {
      expect(statuses.has(s)).toBe(true);
    }
    const types = new Set(ops.map(o => o.operation));
    expect(types.size).toBeGreaterThan(2);
  });

  it('سجل العمليات يشمل الدفعة الجديدة كاملة (305 اسماً) بدون أكرم هيج', () => {
    const logNames = new Set(buildGulfNameOperations().map(o => o.subscriberName));
    for (const name of GULF_NAMES_EXTRA) {
      expect(logNames.has(name), `الاسم غير موجود في السجل: ${name}`).toBe(true);
    }
    expect(logNames.has('أكرم هيج')).toBe(false);
    expect(buildGulfNameOperations().length).toBe(GULF_NAMES.length + GULF_NAMES_EXTRA.length);
  });
});
