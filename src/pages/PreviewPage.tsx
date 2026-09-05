// صفحة معاينة تطبيق العميل في نافذة مستقلة (/preview)
// تقرأ لقطة {subscriber, operations, cms} من sessionStorage (تُكتب عند "فتح في نافذة جديدة")
import { Subscriber, Operation } from '@/types';
import { SubscriberCMS } from '@/types/cms';
import { resolveCMS } from '@/data/cms-defaults';
import { SubscriberDashboard } from '@/components/cms/SubscriberDashboard';
import { FlaskConical } from 'lucide-react';

export default function PreviewPage() {
  let data: { subscriber: Subscriber; operations: Operation[]; cms: SubscriberCMS } | null = null;
  try {
    const raw = sessionStorage.getItem('msub_preview') || localStorage.getItem('msub_preview');
    if (raw) data = JSON.parse(raw);
  } catch { data = null; }

  if (!data?.subscriber) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <FlaskConical size={36} className="mx-auto text-slate-300 mb-3" />
          <h1 className="text-lg font-black text-slate-700 mb-1">لا توجد معاينة محفوظة</h1>
          <p className="text-sm text-slate-400">افتح المعاينة من تبويب إضافة المشترك عبر زر "فتح في نافذة جديدة".</p>
        </div>
      </div>
    );
  }

  return <SubscriberDashboard subscriber={data.subscriber} operations={data.operations || []} cms={resolveCMS(data.cms)} />;
}
