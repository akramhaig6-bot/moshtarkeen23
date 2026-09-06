/**
 * اختبار التكافؤ الوظيفي بين الحاسوب والجوال في بيئة البناء:
 * كل أداة موجودة على شريط الحاسوب يجب أن تصل إليها من الهاتف،
 * والكتابة في الحقول يجب أن تبقى مستقرة (لا يُعاد تركيب النوافذ).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { AppBuilderStudio } from '@/components/app-builder/AppBuilderStudio';
import { createProject } from '@/data/app-builder-defaults';
import { DEMO_DATA } from '@/lib/app-builder';

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 844, writable: true, configurable: true });
  window.dispatchEvent(new Event('resize'));
}

const studio = () => render(
  <AppBuilderStudio
    initialProject={createProject({ name: 'تطبيق التكافؤ' })}
    onSave={vi.fn()} onExit={vi.fn()}
    subscribers={[{ id: 's1', name: 'مشترك' }]}
    runtimeData={DEMO_DATA}
  />,
);

/** كل الأدوات التي كانت على شريط الحاسوب */
const DESKTOP_TOOLS = [
  'الصفحات', 'الأشرطة', 'النوافذ', 'إضافة مكون', 'التصميم', 'البيانات',
  'القوالب', 'إعدادات التطبيق', 'معاينة', 'نشر',
];

beforeEach(() => cleanup());

describe('تكافؤ الأدوات بين المقاسين', () => {
  it('شيت الأدوات على الهاتف يعرض كل أدوات شريط الحاسوب', () => {
    setViewport(390);
    studio();
    fireEvent.click(screen.getByLabelText('كل الأدوات'));
    const text = document.body.textContent || '';
    for (const tool of DESKTOP_TOOLS) {
      // الأدوات تُعرض بأسماء موسّعة داخل الشيت (معاينة التطبيق / نشر التطبيق…)
      const found = new RegExp(tool.replace('المكون', 'المكوّن')).test(text);
      expect(found, `الأداة «${tool}» غير متاحة على الجوال`).toBe(true);
    }
  });

  it('قوائم البنية والتصدير متاحة من شيت الأدوات على الهاتف', () => {
    setViewport(390);
    studio();
    fireEvent.click(screen.getByLabelText('كل الأدوات'));
    for (const label of ['خريطة التطبيق', 'مكتبة النوافذ الجاهزة', 'البيانات والمتغيرات', 'التصميم العام']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    // قائمة القوالب والاستيراد
    fireEvent.click(screen.getByText('القوالب · التصدير · الاستيراد'));
    for (const label of ['تصدير JSON كامل', 'تصدير JSON خفيف', 'استيراد تصميم JSON']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('الكتابة في نموذج الإنشاء لا تُفقد التركيز (لا إعادة تركيب للنافذة)', () => {
    setViewport(390);
    studio();
    fireEvent.click(screen.getByText('الصفحات'));          // قائمة الصفحات كـ sheet
    fireEvent.click(screen.getByText('صفحة'));               // زر «+ صفحة»
    const input = screen.getByPlaceholderText('مثال: صفحة أرباحي') as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: 'صفح' } });
    // نفس العقدة DOM + التركيز باقٍ = لم يُعد تركيب النموذج مع كل ضغطة مفتاح
    const after = screen.getByPlaceholderText('مثال: صفحة أرباحي') as HTMLInputElement;
    expect(after).toBe(input);
    expect(after.value).toBe('صفح');
    expect(document.activeElement).toBe(after);
  });

  it('إضافة مكوّن من المكتبة تعمل بضغطة واحدة على الجوال', () => {
    setViewport(390);
    studio();
    fireEvent.click(screen.getByLabelText('كل الأدوات'));
    fireEvent.click(screen.getByText('مكتبة المكونات'));
    expect(screen.getByText('🧱 مكتبة المكونات')).toBeInTheDocument();
    fireEvent.click(screen.getByText('زر أساسي'));
    // المكوّن أُضيف إلى المشروع (اسم المكوّن في الشجرة + نص الزر في اللوحة)
    expect((document.body.textContent || '').includes('زر أساسي')).toBe(true);
  });

  it('محرر الإجراء يفتح على الجوال بكل أنماطه وأنواع أوامره', () => {
    setViewport(390);
    studio();
    fireEvent.click(screen.getByText('إضافة'));                              // زر الإضافة العائم
    fireEvent.click(screen.getByText('زر أساسي'));                            // مكوّن زر من المكتبة
    fireEvent.click(screen.getByRole('button', { name: /خصائص «/ }));         // شيت الخصائص بضغطة
    fireEvent.click(screen.getByText(/الإجراء عند الضغط/));                   // تبويب «الإجراء عند الضغط»
    fireEvent.click(screen.getByText('تحرير الإجراء'));                       // محرر الإجراء

    expect(screen.getByText('محرر الإجراء')).toBeInTheDocument();
    expect(screen.getByText('تسلسل إجراءات')).toBeInTheDocument();
    expect(screen.getByText('إجراء شرطي')).toBeInTheDocument();

    const sheet = screen.getAllByTestId('builder-sheet').pop() as HTMLElement;
    const typeSelect = sheet.querySelector('select') as HTMLSelectElement;
    const vals = Array.from(typeSelect.options).map(o => o.value);
    // كل مجموعات الأوامر الخمس ممثلة داخل نفس القائمة (28 أمرًا)
    expect(typeSelect.querySelectorAll('optgroup')).toHaveLength(5);
    ['openPage', 'openModal', 'toast', 'copy', 'whatsapp', 'setVar', 'call'].forEach(v => expect(vals).toContain(v));

    fireEvent.click(within(sheet).getByText('تسلسل إجراءات'));
    expect(within(sheet).getByText('إضافة إجراء')).toBeInTheDocument();
  });
});
