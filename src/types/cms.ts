// ═══════════════════════════════════════════════════════════════
// أنواع نظام CMS المتكامل — الأقسام 1 إلى 28
// كل شيء اختياري وقابل للإظهار/الإخفاء
// ═══════════════════════════════════════════════════════════════

// ─── 1. هوية الشركة والعلامة التجارية ───
export interface CompanyInfo {
  name: string;
  shortName: string;
  logo: string;
  favicon: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  whatsappEnabled: boolean;
  address: string;
  commercialReg: string;
  coverImage: string;
  social: {
    instagram: string;
    twitter: string;
    telegram: string;
    tiktok: string;
    linkedin: string;
    snapchat: string;
  };
  license: string;
  licenseImage: string;
}

// ─── 2. الملف الشخصي للعميل ───
export interface ClientProfile {
  avatarType: 'upload' | 'auto' | 'hidden';
  avatarImage: string;
  avatarShape: 'circle' | 'square' | 'rounded';
  displayName: string;
  displayMode: 'original' | 'alias' | 'hidden';
  title: string;
  memberNumber: string;
  statusStyle: 'active' | 'pending' | 'stopped' | 'new';
  badge: 'none' | 'vip' | 'premium' | 'platinum' | 'founder';
  memberLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  phoneDisplay: 'full' | 'partial' | 'hidden';
  showCountry: boolean;
  showJoinDate: boolean;
  personalBio: string;
  cardBgType: 'color' | 'gradient' | 'image' | 'transparent';
  cardBackground: string;
  nameColor: string;
}

// ─── 3. الشريط العلوي ───
export interface TopBarButton { id: string; label: string; icon: string; url: string; color: string; }
export interface TopBar {
  enabled: boolean;
  showLogo: boolean;
  logoType: 'company' | 'icon' | 'text' | 'hidden';
  logoPosition: 'right' | 'left' | 'center';
  title: string;
  subtitle: string;
  showClientName: boolean;
  showNotifications: boolean;
  showDarkMode: boolean;
  showSearch: boolean;
  showLanguage: boolean;
  showMenu: boolean;
  customButtons: TopBarButton[];
  bgColor: string;
  bgGradient: string;
  transparency: 'solid' | 'transparent' | 'blur';
  shadow: 'none' | 'light' | 'strong';
  height: 'small' | 'medium' | 'large';
  sticky: boolean;
  showProgress: boolean;
  textColor: string;
}

// ─── 4. الشريط السفلي ───
export interface BottomBarButton {
  id: string; icon: string; label: string;
  action: 'home' | 'wallet' | 'withdraw' | 'profits' | 'operations' | 'account' | 'custom' | 'sidebar';
  customUrl?: string;
  highlighted: boolean; color: string; badge: number; visible: boolean; order: number;
}
export interface BottomBar {
  enabled: boolean; buttonCount: 3 | 4 | 5; showOnDesktop: boolean;
  style: 'flat' | 'raised' | 'rounded' | 'glass';
  bgColor: string; shadow: 'none' | 'light' | 'strong';
  buttons: BottomBarButton[];
}

// ─── 5. الشريط الجانبي ───
export interface SideBarItem {
  id: string; icon: string; label: string; description: string; action: string;
  badge: number; color: string; group: string; visible: boolean; order: number; separator: boolean;
}
export interface SideBar {
  enabled: boolean; position: 'right' | 'left';
  behavior: 'fixed' | 'collapsible' | 'press-only';
  defaultState: 'open' | 'closed';
  width: 'narrow' | 'normal' | 'wide';
  bgColor: string; bgGradient: string; shadow: 'none' | 'light' | 'strong';
  header: { showAvatar: boolean; showName: boolean; showStatus: boolean; showMemberNumber: boolean; showSettings: boolean; };
  items: SideBarItem[];
  footer: { showSupport: boolean; supportLink: string; showLogout: boolean; version: string; copyright: string; };
}

// ─── 6. الألوان والثيمات ───
export interface DesignColors {
  primary: string; secondary: string; success: string; warning: string; danger: string;
  bgMain: string; bgCards: string; textMain: string; textSecondary: string; borders: string;
}
export interface DesignDarkMode { enabled: boolean; autoSwitch: boolean; colors: DesignColors; }

// ─── 25. الخطوط ───
export interface DesignFonts {
  heading: string; body: string; baseSize: 'small' | 'normal' | 'large';
  weight: 'normal' | 'medium' | 'bold'; lineHeight: 'tight' | 'normal' | 'wide';
  direction: 'rtl' | 'ltr';
}

