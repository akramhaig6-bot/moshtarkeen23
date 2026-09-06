/**
 * اختبارات تجاوب بيئة بناء تطبيق العميل (Mobile-First Layout)
 * تتأكد أن كل أدوات الاستوديو متاحة على شاشة الهاتف، وأن تخطيط
 * الأعمدة الكامل يبقى كما هو على الشاشات العريضة — بلا أي وظيفة ناقصة.
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

function renderStudio() {
  return render(
    <AppBuilderStudio
      initialProject={createProject({ name: 'تطبيق الاختبار' })}
      onSave={vi.fn()}
      onExit={vi.fn()}
      subscribers={[{ id: 's1', name: 'مشترك تجريبي' }]}
      runtimeData={DEMO_DATA}
    />,
  );
}

beforeEach(() => cleanup());

describe('بيئة البناء على شاشة الهاتف', () => {
  beforeEach(() => setViewport(390));

  it('تُظهر الشريط المضغوط وشريط التبويبات بدل الأعمدة الثلاثة', () => {
    renderStudio();
    expect(screen.getByTestId('app-builder-studio')).toBeInTheDocument();
    expect(screen.getByTestId('builder-mobile-tabs')).toBeInTheDocument();
    expect(screen.queryByTestId('builder-tree-aside')).toBeNull();
    expect(screen.queryByTestId('builder-props-aside')).toBeNull();
  });

  it('شيت الأدوات يعرض كل أوامر الشريط العلوي (لا شيء مخفي)', () => {
    renderStudio();
    fireEvent.click(screen.getByLabelText('كل الأدوات'));
    for (const label of ['خريطة التطبيق', 'مكتبة النوافذ الجاهزة', 'التصميم العام', 'البيانات والمتغيرات', 'إعدادات التطبيق', 'نشر التطبيق', 'معاينة التطبيق']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('تبويب البنية يفتح شجرة العناصر بكل مجموعاتها', () => {
    renderStudio();
    fireEvent.click(screen.getByText('البنية'));
    expect(screen.getByText('الصفحات (1)')).toBeInTheDocument();
    expect(screen.getByText(/الأشرطة \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/النوافذ المنبثقة \(0\)/)).toBeInTheDocument();
  });

  it('تبويب الخصائص يفتح لوحة الخصائص بتبويباتها', () => {
    renderStudio();
    fireEvent.click(screen.getByLabelText('كل الأدوات'));
    fireEvent.click(screen.getByText('مكتبة المكونات'));
    // مكتبة المكونات تُفتح كـ bottom sheet وتحتوي حقل البحث
    expect(screen.getByPlaceholderText('ابحث عن مكون…')).toBeInTheDocument();
  });

  it('مفاتيح التبديل في لوحة الخصائص تُقلّب القيمة مرة واحدة فقط', () => {
    renderStudio();
    fireEvent.click(screen.getByText('البنية'));
    fireEvent.click(within(screen.getByTestId('builder-sheet')).getByLabelText('خصائص الصفحة'));   // يفتح شيت الخصائص
    const row = screen.getByText('ظاهرة في التنقل').closest('label') as HTMLLabelElement;
    const input = row.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
    // الضغط على نص الصف نفسه (المسار الذي كان يطلق الحدث مرتين لو كان هناك onClick مكرر)
    fireEvent.click(screen.getByText('ظاهرة في التنقل'));
    const after = screen.getByText('ظاهرة في التنقل').closest('label')!.querySelector('input') as HTMLInputElement;
    expect(after.checked).toBe(false);
  });

  it('شريط الحالة يحتفظ بأدوات التكبير والملاءمة على الجوال', () => {
    renderStudio();
    expect(screen.getByLabelText('الشبكة')).toBeInTheDocument();
    expect(screen.getByLabelText('المسطرة')).toBeInTheDocument();
    expect(screen.getByLabelText('تكبير')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ملاءمة' })).toBeInTheDocument();
  });

  it('معاينة التطبيق تظل قابلة للوصول من الأزرار السريعة', () => {
    renderStudio();
    fireEvent.click(screen.getByText('معاينة'));
    expect(screen.getByTestId('builder-preview')).toBeInTheDocument();
  });
});

describe('بيئة البناء على الشاشات العريضة', () => {
  beforeEach(() => setViewport(1440));

  it('تحافظ على الأعمدة الثلاثة: الشجرة واللوحة والخصائص', () => {
    renderStudio();
    expect(screen.getByTestId('builder-tree-aside')).toBeInTheDocument();
    expect(screen.getByTestId('builder-props-aside')).toBeInTheDocument();
    expect(screen.queryByTestId('builder-mobile-tabs')).toBeNull();
  });

  it('شريط الأدوات الكامل ظاهر مع مفاتيح المقاسات', () => {
    renderStudio();
    expect(screen.getByText('إضافة مكون')).toBeInTheDocument();
    expect(screen.getByText('إعدادات التطبيق')).toBeInTheDocument();
    expect(screen.getByTitle('تابلت 768px')).toBeInTheDocument();
  });
});
