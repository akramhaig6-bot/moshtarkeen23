// ═══════════════════════════════════════════════════════════════
// أنواع قسم «بناء تطبيق العميل» — نظام واجهات ديناميكي غير محدود
// (وثيقة: بناء تطبيق العميل — الأقسام 1 إلى 16)
// تخزين محلي بالكامل (localStorage) — بلا خادم
// ═══════════════════════════════════════════════════════════════

export type DeviceSize = 375 | 768 | 1280;

export type BarKind =
  | 'top' | 'bottom' | 'right' | 'left' | 'floating' | 'sub' | 'announcement';

export type ModalKind =
  | 'modal' | 'fullscreen' | 'drawer-right' | 'drawer-left' | 'drawer-top'
  | 'sheet' | 'popover' | 'alert' | 'toast';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** فئات مكتبة المكونات */
export type ComponentCategory =
  | 'containers' | 'text' | 'media' | 'buttons' | 'forms'
  | 'cards' | 'tables' | 'charts' | 'interactive' | 'advanced';

/** تعريف مكوّن داخل مكتبة المكونات */
export interface ComponentDef {
  type: string;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  /** هل يقبل مكونات بداخله (تداخل غير محدود) */
  container?: boolean;
  defaults: () => { props: Record<string, unknown>; style: NodeStyle };
}

/** تنسيق أي عنصر (القسم العاشر من الوثيقة) */
export interface NodeStyle {
  // التخطيط والأبعاد
  display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'none';
  width?: string;
  height?: string;
  maxWidth?: string;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: number;
  columns?: number;
  padding?: number;
  margin?: number;
  // الألوان
  bg?: string;
  bgGradient?: string;
  color?: string;
  opacity?: number;
  // الحدود والزوايا
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  // الظلال
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // النصوص
  fontSize?: number;
  fontWeight?: '400' | '500' | '700' | '900';
  textAlign?: 'right' | 'center' | 'left';
  lineHeight?: number;
  letterSpacing?: number;
  // التحويلات والمرشحات
  rotate?: number;
  scale?: number;
  blur?: number;
  grayscale?: number;
  // الحركة
  animation?: 'none' | 'fade' | 'slide-up' | 'slide-right' | 'zoom' | 'bounce';
  animationDuration?: number;
  hoverEffect?: 'none' | 'zoom' | 'lift' | 'glow';
}

