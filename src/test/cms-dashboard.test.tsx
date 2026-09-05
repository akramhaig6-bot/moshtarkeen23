// اختبار دخاني شامل: بيانات أكرم هيج + الداشبورد + التنقل + CMSBuilder
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SubscriberDashboard } from '@/components/cms/SubscriberDashboard';
import { CMSBuilder } from '@/components/cms/CMSBuilder';
import { buildAkramDemo } from '@/data/akram-demo';
import { resolveCMS } from '@/data/cms-defaults';

describe('buildAkramDemo — البيانات التجريبية', () => {
  const demo = buildAkramDemo();
  it('يحتوي على بيانات أكرم هيج الصحيحة', () => {
    expect(demo.subscriber.name).toBe('أكرم هيج');
    expect(demo.subscriber.phone).toBe('+966551234567');
    expect(demo.subscriber.iban).toBe('SA0380000000608010167519');
    expect(demo.subscriber.accountNumber).toBe('608010167519');
    expect(demo.subscriber.subscriptionAmount).toBe(15000);
    expect(demo.subscriber.profits).toBe(4200);
    expect(demo.subscriber.systemFees).toBe(150);
    expect(demo.subscriber.systemAccount).toBe('SYS-AKRAM-001');
    expect(demo.subscriber.joinDate).toBe('2024-01-15');
    expect(demo.subscriber.bankName).toBe('مصرف الراجحي');
    expect(demo.subscriber.bankType).toBe('islamic');
    expect(demo.subscriber.withdrawalText).toContain('24 ساعة');
  });
  it('يحتوي على 5 عمليات مكتملة', () => {
    expect(demo.operations).toHaveLength(5);
    demo.operations.forEach(op => {
      expect(op.subscriberName).toBe('أكرم هيج');
      expect(op.status).toBe('مكتمل');
    });
  });
  it('يحتوي على CMS كامل (28 قسم)', () => {
    const cms = demo.cms;
    expect(cms.company.name).toBe('هيج للاستثمار الذكي');
    expect(cms.topBar.bgColor).toBe('#1e3a8a');
    expect(cms.bottomBar.enabled).toBe(true);
    expect(cms.bottomBar.buttons.filter(b => b.visible)).toHaveLength(5);
    expect(cms.bottomBar.buttons.find(b => b.action === 'withdraw')?.highlighted).toBe(true);
    expect(cms.bottomBar.buttons.find(b => b.action === 'profits')?.badge).toBe(3);
    expect(cms.sideBar.items).toHaveLength(10);
    expect(cms.sideBar.items.filter(i => i.separator)).toHaveLength(3);
    expect(cms.texts.filter(t => t.location === 'query')).toHaveLength(2);
    expect(cms.texts.filter(t => t.location === 'afterQuery')).toHaveLength(1);
    expect(cms.sections).toHaveLength(2);
    expect(cms.sections[0].images).toHaveLength(3);
    expect(cms.infoCards).toHaveLength(8);
    expect(cms.infoCards.some(c => c.sparkline.length > 1)).toBe(true);
    expect(cms.charts.map(c => c.type)).toContain('pie');
    expect(cms.counters).toHaveLength(4);
    expect(cms.achievements).toHaveLength(8);
    expect(cms.banners.some(b => b.expiryDate === '2025-02-28')).toBe(true);
    expect(cms.dataTable.searchable).toBe(true);
    expect(cms.dataTable.exportable).toBe('pdf');
    expect(cms.map.enabled).toBe(true);
    expect(cms.messages.messages).toHaveLength(4);
    expect(cms.calendar.events.some(e => e.repeat === 'monthly')).toBe(true);
    expect(cms.gallery.images).toHaveLength(5);
    expect(cms.alerts).toHaveLength(4);
    expect(cms.documents).toHaveLength(5);
    expect(cms.progressBars).toHaveLength(4);
    expect(cms.countdowns).toHaveLength(2);
    expect(cms.invoice.customNumber).toBe('INV-2024-VIP-001');
    expect(cms.templateId).toBe('gulf-luxury');
    expect(cms.design.fonts.body).toBe('Tajawal');
    expect(cms.design.background.type).toBe('gradient');
    expect(cms.widgets.qrCode).toBe(true);
    expect(cms.widgets.profitCalculator).toBe(true);
    expect(cms.design.query.buttonColor).toBe('#d4af37');
  });
});

