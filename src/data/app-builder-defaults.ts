// ═══════════════════════════════════════════════════════════════
// القيم الافتراضية + مكتبة المكونات + قوالب قسم «بناء تطبيق العميل»
// ═══════════════════════════════════════════════════════════════
import {
  AppBar, AppModal, AppNode, AppPage, AppProject, ActionSpec, ComponentCategory,
  ComponentDef, NodeStyle, ProgressSpec, VisibilityRule, BarKind, ModalKind,
} from '@/types/app-builder';
import { uid, todayStr } from '@/lib/random';

// ─────────────────────────── قيم أساسية ───────────────────────────

export const DEFAULT_VISIBILITY: VisibilityRule = {
  conditional: false, field: '', operator: '=', value: '',
  mobile: true, tablet: true, desktop: true,
};

export const DEFAULT_PROGRESS: ProgressSpec = {
  enabled: false, kind: 'linear', position: 'below', duration: 3000, thickness: 8,
  color: '#2563eb', trackColor: '#e2e8f0', radius: 8, glow: false, showPercent: true,
  label: 'جارٍ المعالجة…', steps: 5, onComplete: 'toast', completeValue: 'تم التنفيذ بنجاح',
  afterBehavior: 'success',
};

export const emptyStep = () => ({
  id: uid(), type: 'none' as const, target: '', value: '', tone: 'success' as const,
  delay: 0, condition: { enabled: false, field: '', operator: '=', value: '' },
});

export const DEFAULT_ACTION = (): ActionSpec => ({
  mode: 'single',
  step: emptyStep(),
  steps: [],
  condition: { field: '', operator: '=', value: '' },
  thenSteps: [],
  elseSteps: [],
  progress: { ...DEFAULT_PROGRESS },
});

export const PROGRESS_PRESETS: { id: string; label: string; patch: Partial<ProgressSpec> }[] = [
  { id: 'simple', label: 'تحميل بسيط', patch: { kind: 'linear', thickness: 4, color: '#2563eb', showPercent: false, glow: false } },
  { id: 'pro', label: 'تحميل احترافي', patch: { kind: 'linear', thickness: 8, color: '#4f46e5', showPercent: true } },
  { id: 'circle', label: 'دائري كلاسيكي', patch: { kind: 'circular', thickness: 8, color: '#0ea5e9', showPercent: true } },
  { id: 'steps', label: 'شرائح خطوات', patch: { kind: 'steps', steps: 5, thickness: 10, color: '#16a34a' } },
  { id: 'gold', label: 'ذهبي فاخر', patch: { kind: 'linear', thickness: 10, color: '#d97706', glow: true, radius: 12 } },
  { id: 'neon', label: 'نيون ملون', patch: { kind: 'linear', thickness: 8, color: '#a855f7', glow: true } },
  { id: 'btc', label: 'بيتكوين', patch: { kind: 'linear', thickness: 8, color: '#f7931a', glow: true } },
  { id: 'flow', label: 'متدفق (Shimmer)', patch: { kind: 'flow', thickness: 8, color: '#0f766e' } },
];

// ─────────────────────────── مكتبة المكونات ───────────────────────────

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  containers: 'حاويات', text: 'نصوص', media: 'صور ووسائط', buttons: 'أزرار وروابط',
  forms: 'نماذج', cards: 'بطاقات', tables: 'جداول وبيانات', charts: 'رسوم بيانية',
  interactive: 'تفاعلي', advanced: 'متقدم',
};

const S = (s: NodeStyle): NodeStyle => s;

function def(
  type: string, label: string, category: ComponentCategory, icon: string, description: string,
  props: Record<string, unknown>, style: NodeStyle, container = false,
): ComponentDef {
  return { type, label, category, icon, description, container, defaults: () => ({ props: { ...props }, style: { ...style } }) };
}

