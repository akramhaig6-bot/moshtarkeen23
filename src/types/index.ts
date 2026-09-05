// الأنواع الأساسية للنظام (المشتركون، العمليات، الإعدادات)

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  iban: string;
  subscriptionAmount: number;
  profits: number;
  systemFees: number;
  systemAccount: string;
  walletAddress: string;
  bankName: string;
  joinDate: string;
  subscriberStatus: string;
  notes: string;
  /** النص الذي يُعرض للمشترك بعد تأكيد سحب الأرباح */
  withdrawalText: string;
  currency: string;
  platform: string;
  // --- إضافات جراحية اختيارية حسب برومبت التحسين ---
  phoneCountryCode?: string;
  phoneCountryIso?: string;
  phoneVisible?: boolean;
  ibanVisible?: boolean;
  accountNumber?: string;
  accountNumberVisible?: boolean;
  subscriptionCurrency?: string;
  subscriptionCurrencySymbol?: string;
  profitsCurrency?: string;
  profitsCurrencySymbol?: string;
  systemFeesCurrency?: string;
  systemFeesCurrencySymbol?: string;
  systemAccountType?: 'wallet_id' | 'wallet_address' | 'manual';
  systemAccountWalletType?: string;
  systemAccountNetwork?: string;
  systemAccountValue?: string;
  walletPlatform?: string;
  walletCurrency?: string;
  walletNetwork?: string;
  walletAddressValue?: string;
  bankCountry?: string;
  bankType?: 'commercial' | 'islamic' | 'digital' | 'government' | 'development' | 'specialized';
  bankLogoUrl?: string;
  bankDomain?: string;
  bankSwift?: string;
  // ══════ بيانات CMS (تطبيق العميل المخصص) ══════
  cms?: import('./cms').SubscriberCMS;
}

export interface Operation {
  id: string;
  subscriberName: string;
  operation: string;
  amount: string;
  date: string;
  status: string;
}

export interface Stats {
  totalSubscribers: string;
  totalProfits: string;
  activeSubscriptions: string;
  pendingRequests: string;
}

export type ExperiencePlacement = 'top' | 'summary' | 'bottom';

export interface CustomQuerySection {
  id: string;
  title: string;
  content: string;
  placement: ExperiencePlacement;
  visible: boolean;
  accent: string;
}

export interface CustomQueryButton {
  id: string;
  label: string;
  content: string;
  helperText: string;
  duration: number;
  placement: ExperiencePlacement;
  visible: boolean;
  tone: 'emerald' | 'blue' | 'amber' | 'violet';
}

export interface SubscriberExperience {
  companyName: string;
  companyLogo: string;
  welcomeTitle: string;
  welcomeText: string;
  sections: CustomQuerySection[];
  buttons: CustomQueryButton[];
}

export interface SystemConfig {
  sectionNames: {
    dashboard: string;
    admin: string;
    addOperations: string;
    addSubscriber: string;
    systemAdmin: string;
  };
  cardOverrides: {
    totalSubscribers: string;
    activeCount: string;
    totalProfits: string;
    completedOps: string;
    activeSubscriptions: string;
    totalSubsCount: string;
    pendingFees: string;
    activationOps: string;
  };
  queryCardOverrides: {
    totalSubscribers: string;
    activeCount: string;
    pendingFees: string;
  };
  institutionalText: string;
  systemDate: string;
  subscriberExperience: SubscriberExperience;
  iPhoneConfig: {
    enabled: boolean;
    dynamicIsland: 'normal' | 'recording';
    batteryLevel: number;
    batteryCharging: boolean;
    showBatteryPct: boolean;
    wifiEnabled: boolean;
    wifiStrength: number;
    signalEnabled: boolean;
    signalStrength: number;
    networkType: string;
    /** حقل قديم للتوافق فقط؛ وقت الآيفون يُعرض دائماً من وقت الجهاز الفعلي */
    customTime: string;
    statusBarBg: string;
    showNotification: boolean;
    /** انحناء حواف الشاشة بالبكسل — يجعل الموقع نفسه يبدو كشاشة آيفون (بدون هيكل خارجي) */
    screenRadius: number;
    /** لون ما خلف الانحناء (حافة الشاشة) */
    screenEdgeColor: string;
    /** مؤشر الشريط السفلي (Home Indicator) */
    showHomeIndicator: boolean;
    /** مقياس واجهة وضع الآيفون أفقياً وعمودياً بالنسبة المئوية */
    widthScale: number;
    heightScale: number;
  };
}

export interface LiveStats {
  totalSubscribers: string; totalProfits: string; activeSubscriptions: string;
  pendingRequests: string; activeCount: string; completedOpsStr: string;
  totalSubsCount: string; activationOpsStr: string;
}

export type Tab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber' | 'systemAdmin' | 'advanced' | 'reports' | 'settings';
