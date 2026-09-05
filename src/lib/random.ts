// أدوات عشوائية صغيرة: مُعرّفات، تواريخ، أرقام هواتف وIBAN تجريبية

export function uid(): string { return Math.random().toString(36).slice(2, 11); }

export function todayStr(): string { return new Date().toISOString().split('T')[0]; }

export function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function randomInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function randomAmount(min: number, max: number): number { return Math.floor((Math.random() * (max - min) + min) / 100) * 100; }

export function randomDate(y1: number, y2: number): string {
  const y = randomInt(y1, y2);
  const m = String(randomInt(1, 12)).padStart(2, '0');
  const d = String(randomInt(1, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function randomPhone(): string {
  return `0${randomFrom(['5', '55', '50', '56', '53'])}${Array.from({ length: 7 }, () => randomInt(0, 9)).join('')}`;
}

export function randomIBAN(): string {
  const code = randomFrom(['SA', 'AE', 'QA', 'KW']);
  return `${code}${Array.from({ length: 20 }, () => randomInt(0, 9)).join('')}`;
}