export const COMPONENT_LIBRARY: ComponentDef[] = [
  // ── حاويات ──
  def('container', 'حاوية عامة', 'containers', 'Box', 'حاوية مرنة تقبل أي مكونات بداخلها', {}, S({ display: 'flex', direction: 'column', gap: 12, padding: 16, bg: 'transparent', radius: 12 }), true),
  def('row', 'صف', 'containers', 'Rows3', 'ترتيب أفقي للعناصر', {}, S({ display: 'flex', direction: 'row', gap: 12, padding: 8, align: 'center' }), true),
  def('column', 'عمود', 'containers', 'Columns3', 'ترتيب رأسي للعناصر', {}, S({ display: 'flex', direction: 'column', gap: 12, padding: 8 }), true),
  def('grid', 'شبكة', 'containers', 'LayoutGrid', 'شبكة بأعمدة قابلة للضبط', {}, S({ display: 'grid', columns: 2, gap: 12, padding: 8 }), true),
  def('card', 'بطاقة', 'containers', 'Square', 'بطاقة بحدود وظل', {}, S({ display: 'flex', direction: 'column', gap: 10, padding: 16, bg: '#ffffff', radius: 16, shadow: 'md', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' }), true),
  def('section', 'قسم', 'containers', 'PanelTop', 'قسم بعنوان ومحتوى', { title: 'عنوان القسم' }, S({ display: 'flex', direction: 'column', gap: 10, padding: 16, bg: '#f8fafc', radius: 16 }), true),
  def('tabs', 'علامات تبويب', 'containers', 'AppWindow', 'تبويبات، كل تبويب يعرض أبناءه بالترتيب', { tabs: ['التبويب 1', 'التبويب 2'] }, S({ padding: 8, radius: 12 }), true),
  def('accordion', 'أكورديون', 'containers', 'ChevronsUpDown', 'قسم قابل للطي', { title: 'اضغط للتوسيع', open: false }, S({ padding: 8, radius: 12, bg: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' }), true),
  def('carousel', 'سلايدر', 'containers', 'GalleryHorizontal', 'عرض الأبناء واحداً تلو الآخر', {}, S({ padding: 8, radius: 12 }), true),
  def('embeddedPage', 'صفحة مضمّنة', 'containers', 'Frame', 'يعرض صفحة كاملة من التطبيق داخل مكون', { pageId: '' }, S({ padding: 0, radius: 12, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' })),
  def('iframe', 'إطار خارجي', 'containers', 'Globe', 'iframe لرابط خارجي', { src: 'https://example.com', height: 240 }, S({ radius: 12 })),

  // ── نصوص ──
  def('h1', 'عنوان H1', 'text', 'Heading1', 'عنوان رئيسي كبير', { text: 'عنوان رئيسي' }, S({ fontSize: 30, fontWeight: '900', color: '#0f172a', textAlign: 'right' })),
  def('h2', 'عنوان H2', 'text', 'Heading2', 'عنوان فرعي', { text: 'عنوان فرعي' }, S({ fontSize: 24, fontWeight: '700', color: '#0f172a', textAlign: 'right' })),
  def('h3', 'عنوان H3', 'text', 'Heading3', 'عنوان صغير', { text: 'عنوان صغير' }, S({ fontSize: 19, fontWeight: '700', color: '#1e293b', textAlign: 'right' })),
  def('paragraph', 'فقرة', 'text', 'Text', 'نص عادي متعدد الأسطر', { text: 'اكتب نصك هنا…' }, S({ fontSize: 14, color: '#475569', lineHeight: 1.9, textAlign: 'right' })),
  def('quote', 'نص مقتبس', 'text', 'Quote', 'اقتباس بخط جانبي', { text: 'اقتباس ملهم' }, S({ fontSize: 15, color: '#334155', padding: 12, bg: '#f1f5f9', radius: 10 })),
  def('list', 'قائمة نقطية', 'text', 'List', 'قائمة عناصر', { items: ['عنصر أول', 'عنصر ثانٍ'], ordered: false }, S({ fontSize: 14, color: '#475569' })),
  def('checklist', 'قائمة مهام', 'text', 'ListChecks', 'قائمة مهام قابلة للتحديد', { items: ['مهمة 1', 'مهمة 2'] }, S({ fontSize: 14, color: '#475569' })),
  def('badgeText', 'شارة نصية', 'text', 'Tag', 'شارة صغيرة ملوّنة', { text: 'جديد' }, S({ fontSize: 11, fontWeight: '900', color: '#ffffff', bg: '#2563eb', radius: 999, padding: 6 })),
  def('dynamicText', 'نص بمتغير ديناميكي', 'text', 'Braces', 'نص يقبل {name} {profits} {balance} {date}', { text: 'مرحباً {name} — رصيدك {balance}' }, S({ fontSize: 15, fontWeight: '700', color: '#0f172a' })),
  def('typewriter', 'نص بكتابة تلقائية', 'text', 'TypeOutline', 'نص يُكتب حرفاً حرفاً', { text: 'أهلاً بك في تطبيقك' }, S({ fontSize: 18, fontWeight: '700', color: '#0f172a' })),
  def('codeBlock', 'كتلة كود', 'text', 'Code', 'نص برمجي بخط ثابت', { text: 'const app = "moshtarikeen";' }, S({ fontSize: 12, color: '#e2e8f0', bg: '#0f172a', radius: 10, padding: 12 })),
  def('divider', 'فاصل', 'text', 'Minus', 'خط فاصل', {}, S({ height: '1px', bg: '#e2e8f0', margin: 8 })),

  // ── صور ووسائط ──
  def('image', 'صورة', 'media', 'Image', 'صورة ثابتة', { src: '', alt: 'صورة', height: 160 }, S({ radius: 12 })),
  def('gallery', 'معرض صور', 'media', 'Images', 'شبكة صور', { images: [] as string[], columns: 3 }, S({ gap: 8, radius: 12 })),
  def('icon', 'أيقونة', 'media', 'Star', 'أيقونة من المكتبة', { icon: 'Star', size: 32 }, S({ color: '#2563eb' })),
  def('logo', 'شعار', 'media', 'BadgeCheck', 'شعار التطبيق', {}, S({ radius: 12 })),
  def('qrcode', 'QR Code', 'media', 'QrCode', 'رمز استجابة سريعة', { value: 'https://example.com', size: 128 }, S({})),
  def('video', 'فيديو مضمّن', 'media', 'Video', 'فيديو من رابط', { src: '', height: 220 }, S({ radius: 12 })),
  def('audio', 'مشغل صوت', 'media', 'Music', 'مشغل صوتي', { src: '' }, S({})),

  // ── أزرار وروابط ──
  def('button', 'زر أساسي', 'buttons', 'MousePointerClick', 'زر بإجراء قابل للتخصيص', { label: 'اضغط هنا', icon: '' }, S({ bg: '#2563eb', color: '#ffffff', radius: 12, padding: 12, fontSize: 14, fontWeight: '700' })),
  def('buttonOutline', 'زر مخطط', 'buttons', 'Square', 'زر بحدود بلا تعبئة', { label: 'زر مخطط' }, S({ bg: 'transparent', color: '#2563eb', radius: 12, padding: 12, borderWidth: 1, borderColor: '#2563eb', borderStyle: 'solid', fontWeight: '700' })),
  def('buttonGhost', 'زر نصي', 'buttons', 'Type', 'زر بلا خلفية', { label: 'زر نصي' }, S({ bg: 'transparent', color: '#2563eb', padding: 8, fontWeight: '700' })),
  def('fab', 'زر عائم', 'buttons', 'Plus', 'زر دائري عائم', { label: '+' }, S({ bg: '#2563eb', color: '#ffffff', radius: 999, padding: 16, shadow: 'lg' })),
  def('buttonGroup', 'مجموعة أزرار', 'buttons', 'Group', 'حاوية أزرار متجاورة', {}, S({ display: 'flex', direction: 'row', gap: 8 }), true),
  def('linkExternal', 'رابط خارجي', 'buttons', 'ExternalLink', 'رابط لموقع خارجي', { label: 'زيارة الموقع', url: 'https://' }, S({ color: '#2563eb', fontWeight: '700' })),
  def('linkWhatsapp', 'رابط واتساب', 'buttons', 'MessageCircle', 'فتح محادثة واتساب', { label: 'تواصل عبر واتساب', phone: '', message: '' }, S({ bg: '#16a34a', color: '#ffffff', radius: 12, padding: 12, fontWeight: '700' })),
  def('linkCall', 'رابط اتصال', 'buttons', 'Phone', 'اتصال مباشر برقم', { label: 'اتصل بنا', phone: '' }, S({ bg: '#0ea5e9', color: '#ffffff', radius: 12, padding: 12, fontWeight: '700' })),
  def('copyButton', 'زر نسخ', 'buttons', 'Copy', 'ينسخ نصاً للحافظة', { label: 'نسخ', value: '' }, S({ bg: '#475569', color: '#ffffff', radius: 12, padding: 10, fontWeight: '700' })),

  // ── نماذج ──
  def('inputText', 'حقل نص', 'forms', 'TextCursorInput', 'حقل إدخال نصي', { label: 'الاسم', placeholder: 'اكتب هنا', required: false }, S({ radius: 10 })),
  def('inputTextarea', 'حقل نص متعدد', 'forms', 'AlignLeft', 'مساحة نص كبيرة', { label: 'ملاحظات', placeholder: '', rows: 3 }, S({ radius: 10 })),
  def('inputEmail', 'حقل بريد', 'forms', 'Mail', 'إدخال بريد إلكتروني', { label: 'البريد', placeholder: 'name@mail.com' }, S({ radius: 10 })),
  def('inputPhone', 'حقل هاتف', 'forms', 'Phone', 'إدخال رقم هاتف', { label: 'الجوال', placeholder: '05xxxxxxxx' }, S({ radius: 10 })),
  def('inputNumber', 'حقل رقمي', 'forms', 'Hash', 'إدخال رقم', { label: 'المبلغ', placeholder: '0' }, S({ radius: 10 })),
  def('inputPassword', 'حقل كلمة مرور', 'forms', 'Lock', 'إدخال كلمة مرور', { label: 'كلمة المرور' }, S({ radius: 10 })),
  def('inputDate', 'حقل تاريخ', 'forms', 'Calendar', 'اختيار تاريخ', { label: 'التاريخ' }, S({ radius: 10 })),
  def('inputFile', 'حقل ملف', 'forms', 'Upload', 'رفع ملف', { label: 'المرفق' }, S({ radius: 10 })),
  def('checkbox', 'مربع اختيار', 'forms', 'CheckSquare', 'خيار صح/خطأ', { label: 'أوافق على الشروط', checked: false }, S({})),
  def('radioGroup', 'زر راديو', 'forms', 'CircleDot', 'اختيار واحد من عدة', { label: 'اختر', options: ['خيار 1', 'خيار 2'] }, S({})),
  def('switch', 'مفتاح تبديل', 'forms', 'ToggleLeft', 'مفتاح تشغيل/إيقاف', { label: 'تفعيل', checked: false }, S({})),
  def('select', 'قائمة منسدلة', 'forms', 'ChevronDown', 'اختيار من قائمة', { label: 'اختر', options: ['خيار 1', 'خيار 2'] }, S({ radius: 10 })),
  def('rating', 'تقييم بالنجوم', 'forms', 'Star', 'تقييم من 5', { label: 'تقييمك', value: 0 }, S({})),
  def('otp', 'حقل OTP', 'forms', 'KeyRound', 'رمز تحقق', { label: 'رمز التحقق', digits: 4 }, S({})),
  def('loginForm', 'نموذج تسجيل دخول', 'forms', 'LogIn', 'نموذج جاهز', { title: 'تسجيل الدخول' }, S({ padding: 16, bg: '#ffffff', radius: 16, shadow: 'md' })),
  def('contactForm', 'نموذج اتصال', 'forms', 'Send', 'نموذج تواصل جاهز', { title: 'تواصل معنا' }, S({ padding: 16, bg: '#ffffff', radius: 16, shadow: 'md' })),

  // ── بطاقات ──
  def('infoCard', 'بطاقة معلومات', 'cards', 'Info', 'عنوان + قيمة + أيقونة', { title: 'الرصيد', value: '0', icon: 'Wallet', hint: '' }, S({ padding: 16, bg: '#ffffff', radius: 16, shadow: 'sm', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' })),
  def('statCard', 'بطاقة إحصائية', 'cards', 'BarChart3', 'قيمة مع نسبة تغيّر', { title: 'الأرباح', value: '0', change: '+0%', icon: 'TrendingUp' }, S({ padding: 16, bg: '#0f172a', color: '#ffffff', radius: 16 })),
  def('profileCard', 'بطاقة ملف شخصي', 'cards', 'UserRound', 'صورة واسم وحالة', { name: '{name}', title: 'عميل', avatar: '' }, S({ padding: 16, bg: '#ffffff', radius: 16, shadow: 'md' })),
  def('priceCard', 'بطاقة سعر', 'cards', 'CircleDollarSign', 'خطة وسعرها', { plan: 'الباقة الذهبية', price: '499', period: 'شهرياً', features: ['ميزة 1', 'ميزة 2'] }, S({ padding: 16, bg: '#ffffff', radius: 16, shadow: 'md' })),
  def('alertCard', 'بطاقة تنبيه', 'cards', 'AlertTriangle', 'تنبيه ملوّن', { text: 'رسالة تنبيه', kind: 'info' }, S({ padding: 12, radius: 12 })),
  def('balanceCard', 'بطاقة رصيد', 'cards', 'Wallet', 'رصيد بارز بتدرج لوني', { title: 'الرصيد المتاح', value: '{balance}' }, S({ padding: 20, bgGradient: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', color: '#ffffff', radius: 20, shadow: 'lg' })),
  def('expandableCard', 'بطاقة قابلة للتوسيع', 'cards', 'ChevronsUpDown', 'بطاقة تُفتح وتُغلق', { title: 'التفاصيل', open: false }, S({ padding: 12, bg: '#ffffff', radius: 14, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' }), true),

  // ── جداول وبيانات ──
  def('simpleTable', 'جدول بسيط', 'tables', 'Table', 'جدول أعمدة وصفوف', { columns: ['العمود 1', 'العمود 2'], rows: [['قيمة', 'قيمة']] }, S({ radius: 12 })),
  def('opsTable', 'جدول عمليات جاهز', 'tables', 'ClipboardList', 'يعرض عمليات المشترك المرتبط', { max: 5 }, S({ radius: 12 })),
  def('repeater', 'قائمة عناصر (Repeater)', 'tables', 'Repeat', 'يكرر أبناءه لكل عنصر بيانات', { source: 'operations', count: 3 }, S({ display: 'flex', direction: 'column', gap: 8 }), true),

  // ── رسوم بيانية ──
  def('lineChart', 'رسم خطي', 'charts', 'LineChart', 'مخطط خطي', { title: 'الأداء', data: [12, 19, 8, 25, 17, 30] }, S({ padding: 12, bg: '#ffffff', radius: 14, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' })),
  def('barChart', 'رسم أعمدة', 'charts', 'BarChart3', 'مخطط أعمدة', { title: 'العمليات', data: [8, 14, 6, 20, 11] }, S({ padding: 12, bg: '#ffffff', radius: 14, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' })),
  def('pieChart', 'رسم دائري', 'charts', 'PieChart', 'مخطط دائري', { title: 'التوزيع', data: [40, 30, 20, 10] }, S({ padding: 12, bg: '#ffffff', radius: 14, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' })),
  def('gauge', 'مقياس (Gauge)', 'charts', 'Gauge', 'نصف دائرة بنسبة', { title: 'الإنجاز', value: 65 }, S({ padding: 12, bg: '#ffffff', radius: 14 })),
  def('progressLinear', 'شريط تقدم خطي', 'charts', 'Minus', 'شريط نسبة مئوية', { title: 'التقدم', value: 60, color: '#2563eb' }, S({ padding: 8 })),
  def('progressCircle', 'شريط تقدم دائري', 'charts', 'CircleDashed', 'دائرة نسبة مئوية', { title: 'التقدم', value: 75, color: '#16a34a' }, S({ padding: 8 })),
  def('sparkline', 'Sparkline', 'charts', 'Activity', 'خط مصغّر', { data: [3, 6, 4, 9, 7, 12] }, S({ padding: 4 })),
  def('timeline', 'مخطط زمني', 'charts', 'GitCommitVertical', 'أحداث بترتيب زمني', { events: ['بداية الاشتراك', 'أول توزيع أرباح'] }, S({ padding: 12 })),

  // ── تفاعلي ──
  def('countdown', 'عداد تنازلي', 'interactive', 'TimerReset', 'عد تنازلي بالثواني', { seconds: 60, title: 'ينتهي خلال' }, S({ padding: 12, bg: '#ffffff', radius: 14 })),
  def('counterUp', 'عداد تصاعدي', 'interactive', 'TrendingUp', 'رقم يتصاعد حتى القيمة', { to: 1000, prefix: '', suffix: '', title: 'إجمالي' }, S({ padding: 12 })),
  def('liveClock', 'ساعة حية', 'interactive', 'Clock', 'الوقت الحالي', {}, S({ padding: 8, fontSize: 18, fontWeight: '700' })),
  def('calculator', 'حاسبة أرباح', 'interactive', 'Calculator', 'حاسبة نسبة أرباح', { rate: 12 }, S({ padding: 14, bg: '#ffffff', radius: 14, shadow: 'sm' })),
  def('currencyConverter', 'محول عملات', 'interactive', 'ArrowLeftRight', 'تحويل بين عملتين بسعر ثابت', { rate: 3.75, from: 'USD', to: 'SAR' }, S({ padding: 14, bg: '#ffffff', radius: 14, shadow: 'sm' })),
  def('poll', 'استطلاع رأي', 'interactive', 'Vote', 'سؤال بخيارات', { question: 'ما رأيك بالخدمة؟', options: ['ممتاز', 'جيد'] }, S({ padding: 14, bg: '#ffffff', radius: 14 })),
  def('map', 'خريطة', 'interactive', 'MapPin', 'موقع على الخريطة', { lat: '24.7136', lng: '46.6753', height: 200 }, S({ radius: 14 })),

  // ── متقدم ──
  def('customHtml', 'كود HTML مخصص', 'advanced', 'CodeXml', 'HTML يُعرض كما هو', { html: '<div>مرحباً</div>' }, S({ padding: 8 })),
  def('spacer', 'مساحة فارغة', 'advanced', 'MoveVertical', 'فراغ بارتفاع محدد', { height: 24 }, S({})),
  def('pdfViewer', 'عارض PDF', 'advanced', 'FileText', 'عرض ملف PDF من رابط', { src: '', height: 320 }, S({ radius: 12 })),
];

export const COMPONENTS_BY_TYPE: Record<string, ComponentDef> =
  Object.fromEntries(COMPONENT_LIBRARY.map(c => [c.type, c]));

export function createNode(type: string, name?: string): AppNode {
  const d = COMPONENTS_BY_TYPE[type] || COMPONENT_LIBRARY[0];
  const { props, style } = d.defaults();
  return {
    id: uid(), type: d.type, name: name || d.label, props, style,
    children: [], hidden: false, locked: false,
    visibility: { ...DEFAULT_VISIBILITY },
    action: d.category === 'buttons' ? DEFAULT_ACTION() : null,
  };
}

// ─────────────────────────── صفحات/أشرطة/نوافذ ───────────────────────────

export const BAR_KIND_LABELS: Record<BarKind, string> = {
  top: 'شريط علوي', bottom: 'شريط سفلي', right: 'شريط جانبي أيمن', left: 'شريط جانبي أيسر',
  floating: 'شريط عائم', sub: 'شريط ثانوي', announcement: 'شريط إعلاني',
};

export const MODAL_KIND_LABELS: Record<ModalKind, string> = {
  modal: 'Modal مركزي', fullscreen: 'Modal كامل الشاشة', 'drawer-right': 'Drawer من اليمين',
  'drawer-left': 'Drawer من اليسار', 'drawer-top': 'Drawer من الأعلى', sheet: 'Bottom Sheet',
  popover: 'Popover', alert: 'Alert Dialog', toast: 'Toast',
};

export const slugify = (s: string) =>
  s.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase() || 'page';

export function createPage(name: string, opts: Partial<AppPage> = {}): AppPage {
  const layout = opts.layout || 'blank';
  const nodes: AppNode[] = [];
  if (layout === 'one') nodes.push(createNode('container', 'عمود واحد'));
  if (layout === 'two') { const g = createNode('grid', 'عمودان'); g.style.columns = 2; g.children = [createNode('container'), createNode('container')]; nodes.push(g); }
  if (layout === 'three') { const g = createNode('grid', 'ثلاثة أعمدة'); g.style.columns = 3; g.children = [createNode('container'), createNode('container'), createNode('container')]; nodes.push(g); }
  if (layout === 'grid') { const g = createNode('grid', 'شبكة 2×2'); g.style.columns = 2; g.children = [createNode('card'), createNode('card'), createNode('card'), createNode('card')]; nodes.push(g); }
  return {
    id: uid(), name, icon: 'FileText', slug: slugify(name), isHome: false, parentId: null,
    layout, bg: '#ffffff', title: name, metaDescription: '', requiresLogin: false,
    visibleInNav: true, nodes, ...opts,
  };
}

export function createBar(name: string, kind: BarKind): AppBar {
  const horizontal = kind === 'top' || kind === 'bottom' || kind === 'sub' || kind === 'announcement';
  return {
    id: uid(), name, kind, scope: 'all', pages: [], enabled: true, sticky: true,
    size: horizontal ? 56 : 220, bg: kind === 'announcement' ? '#4f46e5' : '#0f172a',
    color: '#ffffff', radius: 0, shadow: 'md',
    justify: 'space-between', gap: 10, padding: 10,
    showOn: { mobile: true, tablet: true, desktop: true }, nodes: [],
  };
}

export function createModal(name: string, kind: ModalKind, size: ModalSize2 = 'md'): AppModal {
  return {
    id: uid(), name, kind, size, closable: true, backdrop: true, backdropColor: 'rgba(15,23,42,0.6)',
    radius: 20, enterAnimation: 'zoom', duration: 250, closeOnBackdrop: true, closeOnEscape: true,
    autoOpen: false, autoOpenDelay: 0, autoHideSeconds: 0, enabled: true, nodes: [],
  };
}
type ModalSize2 = AppModal['size'];

export const DEFAULT_DESIGN = () => ({
  primary: '#2563eb', secondary: '#4f46e5', success: '#16a34a', warning: '#d97706', danger: '#dc2626',
  bgMain: '#f8fafc', bgCards: '#ffffff', textMain: '#0f172a', textSecondary: '#64748b', borders: '#e2e8f0',
  headingFont: 'system-ui', bodyFont: 'system-ui', baseSize: 14, radius: 14, spacing: 12,
});

export function createProject(partial: Partial<AppProject> = {}): AppProject {
  const home = createPage('الصفحة الرئيسية', { isHome: true });
  const now = new Date().toISOString();
  return {
    id: uid(), name: 'تطبيق العميل', shortName: '', description: '', logo: '', favicon: '',
    brandColor: '#2563eb', lang: 'ar', dir: 'rtl', timezone: 'Asia/Riyadh', currency: 'SAR',
    themeMode: 'light', version: '1.0.0', keywords: '',
    contact: { email: '', phone: '', whatsapp: '', address: '' },
    social: { instagram: '', twitter: '', telegram: '', tiktok: '', linkedin: '' },
    legal: { terms: '', privacy: '' },
    design: DEFAULT_DESIGN(), variables: [],
    pages: [home], bars: [], modals: [],
    subscriberId: null, isTemplate: false, published: false, publishedAt: '', releaseNotes: '',
    createdAt: now, updatedAt: now,
    ...partial,
  };
}

// ─────────────────────────── قوالب جاهزة ───────────────────────────

function n(type: string, props: Record<string, any> = {}, style: NodeStyle = {}, children: AppNode[] = []): AppNode {
  const node = createNode(type);
  node.props = { ...node.props, ...props };
  node.style = { ...node.style, ...style };
  node.children = children;
  return node;
}

/** قالب: بوابة مالية للمشترك */
function financeTemplate(): AppProject {
  const p = createProject({ name: 'البوابة المالية', description: 'قالب بوابة مالية للمشترك: رصيد، أرباح، عمليات، سحب.' });
  const home = p.pages[0];
  home.nodes = [
    n('balanceCard', { title: 'الرصيد المتاح', value: '{balance}' }),
    n('grid', {}, { columns: 2, gap: 10 }, [
      n('infoCard', { title: 'الأرباح', value: '{profits}', icon: 'TrendingUp' }),
      n('infoCard', { title: 'الاشتراك', value: '{subscription}', icon: 'Wallet' }),
    ]),
    n('h3', { text: 'أداء الأرباح' }),
    n('lineChart', { title: 'آخر 6 فترات', data: [10, 18, 14, 26, 22, 34] }),
    n('h3', { text: 'آخر العمليات' }),
    n('opsTable', { max: 5 }),
  ];
  const profits = createPage('صفحة أرباحي');
  profits.nodes = [n('h2', { text: 'أرباحي' }), n('progressCircle', { title: 'نسبة التحقيق', value: 72 }), n('barChart', { title: 'التوزيعات', data: [5, 9, 7, 14, 11] })];
  p.pages.push(profits);

  const top = createBar('الشريط العلوي الرئيسي', 'top');
  top.nodes = [n('h3', { text: '{name}' }, { color: '#ffffff', fontSize: 15 }), n('icon', { icon: 'Bell', size: 18 }, { color: '#ffffff' })];
  const bottom = createBar('شريط التنقل السفلي', 'bottom');
  bottom.justify = 'space-around';
  bottom.nodes = [
    n('buttonGhost', { label: 'الرئيسية' }, { color: '#ffffff' }),
    n('buttonGhost', { label: 'أرباحي' }, { color: '#ffffff' }),
    n('buttonGhost', { label: 'العمليات' }, { color: '#ffffff' }),
  ];
  p.bars = [top, bottom];

  const withdraw = createModal('نافذة السحب', 'sheet', 'md');
  withdraw.nodes = [n('h3', { text: 'طلب سحب أرباح' }), n('inputNumber', { label: 'المبلغ المطلوب' }), n('button', { label: 'تأكيد السحب' })];
  p.modals = [withdraw];
  p.isTemplate = true;
  return p;
}

/** قالب: صفحة تعريفية بسيطة */
function landingTemplate(): AppProject {
  const p = createProject({ name: 'صفحة ترحيبية', description: 'قالب صفحة ترحيبية بسيطة بشعار ونص وأزرار.' });
  const home = p.pages[0];
  home.nodes = [
    n('card', {}, { bgGradient: 'linear-gradient(135deg,#0f172a,#4f46e5)', color: '#ffffff', padding: 24, radius: 24 }, [
      n('h1', { text: 'أهلاً {name}' }, { color: '#ffffff' }),
      n('paragraph', { text: 'هذه بوابتك الخاصة — تابع اشتراكك وأرباحك وعملياتك في مكان واحد.' }, { color: '#e2e8f0' }),
      n('button', { label: 'ابدأ الآن' }, { bg: '#ffffff', color: '#0f172a' }),
    ]),
    n('grid', {}, { columns: 3, gap: 10 }, [
      n('infoCard', { title: 'سرعة', value: '99%', icon: 'Zap' }),
      n('infoCard', { title: 'أمان', value: 'A+', icon: 'Shield' }),
      n('infoCard', { title: 'دعم', value: '24/7', icon: 'Headphones' }),
    ]),
  ];
  p.isTemplate = true;
  return p;
}

/** قالب: لوحة عمليات */
function opsTemplate(): AppProject {
  const p = createProject({ name: 'لوحة العمليات', description: 'قالب يركّز على جداول العمليات والتقارير.' });
  const home = p.pages[0];
  home.nodes = [
    n('h2', { text: 'سجل العمليات' }),
    n('grid', {}, { columns: 3, gap: 10 }, [
      n('statCard', { title: 'مكتملة', value: '18', change: '+4' }),
      n('statCard', { title: 'قيد التنفيذ', value: '3', change: '0' }),
      n('statCard', { title: 'إجمالي', value: '21', change: '+4' }),
    ]),
    n('opsTable', { max: 10 }),
  ];
  p.isTemplate = true;
  return p;
}

export const APP_TEMPLATES = (): AppProject[] => [financeTemplate(), landingTemplate(), opsTemplate()];

/** مكتبة نوافذ جاهزة (القسم 7.7) */
export const MODAL_LIBRARY: { id: string; label: string; description: string; build: () => AppModal }[] = [
  {
    id: 'confirm', label: 'نافذة تأكيد', description: 'تأكيد إجراء بنعم/لا',
    build: () => { const m = createModal('تأكيد الإجراء', 'alert', 'sm'); m.nodes = [n('h3', { text: 'هل أنت متأكد؟' }), n('paragraph', { text: 'لا يمكن التراجع عن هذا الإجراء.' }), n('row', {}, { gap: 8 }, [n('button', { label: 'نعم' }), n('buttonOutline', { label: 'إلغاء' })])]; return m; },
  },
  {
    id: 'withdraw', label: 'نافذة سحب مالي', description: 'طلب سحب بمبلغ وتأكيد',
    build: () => { const m = createModal('سحب مالي', 'sheet', 'md'); m.nodes = [n('h3', { text: 'سحب أرباح' }), n('inputNumber', { label: 'المبلغ' }), n('inputText', { label: 'الحساب البنكي' }), n('button', { label: 'إرسال الطلب' })]; return m; },
  },
  {
    id: 'login', label: 'تسجيل الدخول', description: 'نموذج دخول جاهز',
    build: () => { const m = createModal('تسجيل الدخول', 'modal', 'sm'); m.nodes = [n('loginForm', { title: 'تسجيل الدخول' })]; return m; },
  },
  {
    id: 'details', label: 'تفاصيل عملية', description: 'عرض تفاصيل عملية مالية',
    build: () => { const m = createModal('تفاصيل العملية', 'modal', 'md'); m.nodes = [n('h3', { text: 'تفاصيل العملية' }), n('simpleTable', { columns: ['البند', 'القيمة'], rows: [['المبلغ', '0'], ['التاريخ', todayStr()]] })]; return m; },
  },
  {
    id: 'share', label: 'مشاركة', description: 'خيارات مشاركة سريعة',
    build: () => { const m = createModal('مشاركة', 'popover', 'sm'); m.nodes = [n('row', {}, { gap: 8 }, [n('icon', { icon: 'Share2' }), n('icon', { icon: 'MessageCircle' }), n('icon', { icon: 'Mail' })])]; return m; },
  },
  {
    id: 'success', label: 'نجاح', description: 'إشعار نجاح مؤقت',
    build: () => { const m = createModal('تم بنجاح', 'toast', 'sm'); m.autoHideSeconds = 3; m.nodes = [n('paragraph', { text: 'تمت العملية بنجاح ✓' })]; return m; },
  },
  {
    id: 'qr', label: 'QR Code', description: 'عرض رمز QR',
    build: () => { const m = createModal('رمز QR', 'modal', 'sm'); m.nodes = [n('qrcode', { value: 'https://example.com' })]; return m; },
  },
  {
    id: 'notifications', label: 'إشعارات', description: 'درج إشعارات جانبي',
    build: () => { const m = createModal('الإشعارات', 'drawer-right', 'md'); m.nodes = [n('h3', { text: 'الإشعارات' }), n('list', { items: ['تم إيداع أرباح', 'تحديث بيانات الحساب'] })]; return m; },
  },
];

export const EMPTY_STORE = () => ({
  projects: [] as AppProject[],
  templates: [] as AppProject[],
  activeProjectId: null as string | null,
  lastSavedAt: '',
});

/** ترقيع مشروع قادم من تخزين قديم / استيراد */
export function resolveProject(raw: any): AppProject {
  const base = createProject();
  const p: AppProject = { ...base, ...(raw || {}) };
  p.design = { ...base.design, ...(raw?.design || {}) };
  p.contact = { ...base.contact, ...(raw?.contact || {}) };
  p.social = { ...base.social, ...(raw?.social || {}) };
  p.legal = { ...base.legal, ...(raw?.legal || {}) };
  p.pages = Array.isArray(raw?.pages) && raw.pages.length ? raw.pages : base.pages;
  p.bars = Array.isArray(raw?.bars) ? raw.bars : [];
  p.modals = Array.isArray(raw?.modals) ? raw.modals : [];
  p.variables = Array.isArray(raw?.variables) ? raw.variables : [];
  return p;
}
