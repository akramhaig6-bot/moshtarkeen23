// عنصر اختيار منصة تداول في قائمة المنصات

import { TradingPlatform } from '@/data/platforms';
import { LogoAvatar } from '@/components/shared/LogoAvatar';
import {
  CheckCircle2,
} from 'lucide-react';

export function PlatformItem({ platform, selected, onClick }: { platform: TradingPlatform; selected: boolean; onClick: () => void }) {
  const logoDomain = `${platform.name.toLowerCase().replace(/[^a-z0-9]/g,'')}.com`;
  const clearbitUrl = `https://logo.clearbit.com/${logoDomain}`;
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
      <LogoAvatar name={platform.name} src={clearbitUrl} size={28} />
      <span className="flex-1 text-sm font-medium text-slate-700 text-right flex flex-col">
        <span>{platform.name}</span>
        <span className="text-[10px] text-slate-400">{platform.abbr} · {platform.type==='crypto'?'كريبتو':'فوركس'}</span>
      </span>
      {selected && <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />}
    </button>
  );
}
