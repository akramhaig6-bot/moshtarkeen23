// أدوات وضع الآيفون: حساب اللمعان، حصر القيم، وتنسيق الساعة

import { IPHONE_DEFAULTS } from '@/config/system';

export function hexLuma(hex: string): number {
  const c = hex.replace('#','');
  const r = parseInt(c.slice(0,2),16), g = parseInt(c.slice(2,4),16), b = parseInt(c.slice(4,6),16);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}

/** يحصر نصف قطر انحناء الشاشة ضمن مدى آمن (0 = زوايا قائمة) */
export function clampRadius(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return IPHONE_DEFAULTS.screenRadius;
  return Math.max(0, Math.min(80, Math.round(n)));
}

/** يحصر مقياس الواجهة كي يبقى المحتوى قابلاً للاستخدام */
export function clampIPhoneScale(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 100;
  return Math.max(60, Math.min(140, Math.round(n)));
}

export function formatIPhoneClock(date = new Date()): string {
  return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}
