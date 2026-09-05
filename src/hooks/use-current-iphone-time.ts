// هوك يعيد وقت الجهاز كل ثانية لعرضه في شريط حالة الآيفون

import { formatIPhoneClock } from '@/lib/iphone';
import React from 'react';

export function useCurrentIPhoneTime(): string {
  const [time, setTime] = React.useState(() => formatIPhoneClock());

  React.useEffect(() => {
    const tick = setInterval(() => setTime(formatIPhoneClock()), 30000);
    return () => clearInterval(tick);
  }, []);

  return time;
}
