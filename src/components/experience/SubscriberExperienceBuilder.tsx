// منشئ تجربة عرض نتيجة الاستعلام للمشترك (أقسام وأزرار مخصصة)

import { ExperiencePlacement, CustomQuerySection, CustomQueryButton, SubscriberExperience } from '@/types';
import { uid } from '@/lib/random';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, X, Building2, Upload,
} from 'lucide-react';

const PLACEMENT_LABELS: Record<ExperiencePlacement, string> = {
  top: 'أعلى نتيجة الاستعلام',
  summary: 'بعد ملخص المشترك',
  bottom: 'أسفل نتيجة الاستعلام',
};

export function SubscriberExperienceBuilder({ value, onChange }: {
  value: SubscriberExperience;
  onChange: (value: SubscriberExperience) => void;
}) {
  const [newSection, setNewSection] = useState({ title: '', content: '', placement: 'summary' as ExperiencePlacement, accent: '#0f766e' });
  const [newButton, setNewButton] = useState({ label: '', content: '', helperText: '', duration: 8, placement: 'summary' as ExperiencePlacement, tone: 'emerald' as CustomQueryButton['tone'] });

  const update = (patch: Partial<SubscriberExperience>) => onChange({ ...value, ...patch });
  const updateSection = (id: string, patch: Partial<CustomQuerySection>) =>
    update({ sections: value.sections.map(section => section.id === id ? { ...section, ...patch } : section) });
  const updateButton = (id: string, patch: Partial<CustomQueryButton>) =>
    update({ buttons: value.buttons.map(button => button.id === id ? { ...button, ...patch } : button) });

  const addSection = () => {
    if (!newSection.title.trim()) {
      toast.error('اكتب اسم القسم أولاً ثم اضغط إضافة');
      return;
    }
    update({ sections: [...value.sections, { ...newSection, id: uid(), visible: true }] });
    setNewSection({ title: '', content: '', placement: 'summary', accent: '#0f766e' });
    toast.success('تمت إضافة قسم مخصص');
  };

  const addButton = () => {
    if (!newButton.label.trim()) {
      toast.error('اكتب تسمية الزر أولاً ثم اضغط إضافة');
      return;
    }
    update({ buttons: [...value.buttons, { ...newButton, id: uid(), visible: true, duration: Math.max(1, Math.min(60, newButton.duration)) }] });
    setNewButton({ label: '', content: '', helperText: '', duration: 8, placement: 'summary', tone: 'emerald' });
    toast.success('تمت إضافة زر مخصص');
  };

  const fileToDataUrl = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => update({ companyLogo: String(reader.result || '') });
    reader.readAsDataURL(file);
  };

  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Building2 size={17} className="text-indigo-600" /> هوية وتجربة بوابة المشترك
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              خصص اسم الشركة، شعارها، الأقسام والأزرار التي تظهر داخل نتيجة الاستعلام. تحفظ الإعدادات محليًا في الواجهة.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Frontend</Badge>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">يحفظ تلقائياً</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم الشركة / المؤسسة</label>
            <Input value={value.companyName} onChange={e => update({ companyName: e.target.value })} placeholder="مثال: شركة النخبة للاستثمار" className="h-10" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">عنوان البوابة</label>
            <Input value={value.welcomeTitle} onChange={e => update({ welcomeTitle: e.target.value })} placeholder="بوابة الاستعلام المؤسسية" className="h-10" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center">
              {value.companyLogo ? <img src={value.companyLogo} alt="شعار الشركة" className="w-full h-full object-contain" /> : <Building2 size={18} className="text-slate-400" />}
            </div>
            <label className="h-10 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
              <Upload size={14} /> رفع الشعار
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && fileToDataUrl(e.target.files[0])} />
            </label>
            {value.companyLogo && <button type="button" onClick={() => update({ companyLogo: '' })} className="p-2 text-slate-400 hover:text-red-500" title="حذف الشعار"><X size={15} /></button>}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1.5 block">النص الترحيبي</label>
          <textarea value={value.welcomeText} onChange={e => update({ welcomeText: e.target.value })} rows={2} placeholder="النص الذي يظهر للمشترك داخل بوابة الاستعلام" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-y" />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-black text-slate-800">الأقسام المخصصة</p>
              <p className="text-xs text-slate-400">كل قسم اختياري ويمكن تحديد مكان ظهوره في الاستعلام.</p>
            </div>
            <Badge variant="outline">{value.sections.length} أقسام</Badge>
          </div>
          <div className="space-y-3">
            {value.sections.map(section => (
              <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2">
                  <Input value={section.title} onChange={e => updateSection(section.id, { title: e.target.value })} placeholder="اسم القسم" className="h-9 bg-white text-sm" />
                  <select value={section.placement} onChange={e => updateSection(section.id, { placement: e.target.value as ExperiencePlacement })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold">
                    {Object.entries(PLACEMENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <input type="color" value={section.accent} onChange={e => updateSection(section.id, { accent: e.target.value })} className="h-9 w-10 rounded-md border border-slate-200 bg-white p-1 cursor-pointer" title="لون القسم" />
                    <button type="button" onClick={() => updateSection(section.id, { visible: !section.visible })} className={`h-9 px-2 rounded-md text-xs font-bold ${section.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{section.visible ? 'ظاهر' : 'مخفي'}</button>
                    <button type="button" onClick={() => update({ sections: value.sections.filter(item => item.id !== section.id) })} className="p-2 text-slate-400 hover:text-red-500" title="حذف القسم"><Trash2 size={15} /></button>
                  </div>
                </div>
                <textarea value={section.content} onChange={e => updateSection(section.id, { content: e.target.value })} rows={2} placeholder="محتوى القسم الذي سيظهر للمشترك..." className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-200 resize-y" />
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-3">
              <p className="text-xs font-black text-indigo-700 mb-2">إضافة قسم جديد</p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2">
                <Input value={newSection.title} onChange={e => setNewSection({ ...newSection, title: e.target.value })} placeholder="اسم القسم الجديد" className="h-9 bg-white text-sm" />
                <select value={newSection.placement} onChange={e => setNewSection({ ...newSection, placement: e.target.value as ExperiencePlacement })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold">
                  {Object.entries(PLACEMENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
                <Button type="button" onClick={addSection} className="h-9 bg-indigo-600 hover:bg-indigo-700 gap-1.5"><Plus size={14} /> إضافة</Button>
              </div>
              <textarea value={newSection.content} onChange={e => setNewSection({ ...newSection, content: e.target.value })} rows={2} placeholder="محتوى القسم..." className="w-full mt-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none resize-y" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-black text-slate-800">الأزرار التفاعلية</p>
              <p className="text-xs text-slate-400">سمِّ الزر، حدّد مدة شريط التقدم، ومحتوى الرسالة بعد الضغط.</p>
            </div>
            <Badge variant="outline">{value.buttons.length} أزرار</Badge>
          </div>
          <div className="space-y-3">
            {value.buttons.map(button => (
              <div key={button.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_auto] gap-2">
                  <Input value={button.label} onChange={e => updateButton(button.id, { label: e.target.value })} placeholder="تسمية الزر" className="h-9 bg-white text-sm" />
                  <select value={button.placement} onChange={e => updateButton(button.id, { placement: e.target.value as ExperiencePlacement })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold">
                    {Object.entries(PLACEMENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  <div className="relative"><Input type="number" min={1} max={60} value={button.duration} onChange={e => updateButton(button.id, { duration: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })} className="h-9 bg-white pl-8 text-sm" /><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">ث</span></div>
                  <div className="flex items-center gap-2">
                    <select value={button.tone} onChange={e => updateButton(button.id, { tone: e.target.value as CustomQueryButton['tone'] })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold">
                      <option value="emerald">أخضر</option><option value="blue">أزرق</option><option value="amber">ذهبي</option><option value="violet">بنفسجي</option>
                    </select>
                    <button type="button" onClick={() => updateButton(button.id, { visible: !button.visible })} className={`h-9 px-2 rounded-md text-xs font-bold ${button.visible ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{button.visible ? 'ظاهر' : 'مخفي'}</button>
                    <button type="button" onClick={() => update({ buttons: value.buttons.filter(item => item.id !== button.id) })} className="p-2 text-slate-400 hover:text-red-500" title="حذف الزر"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input value={button.helperText} onChange={e => updateButton(button.id, { helperText: e.target.value })} placeholder="وصف قصير يظهر تحت الزر" className="h-9 bg-white text-xs" />
                  <Input value={button.content} onChange={e => updateButton(button.id, { content: e.target.value })} placeholder="النص الذي يظهر بعد الضغط" className="h-9 bg-white text-xs" />
                </div>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-3">
              <p className="text-xs font-black text-violet-700 mb-2">إضافة زر جديد</p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_100px_auto] gap-2">
                <Input value={newButton.label} onChange={e => setNewButton({ ...newButton, label: e.target.value })} placeholder="تسمية الزر" className="h-9 bg-white text-sm" />
                <select value={newButton.placement} onChange={e => setNewButton({ ...newButton, placement: e.target.value as ExperiencePlacement })} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold">
                  {Object.entries(PLACEMENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
                <div className="relative"><Input type="number" min={1} max={60} value={newButton.duration} onChange={e => setNewButton({ ...newButton, duration: Number(e.target.value) || 1 })} className="h-9 bg-white pl-8 text-sm" /><span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">ث</span></div>
                <Button type="button" onClick={addButton} className="h-9 bg-violet-600 hover:bg-violet-700 gap-1.5"><Plus size={14} /> إضافة</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Input value={newButton.helperText} onChange={e => setNewButton({ ...newButton, helperText: e.target.value })} placeholder="وصف قصير للزر" className="h-9 bg-white text-xs" />
                <Input value={newButton.content} onChange={e => setNewButton({ ...newButton, content: e.target.value })} placeholder="النص بعد الضغط" className="h-9 bg-white text-xs" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