// ─── 26. الخلفيات ───
export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image' | 'pattern';
  color: string; gradient: string; gradientDirection: string;
  image: string; opacity: number; blur: number; fixed: boolean;
}

// ─── 27. شاشة الاستعلام ───
export interface QueryScreenSettings {
  method: 'phone' | 'iban' | 'code' | 'name' | 'multi';
  fields: number; bgColor: string; bgType: 'color' | 'image' | 'gradient' | 'video'; bgValue: string;
  showLogo: boolean; welcomeTitle: string; welcomeDesc: string;
  inputStyle: 'flat' | 'raised' | 'glass' | 'rounded';
  buttonColor: string; buttonIcon: string;
  loadingText: string; errorText: string; successText: string;
  transition: 'fade' | 'slide' | 'scale';
  layout: 'dashboard' | 'cards' | 'list';
  grid: 1 | 2 | 3 | 4; swipeNav: boolean;
}

// ─── التصميم العام ───
export interface DesignSettings {
  colors: DesignColors; darkMode: DesignDarkMode; fonts: DesignFonts; background: BackgroundSettings;
  query: QueryScreenSettings;
  layout: 'dashboard' | 'cards' | 'list'; grid: 1 | 2 | 3 | 4;
  swipeNav: boolean; navIndicators: 'dots' | 'numbers' | 'progress' | 'none';
  cardStyle: 'flat' | 'shadow' | 'border' | 'glass' | 'neumorphism';
  corners: 'sharp' | 'slight' | 'very-rounded';
  cardSize: 'small' | 'medium' | 'large' | 'full'; spacing: 'tight' | 'normal' | 'wide';
  iconStyle: 'colored' | 'mono' | 'none';
  hoverEffect: 'zoom' | 'lift' | 'glow' | 'none';
  animation: 'fade' | 'slide' | 'bounce' | 'none';
}

// ─── 7. النصوص المخصصة ───
export interface CustomText {
  id: string; title: string; content: string; icon: string; color: string;
  size: 'small' | 'medium' | 'large'; align: 'right' | 'left' | 'center';
  bgType: 'none' | 'color' | 'gradient'; bgValue: string;
  border: 'none' | 'edges' | 'frame';
  type: 'normal' | 'alert' | 'success' | 'danger' | 'info';
  location: 'top' | 'summary' | 'bottom' | 'query' | 'afterQuery' | 'custom';
  visible: boolean; expiryDate: string;
}

// ─── 8. الأقسام المخصصة ───
export interface CustomSectionButton { id: string; label: string; url: string; color?: string; }
export interface CustomSection {
  id: string; title: string; subtitle: string; icon: string; description: string;
  images: string[]; imageDisplay: 'single' | 'grid' | 'slider' | 'carousel';
  imageSize: 'small' | 'medium' | 'large' | 'fullscreen';
  videoUrl: string; buttons: CustomSectionButton[];
  location: 'home' | 'separate' | 'sidebar';
  order: number; collapsible: boolean; defaultState: 'open' | 'closed';
  bgColor: string; style: 'card' | 'borderless' | 'frame';
  visible: boolean; dateFrom: string; dateTo: string;
}

// ─── 9. بطاقات المعلومات ───
export interface InfoCard {
  id: string; title: string; value: string; icon: string; color: string;
  change: string; sparkline: number[];
  size: 'small' | 'medium' | 'large' | 'wide';
  visible: boolean; order: number;
}

// ─── 10. الرسوم البيانية ───
export interface ChartWidget {
  id: string; type: 'line' | 'bar' | 'pie' | 'area' | 'horizontal-bar';
  title: string; dataType: 'profits' | 'withdrawals' | 'balance' | 'operations' | 'custom';
  period: '7d' | '30d' | '3m' | '1y' | 'all';
  colors: string[]; showNumbers: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean; order: number;
}

// ─── 11. العدادات المتحركة ───
export interface AnimatedCounter {
  id: string; value: number; prefix: string; suffix: string;
  title: string; icon: string; color: string;
  duration: 1 | 2; visible: boolean; order: number;
}

// ─── 12. الشارات والأوسمة ───
export interface Achievement {
  id: string; name: string; icon: string; color: 'gold' | 'silver' | 'bronze' | 'custom';
  customColor: string; description: string; dateEarned: string;
  visible: boolean; order: number;
}

// ─── 13. البانرات والإعلانات ───
export interface Banner {
  id: string; text: string; image: string; url: string; color: string;
  location: 'top' | 'middle' | 'bottom';
  closable: boolean; expiryDate: string; visible: boolean; order: number;
}