describe('SubscriberDashboard — العرض والتنقل', () => {
  const { subscriber, cms } = buildAkramDemo();
  const operations = [
    { id: 'o1', subscriberName: 'أكرم هيج', operation: 'توزيع أرباح', amount: '800 USDT', date: '2025-01-01', status: 'مكتمل' },
    { id: 'o2', subscriberName: 'أكرم هيج', operation: 'إيداع', amount: '5,000 USDT', date: '2024-12-15', status: 'مكتمل' },
    { id: 'o3', subscriberName: 'غير موجود', operation: 'سحب', amount: '100', date: '2024-01-01', status: 'مكتمل' },
  ];

  it('يعرض الرئيسية بكل المحتوى بدون انهيار', () => {
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    // الشركة + البطاقات المالية + الجدول
    expect(screen.getByText('هيج للاستثمار الذكي')).toBeTruthy();
    expect(screen.getByText('مبلغ الاشتراك')).toBeTruthy();
    expect(screen.getByText('15,000')).toBeTruthy();
    // Bottom Bar: 5 أزرار
    expect(screen.getByText('أرباحي')).toBeTruthy();
    expect(screen.getByText('سحب')).toBeTruthy();
    // جدول العمليات
    expect(screen.getAllByText('سجل العمليات').length).toBeGreaterThan(0);
    // الرسائل: غير مقروءة تظهر
    expect(screen.getAllByText(/توزيع أرباح ديسمبر/).length).toBeGreaterThan(0);
    // حاسبة الأرباح
    expect(screen.getByText('حاسبة الأرباح التفاعلية')).toBeTruthy();
    // QR
    expect(screen.getByText(/QR الاستعلام/)).toBeTruthy();
  });

  it('التنقل عبر Bottom Bar يغيّر العرض وزر الرجوع يعود للرئيسية', () => {
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    // اضغط "أرباحي" في الشريط السفلي
    fireEvent.click(screen.getByText('أرباحي'));
    expect(screen.getByText('إجمالي الأرباح')).toBeTruthy();
    // زر رجوع للرئيسية
    fireEvent.click(screen.getByText('رجوع للرئيسية'));
    expect(screen.getByText('مبلغ الاشتراك')).toBeTruthy();
    // عرض السحب: نص السحب بعد التأكيد
    fireEvent.click(screen.getByText('سحب'));
    fireEvent.click(screen.getByText('تأكيد طلب السحب'));
    expect(screen.getByText(/تم تأكيد طلب السحب بنجاح/)).toBeTruthy();
    // الحساب
    fireEvent.click(screen.getByText('حسابي'));
    expect(screen.getByText('تفاصيل الحساب')).toBeTruthy();
    expect(screen.getByText('SA0380000000608010167519')).toBeTruthy();
  });

  it('البحث في الجدول يفلتر الصفوف فوراً', () => {
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    const input = screen.getByPlaceholderText('بحث...');
    fireEvent.change(input, { target: { value: 'إيداع' } });
    // بعد الفلترة: يظهر إيداع ولا يظهر توزيع أرباح داخل الجدول
    const table = screen.getAllByText('إيداع');
    expect(table.length).toBeGreaterThan(0);
    expect(screen.queryByText('800 USDT')).toBeNull();
  });

  it('النقر على رسالة غير مقروءة يحوّلها لمقروءة', () => {
    render(<SubscriberDashboard subscriber={subscriber} operations={operations} cms={resolveCMS(cms)} />);
    expect(screen.getByText(/2 غير مقروءة|3 غير مقروءة/)).toBeTruthy();
    const msg = screen.getAllByText(/توزيع أرباح ديسمبر/).map(e => e.closest('button')).find(Boolean);
    expect(msg).toBeTruthy();
    fireEvent.click(msg!);
    expect(screen.getAllByText('✓ مقروءة').length).toBe(2);
  });
});

describe('CMSBuilder — الحقول الجديدة', () => {
  const { cms } = buildAkramDemo();
  it('يعرض ويعالج تحديث الأقسام والنصوص بدون انهيار', () => {
    let current = resolveCMS(cms);
    const { container } = render(<CMSBuilder cms={current} onChange={c => { current = c; }} subscribers={[{ ...buildAkramDemo().subscriber }]} />);
    // تبويب الأقسام (العناوين حقول إدخال — نتحقق من الحقول الجديدة)
    fireEvent.mouseDown(screen.getByText('أقسام'));
    expect(container.textContent).toContain('رفع صور');
    expect(container.textContent).toContain('نوع العرض');
    expect(container.textContent).toContain('حجم الصور');
    // تبويب النصوص: حقل الموقع الجديد
    fireEvent.mouseDown(screen.getByText('نصوص'));
    expect(container.textContent).toContain('شاشة الاستعلام');
    // تبويب جدول: الأعمدة
    fireEvent.mouseDown(screen.getByText('جدول'));
    expect(container.textContent).toContain('الأعمدة المعروضة');
    // تبويب الفاتورة: الختم
    fireEvent.mouseDown(screen.getByText('فاتورة'));
    expect(container.textContent).toContain('ختم الشركة');
    // نسخ تصميم من مشترك
    expect(screen.getByText('نسخ تصميم من مشترك')).toBeTruthy();
  });
  it('إضافة نص جديد تُنتج مصفوفة حقيقية (إصلاح الخلل القديم)', () => {
    let current = resolveCMS(undefined);
    render(<CMSBuilder cms={current} onChange={c => { current = c; }} />);
    fireEvent.mouseDown(screen.getByText('نصوص'));
    fireEvent.click(screen.getByText('إضافة'));
    expect(Array.isArray(current.texts)).toBe(true);
    expect(current.texts).toHaveLength(1);
  });
});
