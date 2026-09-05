// طبقة انحناء حواف الشاشة (محاكاة شاشة آيفون بدون هيكل خارجي)

import { SystemConfig } from '@/types';
import { clampRadius } from '@/lib/iphone';
import React from 'react';

/**
 * انحناء حواف الشاشة — يجعل الموقع نفسه يبدو وكأنه معروض على شاشة آيفون
 * من الداخل: زوايا منحنية + مؤشر الشريط السفلي، بدون أي هيكل/إطار خارجي للجهاز.
 *
 * الفكرة: طبقة ثابتة تغطي كامل نافذة العرض بزوايا منحنية، ومعها ظل خارجي
 * ضخم (box-shadow spread) يُرسم خارج الشكل المنحني فقط — أي أنه يملأ
 * المساحات الأربع بين قوس الانحناء وزاوية الشاشة القائمة، فيظهر الموقع
 * كأن حوافه مقصوصة بانحناء الشاشة، بما في ذلك النوافذ المنبثقة والتنبيهات.
 */
export function IPhoneScreenCurvature({ cfg }: { cfg: SystemConfig['iPhoneConfig'] }) {
  const R = clampRadius(cfg.screenRadius);
  const edge = cfg.screenEdgeColor || '#000000';

  // خلفية الصفحة (منطقة السحب الزائد) بلون حافة الشاشة حتى لا يظهر أبيض حول الانحناء،
  // وإخفاء شريط التمرير لأن شاشة الآيفون لا تُظهر شريط تمرير دائماً.
  React.useEffect(() => {
    if (R <= 0) return;
    const html = document.documentElement;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    html.style.backgroundColor = edge;
    document.body.style.backgroundColor = edge;

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-iphone-screen', '');
    styleEl.textContent =
      'html.iphone-screen-mode{scrollbar-width:none;-ms-overflow-style:none}' +
      'html.iphone-screen-mode::-webkit-scrollbar,' +
      'html.iphone-screen-mode body::-webkit-scrollbar{width:0;height:0;display:none}';
    document.head.appendChild(styleEl);
    html.classList.add('iphone-screen-mode');

    return () => {
      html.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      html.classList.remove('iphone-screen-mode');
      styleEl.remove();
    };
  }, [edge, R]);

  return (
    <>
      {R > 0 && (
        <div
          aria-hidden="true"
          data-testid="iphone-screen-curvature"
          style={{
            position: 'fixed', inset: 0, zIndex: 2147483000, pointerEvents: 'none',
            borderRadius: R,
            // الظل الخارجي يملأ زوايا الشاشة الأربع فقط (خارج القوس المنحني)
            boxShadow: `0 0 0 600px ${edge}, inset 0 0 0 1px rgba(255,255,255,0.05)`,
          }}
        />
      )}

      {cfg.showHomeIndicator && (
        <div
          aria-hidden="true"
          data-testid="iphone-home-indicator"
          style={{
            position: 'fixed', bottom: 7, left: '50%', transform: 'translateX(-50%)',
            width: 138, height: 5, borderRadius: 999, background: '#ffffff',
            mixBlendMode: 'difference', opacity: 0.9,
            zIndex: 2147483001, pointerEvents: 'none',
          }}
        />
      )}
    </>
  );
}
