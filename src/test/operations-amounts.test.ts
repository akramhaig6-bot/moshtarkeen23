// اختبار قواعد مبالغ العمليات:
// — جميع العمليات من 43,000 إلى 300,000 ر.س (متباينة)
// — عمليات "تنشيط النظام" من 10,000 إلى 18,000 ر.س
import { describe, it, expect } from 'vitest';
import { INITIAL_OPERATIONS, buildGulfNameOperations } from '@/data/seed';
import { buildAkramDemo } from '@/data/akram-demo';

const parseAmount = (s: string) => Number(s.replace(/[^\d]/g, ''));

describe('قواعد مبالغ سجل العمليات', () => {
  const ops = INITIAL_OPERATIONS;
  const activation = ops.filter(o => o.status === 'تنشيط النظام');
  const regular = ops.filter(o => o.status !== 'تنشيط النظام');

  it('جميع العمليات العادية ضمن 43,000 – 300,000 ر.س', () => {
    expect(regular.length).toBeGreaterThan(0);
    for (const o of regular) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(43_000);
      expect(n).toBeLessThanOrEqual(300_000);
    }
  });

  it('عمليات تنشيط النظام ضمن 10,000 – 18,000 ر.س', () => {
    expect(activation.length).toBeGreaterThan(0);
    for (const o of activation) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(10_000);
      expect(n).toBeLessThanOrEqual(18_000);
    }
  });

  it('المبالغ متباينة (أكثر من 20 قيمة فريدة)', () => {
    expect(new Set(ops.map(o => o.amount)).size).toBeGreaterThan(20);
  });

  it('الحالات مختلطة: مكتمل · قيد المعالجة · اشتراك جديد · تنشيط النظام', () => {
    const statuses = new Set(ops.map(o => o.status));
    for (const s of ['مكتمل', 'قيد المعالجة', 'اشتراك جديد', 'تنشيط النظام']) {
      expect(statuses.has(s)).toBe(true);
    }
    const types = new Set(ops.map(o => o.operation));
    expect(types.size).toBeGreaterThan(2);
  });

  it('عمليات أسماء الخليج تتبع نفس قواعد المبالغ', () => {
    for (const o of buildGulfNameOperations()) {
      const n = parseAmount(o.amount);
      if (o.status === 'تنشيط النظام') {
        expect(n).toBeGreaterThanOrEqual(10_000);
        expect(n).toBeLessThanOrEqual(18_000);
      } else {
        expect(n).toBeGreaterThanOrEqual(43_000);
        expect(n).toBeLessThanOrEqual(300_000);
      }
    }
  });

  it('عمليات أكرم هيج التجريبية ضمن 43,000 – 300,000', () => {
    for (const o of buildAkramDemo().operations) {
      const n = parseAmount(o.amount);
      expect(n).toBeGreaterThanOrEqual(43_000);
      expect(n).toBeLessThanOrEqual(300_000);
    }
  });
});
