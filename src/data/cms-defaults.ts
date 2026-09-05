// ═══════════════════════════════════════════════════════════════
// القيم الافتراضية + 12 قالب جاهز لنظام CMS
// ═══════════════════════════════════════════════════════════════
import { SubscriberCMS, CMSTemplate, DesignSettings, BackgroundSettings, QueryScreenSettings } from '@/types/cms';
import { uid } from '@/lib/random';

const DEFAULT_COLORS = { primary: '#3b82f6', secondary: '#8b5cf6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#f8fafc', bgCards: '#ffffff', textMain: '#1e293b', textSecondary: '#64748b', borders: '#e2e8f0' };
const DARK_COLORS = { primary: '#60a5fa', secondary: '#a78bfa', success: '#34d399', warning: '#fbbf24', danger: '#f87171', bgMain: '#0f172a', bgCards: '#1e293b', textMain: '#f1f5f9', textSecondary: '#94a3b8', borders: '#334155' };

const DEFAULT_BG: BackgroundSettings = { type: 'color', color: '#f8fafc', gradient: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', gradientDirection: '135deg', image: '', opacity: 100, blur: 0, fixed: false };
const DEFAULT_QUERY: QueryScreenSettings = { method: 'phone', fields: 1, bgColor: '#0f172a', bgType: 'gradient', bgValue: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)', showLogo: true, welcomeTitle: 'بوابة الاستعلام', welcomeDesc: 'أدخل بياناتك للوصول إلى حسابك', inputStyle: 'glass', buttonColor: '#3b82f6', buttonIcon: 'search', loadingText: 'جارٍ البحث...', errorText: 'لم يتم العثور على بيانات', successText: 'تم العثور على البيانات بنجاح', transition: 'fade', layout: 'dashboard', grid: 2, swipeNav: true };

// ═══ تسمية قسم المحفظة في تطبيق العميل ═══
// البيانات القديمة المحفوظة في localStorage تحمل تسميات («محفظتي»، «محفظتي الاستثمارية»…)
// تُرحَّل هنا — نقطة الحل الوحيدة — حتى تظهر التسمية المعتمدة دون تعديل كل سجل على حدة.
export const WALLET_SECTION_TITLE = 'محفظة المستثمر';
const LEGACY_WALLET_TITLES = new Set(['محفظتي', 'محفظتي الاستثمارية', 'محفظتي الحالية', 'محفظة العميل', 'محفظة العميل المخصصة']);
const isLegacyWalletTitle = (label?: string) => !!label && LEGACY_WALLET_TITLES.has(label.trim());

export const DEFAULT_CMS: SubscriberCMS = {
  company: { name: '', shortName: '', logo: '', favicon: '', description: '', website: '', email: '', phone: '', whatsappEnabled: false, address: '', commercialReg: '', coverImage: '', social: { instagram: '', twitter: '', telegram: '', tiktok: '', linkedin: '', snapchat: '' }, license: '', licenseImage: '' },
  clientProfile: { avatarType: 'auto', avatarImage: '', avatarShape: 'circle', displayName: '', displayMode: 'original', title: '', memberNumber: '', statusStyle: 'active', badge: 'none', memberLevel: 'none', phoneDisplay: 'full', showCountry: true, showJoinDate: true, personalBio: '', cardBgType: 'gradient', cardBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', nameColor: '#ffffff' },
  topBar: { enabled: true, showLogo: true, logoType: 'company', logoPosition: 'right', title: 'محفظة المستثمر', subtitle: '', showClientName: true, showNotifications: true, showDarkMode: false, showSearch: false, showLanguage: false, showMenu: true, customButtons: [], bgColor: '#ffffff', bgGradient: '', transparency: 'solid', shadow: 'light', height: 'medium', sticky: true, showProgress: false, textColor: '#1e293b' },
  bottomBar: { enabled: true, buttonCount: 4, showOnDesktop: false, style: 'raised', bgColor: '#ffffff', shadow: 'light', buttons: [
    { id: uid(), icon: 'home', label: 'الرئيسية', action: 'home', highlighted: false, color: '#3b82f6', badge: 0, visible: true, order: 0 },
    { id: uid(), icon: 'wallet', label: 'المحفظة', action: 'wallet', highlighted: false, color: '#10b981', badge: 0, visible: true, order: 1 },
    { id: uid(), icon: 'withdraw', label: 'السحب', action: 'withdraw', highlighted: true, color: '#f59e0b', badge: 0, visible: true, order: 2 },
    { id: uid(), icon: 'account', label: 'حسابي', action: 'account', highlighted: false, color: '#8b5cf6', badge: 0, visible: true, order: 3 },
  ]},
  sideBar: { enabled: true, position: 'right', behavior: 'press-only', defaultState: 'closed', width: 'normal', bgColor: '#ffffff', bgGradient: '', shadow: 'strong',
    header: { showAvatar: true, showName: true, showStatus: true, showMemberNumber: false, showSettings: true },
    items: [
      { id: uid(), icon: 'home', label: 'الرئيسية', description: '', action: 'home', badge: 0, color: '', group: 'الرئيسية', visible: true, order: 0, separator: false },
      { id: uid(), icon: 'wallet', label: 'المحفظة', description: 'أرصدة ومحافظ', action: 'wallet', badge: 0, color: '', group: 'المالية', visible: true, order: 1, separator: false },
      { id: uid(), icon: 'profits', label: 'الأرباح', description: 'أرباحك الحالية', action: 'profits', badge: 0, color: '', group: 'المالية', visible: true, order: 2, separator: false },
      { id: uid(), icon: 'operations', label: 'العمليات', description: 'سجل العمليات', action: 'operations', badge: 0, color: '', group: 'المالية', visible: true, order: 3, separator: true },
      { id: uid(), icon: 'settings', label: 'الإعدادات', description: '', action: 'settings', badge: 0, color: '', group: 'الحساب', visible: true, order: 4, separator: false },
    ],
    footer: { showSupport: true, supportLink: '', showLogout: false, version: 'v1.0', copyright: '' },
  },
  texts: [],
  sections: [],
  infoCards: [],
  charts: [],
  counters: [],
  achievements: [],
  banners: [],
  dataTable: { id: uid(), title: 'سجل العمليات', columns: ['العملية', 'المبلغ', 'التاريخ', 'الحالة'], sortOrder: 'newest', maxRows: 10, searchable: false, exportable: 'none', colors: { header: '#f1f5f9', rows: '#ffffff', text: '#1e293b' }, visible: true, order: 0 },
  map: { enabled: false, title: '', lat: '', lng: '', mapType: 'roadmap', height: 'medium', customMarker: '', visible: false },
  messages: { enabled: false, messages: [] },
  calendar: { enabled: false, events: [] },
  gallery: { enabled: false, images: [], display: 'grid', size: 'medium', zoomOnClick: true, visible: false },
  alerts: [],
  documents: [],
  progressBars: [],
  countdowns: [],
  invoice: { enabled: false, autoNumber: true, customNumber: '', items: [], currency: 'SAR', showLogo: true, stampImage: '', notes: '', showDownload: true, visible: false },
  widgets: { liveClock: false, hijriDate: false, currencyRates: false, goldPrice: false, btcPrice: false, weather: false, profitCalculator: false, qrCode: false, newsTicker: false, newsTickerText: '' },
  design: {
    colors: { ...DEFAULT_COLORS }, darkMode: { enabled: false, autoSwitch: false, colors: { ...DARK_COLORS } },
    fonts: { heading: 'Cairo', body: 'Cairo', baseSize: 'normal', weight: 'medium', lineHeight: 'normal', direction: 'rtl' },
    background: { ...DEFAULT_BG }, query: { ...DEFAULT_QUERY },
    layout: 'dashboard', grid: 2, swipeNav: true, navIndicators: 'dots',
    cardStyle: 'shadow', corners: 'slight', cardSize: 'medium', spacing: 'normal',
    iconStyle: 'colored', hoverEffect: 'lift', animation: 'fade',
  },
  templateId: '',
};

export const CMS_TEMPLATES: CMSTemplate[] = [
  { id: 'classic-bank', name: '🏦 بنك كلاسيكي', category: 'financial', description: 'أزرق رسمي + بطاقات بسيطة', preview: '', design: { colors: { primary: '#1e40af', secondary: '#3b82f6', success: '#059669', warning: '#d97706', danger: '#dc2626', bgMain: '#f0f4ff', bgCards: '#ffffff', textMain: '#1e293b', textSecondary: '#64748b', borders: '#bfdbfe' }, cardStyle: 'shadow', layout: 'dashboard' }, topBar: { bgColor: '#1e40af', shadow: 'strong' }, bottomBar: { bgColor: '#ffffff', style: 'flat' }, sideBar: { bgColor: '#f0f4ff' } },
  { id: 'luxury-gold', name: '💎 فاخر ذهبي', category: 'financial', description: 'أسود وذهبي + خطوط أنيقة', preview: '', design: { colors: { primary: '#d4af37', secondary: '#1a1a2e', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#0a0a0a', bgCards: '#1a1a2e', textMain: '#f5f5f5', textSecondary: '#d4af37', borders: '#333' }, cardStyle: 'glass', layout: 'cards' }, topBar: { bgColor: '#0a0a0a', bgGradient: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)', shadow: 'strong' }, bottomBar: { bgColor: '#1a1a2e', style: 'glass' }, sideBar: { bgColor: '#0a0a0a' } },
  { id: 'crypto-modern', name: '🪙 كريبتو حديث', category: 'financial', description: 'داكن + ألوان نيون', preview: '', design: { colors: { primary: '#8b5cf6', secondary: '#06b6d4', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#0f0f23', bgCards: '#1a1a3e', textMain: '#e2e8f0', textSecondary: '#94a3b8', borders: '#2d2d5e' }, cardStyle: 'glass', layout: 'dashboard' }, topBar: { bgColor: '#0f0f23', bgGradient: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', shadow: 'none' }, bottomBar: { bgColor: '#1a1a3e', style: 'glass' }, sideBar: { bgColor: '#0f0f23' } },
  { id: 'forex-pro', name: '📊 فوركس احترافي', category: 'financial', description: 'أخضر وأحمر + رسوم بيانية', preview: '', design: { colors: { primary: '#059669', secondary: '#dc2626', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#111827', bgCards: '#1f2937', textMain: '#f9fafb', textSecondary: '#9ca3af', borders: '#374151' }, cardStyle: 'shadow', layout: 'dashboard' }, topBar: { bgColor: '#111827', shadow: 'strong' }, bottomBar: { bgColor: '#1f2937', style: 'raised' }, sideBar: { bgColor: '#111827' } },
  { id: 'corporate', name: '🏢 شركة رسمية', category: 'commercial', description: 'أزرق داكن + تصميم كلاسيكي', preview: '', design: { colors: { primary: '#1e3a5f', secondary: '#4a90d9', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#f1f5f9', bgCards: '#ffffff', textMain: '#1e293b', textSecondary: '#64748b', borders: '#cbd5e1' }, cardStyle: 'border', layout: 'cards' }, topBar: { bgColor: '#1e3a5f', shadow: 'strong' }, bottomBar: { bgColor: '#ffffff', style: 'flat' }, sideBar: { bgColor: '#f1f5f9' } },
  { id: 'startup', name: '🚀 ستارت آب', category: 'commercial', description: 'ألوان جريئة + Modern', preview: '', design: { colors: { primary: '#7c3aed', secondary: '#ec4899', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#faf5ff', bgCards: '#ffffff', textMain: '#1e1b4b', textSecondary: '#6b7280', borders: '#e9d5ff' }, cardStyle: 'shadow', layout: 'dashboard' }, topBar: { bgColor: '#7c3aed', bgGradient: 'linear-gradient(90deg, #7c3aed, #ec4899)', shadow: 'none' }, bottomBar: { bgColor: '#ffffff', style: 'rounded' }, sideBar: { bgColor: '#faf5ff' } },
  { id: 'minimal', name: '✨ بسيط ونظيف', category: 'style', description: 'أبيض + مسافات واسعة', preview: '', design: { colors: { primary: '#374151', secondary: '#6b7280', success: '#059669', warning: '#d97706', danger: '#dc2626', bgMain: '#ffffff', bgCards: '#f9fafb', textMain: '#111827', textSecondary: '#6b7280', borders: '#e5e7eb' }, cardStyle: 'flat', layout: 'list', spacing: 'wide' }, topBar: { bgColor: '#ffffff', shadow: 'none' }, bottomBar: { bgColor: '#ffffff', style: 'flat' }, sideBar: { bgColor: '#ffffff' } },
  { id: 'dark-elegant', name: '🌙 داكن أنيق', category: 'style', description: 'أسود + رمادي + أبيض', preview: '', design: { colors: { primary: '#d4af37', secondary: '#1f2937', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#111827', bgCards: '#1f2937', textMain: '#f9fafb', textSecondary: '#d1d5db', borders: '#374151' }, cardStyle: 'border', layout: 'cards' }, topBar: { bgColor: '#111827', shadow: 'strong' }, bottomBar: { bgColor: '#1f2937', style: 'flat' }, sideBar: { bgColor: '#111827' } },
  { id: 'glassmorphism', name: '🪟 زجاجي', category: 'style', description: 'شفاف + Blur', preview: '', design: { colors: { primary: '#6366f1', secondary: '#8b5cf6', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#e0e7ff', bgCards: 'rgba(255,255,255,0.7)', textMain: '#1e1b4b', textSecondary: '#4338ca', borders: 'rgba(99,102,241,0.2)' }, cardStyle: 'glass', layout: 'dashboard' }, topBar: { bgColor: 'rgba(255,255,255,0.8)', transparency: 'blur', shadow: 'none' }, bottomBar: { bgColor: 'rgba(255,255,255,0.8)', style: 'glass' }, sideBar: { bgColor: 'rgba(255,255,255,0.8)' } },
  { id: 'gradient-vibe', name: '🌈 متدرج', category: 'style', description: 'ألوان متدرجة جذابة', preview: '', design: { colors: { primary: '#8b5cf6', secondary: '#ec4899', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#faf5ff', bgCards: '#ffffff', textMain: '#1e1b4b', textSecondary: '#6b7280', borders: '#e9d5ff' }, cardStyle: 'shadow', layout: 'dashboard' }, topBar: { bgColor: '#8b5cf6', bgGradient: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)', shadow: 'light' }, bottomBar: { bgColor: '#ffffff', style: 'raised' }, sideBar: { bgColor: '#faf5ff' } },
  { id: 'gulf-luxury', name: '🇸🇦 خليجي فاخر', category: 'regional', description: 'ذهبي + أخضر + خط عربي', preview: '', design: { colors: { primary: '#d4af37', secondary: '#065f46', success: '#059669', warning: '#d97706', danger: '#dc2626', bgMain: '#fefce8', bgCards: '#ffffff', textMain: '#1a1a1a', textSecondary: '#78716c', borders: '#fde68a' }, cardStyle: 'shadow', layout: 'dashboard', fonts: { heading: 'Cairo', body: 'Cairo', baseSize: 'normal', weight: 'bold', lineHeight: 'wide', direction: 'rtl' } }, topBar: { bgColor: '#065f46', bgGradient: 'linear-gradient(90deg, #065f46, #d4af37)', shadow: 'strong' }, bottomBar: { bgColor: '#ffffff', style: 'raised' }, sideBar: { bgColor: '#fefce8' } },
  { id: 'red-bold', name: '🔴 أحمر جريء', category: 'style', description: 'أحمر حيوي وقوي', preview: '', design: { colors: { primary: '#dc2626', secondary: '#991b1b', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#fef2f2', bgCards: '#ffffff', textMain: '#1c1917', textSecondary: '#78716c', borders: '#fecaca' }, cardStyle: 'shadow', layout: 'dashboard' }, topBar: { bgColor: '#dc2626', shadow: 'strong' }, bottomBar: { bgColor: '#ffffff', style: 'raised' }, sideBar: { bgColor: '#fef2f2' } },
];

export function resolveCMS(cms?: Partial<SubscriberCMS>): SubscriberCMS {
  if (!cms) return JSON.parse(JSON.stringify(DEFAULT_CMS));
  return {
    company: { ...DEFAULT_CMS.company, ...(cms.company || {}), social: { ...DEFAULT_CMS.company.social, ...(cms.company?.social || {}) } },
    clientProfile: { ...DEFAULT_CMS.clientProfile, ...(cms.clientProfile || {}) },
    topBar: { ...DEFAULT_CMS.topBar, ...(cms.topBar || {}), title: isLegacyWalletTitle(cms.topBar?.title) ? WALLET_SECTION_TITLE : (cms.topBar?.title ?? DEFAULT_CMS.topBar.title), customButtons: cms.topBar?.customButtons || [] },
    bottomBar: {
      ...DEFAULT_CMS.bottomBar, ...(cms.bottomBar || {}),
      // أزرار الشريط السفلي تبقى قصيرة («المحفظة») حتى لا تتزاحم مع بقية الأزرار
      buttons: (cms.bottomBar?.buttons || DEFAULT_CMS.bottomBar.buttons).map(b =>
        b.action === 'wallet' && isLegacyWalletTitle(b.label) ? { ...b, label: 'المحفظة' } : b),
    },
    sideBar: {
      ...DEFAULT_CMS.sideBar, ...(cms.sideBar || {}),
      header: { ...DEFAULT_CMS.sideBar.header, ...(cms.sideBar?.header || {}) },
      footer: { ...DEFAULT_CMS.sideBar.footer, ...(cms.sideBar?.footer || {}) },
      items: (cms.sideBar?.items || DEFAULT_CMS.sideBar.items).map(it =>
        it.action === 'wallet' && isLegacyWalletTitle(it.label) ? { ...it, label: WALLET_SECTION_TITLE } : it),
    },
    texts: cms.texts || [], sections: cms.sections || [],
    infoCards: cms.infoCards || [], charts: cms.charts || [], counters: cms.counters || [],
    achievements: cms.achievements || [], banners: cms.banners || [],
    dataTable: { ...DEFAULT_CMS.dataTable, ...(cms.dataTable || {}), colors: { ...DEFAULT_CMS.dataTable.colors, ...(cms.dataTable?.colors || {}) } },
    map: { ...DEFAULT_CMS.map, ...(cms.map || {}) },
    messages: { ...DEFAULT_CMS.messages, ...(cms.messages || {}), messages: cms.messages?.messages || [] },
    calendar: { ...DEFAULT_CMS.calendar, ...(cms.calendar || {}), events: cms.calendar?.events || [] },
    gallery: { ...DEFAULT_CMS.gallery, ...(cms.gallery || {}), images: cms.gallery?.images || [] },
    alerts: cms.alerts || [], documents: cms.documents || [],
    progressBars: cms.progressBars || [], countdowns: cms.countdowns || [],
    invoice: { ...DEFAULT_CMS.invoice, ...(cms.invoice || {}), items: cms.invoice?.items || [] },
    widgets: { ...DEFAULT_CMS.widgets, ...(cms.widgets || {}) },
    design: {
      ...DEFAULT_CMS.design, ...(cms.design || {}),
      colors: { ...DEFAULT_CMS.design.colors, ...(cms.design?.colors || {}) },
      darkMode: { ...DEFAULT_CMS.design.darkMode, ...(cms.design?.darkMode || {}), colors: { ...DEFAULT_CMS.design.darkMode.colors, ...(cms.design?.darkMode?.colors || {}) } },
      fonts: { ...DEFAULT_CMS.design.fonts, ...(cms.design?.fonts || {}) },
      background: { ...DEFAULT_CMS.design.background, ...(cms.design?.background || {}) },
      query: { ...DEFAULT_CMS.design.query, ...(cms.design?.query || {}) },
    },
    templateId: cms.templateId || '',
  };
}
