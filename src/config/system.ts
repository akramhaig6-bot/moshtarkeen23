// الإعدادات الافتراضية للنظام ودوال دمج/تصحيح القيم المحفوظة

import { SystemConfig, SubscriberExperience } from '@/types';

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  sectionNames: {
    dashboard: 'النظام الإداري',
    admin: 'نظام الإستعلام عن الأرباح',
    addOperations: 'سجل العمليات',
    addSubscriber: 'إضافة مشترك',
    systemAdmin: 'لوحة إدارة النظام',
  },
  cardOverrides: {
    totalSubscribers: '',
    activeCount: '',
    totalProfits: '',
    completedOps: '',
    activeSubscriptions: '',
    totalSubsCount: '',
    pendingFees: '',
    activationOps: '',
  },
  queryCardOverrides: {
    totalSubscribers: '',
    activeCount: '',
    pendingFees: '',
  },
  institutionalText: '',
  systemDate: '',
  subscriberExperience: {
    companyName: 'مركز المشتركين',
    companyLogo: '',
    welcomeTitle: 'بوابة الاستعلام المؤسسية',
    welcomeText: 'أدخل بياناتك للوصول إلى ملخص حسابك وعملياتك.',
    sections: [],
    buttons: [],
  },
  iPhoneConfig: {
    enabled: false,
    dynamicIsland: 'normal',
    batteryLevel: 85,
    batteryCharging: false,
    showBatteryPct: true,
    wifiEnabled: true,
    wifiStrength: 3,
    signalEnabled: true,
    signalStrength: 4,
    networkType: '4G',
    customTime: '',
    statusBarBg: '#ffffff',
    showNotification: true,
    screenRadius: 48,
    screenEdgeColor: '#000000',
    showHomeIndicator: true,
    widthScale: 100,
    heightScale: 100,
  },
};

export function resolveSubscriberExperience(experience?: Partial<SubscriberExperience>): SubscriberExperience {
  return {
    ...DEFAULT_SYSTEM_CONFIG.subscriberExperience,
    ...(experience ?? {}),
    sections: (experience?.sections ?? DEFAULT_SYSTEM_CONFIG.subscriberExperience.sections).map((section, index) => ({
      id: section.id || `legacy-section-${index}`,
      title: section.title || '',
      content: section.content || '',
      placement: section.placement || 'summary',
      visible: section.visible !== false,
      accent: section.accent || '#0f766e',
    })),
    buttons: (experience?.buttons ?? DEFAULT_SYSTEM_CONFIG.subscriberExperience.buttons).map((button, index) => ({
      id: button.id || `legacy-button-${index}`,
      label: button.label || '',
      content: button.content || '',
      helperText: button.helperText || '',
      duration: Math.max(1, Math.min(60, Number(button.duration) || 8)),
      placement: button.placement || 'summary',
      visible: button.visible !== false,
      tone: button.tone || 'emerald',
    })),
  };
}

// ─────────────────────────────────────────────────────────────
// iPhone mode defaults (used whenever config is partial/legacy)
// ─────────────────────────────────────────────────────────────
export const IPHONE_DEFAULTS: SystemConfig['iPhoneConfig'] = {
  enabled: false, dynamicIsland: 'normal', batteryLevel: 85, batteryCharging: false,
  showBatteryPct: true, wifiEnabled: true, wifiStrength: 3, signalEnabled: true,
  signalStrength: 4, networkType: '4G', customTime: '', statusBarBg: '#ffffff',
  showNotification: true, screenRadius: 48, screenEdgeColor: '#000000', showHomeIndicator: true,
  widthScale: 100, heightScale: 100,
};

/** يدمج الإعدادات المحفوظة (قد تكون قديمة/ناقصة) مع القيم الافتراضية */
export function resolveIPhoneCfg(cfg?: Partial<SystemConfig['iPhoneConfig']>): SystemConfig['iPhoneConfig'] {
  return { ...IPHONE_DEFAULTS, ...(cfg ?? {}), customTime: '' };
}
