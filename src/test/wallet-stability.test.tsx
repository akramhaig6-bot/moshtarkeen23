// ═══════════════════════════════════════════════════════════════
// اختبارات انحدار (regression) لمشكلتين في تطبيق العميل:
// 1) البطاقات/CMS كانت تهتزّ/ترفرف: نبضة ساعة كل ثانية + مكوّنات معرّفة داخل جسم
//    المكوّن الأم = إعادة تركيب (unmount/mount) للشجرة كل ثانية، فتُعاد حركة الظهور.
//    الدليل القاطع: عدد عقد DOM المُضافة/المحذوفة يجب أن يكون صفراً مع مرور الوقت.
// 2) عنوان قسم المحفظة يجب أن يكون "محفظة المستثمر".
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SubscriberDashboard } from '@/components/cms/SubscriberDashboard';
import { buildAkramDemo } from '@/data/akram-demo';
import { DEFAULT_CMS } from '@/data/cms-defaults';
import { resolveCMS } from '@/data/cms-defaults';

const operations = [
  { id: 'o1', subscriberName: 'أكرم هيج', operation: 'توزيع أرباح', amount: '800 USDT', date: '2025-01-01', status: 'مكتمل' as const },
  { id: 'o2', subscriberName: 'أكرم هيج', operation: 'إيداع', amount: '5,000 USDT', date: '2024-12-15', status: 'مكتمل' as const },
];

describe('SubscriberDashboard — ثبات البطاقات (بدون اهتزاز/رفة)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('لا يحذف/يعيد تركيب عقد DOM مع تقدّم نبضات الوقت', () => {
    const { subscriber, cms } = buildAkramDemo();
    const { container } = render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);

    const host = container.firstChild as HTMLElement;
    let added = 0, removed = 0;
    const observer = new MutationObserver(muts => muts.forEach(m => { added += m.addedNodes.length; removed += m.removedNodes.length; }));
    observer.observe(host, { childList: true, subtree: true });

    const cardNode = screen.getByText('مبلغ الاشتراك').parentElement?.parentElement as HTMLElement;
    expect(cardNode).toBeTruthy();

    // ثلاث نبضات (كانت الداشبورد تعيد تركيب نفسها في كل واحدة منها)
    for (let i = 0; i < 3; i++) act(() => { vi.advanceTimersByTime(1000); });
    observer.takeRecords().forEach(m => { added += m.addedNodes.length; removed += m.removedNodes.length; });
    observer.disconnect();

    expect({ added, removed }).toEqual({ added: 0, removed: 0 });
    // نفس العقدة ما زالت موصولة = لم تُعاد تركيبها = حركة الظهور لم تُشغَّل من جديد
    expect(screen.getByText('مبلغ الاشتراك').parentElement?.parentElement).toBe(cardNode);
    expect(cardNode.isConnected).toBe(true);
  });

  it('لا يفقد حقل البحث تركيزه ولا قيمته عند تقدّم الوقت', () => {
    const { subscriber, cms } = buildAkramDemo();
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    const input = screen.getByPlaceholderText('بحث...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'إيداع' } });
    input.focus();
    for (let i = 0; i < 2; i++) act(() => { vi.advanceTimersByTime(1000); });
    expect(input.value).toBe('إيداع');
    expect(document.activeElement).toBe(input);
  });

  it('الحالة الداخلية للقسم القابل للطي لا تُصفَّر مع الوقت', () => {
    const { subscriber, cms } = buildAkramDemo();
    const localCms = { ...resolveCMS(cms), sections: [{ ...resolveCMS(cms).sections[0]!, collapsible: true, defaultState: 'open' as const }] };
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(localCms)} />);
    const heading = screen.getAllByText(localCms.sections[0].title)[0];
    expect(heading).toBeTruthy();
    for (let i = 0; i < 2; i++) act(() => { vi.advanceTimersByTime(1000); });
    // نفس العقدة بعد نبضتين = المكوّن لم يُعاد تركيبه (وإلا عاد setOpen إلى الافتراضي)
    expect(screen.getAllByText(localCms.sections[0].title)[0]).toBe(heading);
  });
});

describe('قسم محفظة المستثمر — التسمية', () => {
  it('عنوان القسم داخل العرض هو "محفظة المستثمر"', () => {
    const { subscriber, cms } = buildAkramDemo();
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    fireEvent.click(screen.getByText('المحفظة')); // زر المحفظة في الشريط السفلي
    expect(screen.getByText('💼 محفظة المستثمر')).toBeTruthy();
  });

  it('شريط الحالة العلوي يعرض "محفظة المستثمر" افتراضياً', () => {
    expect(DEFAULT_CMS.topBar.title).toBe('محفظة المستثمر');
    expect(buildAkramDemo().cms.topBar.title).toBe('محفظة المستثمر');
  });

  it('عنصر السايد بار للمحفظة موسوم بـ "محفظة المستثمر"', () => {
    const item = buildAkramDemo().cms.sideBar.items.find(i => i.action === 'wallet');
    expect(item?.label).toBe('محفظة المستثمر');
  });
});

describe('ترحيل التسميات القديمة في CMS المحفوظ (localStorage)', () => {
  // نبني كائنات كاملة الحقول من DEFAULT_CMS بدل اللجوء إلى any
  const withTopBarTitle = (title: string) => resolveCMS({ ...DEFAULT_CMS, topBar: { ...DEFAULT_CMS.topBar, title } });

  it('«محفظتي» في الشريط العلوي تتحول إلى «محفظة المستثمر»', () => {
    expect(withTopBarTitle('محفظتي').topBar.title).toBe('محفظة المستثمر');
    expect(withTopBarTitle('محفظتي الاستثمارية').topBar.title).toBe('محفظة المستثمر');
  });

  it('التسمية المخصصة من المدير لا تُمسّ', () => {
    expect(withTopBarTitle('بوابة المستثمرين').topBar.title).toBe('بوابة المستثمرين');
  });

  it('زر الشريط السفلي يبقى قصيراً وعنصر السايد بار يتبنّى التسمية الكاملة', () => {
    const base = resolveCMS(undefined);
    const bottomBar = { ...base.bottomBar, buttons: base.bottomBar.buttons.map(b => (b.action === 'wallet' ? { ...b, label: 'محفظتي' } : b)) };
    const sideBar = { ...base.sideBar, items: base.sideBar.items.map(i => (i.action === 'wallet' ? { ...i, label: 'محفظتي' } : i)) };
    const r = resolveCMS({ ...base, bottomBar, sideBar });
    expect(r.bottomBar.buttons.find(b => b.action === 'wallet')?.label).toBe('المحفظة');
    expect(r.sideBar.items.find(i => i.action === 'wallet')?.label).toBe('محفظة المستثمر');
  });
});