/** إظهار شرطي (القسم 11) */
export interface VisibilityRule {
  conditional: boolean;
  field: string;
  operator: '=' | '≠' | '>' | '<' | 'contains' | 'empty' | 'notEmpty';
  value: string;
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

/** شريط التقدم المرافق للإجراء (القسم التاسع) */
export interface ProgressSpec {
  enabled: boolean;
  kind: 'linear' | 'circular' | 'steps' | 'flow';
  position: 'inside' | 'above' | 'below';
  duration: number;           // ميلي ثانية
  thickness: number;
  color: string;
  trackColor: string;
  radius: number;
  glow: boolean;
  showPercent: boolean;
  label: string;
  steps: number;
  onComplete: 'none' | 'hide' | 'toast' | 'openPage' | 'openModal' | 'showNode' | 'hideNode';
  completeValue: string;
  afterBehavior: 'stay' | 'hide' | 'success';
}

export type ActionType =
  // التنقل
  | 'none' | 'openPage' | 'back' | 'home' | 'externalLink' | 'scrollTo' | 'scrollTop' | 'scrollBottom'
  // النوافذ
  | 'openModal' | 'closeModal' | 'closeAllModals' | 'toast'
  // التحكم في المكونات
  | 'showNode' | 'hideNode' | 'toggleNode' | 'setNodeText'
  // البيانات
  | 'setVar' | 'incVar' | 'decVar' | 'saveLocal' | 'clearLocal'
  // التطبيق
  | 'toggleDark' | 'copy' | 'print' | 'share' | 'call' | 'mail' | 'whatsapp' | 'reload';

export interface ActionStep {
  id: string;
  type: ActionType;
  target: string;    // معرّف صفحة/نافذة/مكون أو نص حسب النوع
  value: string;     // قيمة إضافية (رسالة، رابط، رقم...)
  tone: 'success' | 'error' | 'info' | 'warning';
  delay: number;     // تأخير قبل التنفيذ (ms)
  condition: { enabled: boolean; field: string; operator: string; value: string };
}

export interface ActionSpec {
  mode: 'single' | 'sequence' | 'conditional';
  step: ActionStep;                 // إجراء واحد
  steps: ActionStep[];              // تسلسل
  condition: { field: string; operator: string; value: string };
  thenSteps: ActionStep[];
  elseSteps: ActionStep[];
  progress: ProgressSpec;
}

/** عقدة مكوّن — تداخل غير محدود */
export interface AppNode {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  style: NodeStyle;
  children: AppNode[];
  hidden: boolean;
  locked: boolean;
  visibility: VisibilityRule;
  action: ActionSpec | null;
}

export interface AppPage {
  id: string;
  name: string;
  icon: string;
  slug: string;
  isHome: boolean;
  parentId: string | null;
  layout: 'blank' | 'one' | 'two' | 'three' | 'grid';
  bg: string;
  title: string;
  metaDescription: string;
  requiresLogin: boolean;
  visibleInNav: boolean;
  nodes: AppNode[];
}

export interface AppBar {
  id: string;
  name: string;
  kind: BarKind;
  scope: 'all' | 'selected';
  pages: string[];
  enabled: boolean;
  sticky: boolean;
  size: number;                 // ارتفاع أو عرض
  bg: string;
  color: string;
  radius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  justify: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap: number;
  padding: number;
  showOn: { mobile: boolean; tablet: boolean; desktop: boolean };
  nodes: AppNode[];
}

export interface AppModal {
  id: string;
  name: string;
  kind: ModalKind;
  size: ModalSize;
  closable: boolean;
  backdrop: boolean;
  backdropColor: string;
  radius: number;
  enterAnimation: 'fade' | 'slide-up' | 'slide-down' | 'slide-right' | 'slide-left' | 'zoom' | 'pop';
  duration: number;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
  autoOpen: boolean;
  autoOpenDelay: number;
  autoHideSeconds: number;
  enabled: boolean;
  nodes: AppNode[];
}

export interface AppDesign {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  bgMain: string;
  bgCards: string;
  textMain: string;
  textSecondary: string;
  borders: string;
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  radius: number;
  spacing: number;
}

export interface AppVariable { id: string; name: string; value: string }

export interface AppProject {
  id: string;
  name: string;
  shortName: string;
  description: string;
  logo: string;
  favicon: string;
  brandColor: string;
  lang: 'ar' | 'en' | 'fr' | 'es';
  dir: 'rtl' | 'ltr' | 'auto';
  timezone: string;
  currency: string;
  themeMode: 'light' | 'dark' | 'system';
  version: string;
  keywords: string;
  contact: { email: string; phone: string; whatsapp: string; address: string };
  social: { instagram: string; twitter: string; telegram: string; tiktok: string; linkedin: string };
  legal: { terms: string; privacy: string };
  design: AppDesign;
  variables: AppVariable[];
  pages: AppPage[];
  bars: AppBar[];
  modals: AppModal[];
  /** ربط اختياري بمشترك معيّن (نطاق النشر) */
  subscriberId: string | null;
  isTemplate: boolean;
  published: boolean;
  publishedAt: string;
  releaseNotes: string;
  createdAt: string;
  updatedAt: string;
}

/** حالة تخزين القسم كاملاً في localStorage */
export interface AppBuilderStore {
  projects: AppProject[];
  templates: AppProject[];
  activeProjectId: string | null;
  lastSavedAt: string;
}

/** عنصر محدد في الاستوديو */
export type SelectionKind = 'page' | 'bar' | 'modal' | 'node' | 'design' | null;
export interface Selection {
  kind: SelectionKind;
  id: string | null;
  /** الحاوية التي تنتمي لها العقدة: صفحة/شريط/نافذة */
  ownerKind?: 'page' | 'bar' | 'modal';
  ownerId?: string;
}