// ─── 14. جداول البيانات ───
export interface DataTable {
  id: string; title: string; columns: string[];
  sortOrder: 'newest' | 'oldest'; maxRows: 5 | 10 | 20 | 0;
  searchable: boolean; exportable: 'pdf' | 'excel' | 'none';
  colors: { header: string; rows: string; text: string; };
  visible: boolean; order: number;
}

// ─── 15. الخريطة ───
export interface MapWidget {
  enabled: boolean; title: string; lat: string; lng: string;
  mapType: 'roadmap' | 'satellite'; height: 'small' | 'medium' | 'large';
  customMarker: string; visible: boolean;
}

// ─── 16. صندوق الرسائل ───
export interface Message {
  id: string; text: string; date: string; read: boolean;
  priority: 'normal' | 'important' | 'urgent'; sender: string;
  visible: boolean;
}
export interface MessagesBox { enabled: boolean; messages: Message[]; }

// ─── 17. التقويم والمواعيد ───
export interface CalendarEvent {
  id: string; type: 'profits' | 'meeting' | 'renewal' | 'withdrawal' | 'custom';
  title: string; date: string; time: string; description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  color: string; repeat: 'once' | 'weekly' | 'monthly';
  visible: boolean;
}
export interface CalendarWidget { enabled: boolean; events: CalendarEvent[]; }

// ─── 18. معرض الصور ───
export interface GalleryImage { id: string; src: string; description: string; category: 'personal' | 'document' | 'other'; }
export interface GalleryWidget {
  enabled: boolean; images: GalleryImage[];
  display: 'grid' | 'slider' | 'masonry'; size: 'small' | 'medium' | 'large';
  zoomOnClick: boolean; visible: boolean;
}

// ─── 19. التنبيهات ───
export interface CustomAlert {
  id: string; text: string; type: 'info' | 'success' | 'warning' | 'danger';
  icon: string; closable: boolean;
  location: 'top' | 'middle' | 'bottom';
  visible: boolean; order: number;
}

// ─── 20. المستندات ───
export interface Document {
  id: string; name: string; fileData: string; fileType: string;
  icon: string; size: string; date: string; showDownload: boolean;
  visible: boolean; order: number;
}

// ─── 21. أشرطة التقدم ───
export interface ProgressBar {
  id: string; title: string; current: number; target: number;
  color: string; shape: 'linear' | 'circular';
  visible: boolean; order: number;
}

// ─── 22. العد التنازلي ───
export interface Countdown {
  id: string; title: string; targetDate: string; targetTime: string;
  color: string; size: 'small' | 'large';
  visible: boolean; order: number;
}

// ─── 23. الفاتورة ───
export interface Invoice {
  enabled: boolean; autoNumber: boolean; customNumber: string;
  items: { label: string; amount: number; type: 'credit' | 'debit'; }[];
  currency: string; showLogo: boolean; stampImage: string;
  notes: string; showDownload: boolean;
  visible: boolean;
}

// ─── 28. عناصر إضافية (Widgets) ───
export interface ExtraWidgets {
  liveClock: boolean;
  hijriDate: boolean;
  currencyRates: boolean;
  goldPrice: boolean;
  btcPrice: boolean;
  weather: boolean;
  profitCalculator: boolean;
  qrCode: boolean;
  newsTicker: boolean;
  newsTickerText: string;
}

// ─── القوالب ───
export interface CMSTemplate {
  id: string; name: string; category: 'financial' | 'commercial' | 'style' | 'regional';
  description: string; preview?: string; design: Partial<DesignSettings>;
  topBar: Partial<TopBar>; bottomBar: Partial<BottomBar>; sideBar: Partial<SideBar>;
}

// ═══════════════════════════════════════
// النوع الرئيسي: SubscriberCMS
// ═══════════════════════════════════════
export interface SubscriberCMS {
  company: CompanyInfo;
  clientProfile: ClientProfile;
  topBar: TopBar;
  bottomBar: BottomBar;
  sideBar: SideBar;
  texts: CustomText[];
  sections: CustomSection[];
  infoCards: InfoCard[];
  charts: ChartWidget[];
  counters: AnimatedCounter[];
  achievements: Achievement[];
  banners: Banner[];
  dataTable: DataTable;
  map: MapWidget;
  messages: MessagesBox;
  calendar: CalendarWidget;
  gallery: GalleryWidget;
  alerts: CustomAlert[];
  documents: Document[];
  progressBars: ProgressBar[];
  countdowns: Countdown[];
  invoice: Invoice;
  widgets: ExtraWidgets;
  design: DesignSettings;
  templateId: string;
}
