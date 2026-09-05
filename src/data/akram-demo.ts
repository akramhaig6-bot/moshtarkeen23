// ═══════════════════════════════════════════════════════════════
// البيانات التجريبية الكاملة للمشترك "أكرم هيج"
// تشمل: بيانات النموذج + CMS كامل (28 قسم) + 5 عمليات
// ═══════════════════════════════════════════════════════════════
import { Subscriber, Operation } from '@/types';
import { SubscriberCMS } from '@/types/cms';
import { DEFAULT_CMS } from '@/data/cms-defaults';
import { EMPTY_SUB } from '@/constants/app';
import { uid } from '@/lib/random';

// صور تجريبية مولّدة محلياً (SVG Base64) — بدون أي API خارجي
const svgImg = (title: string, c1: string, c2: string, emoji = '📈') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="480" height="320" fill="url(#g)"/><text x="240" y="150" font-size="64" text-anchor="middle">${emoji}</text><text x="240" y="220" font-size="26" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text></svg>`
  )}`;

/** يبني كل بيانات أكرم هيج من جديد (معرّفات فريدة في كل استدعاء) */
export function buildAkramDemo(): { subscriber: Subscriber; operations: Omit<Operation, 'id'>[]; cms: SubscriberCMS } {
  const demoSub: Subscriber = {
    ...EMPTY_SUB,
    id: uid(),
    name: 'أكرم هيج',
    phone: '+966551234567',
    phoneCountryCode: '+966',
    phoneCountryIso: 'SA',
    phoneVisible: true,
    iban: 'SA0380000000608010167519',
    ibanVisible: true,
    accountNumber: '608010167519',
    accountNumberVisible: true,
    subscriptionAmount: 15000,
    subscriptionCurrency: 'USDT',
    subscriptionCurrencySymbol: 'USDT',
    profits: 4200,
    profitsCurrency: 'USDT',
    profitsCurrencySymbol: 'USDT',
    systemFees: 150,
    systemFeesCurrency: 'USDT',
    systemFeesCurrencySymbol: 'USDT',
    systemAccount: 'SYS-AKRAM-001',
    systemAccountType: 'manual',
    systemAccountValue: 'SYS-AKRAM-001',
    joinDate: '2024-01-15',
    walletAddress: 'Binance|USDT|TRC20|TXkR9mN2pQ7vB3wL5jH8cF4dE6gA1sY0z',
    walletPlatform: 'Binance',
    walletCurrency: 'USDT',
    walletNetwork: 'TRC20',
    walletAddressValue: 'TXkR9mN2pQ7vB3wL5jH8cF4dE6gA1sY0z',
    subscriberStatus: 'نشط',
    bankName: 'مصرف الراجحي',
    bankCountry: 'السعودية',
    bankType: 'islamic',
    bankLogoUrl: 'https://logo.clearbit.com/alrajhibank.com.sa',
    bankDomain: 'alrajhibank.com.sa',
    bankSwift: 'RJHISARI',
    currency: 'USD',
    platform: 'Binance',
    notes: 'عميل مميز - يتابع بشكل أسبوعي',
    withdrawalText: 'تم تأكيد طلب السحب بنجاح. سيتم التحويل خلال 24 ساعة عمل.',
  };

  const operations: Omit<Operation, 'id'>[] = [
    { subscriberName: 'أكرم هيج', operation: 'توزيع أرباح', amount: '800 USDT', date: '2025-01-01', status: 'مكتمل' },
    { subscriberName: 'أكرم هيج', operation: 'إيداع', amount: '5,000 USDT', date: '2024-12-15', status: 'مكتمل' },
    { subscriberName: 'أكرم هيج', operation: 'سحب', amount: '2,000 USDT', date: '2024-11-20', status: 'مكتمل' },
    { subscriberName: 'أكرم هيج', operation: 'توزيع أرباح', amount: '1,200 USDT', date: '2024-10-01', status: 'مكتمل' },
    { subscriberName: 'أكرم هيج', operation: 'إيداع', amount: '10,000 USDT', date: '2024-01-15', status: 'مكتمل' },
  ];

  // ═══════════ CMS كامل ═══════════
  const cms: SubscriberCMS = JSON.parse(JSON.stringify(DEFAULT_CMS));

  // 1. الشركة
  cms.company = {
    ...cms.company,
    name: 'هيج للاستثمار الذكي',
    shortName: 'هيج',
    description: 'شركة رائدة في إدارة المحافظ',
    website: 'https://www.hijj-invest.com',
    email: 'info@hijj-invest.com',
    phone: '+966501234567',
    whatsappEnabled: true,
    address: 'الرياض السعودية',
    commercialReg: '1010456789',
    social: { instagram: 'https://instagram.com/hijj.invest', twitter: 'https://x.com/hijj_invest', telegram: 'https://t.me/hijj_invest', tiktok: '', linkedin: '', snapchat: '' },
  };

  // 2. الملف الشخصي
  cms.clientProfile = {
    ...cms.clientProfile,
    avatarType: 'auto',
    avatarShape: 'circle',
    displayName: 'أكرم هيج',
    displayMode: 'original',
    title: 'مستثمر VIP',
    memberNumber: 'VIP-2024-001',
    statusStyle: 'active',
    badge: 'platinum',
    memberLevel: 'diamond',
    phoneDisplay: 'partial',
    showCountry: true,
    showJoinDate: true,
    personalBio: 'مستثمر منذ 2024',
    cardBgType: 'gradient',
    cardBackground: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%)',
    nameColor: '#ffffff',
  };

  // 3. Top Bar
  cms.topBar = {
    ...cms.topBar,
    enabled: true,
    showLogo: true,
    logoType: 'text',
    title: 'محفظة المستثمر',
    subtitle: 'لوحة التحكم الشخصية',
    showClientName: true,
    showNotifications: true,
    showDarkMode: true,
    showSearch: true,
    showLanguage: true,
    showMenu: true,
    bgColor: '#1e3a8a',
    textColor: '#ffffff',
    transparency: 'solid',
    shadow: 'light',
    height: 'medium',
    sticky: true,
    showProgress: true,
  };

  // 4. Bottom Bar — 5 أزرار، "سحب" بارز أخضر، "أرباحي" بشارة 3
  cms.bottomBar = {
    ...cms.bottomBar,
    enabled: true,
    buttonCount: 5,
    showOnDesktop: true,
    style: 'raised',
    bgColor: '#ffffff',
    shadow: 'strong',
    buttons: [
      { id: uid(), icon: 'home', label: 'الرئيسية', action: 'home', highlighted: false, color: '#2563eb', badge: 0, visible: true, order: 0 },
      { id: uid(), icon: 'wallet', label: 'المحفظة', action: 'wallet', highlighted: false, color: '#10b981', badge: 0, visible: true, order: 1 },
      { id: uid(), icon: 'withdraw', label: 'سحب', action: 'withdraw', highlighted: true, color: '#22c55e', badge: 0, visible: true, order: 2 },
      { id: uid(), icon: 'profits', label: 'أرباحي', action: 'profits', highlighted: false, color: '#f59e0b', badge: 3, visible: true, order: 3 },
      { id: uid(), icon: 'account', label: 'حسابي', action: 'account', highlighted: false, color: '#8b5cf6', badge: 0, visible: true, order: 4 },
    ],
  };

  // 5. Side Bar — 10 عناصر مع فواصل + دعم فني واتساب
  cms.sideBar = {
    ...cms.sideBar,
    enabled: true,
    position: 'right',
    behavior: 'collapsible',
    defaultState: 'closed',
    width: 'normal',
    shadow: 'strong',
    header: { showAvatar: true, showName: true, showStatus: true, showMemberNumber: true, showSettings: true },
    items: [
      { id: uid(), icon: 'home', label: 'الرئيسية', description: 'النظرة العامة', action: 'home', badge: 0, color: '', group: 'الرئيسية', visible: true, order: 0, separator: false },
      { id: uid(), icon: 'wallet', label: 'محفظة المستثمر', description: 'الأرصدة والمحافظ', action: 'wallet', badge: 0, color: '', group: 'المالية', visible: true, order: 1, separator: false },
      { id: uid(), icon: 'profits', label: 'أرباحي', description: 'الرسوم والعدادات', action: 'profits', badge: 3, color: '', group: 'المالية', visible: true, order: 2, separator: false },
      { id: uid(), icon: 'withdraw', label: 'سحب', description: 'طلب سحب أرباح', action: 'withdraw', badge: 0, color: '', group: 'المالية', visible: true, order: 3, separator: true },
      { id: uid(), icon: 'operations', label: 'العمليات', description: 'سجل كامل', action: 'operations', badge: 12, color: '', group: 'السجلات', visible: true, order: 4, separator: false },
      { id: uid(), icon: 'account', label: 'حسابات بنكية', description: 'الحساب والآيبان', action: 'account', badge: 0, color: '', group: 'السجلات', visible: true, order: 5, separator: true },
      { id: uid(), icon: 'star', label: 'عروض جديدة', description: 'العروض الحالية', action: 'extras', badge: 0, color: '#d4af37', group: 'المزيد', visible: true, order: 6, separator: false },
      { id: uid(), icon: 'file', label: 'مستندات', description: 'العقود والكشوف', action: 'docs', badge: 0, color: '', group: 'المزيد', visible: true, order: 7, separator: true },
      { id: uid(), icon: 'settings', label: 'الإعدادات', description: 'تخصيص العرض', action: 'settings', badge: 0, color: '', group: 'الحساب', visible: true, order: 8, separator: false },
      { id: uid(), icon: 'help', label: 'دعم فني', description: 'واتساب مباشر', action: 'support', badge: 0, color: '#10b981', group: 'الحساب', visible: true, order: 9, separator: false },
    ],
    footer: { showSupport: true, supportLink: 'https://wa.me/966501234567', showLogout: true, version: 'v2.0', copyright: 'جميع الحقوق محفوظة 2025' },
  };

  // 6. الألوان + الوضع الداكن
  cms.design.colors = { primary: '#2563eb', secondary: '#64748b', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', bgMain: '#f8fafc', bgCards: '#ffffff', textMain: '#1e293b', textSecondary: '#94a3b8', borders: '#e2e8f0' };
  cms.design.darkMode = { enabled: true, autoSwitch: false, colors: { ...cms.design.darkMode.colors } };

  // 7. النصوص المخصصة
  cms.texts = [
    { id: uid(), title: '', content: 'مرحباً {الاسم} 👋', icon: 'star', color: '#2563eb', size: 'medium', align: 'right', bgType: 'none', bgValue: '', border: 'none', type: 'normal', location: 'top', visible: true, expiryDate: '' },
    { id: uid(), title: '', content: 'عرض خاص: أرباح مضاعفة على الإيداعات الجديدة حتى نهاية فبراير', icon: 'bell', color: '#92400e', size: 'medium', align: 'center', bgType: 'color', bgValue: '#fffbeb', border: 'edges', type: 'alert', location: 'top', visible: true, expiryDate: '2025-02-28' },
    { id: uid(), title: '', content: 'آخر تحديث: {اليوم}/{الشهر}/{السنة}', icon: 'clock', color: '#64748b', size: 'small', align: 'left', bgType: 'none', bgValue: '', border: 'none', type: 'normal', location: 'summary', visible: true, expiryDate: '' },
    { id: uid(), title: '', content: 'تم استلام طلبك بنجاح يا {الاسم}', icon: 'star', color: '#166534', size: 'medium', align: 'right', bgType: 'color', bgValue: '#f0fdf4', border: 'none', type: 'success', location: 'query', visible: true, expiryDate: '' },
    { id: uid(), title: '', content: 'تم العثور على محفظتك', icon: 'star', color: '#1e40af', size: 'medium', align: 'center', bgType: 'none', bgValue: '', border: 'none', type: 'info', location: 'afterQuery', visible: true, expiryDate: '' },
    { id: uid(), title: '', content: 'أدخل بياناتك للوصول إلى محفظتك', icon: 'search', color: '#e2e8f0', size: 'medium', align: 'center', bgType: 'none', bgValue: '', border: 'none', type: 'normal', location: 'query', visible: true, expiryDate: '' },
    { id: uid(), title: '', content: '© 2025 شركة هيج للاستثمار', icon: 'star', color: '#94a3b8', size: 'small', align: 'center', bgType: 'none', bgValue: '', border: 'none', type: 'normal', location: 'bottom', visible: true, expiryDate: '' },
  ];

  // 8. الأقسام المخصصة
  cms.sections = [
    {
      id: uid(), title: 'خطة الاستثمار', subtitle: 'استراتيجية 2025', icon: 'chart',
      description: 'نتبع استراتيجية استثمار متوازنة تجمع بين النمو الرأسمالي والتوزيعات الدورية، مع إدارة مخاطر احترافية وتنويع الأصول بين الأسهم العالمية والعملات الرقمية والذهب.',
      images: [svgImg('محفظة النمو', '#1d4ed8', '#60a5fa', '📊'), svgImg('صندوق الذهب', '#b45309', '#fbbf24', '🥇'), svgImg('الأصول الرقمية', '#0f766e', '#34d399', '🪙')],
      imageDisplay: 'grid', imageSize: 'medium', videoUrl: '',
      buttons: [{ id: uid(), label: 'استكشف الخطة', url: 'https://www.hijj-invest.com', color: '#2563eb' }],
      location: 'home', order: 0, collapsible: false, defaultState: 'open', bgColor: '#ffffff', style: 'card', visible: true, dateFrom: '', dateTo: '',
    },
    {
      id: uid(), title: 'إنجازاتك', subtitle: '+28% نمو', icon: 'star',
      description: 'نما محفظتك بنسبة 28% خلال العام الأخير بفضل التوزيعات الدورية وارتفاع قيمة الأصول الرقمية — استمر على هذا المسار!',
      images: [svgImg('نمو 28% خلال عام واحد', '#065f46', '#34d399', '🚀')],
      imageDisplay: 'single', imageSize: 'large', videoUrl: '',
      buttons: [],
      location: 'home', order: 1, collapsible: false, defaultState: 'open', bgColor: '#ffffff', style: 'card', visible: true, dateFrom: '', dateTo: '',
    },
  ];

  // 9. بطاقات المعلومات
  cms.infoCards = [
    { id: uid(), title: 'إجمالي الرصيد', value: '19,050 USDT', icon: 'wallet', color: '#2563eb', change: '', sparkline: [12000, 13200, 14000, 15200, 16600, 17500, 18300, 19050], size: 'medium', visible: true, order: 0 },
    { id: uid(), title: 'إجمالي الأرباح', value: '4,200 USDT', icon: 'profits', color: '#10b981', change: '+28%', sparkline: [800, 1500, 2100, 2600, 3200, 3700, 4000, 4200], size: 'medium', visible: true, order: 1 },
    { id: uid(), title: 'الرسوم', value: '150 USDT', icon: 'operations', color: '#f59e0b', change: '', sparkline: [], size: 'medium', visible: true, order: 2 },
    { id: uid(), title: 'نسبة الربح', value: '28%', icon: 'profits', color: '#8b5cf6', change: '', sparkline: [4, 8, 12, 16, 20, 24, 26, 28], size: 'medium', visible: true, order: 3 },
    { id: uid(), title: 'عدد العمليات', value: '12', icon: 'operations', color: '#06b6d4', change: '', sparkline: [], size: 'medium', visible: true, order: 4 },
    { id: uid(), title: 'أيام الاستثمار', value: '380 يوم', icon: 'clock', color: '#64748b', change: '', sparkline: [], size: 'medium', visible: true, order: 5 },
    { id: uid(), title: 'التصنيف', value: 'بلاتيني 💎', icon: 'star', color: '#d4af37', change: '', sparkline: [], size: 'medium', visible: true, order: 6 },
    { id: uid(), title: 'آخر عملية', value: 'قبل 5 أيام', icon: 'clock', color: '#ef4444', change: '', sparkline: [], size: 'medium', visible: true, order: 7 },
  ];

  // 10. الرسوم البيانية
  cms.charts = [
    { id: uid(), type: 'line', title: 'تطور الرصيد', dataType: 'balance', period: '1y', colors: ['#2563eb'], showNumbers: true, size: 'medium', visible: true, order: 0 },
    { id: uid(), type: 'pie', title: 'توزيع الأصول', dataType: 'custom', period: 'all', colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'], showNumbers: true, size: 'medium', visible: true, order: 1 },
  ];

  // 11. العدادات
  cms.counters = [
    { id: uid(), value: 19050, prefix: '', suffix: 'USDT', title: 'إجمالي الرصيد', icon: 'wallet', color: '#2563eb', duration: 2, visible: true, order: 0 },
    { id: uid(), value: 4200, prefix: '', suffix: 'USDT', title: 'الأرباح', icon: 'profits', color: '#10b981', duration: 2, visible: true, order: 1 },
    { id: uid(), value: 28, prefix: '', suffix: '%', title: 'نسبة النمو', icon: 'profits', color: '#8b5cf6', duration: 2, visible: true, order: 2 },
    { id: uid(), value: 12, prefix: '', suffix: '', title: 'عدد العمليات', icon: 'operations', color: '#f59e0b', duration: 2, visible: true, order: 3 },
  ];

  // 12. الأوسمة
  cms.achievements = [
    { id: uid(), name: 'أول إيداع', icon: '🥇', color: 'gold', customColor: '', description: 'يناير 2024', dateEarned: '2024-01-15', visible: true, order: 0 },
    { id: uid(), name: 'رصيد 10000+', icon: '💰', color: 'gold', customColor: '', description: 'تجاوزت 10,000 USDT', dateEarned: '2024-12-15', visible: true, order: 1 },
    { id: uid(), name: 'أول ربح', icon: '📈', color: 'silver', customColor: '', description: 'أول توزيع أرباح', dateEarned: '2024-10-01', visible: true, order: 2 },
    { id: uid(), name: 'سنة كاملة', icon: '🎂', color: 'bronze', customColor: '', description: 'انضممت في 2024-01-15', dateEarned: '2025-01-15', visible: true, order: 3 },
    { id: uid(), name: 'عضوية VIP', icon: '👑', color: 'custom', customColor: '#d4af37', description: 'مستثمر مميز', dateEarned: '2024-06-01', visible: true, order: 4 },
    { id: uid(), name: '10 عمليات', icon: '🔢', color: 'silver', customColor: '', description: '12 عملية منجزة', dateEarned: '2025-01-01', visible: true, order: 5 },
    { id: uid(), name: 'مستثمر دولي', icon: '🌍', color: 'gold', customColor: '', description: 'تستثمر بعملة USDT', dateEarned: '2024-03-01', visible: true, order: 6 },
    { id: uid(), name: 'بلاتيني', icon: '💎', color: 'custom', customColor: '#38bdf8', description: 'أعلى تصنيف', dateEarned: '2025-01-12', visible: true, order: 7 },
  ];

  // 13. البانرات
  cms.banners = [
    { id: uid(), text: '🎉 عرض خاص: أرباح مضاعفة على الإيداعات حتى 2025-02-28', image: '', url: '', color: '#d4af37', location: 'top', closable: true, expiryDate: '2025-02-28', visible: true, order: 0 },
    { id: uid(), text: '💎 تهانينا! تمت ترقية عضويتك إلى بلاتيني', image: '', url: '', color: '#0ea5e9', location: 'middle', closable: true, expiryDate: '', visible: true, order: 1 },
  ];

  // 14. جدول البيانات
  cms.dataTable = { ...cms.dataTable, title: 'سجل العمليات', sortOrder: 'newest', maxRows: 10, searchable: true, exportable: 'pdf', columns: ['العملية', 'المبلغ', 'التاريخ', 'الحالة'], colors: { header: '#eff6ff', rows: '#ffffff', text: '#1e293b' }, visible: true };

  // 15. الخريطة
  cms.map = { ...cms.map, enabled: true, visible: true, title: 'موقعنا في الرياض', lat: '24.7136', lng: '46.6753', mapType: 'roadmap', height: 'medium' };

  // 16. الرسائل
  cms.messages = {
    enabled: true,
    messages: [
      { id: uid(), text: 'توزيع أرباح ديسمبر: تم إيداع 800 USDT في محفظتك بنجاح.', date: '2025-01-01', read: false, priority: 'urgent', sender: 'الإدارة', visible: true },
      { id: uid(), text: 'تم تحديث خطة الاستثمار الخاصة بك بناءً على آخر تقييم للمخاطر.', date: '2025-01-05', read: false, priority: 'normal', sender: 'مدير الحساب', visible: true },
      { id: uid(), text: 'تذكير: اجتماع مراجعة الأداء يوم 2025-01-20 الساعة 6 مساءً.', date: '2025-01-10', read: false, priority: 'important', sender: 'خدمة العملاء', visible: true },
      { id: uid(), text: 'مبروك! وصلت إلى التصنيف البلاتيني 🎉', date: '2025-01-12', read: true, priority: 'normal', sender: 'الإدارة', visible: true },
    ],
  };

  // 17. التقويم
  cms.calendar = {
    enabled: true,
    events: [
      { id: uid(), type: 'profits', title: 'توزيع أرباح فبراير', date: '2025-02-01', time: '', description: 'التوزيع الشهري للأرباح', status: 'upcoming', color: '#10b981', repeat: 'monthly', visible: true },
      { id: uid(), type: 'meeting', title: 'اجتماع المراجعة', date: '2025-01-20', time: '18:00', description: 'مراجعة أداء المحفظة', status: 'upcoming', color: '#2563eb', repeat: 'once', visible: true },
      { id: uid(), type: 'renewal', title: 'تجديد العقد السنوي', date: '2025-03-15', time: '', description: '', status: 'upcoming', color: '#f59e0b', repeat: 'once', visible: true },
      { id: uid(), type: 'withdrawal', title: 'سحب مجدول', date: '2025-02-10', time: '', description: 'سحب تلقائي 500 USDT', status: 'upcoming', color: '#ef4444', repeat: 'monthly', visible: true },
    ],
  };

  // 18. المعرض
  cms.gallery = {
    enabled: true,
    images: [
      { id: uid(), src: svgImg('المقر الرئيسي', '#1e3a8a', '#3b82f6', '🏢'), description: 'المقر الرئيسي — الرياض', category: 'other' },
      { id: uid(), src: svgImg('فريق الإدارة', '#4c1d95', '#a78bfa', '👥'), description: 'فريق إدارة المحافظ', category: 'personal' },
      { id: uid(), src: svgImg('جلسة الاستثمار', '#065f46', '#34d399', '🤝'), description: 'جلسة مراجعة الربع الرابع', category: 'personal' },
      { id: uid(), src: svgImg('تقرير الأداء', '#92400e', '#fbbf24', '📗'), description: 'التقرير السنوي 2024', category: 'document' },
      { id: uid(), src: svgImg('حفل التكريم', '#9f1239', '#fb7185', '🏆'), description: 'تكريم العملاء المميزين', category: 'personal' },
    ],
    display: 'masonry', size: 'medium', zoomOnClick: true, visible: true,
  };

  // 19. التنبيهات
  cms.alerts = [
    { id: uid(), text: '✅ تم تحديث بياناتك بنجاح', type: 'success', icon: 'bell', closable: true, location: 'top', visible: true, order: 0 },
    { id: uid(), text: '⚠️ يرجى التأكد من صحة بيانات الحساب البنكي قبل أول سحب', type: 'warning', icon: 'bell', closable: true, location: 'middle', visible: true, order: 1 },
    { id: uid(), text: '💡 نصيحة: راجع محفظتك أسبوعياً لمتابعة الأداء', type: 'info', icon: 'bell', closable: true, location: 'bottom', visible: true, order: 2 },
    { id: uid(), text: '🎯 مبروك! حققت هدف الادخار لهذا الشهر', type: 'success', icon: 'bell', closable: true, location: 'bottom', visible: true, order: 3 },
  ];

  // 20. المستندات
  cms.documents = [
    { id: uid(), name: 'عقد الاستثمار', fileData: '', fileType: 'application/pdf', icon: 'file', size: 'PDF · 1.2 MB', date: '2024-01-15', showDownload: true, visible: true, order: 0 },
    { id: uid(), name: 'كشف حساب يناير 2025', fileData: '', fileType: 'application/pdf', icon: 'file', size: 'PDF · 340 KB', date: '2025-01-01', showDownload: true, visible: true, order: 1 },
    { id: uid(), name: 'التقرير السنوي 2024', fileData: '', fileType: 'application/pdf', icon: 'file', size: 'PDF · 2.8 MB', date: '2025-01-05', showDownload: true, visible: true, order: 2 },
    { id: uid(), name: 'فاتورة INV-2024-VIP-001', fileData: '', fileType: 'application/pdf', icon: 'file', size: 'PDF · 120 KB', date: '2025-01-01', showDownload: true, visible: true, order: 3 },
    { id: uid(), name: 'الشروط والأحكام', fileData: '', fileType: 'application/pdf', icon: 'file', size: 'PDF · 90 KB', date: '2024-01-15', showDownload: true, visible: true, order: 4 },
  ];

  // 21. أشرطة التقدم
  cms.progressBars = [
    { id: uid(), title: 'هدف الادخار', current: 15200, target: 20000, color: '#2563eb', shape: 'linear', visible: true, order: 0 },
    { id: uid(), title: 'نمو المحفظة', current: 80, target: 100, color: '#10b981', shape: 'linear', visible: true, order: 1 },
    { id: uid(), title: 'العضوية الماسية', current: 52, target: 100, color: '#8b5cf6', shape: 'linear', visible: true, order: 2 },
    { id: uid(), title: 'العمليات الشهرية', current: 8, target: 10, color: '#f59e0b', shape: 'linear', visible: true, order: 3 },
  ];

  // 22. العد التنازلي
  cms.countdowns = [
    { id: uid(), title: '⏳ توزيع الأرباح القادم', targetDate: '2025-02-01', targetTime: '', color: '#10b981', size: 'small', visible: true, order: 0 },
    { id: uid(), title: '🔥 انتهاء عرض المضاعفة', targetDate: '2025-02-28', targetTime: '', color: '#d4af37', size: 'small', visible: true, order: 1 },
  ];

  // 23. الفاتورة
  cms.invoice = {
    ...cms.invoice,
    enabled: true,
    visible: true,
    autoNumber: false,
    customNumber: 'INV-2024-VIP-001',
    items: [
      { label: 'الاشتراك السنوي', amount: 15000, type: 'credit' },
      { label: 'الأرباح الموزعة', amount: 4200, type: 'credit' },
      { label: 'رسوم النظام', amount: 150, type: 'debit' },
    ],
    currency: 'USDT',
    showLogo: true,
    stampImage: '',
    notes: 'شكراً لثقتكم بـ هيج للاستثمار الذكي — هذا الكشف صادر آلياً ولا يحتاج إلى توقيع.',
    showDownload: true,
  };

  // 24. القالب
  cms.templateId = 'gulf-luxury';

  // 25-27. التصميم
  cms.design.fonts = { heading: 'Cairo', body: 'Tajawal', baseSize: 'normal', weight: 'normal', lineHeight: 'normal', direction: 'rtl' };
  cms.design.background = { type: 'gradient', color: '#f8fafc', gradient: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', gradientDirection: '135deg', image: '', opacity: 100, blur: 0, fixed: true };
  cms.design.query = {
    ...cms.design.query,
    method: 'phone', fields: 1,
    bgType: 'gradient', bgValue: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    showLogo: true, welcomeTitle: 'أهلاً بك في بوابة الاستعلام', welcomeDesc: 'أدخل بياناتك للوصول إلى محفظتك',
    inputStyle: 'rounded', buttonColor: '#d4af37', buttonIcon: 'search',
    loadingText: 'جاري البحث...', errorText: 'لم يتم العثور على بياناتك', successText: 'تم العثور على محفظتك',
    transition: 'fade', layout: 'dashboard', grid: 2, swipeNav: true,
  };
  cms.design.cardStyle = 'shadow';
  cms.design.animation = 'slide';
  cms.design.spacing = 'normal';
  cms.design.hoverEffect = 'lift';

  // 28. Widgets
  cms.widgets = {
    liveClock: true, hijriDate: true, currencyRates: true, goldPrice: true, btcPrice: true,
    weather: true, profitCalculator: true, qrCode: true, newsTicker: true,
    newsTickerText: 'توزيع أرباح ديسمبر يوم 2025-02-01 — وأرباح مضاعفة على الإيداعات الجديدة!',
  };

  return { subscriber: demoSub, operations, cms };
}
