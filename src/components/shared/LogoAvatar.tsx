// صورة رمزية شعار مع بديل نصي ملوّن مشتق من الاسم

import { useState } from 'react';

// دالة توليد لون من string للـ fallback avatar
function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function getInitials(name: string): string {
  return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

// مكون Avatar fallback للشعارات
export function LogoAvatar({ name, src, size = 32, className = '' }: { name: string; src?: string; size?: number; className?: string }) {
  const [imgError, setImgError] = useState(false);
  if (!src || imgError) {
    return (
      <div className={`flex items-center justify-center rounded-lg font-black text-white flex-shrink-0 ${className}`}
        style={{ width: size, height: size, background: generateColorFromString(name), fontSize: size*0.4 }}>
        {getInitials(name)}
      </div>
    );
  }
  return (
    <img src={src} alt={name} width={size} height={size} loading="lazy"
      onError={()=>setImgError(true)}
      className={`rounded-lg object-contain bg-white border border-slate-100 flex-shrink-0 ${className}`}
      style={{ width: size, height: size }} />
  );
}
