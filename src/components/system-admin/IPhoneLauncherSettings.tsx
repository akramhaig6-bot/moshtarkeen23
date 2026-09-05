// إعدادات شاشة الآيفون الرئيسية (Launcher) داخل لوحة إدارة النظام

import { SystemConfig } from '@/types';
import { resolveIPhoneCfg } from '@/config/system';
import { hexLuma, clampRadius, clampIPhoneScale } from '@/lib/iphone';
import { useCurrentIPhoneTime } from '@/hooks/use-current-iphone-time';
import {
  RotateCcw,
} from 'lucide-react';

export function IPhoneLauncherSettings({ systemConfig, onConfigChange }: {
  systemConfig: SystemConfig;
  onConfigChange: (p: Partial<SystemConfig>) => void;
}) {
  const ic = resolveIPhoneCfg(systemConfig.iPhoneConfig);

  const update = (patch: Partial<typeof ic>) =>
    onConfigChange({ iPhoneConfig: { ...ic, ...patch } });

  const ToggleRow = ({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${value ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}>
        <span className="w-5 h-5 rounded-full bg-white shadow block" />
      </button>
    </div>
  );

  const dark = hexLuma(ic.statusBarBg || '#ffffff') < 0.5;
  const icRadius = clampRadius(ic.screenRadius);
  const iWidthScaleVal = clampIPhoneScale(ic.widthScale);
  const iHeightScaleVal = clampIPhoneScale(ic.heightScale);
  // «الوضع السابق» = بلا أي تحجيم مخصص (100%/100%)، أي الحالة قبل إضافة هذه الميزة
  const isIPhoneScaleDefault = iWidthScaleVal === 100 && iHeightScaleVal === 100;
  const previewTime = useCurrentIPhoneTime();
  // المعاينة أصغر من الشاشة الحقيقية، فنُصغّر الانحناء بنفس النسبة تقريباً
  const previewRadius = Math.round(icRadius * 0.5);

  return (
    <div className="space-y-5">

      {/* ── Row 1: Master Enable + Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Enable */}
        <div className={`rounded-2xl p-5 ${ic.enabled ? 'bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-slate-700' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-sm font-black ${ic.enabled ? 'text-white' : 'text-slate-700'}`}>📱 تفعيل وضع الآيفون</p>
              <p className={`text-xs mt-0.5 ${ic.enabled ? 'text-slate-400' : 'text-slate-400'}`}>
                {ic.enabled ? '🟢 الموقع معروض بحواف شاشة منحنية' : 'الوضع الاعتيادي للنظام'}
              </p>
            </div>
            <button onClick={() => update({ enabled: !ic.enabled })}
              className={`w-14 h-7 rounded-full transition-all duration-300 flex items-center px-0.5 ${ic.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'}`}>
              <span className="w-6 h-6 rounded-full bg-white shadow-md block transition-all" />
            </button>
          </div>
          {ic.enabled && (
            <button onClick={() => update({ enabled: false })}
              className="w-full py-1.5 text-xs font-bold text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors">
              ✕ إيقاف الوضع الآن
            </button>
          )}
        </div>

        {/* Live preview — معاينة الشاشة المنحنية بالكامل */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-500 mb-3">معاينة الشاشة (بدون هيكل خارجي)</p>
          {/* الحاوية تمثّل نافذة العرض؛ الزوايا منحنية تماماً كما ستبدو في الموقع */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: previewRadius,
            background: '#f8fafc',
            boxShadow: `0 2px 10px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(0,0,0,0.06)`,
          }}>
            {/* شريط الحالة */}
            <div style={{
              background: ic.statusBarBg || '#fff',
              padding: `0 ${12 + Math.round(previewRadius * 0.32)}px`,
              height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>
                {previewTime}
                {ic.showNotification && ' 🔔'}
              </span>
              <div style={{ width: 64, height: 20, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#111' }} />
                {ic.dynamicIsland === 'recording' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ width: 3, height: 3+i*2.5, borderRadius: 1, background: i <= ic.signalStrength ? (dark ? '#fff' : '#0f172a') : 'rgba(100,100,100,0.3)' }} />)}
                </div>
                {ic.networkType && <span style={{ fontSize: 10, fontWeight: 800, color: dark ? '#fff' : '#0f172a' }}>{ic.networkType}</span>}
                {ic.showBatteryPct && <span style={{ fontSize: 10, fontWeight: 700, color: dark ? '#fff' : '#0f172a' }}>{ic.batteryLevel}%</span>}
                <div style={{ width: 18, height: 9, border: `1.5px solid ${dark ? '#fff' : '#0f172a'}`, borderRadius: 2.5, position: 'relative', opacity: 0.8 }}>
                  <div style={{ position: 'absolute', left: 1, top: 1, height: 5, borderRadius: 1, background: ic.batteryCharging ? '#22c55e' : (dark ? '#fff' : '#0f172a'), width: `${Math.max(1, ic.batteryLevel * 0.13)}px` }} />
                </div>
              </div>
            </div>

            {/* محتوى وهمي يمثّل الموقع داخل الشاشة */}
            <div style={{ padding: `10px ${10 + Math.round(previewRadius * 0.32)}px 20px` }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 30, borderRadius: 8, background: i === 0 ? '#d1fae5' : '#e2e8f0' }} />)}
              </div>
              <div style={{ height: 8, width: '70%', borderRadius: 4, background: '#e2e8f0', marginBottom: 6 }} />
              <div style={{ height: 8, width: '45%', borderRadius: 4, background: '#e2e8f0' }} />
            </div>

            {/* مؤشر الشريط السفلي */}
            {ic.showHomeIndicator && (
              <div style={{
                position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                width: 84, height: 4, borderRadius: 999, background: '#0f172a', opacity: 0.55,
              }} />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            الانحناء الحالي: <span className="font-bold text-slate-600">{icRadius}px</span> — يُطبَّق على حواف الموقع مباشرة
          </p>
        </div>
      </div>

      {/* ── Row 1.25: UI scaling ── */}
      <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-black text-slate-700">↔️↕️ حجم واجهة الآيفون</p>
            <p className="text-xs text-slate-400 mt-0.5">تحكم بحجم واجهة الآيفون كاملة أفقياً وعمودياً، بما في ذلك الخطوط والأزرار والبطاقات.</p>
          </div>
          {/* زر العودة الحرفية لما كان عليه وضع الآيفون قبل إضافة ميزة التحجيم (100%/100% بلا أي تأثير Transform) */}
          <button
            type="button"
            onClick={() => update({ widthScale: 100, heightScale: 100 })}
            disabled={isIPhoneScaleDefault}
            aria-label="العودة إلى الوضع السابق"
            data-testid="iphone-scale-reset"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isIPhoneScaleDefault
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            <RotateCcw size={14} /> العودة إلى الوضع السابق
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {([
            { key: 'widthScale' as const, label: 'المقياس الأفقي (العرض)', value: iWidthScaleVal },
            { key: 'heightScale' as const, label: 'المقياس العمودي (الطول)', value: iHeightScaleVal },
          ]).map(scale => (
            <div key={scale.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500">{scale.label}</label>
                <span className="text-sm font-black text-slate-700">{scale.value}%</span>
              </div>
              <input type="range" min={60} max={140} step={1} value={scale.value}
                onChange={e => update(scale.key === 'widthScale'
                  ? { widthScale: clampIPhoneScale(e.target.value) }
                  : { heightScale: clampIPhoneScale(e.target.value) })}
                aria-label={scale.label} className="w-full accent-emerald-500" />
              <div className="grid grid-cols-5 gap-1">
                {[75, 90, 100, 115, 130].map(value => (
                  <button key={value} onClick={() => update(scale.key === 'widthScale' ? { widthScale: value } : { heightScale: value })}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${scale.value === value ? 'bg-slate-800 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {value}%
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p data-testid="iphone-scale-status" className="text-xs text-slate-500 text-center">
          {isIPhoneScaleDefault
            ? 'الوضع السابق مفعل'
            : `تطبيق مقياس مخصص: عرض ${iWidthScaleVal}% · طول ${iHeightScaleVal}%`}
        </p>
      </div>

      {/* ── Row 1.5: شكل الشاشة — الانحناء ── */}
      <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-4">
        <div>
          <p className="text-sm font-black text-slate-700">📐 انحناء حواف الشاشة</p>
          <p className="text-xs text-slate-400 mt-0.5">
            يجعل حواف الموقع منحنية كشاشة آيفون من الداخل — بدون عرض هيكل الجهاز الخارجي
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* المنزلق */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">درجة الانحناء</label>
              <span className="text-sm font-black text-slate-700">{icRadius}px</span>
            </div>
            <input type="range" min={0} max={80} step={1} value={icRadius}
              onChange={e => update({ screenRadius: clampRadius(e.target.value) })}
              aria-label="درجة انحناء حواف الشاشة"
              className="w-full accent-emerald-500" />
            <div className="grid grid-cols-5 gap-1">
              {[
                { v: 0,  l: 'مستقيم' },
                { v: 24, l: 'خفيف' },
                { v: 40, l: 'متوسط' },
                { v: 48, l: 'آيفون' },
                { v: 64, l: 'قوي' },
              ].map(p => (
                <button key={p.v} onClick={() => update({ screenRadius: p.v })}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${icRadius === p.v ? 'bg-slate-800 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {p.l}
                </button>
              ))}
            </div>
          </div>

          {/* لون الحافة + مؤشر الشريط السفلي */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">لون حافة الشاشة (خلف الانحناء)</label>
              <div className="flex items-center gap-2">
                <input type="color" value={ic.screenEdgeColor || '#000000'}
                  onChange={e => update({ screenEdgeColor: e.target.value })}
                  aria-label="لون حافة الشاشة"
                  className="w-10 h-9 rounded-xl border-0 cursor-pointer bg-transparent" />
                <input type="text" value={ic.screenEdgeColor || '#000000'}
                  onChange={e => update({ screenEdgeColor: e.target.value })}
                  placeholder="#000000" maxLength={7}
                  className="flex-1 h-9 border border-slate-200 rounded-lg px-3 text-sm font-mono" />
              </div>
              <div className="flex flex-wrap gap-2">
                {['#000000','#0f172a','#1e293b','#111827','#f8fafc','#ffffff'].map(c => (
                  <button key={c} onClick={() => update({ screenEdgeColor: c })}
                    aria-label={`لون الحافة ${c}`}
                    style={{ background: c, width: 24, height: 24, borderRadius: 6, border: ic.screenEdgeColor === c ? '2px solid #10b981' : '1.5px solid rgba(0,0,0,0.15)', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <ToggleRow label="مؤشر الشريط السفلي" desc="الخط الصغير أسفل شاشة الآيفون"
              value={ic.showHomeIndicator} onChange={v => update({ showHomeIndicator: v })} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Status Bar Color + Dynamic Island ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Background color */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">🎨 لون خلفية الشريط</p>
          <div className="flex items-center gap-3">
            <input type="color" value={ic.statusBarBg || '#ffffff'}
              onChange={e => update({ statusBarBg: e.target.value })}
              className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent" />
            <input type="text" value={ic.statusBarBg || '#ffffff'}
              onChange={e => update({ statusBarBg: e.target.value })}
              placeholder="#ffffff" maxLength={7}
              className="flex-1 h-9 border border-slate-200 rounded-lg px-3 text-sm font-mono" />
          </div>
          {/* Quick colors */}
          <div className="flex flex-wrap gap-2">
            {['#ffffff','#0f172a','#1e3a5f','#064e3b','#1a1a2e','#f8fafc','#7c3aed','#dc2626','#d97706'].map(c => (
              <button key={c} onClick={() => update({ statusBarBg: c })}
                style={{ background: c, width: 24, height: 24, borderRadius: 6, border: ic.statusBarBg === c ? '2px solid #10b981' : '1.5px solid rgba(0,0,0,0.15)', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* Dynamic Island */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">💊 Dynamic Island</p>
          <div className="grid grid-cols-2 gap-2">
            {(['normal', 'recording'] as const).map(mode => (
              <button key={mode} onClick={() => update({ dynamicIsland: mode })}
                className={`py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 ${ic.dynamicIsland === mode ? (mode === 'recording' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white') : 'bg-white ring-1 ring-slate-200 text-slate-600'}`}>
                <span className={`rounded-full block ${mode === 'recording' ? 'bg-red-400 w-3 h-3 animate-pulse' : 'bg-slate-500 w-2 h-2'}`} />
                {mode === 'normal' ? 'عادي' : '🔴 تسجيل'}
              </button>
            ))}
          </div>
          <ToggleRow label="أيقونة إشعارات 🔔" value={ic.showNotification} onChange={v => update({ showNotification: v })} />
        </div>

      </div>

      {/* ── Row 3: Battery + Signal + WiFi ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Battery */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">🔋 البطارية</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">مستوى الشحن</label>
              <span className="text-sm font-black text-slate-700">{ic.batteryLevel}%</span>
            </div>
            <input type="range" min={1} max={100} value={ic.batteryLevel}
              onChange={e => update({ batteryLevel: Number(e.target.value) })}
              className="w-full accent-emerald-500" />
            <div className="grid grid-cols-4 gap-1">
              {[20,50,75,100].map(v => (
                <button key={v} onClick={() => update({ batteryLevel: v })}
                  className={`py-1 text-xs font-bold rounded-lg ${ic.batteryLevel === v ? 'bg-emerald-500 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-600'}`}>{v}%</button>
              ))}
            </div>
          </div>
          <ToggleRow label="وضع الشحن ⚡" value={ic.batteryCharging} onChange={v => update({ batteryCharging: v })} />
          <ToggleRow label="إظهار الرقم" desc="مثال: 85%" value={ic.showBatteryPct} onChange={v => update({ showBatteryPct: v })} />
        </div>

        {/* Signal */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">📶 الإشارة</p>
          <ToggleRow label="إظهار أعمدة الإشارة" value={ic.signalEnabled} onChange={v => update({ signalEnabled: v })} />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">قوة الإشارة</label>
              <div className="flex items-flex-end gap-1.5">
                {[1,2,3,4].map(i => <div key={i} onClick={() => update({ signalStrength: i })} style={{ width:5, height:4+i*3.5, borderRadius:1.5, background: i<=ic.signalStrength?'#0f172a':'rgba(15,23,42,0.18)', cursor:'pointer' }} />)}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[0,1,2,3,4].map(v => (
                <button key={v} onClick={() => update({ signalStrength: v })}
                  className={`py-1.5 text-xs font-bold rounded-lg ${ic.signalStrength===v?'bg-slate-700 text-white':'bg-white ring-1 ring-slate-200 text-slate-600'}`}>{v===0?'✗':v}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">نوع الشبكة</label>
            <div className="grid grid-cols-3 gap-1">
              {['5G','4G','LTE','3G','2G',''].map(t => (
                <button key={t} onClick={() => update({ networkType: t })}
                  className={`py-1.5 text-xs font-bold rounded-lg ${ic.networkType===t?'bg-blue-600 text-white':'bg-white ring-1 ring-slate-200 text-slate-600'}`}>{t||'بدون'}</button>
              ))}
            </div>
          </div>
        </div>

        {/* WiFi */}
        <div className="bg-slate-50 ring-1 ring-slate-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-black text-slate-700">📡 الواي فاي</p>
          <ToggleRow label="إظهار أيقونة الواي فاي" value={ic.wifiEnabled} onChange={v => update({ wifiEnabled: v })} />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">قوة الإشارة</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0,1,2,3].map(v => (
                <button key={v} onClick={() => update({ wifiStrength: v })}
                  className={`py-1.5 text-xs font-bold rounded-lg ${ic.wifiStrength===v?'bg-cyan-600 text-white':'bg-white ring-1 ring-slate-200 text-slate-600'}`}>{v===0?'✗':v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
