// شريط حالة آيفون العلوي (بطارية/واي فاي/شبكة) كطبقة ثابتة

import { SystemConfig } from '@/types';
import { hexLuma, clampRadius } from '@/lib/iphone';
import { useCurrentIPhoneTime } from '@/hooks/use-current-iphone-time';

export function IPhoneStatusBarOverlay({ cfg, onExit: _onExit }: {
  cfg: SystemConfig['iPhoneConfig'];
  onExit: () => void;
}) {
  const time = useCurrentIPhoneTime();

  const bg = cfg.statusBarBg || '#ffffff';
  const dark = hexLuma(bg) < 0.5;
  const fg = dark ? '#ffffff' : '#0f172a';
  const fgSub = dark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.28)';
  const isRec = cfg.dynamicIsland === 'recording';

  // إزاحة أفقية تتبع انحناء الشاشة حتى لا تختفي الأيقونات داخل الزوايا المنحنية
  const radius = clampRadius(cfg.screenRadius);
  const inset = 14 + Math.round(radius * 0.32);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 44,
      zIndex: 9999, display: 'flex', alignItems: 'center',
      backgroundColor: bg, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
      boxShadow: '0 1px 12px rgba(0,0,0,0.08)',
      borderTopLeftRadius: radius, borderTopRightRadius: radius,
      userSelect: 'none', paddingLeft: inset, paddingRight: inset,
    }}>

      {/* ── LEFT: Time + Bell ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 80 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: fg, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </span>
        {cfg.showNotification && (
          <svg width="13" height="14" viewBox="0 0 14 15" fill="none">
            <path d="M7 1a4.5 4.5 0 00-4.5 4.5v2.5l-1 1.5h11l-1-1.5V5.5A4.5 4.5 0 007 1z"
              fill={fg} opacity="0.85" />
            <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke={fg} strokeWidth="1.2" fill="none" />
          </svg>
        )}
      </div>

      {/* ── CENTER: Dynamic Island ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: isRec ? 110 : 100, height: 28, background: '#000',
            borderRadius: 20, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7,
            transition: 'width 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#111', border: '1.5px solid #2a2a2a' }} />
          {isRec && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
              boxShadow: '0 0 7px 2px rgba(239,68,68,0.6)',
              animation: 'iphonePulse 1.4s ease-in-out infinite',
            }} />
          )}
        </div>
      </div>

      {/* ── RIGHT: Signal + WiFi + Network + Battery ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 80, justifyContent: 'flex-end' }}>

        {/* Signal bars */}
        {cfg.signalEnabled && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                width: 3.5, height: 4 + i * 3, borderRadius: 1.5,
                background: i <= cfg.signalStrength ? fg : fgSub,
              }} />
            ))}
          </div>
        )}

        {/* WiFi arc */}
        {cfg.wifiEnabled && (
          <svg width="16" height="12" viewBox="0 0 16 12" style={{ overflow: 'visible' }}>
            {[3,2,1].map((r, idx) => {
              const show = idx < cfg.wifiStrength;
              const arcR = r * 3;
              const sw = 1.5;
              const sa = 0.55;
              return (
                <path key={r}
                  d={`M ${8 - arcR * Math.cos(sa)} ${11 - arcR * Math.sin(sa)} A ${arcR} ${arcR} 0 0 1 ${8 + arcR * Math.cos(sa)} ${11 - arcR * Math.sin(sa)}`}
                  fill="none" stroke={show ? fg : fgSub} strokeWidth={sw} strokeLinecap="round" />
              );
            })}
            <circle cx="8" cy="11" r="1.3" fill={fg} />
          </svg>
        )}

        {/* Network type */}
        {cfg.networkType && (
          <span style={{ fontSize: 11, fontWeight: 800, color: fg, letterSpacing: -0.5 }}>{cfg.networkType}</span>
        )}

        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {cfg.showBatteryPct && (
            <span style={{ fontSize: 11, fontWeight: 700, color: fg, letterSpacing: -0.5 }}>{cfg.batteryLevel}%</span>
          )}
          <div style={{ position: 'relative', width: 24, height: 12, border: `1.5px solid ${fg}`, borderRadius: 3.5, opacity: 0.85 }}>
            <div style={{ position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 6, background: fg, borderRadius: '0 2px 2px 0', opacity: 0.6 }} />
            <div style={{
              position: 'absolute', left: 1.5, top: 1.5, height: 7, borderRadius: 2,
              width: `${Math.max(1, Math.min(17, cfg.batteryLevel * 0.17))}px`,
              background: cfg.batteryLevel <= 20 ? '#ef4444' : cfg.batteryCharging ? '#22c55e' : fg,
              transition: 'width 0.4s, background 0.3s',
            }} />
          </div>
          {cfg.batteryCharging && <span style={{ fontSize: 11, color: '#22c55e', lineHeight: 1 }}>⚡</span>}
        </div>
      </div>

      <style>{`
        @keyframes iphonePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.88)} }
      `}</style>
    </div>
  );
}
